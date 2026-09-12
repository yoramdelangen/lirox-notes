use crate::{is_installed, load_config, RuntimePaths};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::{
    fs,
    io::{self, ErrorKind},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

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
    pub credentials: Vec<CredentialRecord>,
}

impl AccountRecord {
    pub fn with_credential(credential: CredentialRecord) -> Self {
        Self {
            version: RECORD_VERSION,
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
    pub onboarding: OnboardingStatus,
    pub authenticated: bool,
    pub user: Option<String>,
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

pub fn serialize_account(account: &AccountRecord) -> io::Result<String> {
    serialize(account)
}

pub fn parse_account(input: &str) -> io::Result<AccountRecord> {
    let account: AccountRecord = parse(input)?;
    if account.version != RECORD_VERSION
        || account.credentials.iter().any(|credential| {
            credential.credential_id.trim().is_empty() || credential.public_key.trim().is_empty()
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
    let challenge: ChallengeRecord = parse(input)?;
    if challenge.version != RECORD_VERSION || challenge.challenge_id.trim().is_empty() {
        return invalid_record();
    }
    Ok(challenge)
}

pub fn serialize_session(session: &StoredSession) -> io::Result<String> {
    serialize(session)
}

pub fn parse_session(input: &str) -> io::Result<StoredSession> {
    let session: StoredSession = parse(input)?;
    if session.version != RECORD_VERSION || session.token.trim().is_empty() {
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
        self.load("challenge.json", parse_challenge)
    }

    pub fn save_challenge(&self, challenge: &ChallengeRecord) -> io::Result<()> {
        self.save("challenge.json", challenge, serialize_challenge)
    }

    pub fn load_session(&self) -> io::Result<Option<StoredSession>> {
        self.load("session.json", parse_session)
    }

    pub fn save_session(&self, session: &StoredSession) -> io::Result<()> {
        self.save("session.json", session, serialize_session)
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
        let path = self.record_path(name);
        let parent = path.parent().unwrap_or_else(|| Path::new("."));
        fs::create_dir_all(parent)?;
        let temporary = parent.join(format!(".{name}.{}.tmp", unique_suffix()));
        fs::write(&temporary, serializer(value)?)?;
        fs::rename(temporary, path)
    }
}

fn unique_suffix() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos()
}

pub fn bootstrap_response(
    paths: &RuntimePaths,
    authenticated: bool,
    user: Option<String>,
) -> io::Result<BootstrapResponse> {
    let installed = is_installed(paths)?;
    let account = AuthStore::new(paths.clone()).load_account()?;
    let config = load_config(&paths.config_file)?;
    let registered = account.is_some_and(|account| !account.credentials.is_empty());
    Ok(BootstrapResponse {
        installed,
        onboarding: onboarding_status(registered, config.is_some()),
        authenticated,
        user,
        workspace_root: paths.default_workspace.to_string_lossy().into_owned(),
        workspace: config.map(|config| GatewayConfigResponse {
            slug: config.workspace_slug,
            name: config.workspace_name,
        }),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

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
            expires_at: 100,
        };
        let session = StoredSession {
            version: 1,
            token: "opaque-session".into(),
            user: "local".into(),
            created_at: 1,
            expires_at: 100,
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
}
