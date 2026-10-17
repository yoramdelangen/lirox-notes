use crate::{app_workspace_root, is_installed, load_config, RuntimePaths};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::{
    fs,
    io::{self, ErrorKind, Write},
    path::{Path, PathBuf},
    sync::atomic::{AtomicU64, Ordering},
    sync::Mutex,
    time::{SystemTime, UNIX_EPOCH},
};
use uuid::Uuid;
use webauthn_rs::prelude::*;

const RECORD_VERSION: u8 = 1;

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub enum OnboardingStatus {
    NotStarted,
    WorkspaceRequired,
    Complete,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct CredentialRecord {
    pub credential_id: String,
    pub public_key: String,
    pub sign_count: u32,
    pub label: String,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct AccountRecord {
    pub version: u8,
    #[serde(default)]
    pub account_id: String,
    pub credentials: Vec<CredentialRecord>,
}

impl AccountRecord {
    pub fn with_credential(credential: CredentialRecord) -> Self {
        Self {
            version: RECORD_VERSION,
            account_id: Uuid::new_v4().to_string(),
            credentials: vec![credential],
        }
    }

    pub fn with_account_id(account_id: String, credential: CredentialRecord) -> Self {
        Self {
            version: RECORD_VERSION,
            account_id,
            credentials: vec![credential],
        }
    }
}

pub trait AccountCredentialExt {
    fn with_credential(self, credential: CredentialRecord) -> Self;
}

impl AccountCredentialExt for AccountRecord {
    fn with_credential(mut self, credential: CredentialRecord) -> Self {
        self.credentials.push(credential);
        self
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub enum ChallengeOperation {
    Registration,
    Authentication,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct ChallengeRecord {
    pub version: u8,
    pub challenge_id: String,
    pub challenge: String,
    pub operation: ChallengeOperation,
    pub account_id: Option<String>,
    pub expires_at: u64,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct StoredSession {
    pub version: u8,
    pub token: String,
    pub user: String,
    pub created_at: u64,
    pub expires_at: u64,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct BootstrapResponse {
    pub installed: bool,
    pub passkey_exists: bool,
    pub onboarding: OnboardingStatus,
    pub authenticated: bool,
    pub user: Option<String>,
    pub display_name: Option<String>,
    pub workspace_root: String,
    pub workspace: Option<GatewayConfigResponse>,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct GatewayConfigResponse {
    pub slug: String,
    pub name: String,
}

pub fn onboarding_status(registered: bool, workspace_configured: bool) -> OnboardingStatus {
    match (registered, workspace_configured) {
        (false, _) => OnboardingStatus::NotStarted,
        (true, false) => OnboardingStatus::WorkspaceRequired,
        (true, true) => OnboardingStatus::Complete,
    }
}

pub fn persisted_onboarding_status(paths: &RuntimePaths) -> io::Result<OnboardingStatus> {
    let registered = AuthStore::new(paths.clone())
        .load_account()?
        .is_some_and(|account| !account.credentials.is_empty());
    let configured = load_config(&paths.config_file)?.is_some();
    if !registered && !is_installed(paths)? {
        return Ok(OnboardingStatus::NotStarted);
    }
    let install = paths.config_file.with_file_name("install");
    if fs::read_to_string(&install)
        .map(|contents| {
            contents
                .lines()
                .any(|line| line.trim() == "onboarding_complete=true")
        })
        .unwrap_or(false)
    {
        return Ok(if configured {
            OnboardingStatus::Complete
        } else {
            OnboardingStatus::WorkspaceRequired
        });
    }
    // A legacy config is not evidence that workspace bootstrap completed.
    // It must be explicitly recreated through POST /api/workspaces.
    Ok(OnboardingStatus::WorkspaceRequired)
}

pub fn install_user_name(input: &str) -> Option<String> {
    input.lines().find_map(|line| {
        let (key, value) = line.split_once('=')?;
        (key.trim() == "user_name" && !value.trim().is_empty()).then(|| value.trim().to_string())
    })
}

pub fn save_install_user_name(paths: &RuntimePaths, value: &str) -> io::Result<()> {
    let name: String = value
        .trim()
        .chars()
        .filter(|character| !character.is_control())
        .take(80)
        .collect();
    if name.is_empty() {
        return Ok(());
    }

    let path = paths.config_file.with_file_name("install");
    let contents = fs::read_to_string(&path).unwrap_or_default();
    let mut output = contents
        .lines()
        .filter(|line| !line.trim_start().starts_with("user_name="))
        .collect::<Vec<_>>()
        .join("\n");
    if !output.is_empty() {
        output.push('\n');
    }
    output.push_str(&format!("user_name={name}\n"));
    fs::write(path, output)
}

pub fn serialize_account(account: &AccountRecord) -> io::Result<String> {
    serialize(account)
}

pub fn parse_account(input: &str) -> io::Result<AccountRecord> {
    let account: AccountRecord = parse(input)?;
    if account.version != RECORD_VERSION
        || account.credentials.iter().any(|credential| {
            credential.credential_id.trim().is_empty() || credential.public_key.trim().is_empty()
        })
        || account
            .credentials
            .iter()
            .enumerate()
            .any(|(index, credential)| {
                account.credentials[..index]
                    .iter()
                    .any(|other| other.credential_id == credential.credential_id)
            })
    {
        return invalid_record();
    }
    Ok(account)
}

pub fn serialize_challenge(challenge: &ChallengeRecord) -> io::Result<String> {
    serialize(challenge)
}

pub fn parse_challenge(input: &str) -> io::Result<ChallengeRecord> {
    let challenge = parse_challenge_record(input)?;
    if challenge.version != RECORD_VERSION
        || challenge.challenge_id.trim().is_empty()
        || challenge.challenge.trim().is_empty()
        || challenge.expires_at <= unix_seconds()
    {
        return invalid_record();
    }
    Ok(challenge)
}

fn parse_challenge_record(input: &str) -> io::Result<ChallengeRecord> {
    let challenge: ChallengeRecord = parse(input)?;
    if challenge.version != RECORD_VERSION
        || challenge.challenge_id.trim().is_empty()
        || challenge.challenge.trim().is_empty()
        || challenge.expires_at == 0
    {
        return invalid_record();
    }
    Ok(challenge)
}

pub fn serialize_session(session: &StoredSession) -> io::Result<String> {
    serialize(session)
}

pub fn parse_session(input: &str) -> io::Result<StoredSession> {
    let session: StoredSession = parse(input)?;
    if session.version != RECORD_VERSION
        || session.token.trim().is_empty()
        || session.user.trim().is_empty()
        || session.created_at >= session.expires_at
        || session.expires_at == 0
    {
        return invalid_record();
    }
    Ok(session)
}

fn serialize<T: Serialize>(value: &T) -> io::Result<String> {
    serde_json::to_string_pretty(value)
        .map_err(|error| io::Error::new(ErrorKind::InvalidData, error))
}

fn parse<T: DeserializeOwned>(input: &str) -> io::Result<T> {
    serde_json::from_str(input).map_err(|error| io::Error::new(ErrorKind::InvalidData, error))
}

fn invalid_record<T>() -> io::Result<T> {
    Err(io::Error::new(
        ErrorKind::InvalidData,
        "malformed auth record",
    ))
}

#[derive(Clone, Debug)]
pub struct AuthStore {
    paths: RuntimePaths,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AuthError {
    ChallengeExpired,
    ChallengeNotFound,
    ChallengeMismatch,
    RegistrationClosed,
    LoginUnavailable,
    VerificationFailed,
    Storage(String),
    Configuration(String),
}

impl std::fmt::Display for AuthError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter.write_str(match self {
            Self::ChallengeExpired => "challenge expired",
            Self::ChallengeNotFound => "challenge not found",
            Self::ChallengeMismatch => "challenge mismatch",
            Self::RegistrationClosed => "registration is already complete",
            Self::LoginUnavailable => "login is not available",
            Self::VerificationFailed => "passkey verification failed",
            Self::Storage(_) => "auth storage failed",
            Self::Configuration(_) => "invalid WebAuthn configuration",
        })
    }
}

impl std::error::Error for AuthError {}

impl From<io::Error> for AuthError {
    fn from(error: io::Error) -> Self {
        Self::Storage(error.to_string())
    }
}

#[derive(Clone)]
pub struct AuthService {
    pub store: AuthStore,
    pub webauthn: Webauthn,
    session_ttl: u64,
    pub(crate) secure_cookies: bool,
}

impl AuthService {
    pub fn new(store: AuthStore, webauthn: Webauthn, session_ttl: u64) -> Self {
        Self {
            store,
            webauthn,
            session_ttl,
            secure_cookies: false,
        }
    }

    pub fn from_env(paths: RuntimePaths) -> Result<Self, AuthError> {
        let rp_id = std::env::var("LIROX_RP_ID").unwrap_or_else(|_| "localhost".into());
        let origin =
            std::env::var("LIROX_RP_ORIGIN").unwrap_or_else(|_| "http://localhost:3010".into());
        let origin =
            Url::parse(&origin).map_err(|error| AuthError::Configuration(error.to_string()))?;
        let webauthn = WebauthnBuilder::new(&rp_id, &origin)
            .map_err(|error| AuthError::Configuration(error.to_string()))?
            .rp_name("LiroxNotes")
            .build()
            .map_err(|error| AuthError::Configuration(error.to_string()))?;
        let session_ttl = parse_session_ttl(std::env::var("LIROX_SESSION_TTL_SECONDS").ok())?;
        let mut service = Self::new(AuthStore::new(paths), webauthn, session_ttl);
        service.secure_cookies = origin.scheme() == "https";
        Ok(service)
    }

    pub fn secure_cookies(&self) -> bool {
        self.secure_cookies
    }

    pub fn registration_options(&self) -> Result<(String, CreationChallengeResponse), AuthError> {
        if persisted_onboarding_status(&self.store.paths)? == OnboardingStatus::Complete {
            return Err(AuthError::RegistrationClosed);
        }
        let account_id = Uuid::new_v4().to_string();
        let (options, state) = self
            .webauthn
            .start_passkey_registration(
                Uuid::parse_str(&account_id).map_err(|_| AuthError::VerificationFailed)?,
                "local",
                "LiroxNotes",
                None,
            )
            .map_err(|_| AuthError::VerificationFailed)?;
        let challenge_id = Uuid::new_v4().to_string();
        self.store.save_challenge(&ChallengeRecord {
            version: RECORD_VERSION,
            challenge_id: challenge_id.clone(),
            challenge: serde_json::to_string(&state)
                .map_err(|error| AuthError::Storage(error.to_string()))?,
            operation: ChallengeOperation::Registration,
            account_id: Some(account_id),
            expires_at: unix_seconds().saturating_add(300),
        })?;
        Ok((challenge_id, options))
    }

    pub fn store_registration_challenge(&self, challenge: ChallengeRecord) {
        self.store
            .save_challenge(&challenge)
            .expect("test challenge persistence should succeed");
    }

    pub fn verify_registration(
        &self,
        challenge_id: &str,
        credential: &RegisterPublicKeyCredential,
    ) -> Result<StoredSession, AuthError> {
        let challenge = self
            .store
            .load_challenge_matching(challenge_id)?
            .ok_or(AuthError::ChallengeNotFound)?;
        if challenge.challenge_id != challenge_id {
            return Err(AuthError::ChallengeMismatch);
        }
        if challenge.operation != ChallengeOperation::Registration {
            return Err(AuthError::ChallengeMismatch);
        }
        let state: PasskeyRegistration = serde_json::from_str(&challenge.challenge)
            .map_err(|_| AuthError::VerificationFailed)?;
        let passkey = self
            .webauthn
            .finish_passkey_registration(credential, &state)
            .map_err(|_| AuthError::VerificationFailed)?;
        self.store
            .consume_challenge_record_matching(challenge_id, unix_seconds())?
            .ok_or(AuthError::ChallengeNotFound)?;
        let credential_id = serde_json::to_string(passkey.cred_id())
            .map_err(|error| AuthError::Storage(error.to_string()))?;
        let public_key = serde_json::to_string(&passkey)
            .map_err(|error| AuthError::Storage(error.to_string()))?;
        let account_id = challenge.account_id.ok_or(AuthError::ChallengeMismatch)?;
        self.store.save_account(&AccountRecord::with_account_id(
            account_id,
            CredentialRecord {
                credential_id,
                public_key,
                sign_count: 0,
                label: "Passkey".into(),
            },
        ))?;
        self.rotate_session()
    }

    pub fn login_options(&self) -> Result<(String, RequestChallengeResponse), AuthError> {
        let account = self
            .store
            .load_account()?
            .ok_or(AuthError::LoginUnavailable)?;
        if account.account_id.is_empty() {
            return Err(AuthError::LoginUnavailable);
        }
        let credentials = account
            .credentials
            .iter()
            .map(|credential| serde_json::from_str::<Passkey>(&credential.public_key))
            .collect::<Result<Vec<_>, _>>()
            .map_err(|_| AuthError::VerificationFailed)?;
        let (options, state) = self
            .webauthn
            .start_passkey_authentication(&credentials)
            .map_err(|_| AuthError::VerificationFailed)?;
        let challenge_id = Uuid::new_v4().to_string();
        self.store.save_challenge(&ChallengeRecord {
            version: RECORD_VERSION,
            challenge_id: challenge_id.clone(),
            challenge: serde_json::to_string(&state)
                .map_err(|error| AuthError::Storage(error.to_string()))?,
            operation: ChallengeOperation::Authentication,
            account_id: Some(account.account_id),
            expires_at: unix_seconds().saturating_add(300),
        })?;
        Ok((challenge_id, options))
    }

    pub fn verify_login(
        &self,
        challenge_id: &str,
        credential: &PublicKeyCredential,
    ) -> Result<StoredSession, AuthError> {
        let challenge = self
            .store
            .load_challenge_matching(challenge_id)?
            .ok_or(AuthError::ChallengeNotFound)?;
        if challenge.challenge_id != challenge_id {
            return Err(AuthError::ChallengeMismatch);
        }
        if challenge.operation != ChallengeOperation::Authentication {
            return Err(AuthError::ChallengeMismatch);
        }
        let state: PasskeyAuthentication = serde_json::from_str(&challenge.challenge)
            .map_err(|_| AuthError::VerificationFailed)?;
        let result = self
            .webauthn
            .finish_passkey_authentication(credential, &state)
            .map_err(|_| AuthError::VerificationFailed)?;
        let mut account = self
            .store
            .load_account()?
            .ok_or(AuthError::LoginUnavailable)?;
        if challenge.account_id.as_deref() != Some(account.account_id.as_str()) {
            return Err(AuthError::ChallengeMismatch);
        }
        let credential_id = serde_json::to_string(&result.cred_id())
            .map_err(|error| AuthError::Storage(error.to_string()))?;
        let record = account
            .credentials
            .iter_mut()
            .find(|record| record.credential_id == credential_id)
            .ok_or(AuthError::VerificationFailed)?;
        record.sign_count = result.counter();
        let mut passkey: Passkey =
            serde_json::from_str(&record.public_key).map_err(|_| AuthError::VerificationFailed)?;
        if passkey.update_credential(&result).is_none() {
            return Err(AuthError::VerificationFailed);
        }
        record.public_key = serde_json::to_string(&passkey)
            .map_err(|error| AuthError::Storage(error.to_string()))?;
        self.store
            .consume_challenge_record_matching(challenge_id, unix_seconds())?
            .ok_or(AuthError::ChallengeNotFound)?;
        self.store.save_account(&account)?;
        self.rotate_session()
    }

    pub fn consume_challenge(
        &self,
        challenge_id: &str,
        now: u64,
    ) -> Result<ChallengeRecord, AuthError> {
        let challenge = self
            .store
            .consume_challenge_record()?
            .ok_or(AuthError::ChallengeNotFound)?;
        if challenge.challenge_id != challenge_id {
            return Err(AuthError::ChallengeMismatch);
        }
        if challenge.expires_at <= now {
            return Err(AuthError::ChallengeExpired);
        }
        Ok(challenge)
    }

    fn rotate_session(&self) -> Result<StoredSession, AuthError> {
        let created_at = unix_seconds();
        let session = StoredSession {
            version: RECORD_VERSION,
            token: Uuid::new_v4().to_string(),
            user: "local".into(),
            created_at,
            expires_at: created_at.saturating_add(self.session_ttl),
        };
        self.store.save_session(&session)?;
        Ok(session)
    }
}

fn parse_session_ttl(value: Option<String>) -> Result<u64, AuthError> {
    let ttl = value
        .map(|value| {
            value.parse::<u64>().map_err(|_| {
                AuthError::Configuration("LIROX_SESSION_TTL_SECONDS must be an integer".into())
            })
        })
        .transpose()?
        .unwrap_or(2_592_000);
    (ttl > 0).then_some(ttl).ok_or_else(|| {
        AuthError::Configuration("LIROX_SESSION_TTL_SECONDS must be greater than zero".into())
    })
}

static PERSISTENCE_LOCK: Mutex<()> = Mutex::new(());

impl AuthStore {
    pub fn new(paths: RuntimePaths) -> Self {
        Self { paths }
    }

    pub fn load_account(&self) -> io::Result<Option<AccountRecord>> {
        self.load("account.json", parse_account)
    }

    pub fn save_account(&self, account: &AccountRecord) -> io::Result<()> {
        self.save("account.json", account, serialize_account)
    }

    pub fn load_challenge(&self) -> io::Result<Option<ChallengeRecord>> {
        let _lock = PERSISTENCE_LOCK
            .lock()
            .map_err(|_| io::Error::other("auth persistence lock poisoned"))?;
        for name in self.challenge_names()? {
            let Some(challenge) = self.load(&name, parse_challenge_record)? else {
                continue;
            };
            if challenge.expires_at <= unix_seconds() {
                self.remove(&name)?;
                continue;
            }
            return Ok(Some(challenge));
        }
        Ok(None)
    }

    fn load_challenge_matching(&self, challenge_id: &str) -> io::Result<Option<ChallengeRecord>> {
        let _lock = PERSISTENCE_LOCK
            .lock()
            .map_err(|_| io::Error::other("auth persistence lock poisoned"))?;
        let name = Self::challenge_name(challenge_id);
        let name = if self.record_path(&name).is_file() {
            name
        } else {
            "challenge.json".to_string()
        };
        let Some(challenge) = self.load(&name, parse_challenge_record)? else {
            return Ok(None);
        };
        if challenge.expires_at <= unix_seconds() {
            self.remove(&name)?;
            return Ok(None);
        }
        Ok((challenge.challenge_id == challenge_id).then_some(challenge))
    }

    pub fn save_challenge(&self, challenge: &ChallengeRecord) -> io::Result<()> {
        self.save(
            &Self::challenge_name(&challenge.challenge_id),
            challenge,
            serialize_challenge,
        )
    }

    pub fn consume_challenge(&self, now: u64) -> io::Result<Option<ChallengeRecord>> {
        let _lock = PERSISTENCE_LOCK
            .lock()
            .map_err(|_| io::Error::other("auth persistence lock poisoned"))?;
        for name in self.challenge_names()? {
            let Some(challenge) = self.load(&name, parse_challenge_record)? else {
                continue;
            };
            self.remove(&name)?;
            return Ok((challenge.expires_at > now).then_some(challenge));
        }
        Ok(None)
    }

    fn consume_challenge_record(&self) -> io::Result<Option<ChallengeRecord>> {
        let _lock = PERSISTENCE_LOCK
            .lock()
            .map_err(|_| io::Error::other("auth persistence lock poisoned"))?;
        for name in self.challenge_names()? {
            if let Some(challenge) = self.load(&name, parse_challenge_record)? {
                self.remove(&name)?;
                return Ok(Some(challenge));
            }
        }
        Ok(None)
    }

    fn consume_challenge_record_matching(
        &self,
        challenge_id: &str,
        now: u64,
    ) -> io::Result<Option<ChallengeRecord>> {
        let _lock = PERSISTENCE_LOCK
            .lock()
            .map_err(|_| io::Error::other("auth persistence lock poisoned"))?;
        let name = Self::challenge_name(challenge_id);
        let name = if self.record_path(&name).is_file() {
            name
        } else {
            "challenge.json".to_string()
        };
        let Some(challenge) = self.load(&name, parse_challenge_record)? else {
            return Ok(None);
        };
        if challenge.challenge_id != challenge_id || challenge.expires_at <= now {
            return Ok(None);
        }
        self.remove(&name)?;
        Ok(Some(challenge))
    }

    fn challenge_name(challenge_id: &str) -> String {
        format!("challenge-{challenge_id}.json")
    }

    fn challenge_names(&self) -> io::Result<Vec<String>> {
        let parent = self
            .paths
            .config_file
            .parent()
            .unwrap_or_else(|| Path::new("."));
        let mut names = Vec::new();
        if self.record_path("challenge.json").is_file() {
            names.push("challenge.json".to_string());
        }
        if let Ok(entries) = fs::read_dir(parent) {
            for entry in entries {
                let name = entry?.file_name().to_string_lossy().into_owned();
                if name.starts_with("challenge-") && name.ends_with(".json") {
                    names.push(name);
                }
            }
        }
        Ok(names)
    }

    pub fn load_session(&self) -> io::Result<Option<StoredSession>> {
        self.load("session.json", parse_session)
    }

    pub fn save_session(&self, session: &StoredSession) -> io::Result<()> {
        self.save("session.json", session, serialize_session)
    }

    pub fn clear_session(&self) -> io::Result<()> {
        let _lock = PERSISTENCE_LOCK
            .lock()
            .map_err(|_| io::Error::other("auth persistence lock poisoned"))?;
        self.remove("session.json")
    }

    fn record_path(&self, name: &str) -> PathBuf {
        self.paths
            .config_file
            .parent()
            .unwrap_or_else(|| Path::new("."))
            .join(name)
    }

    fn load<T>(&self, name: &str, parser: fn(&str) -> io::Result<T>) -> io::Result<Option<T>> {
        match fs::read_to_string(self.record_path(name)) {
            Ok(contents) => parser(&contents).map(Some),
            Err(error) if error.kind() == ErrorKind::NotFound => Ok(None),
            Err(error) => Err(error),
        }
    }

    fn save<T>(
        &self,
        name: &str,
        value: &T,
        serializer: fn(&T) -> io::Result<String>,
    ) -> io::Result<()> {
        let _lock = PERSISTENCE_LOCK
            .lock()
            .map_err(|_| io::Error::other("auth persistence lock poisoned"))?;
        let path = self.record_path(name);
        let parent = path.parent().unwrap_or_else(|| Path::new("."));
        fs::create_dir_all(parent)?;
        let contents = serializer(value)?;
        let (temporary, mut file) = temporary_file(parent, name)?;
        if let Err(error) = file.write_all(contents.as_bytes()) {
            let _ = fs::remove_file(&temporary);
            return Err(error);
        }
        drop(file);
        replace_file(&temporary, &path)
    }

    fn remove(&self, name: &str) -> io::Result<()> {
        match fs::remove_file(self.record_path(name)) {
            Ok(()) => Ok(()),
            Err(error) if error.kind() == ErrorKind::NotFound => Ok(()),
            Err(error) => Err(error),
        }
    }
}

static TEMP_COUNTER: AtomicU64 = AtomicU64::new(0);

fn temporary_file(parent: &Path, name: &str) -> io::Result<(PathBuf, fs::File)> {
    for _ in 0..100 {
        let suffix = TEMP_COUNTER.fetch_add(1, Ordering::Relaxed);
        let path = parent.join(format!(".{name}.{}.{}.tmp", std::process::id(), suffix));
        match fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&path)
        {
            Ok(file) => return Ok((path, file)),
            Err(error) if error.kind() == ErrorKind::AlreadyExists => continue,
            Err(error) => return Err(error),
        }
    }
    Err(io::Error::new(
        ErrorKind::AlreadyExists,
        "could not allocate temporary auth record",
    ))
}

fn replace_file(temporary: &Path, destination: &Path) -> io::Result<()> {
    #[cfg(windows)]
    if destination.exists() {
        let backup = destination.with_file_name(format!(
            ".{}.{}.bak",
            destination
                .file_name()
                .unwrap_or_default()
                .to_string_lossy(),
            TEMP_COUNTER.fetch_add(1, Ordering::Relaxed)
        ));
        fs::rename(destination, &backup)?;
        return match fs::rename(temporary, destination) {
            Ok(()) => fs::remove_file(backup),
            Err(error) => {
                let _ = fs::rename(&backup, destination);
                let _ = fs::remove_file(temporary);
                Err(error)
            }
        };
    }
    match fs::rename(temporary, destination) {
        Ok(()) => Ok(()),
        Err(error) => {
            let _ = fs::remove_file(temporary);
            Err(error)
        }
    }
}

fn unix_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

pub fn bootstrap_response(
    paths: &RuntimePaths,
    authenticated: bool,
    user: Option<String>,
) -> io::Result<BootstrapResponse> {
    let installed = is_installed(paths)?;
    let passkey_exists = AuthStore::new(paths.clone())
        .load_account()?
        .is_some_and(|account| !account.credentials.is_empty());
    let onboarding = persisted_onboarding_status(paths)?;
    let config = load_config(&paths.config_file)?;
    let display_name = fs::read_to_string(paths.config_file.with_file_name("install"))
        .ok()
        .and_then(|contents| install_user_name(&contents));
    Ok(BootstrapResponse {
        installed,
        passkey_exists,
        onboarding: onboarding.clone(),
        authenticated,
        user,
        display_name,
        workspace_root: app_workspace_root(paths)?.to_string_lossy().into_owned(),
        workspace: (onboarding == OnboardingStatus::Complete)
            .then_some(config)
            .flatten()
            .map(|config| GatewayConfigResponse {
                slug: config.workspace_slug,
                name: config.workspace_name,
            }),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;

    fn credential(id: &str) -> CredentialRecord {
        CredentialRecord {
            credential_id: id.to_string(),
            public_key: format!("key-{id}"),
            sign_count: 0,
            label: format!("Passkey {id}"),
        }
    }

    #[test]
    fn bootstrap_status_distinguishes_fresh_registered_and_complete() {
        assert_eq!(
            onboarding_status(false, false),
            OnboardingStatus::NotStarted
        );
        assert_eq!(
            onboarding_status(true, false),
            OnboardingStatus::WorkspaceRequired
        );
        assert_eq!(onboarding_status(true, true), OnboardingStatus::Complete);
    }

    #[test]
    fn install_marker_reads_a_persisted_display_name() {
        assert_eq!(
            install_user_name("installed=true\nuser_name=Example User\n"),
            Some("Example User".into())
        );
        assert_eq!(install_user_name("installed=true\n"), None);
    }

    #[test]
    fn installed_legacy_workspace_requires_fresh_passkey_registration() {
        let root =
            std::env::temp_dir().join(format!("lirox-auth-migration-{}", std::process::id()));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(&root).unwrap();
        let paths = RuntimePaths {
            config_file: root.join("config"),
            default_workspace: root.join("workspace"),
        };
        fs::write(
            paths.config_file.with_file_name("install"),
            "installed=true\n",
        )
        .unwrap();
        fs::write(
            paths.config_file.with_file_name("user"),
            "user=local\npassword_hash=old\n",
        )
        .unwrap();
        assert_eq!(
            persisted_onboarding_status(&paths).unwrap(),
            OnboardingStatus::WorkspaceRequired
        );
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn login_options_are_available_before_workspace_completion() {
        let root =
            std::env::temp_dir().join(format!("lirox-auth-login-gate-{}", std::process::id()));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(&root).unwrap();
        let paths = RuntimePaths {
            config_file: root.join("config"),
            default_workspace: root.join("workspace"),
        };
        fs::write(
            paths.config_file.with_file_name("install"),
            "installed=true\n",
        )
        .unwrap();
        let store = AuthStore::new(paths.clone());
        store
            .save_account(&AccountRecord::with_credential(credential("one")))
            .unwrap();
        let origin = Url::parse("http://localhost:3010").unwrap();
        let webauthn = WebauthnBuilder::new("localhost", &origin)
            .unwrap()
            .build()
            .unwrap();
        let service = AuthService::new(store, webauthn, 60);
        assert!(!matches!(
            service.login_options(),
            Err(AuthError::LoginUnavailable)
        ));
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn credentials_support_multiple_passkeys() {
        let account = AccountRecord::with_credential(credential("one"));
        let account = account.with_credential(credential("two"));
        assert_eq!(account.credentials.len(), 2);
    }

    #[test]
    fn account_records_round_trip_and_reject_malformed_input() {
        let account = AccountRecord::with_credential(credential("one"));
        let encoded = serialize_account(&account).unwrap();
        assert_eq!(parse_account(&encoded).unwrap(), account);
        assert!(parse_account("{\"version\":1,\"credentials\":null}").is_err());

        let duplicate = account.with_credential(credential("one"));
        assert!(parse_account(&serialize_account(&duplicate).unwrap()).is_err());
    }

    #[test]
    fn parsers_reject_invalid_auth_domains() {
        let expired = ChallengeRecord {
            version: 1,
            challenge_id: "challenge-1".into(),
            challenge: "challenge".into(),
            operation: ChallengeOperation::Registration,
            account_id: None,
            expires_at: 1,
        };
        assert!(parse_challenge(&serialize_challenge(&expired).unwrap()).is_err());

        let session = StoredSession {
            version: 1,
            token: "token".into(),
            user: String::new(),
            created_at: 10,
            expires_at: 10,
        };
        assert!(parse_session(&serialize_session(&session).unwrap()).is_err());
    }

    #[test]
    fn consuming_a_challenge_deletes_it_and_rejects_expiry() {
        let root = std::env::temp_dir().join(format!("lirox-auth-consume-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&root);
        let store = AuthStore::new(RuntimePaths {
            config_file: root.join("config"),
            default_workspace: root.join("workspace"),
        });
        let challenge = ChallengeRecord {
            version: 1,
            challenge_id: "challenge-1".into(),
            challenge: "opaque-challenge".into(),
            operation: ChallengeOperation::Registration,
            account_id: None,
            expires_at: u64::MAX,
        };
        store.save_challenge(&challenge).unwrap();
        assert!(store.consume_challenge(100).unwrap().is_some());
        assert!(store.consume_challenge(100).unwrap().is_none());

        let expired = ChallengeRecord {
            expires_at: 1,
            ..challenge
        };
        store.save_challenge(&expired).unwrap();
        assert!(store.consume_challenge(2).unwrap().is_none());
        assert!(store.load_challenge().unwrap().is_none());
        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn challenge_records_do_not_overwrite_each_other() {
        let root =
            std::env::temp_dir().join(format!("lirox-auth-challenges-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&root);
        let store = AuthStore::new(RuntimePaths {
            config_file: root.join("config"),
            default_workspace: root.join("workspace"),
        });
        let first = ChallengeRecord {
            version: 1,
            challenge_id: "first".into(),
            challenge: "one".into(),
            operation: ChallengeOperation::Authentication,
            account_id: Some("account".into()),
            expires_at: u64::MAX,
        };
        let second = ChallengeRecord {
            challenge_id: "second".into(),
            challenge: "two".into(),
            ..first.clone()
        };
        store.save_challenge(&first).unwrap();
        store.save_challenge(&second).unwrap();
        assert_eq!(
            store
                .consume_challenge_record_matching("first", 0)
                .unwrap()
                .unwrap()
                .challenge,
            "one"
        );
        assert_eq!(store.load_challenge().unwrap().unwrap().challenge, "two");
        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn auth_store_round_trips_records_below_runtime_directory() {
        let root = std::env::temp_dir().join(format!("lirox-auth-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&root);
        let paths = RuntimePaths {
            config_file: root.join("nested/config"),
            default_workspace: root.join("workspace"),
        };
        let store = AuthStore::new(paths.clone());
        let account = AccountRecord::with_credential(credential("one"));
        let challenge = ChallengeRecord {
            version: 1,
            challenge_id: "challenge-1".into(),
            challenge: "opaque-challenge".into(),
            operation: ChallengeOperation::Registration,
            account_id: None,
            expires_at: u64::MAX,
        };
        let session = StoredSession {
            version: 1,
            token: "opaque-session".into(),
            user: "local".into(),
            created_at: 1,
            expires_at: u64::MAX,
        };

        store.save_account(&account).unwrap();
        store.save_challenge(&challenge).unwrap();
        store.save_session(&session).unwrap();

        assert_eq!(store.load_account().unwrap(), Some(account));
        assert_eq!(store.load_challenge().unwrap(), Some(challenge));
        assert_eq!(store.load_session().unwrap(), Some(session));
        assert!(root.join("nested/account.json").exists());
        assert!(!std::fs::read_to_string(root.join("nested/account.json"))
            .unwrap()
            .contains("password"));
        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn atomic_save_does_not_reuse_an_existing_temp_file() {
        let root = std::env::temp_dir().join(format!("lirox-auth-atomic-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&root);
        let paths = RuntimePaths {
            config_file: root.join("config"),
            default_workspace: root.join("workspace"),
        };
        std::fs::create_dir_all(&root).unwrap();
        std::fs::write(root.join(".account.json.0.tmp"), "sentinel").unwrap();
        AuthStore::new(paths)
            .save_account(&AccountRecord::with_credential(credential("one")))
            .unwrap();
        assert_eq!(
            parse_account(&std::fs::read_to_string(root.join("account.json")).unwrap())
                .unwrap()
                .credentials[0]
                .credential_id,
            "one"
        );
        assert_eq!(
            std::fs::read_to_string(root.join(".account.json.0.tmp")).unwrap(),
            "sentinel"
        );
        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn concurrent_challenge_consumption_succeeds_once() {
        let root = std::env::temp_dir().join(format!(
            "lirox-auth-concurrent-{}-{}",
            std::process::id(),
            TEMP_COUNTER.fetch_add(1, Ordering::Relaxed)
        ));
        let _ = std::fs::remove_dir_all(&root);
        let store = Arc::new(AuthStore::new(RuntimePaths {
            config_file: root.join("config"),
            default_workspace: root.join("workspace"),
        }));
        store
            .save_challenge(&ChallengeRecord {
                version: 1,
                challenge_id: "challenge-1".into(),
                challenge: "opaque-challenge".into(),
                operation: ChallengeOperation::Registration,
                account_id: None,
                expires_at: u64::MAX,
            })
            .unwrap();

        let first = Arc::clone(&store);
        let second = Arc::clone(&store);
        let first = std::thread::spawn(move || first.consume_challenge(1).unwrap());
        let second = std::thread::spawn(move || second.consume_challenge(1).unwrap());
        let consumed = [first.join().unwrap(), second.join().unwrap()]
            .into_iter()
            .flatten()
            .count();
        assert_eq!(consumed, 1);
        let _ = std::fs::remove_dir_all(root);
    }

    fn test_service_at(_now: u64) -> AuthService {
        let root = std::env::temp_dir().join(format!("lirox-auth-service-{}", Uuid::new_v4()));
        let store = AuthStore::new(RuntimePaths {
            config_file: root.join("config"),
            default_workspace: root.join("workspace"),
        });
        let origin = Url::parse("http://localhost:3010").unwrap();
        let webauthn = WebauthnBuilder::new("localhost", &origin)
            .unwrap()
            .build()
            .unwrap();
        AuthService::new(store, webauthn, 2_592_000)
    }

    fn challenge(id: &str, expires_at: u64) -> ChallengeRecord {
        ChallengeRecord {
            version: RECORD_VERSION,
            challenge_id: id.into(),
            challenge: "state".into(),
            operation: ChallengeOperation::Registration,
            account_id: None,
            expires_at,
        }
    }

    #[test]
    fn expired_challenge_is_rejected() {
        let service = test_service_at(100);
        service.store_registration_challenge(challenge("c", 90));
        assert!(matches!(
            service.consume_challenge("c", 100),
            Err(AuthError::ChallengeExpired)
        ));
    }

    #[test]
    fn challenge_cannot_be_consumed_twice() {
        let service = test_service_at(100);
        service.store_registration_challenge(challenge("c", 200));
        service.consume_challenge("c", 100).unwrap();
        assert!(matches!(
            service.consume_challenge("c", 100),
            Err(AuthError::ChallengeNotFound)
        ));
    }

    #[test]
    fn invalid_session_ttl_configuration_is_rejected() {
        assert!(matches!(
            parse_session_ttl(Some("not-a-number".into())),
            Err(AuthError::Configuration(_))
        ));
        assert!(matches!(
            parse_session_ttl(Some("0".into())),
            Err(AuthError::Configuration(_))
        ));
    }

    #[test]
    fn registration_challenge_persists_account_association() {
        let service = test_service_at(100);
        let (challenge_id, _) = service.registration_options().unwrap();
        let challenge = service.store.load_challenge().unwrap().unwrap();
        assert_eq!(challenge.challenge_id, challenge_id);
        assert!(challenge.account_id.is_some());
    }
}
