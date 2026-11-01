//! In-process Git operations (libgit2), including credential selection and
//! SSH host-key verification. The server never shells out to `git`.

use base64::{engine::general_purpose::STANDARD, Engine};
use git2::{
    build::{CheckoutBuilder, RepoBuilder},
    cert::Cert,
    CertificateCheckStatus, ConfigLevel, Cred, CredentialType, ErrorCode, FetchOptions,
    PushOptions, RemoteCallbacks, Repository, StatusOptions,
};
use hmac::{Hmac, Mac};
use sha1::Sha1;
use std::{
    cell::{Cell, RefCell},
    env, fs, io,
    path::{Path, PathBuf},
    sync::Once,
    time::{Duration, Instant},
};

/// Git credential configuration, read from the environment.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct GitEnv {
    pub ssh_key: Option<PathBuf>,
    pub ssh_agent: bool,
    pub home: Option<PathBuf>,
    pub token: Option<String>,
    pub username: String,
    pub token_hosts: Vec<String>,
    pub known_hosts: Option<PathBuf>,
}

impl GitEnv {
    pub fn from_env() -> Self {
        let non_empty = |name: &str| env::var(name).ok().filter(|value| !value.trim().is_empty());
        let home = env::var_os("HOME").map(PathBuf::from);
        GitEnv {
            ssh_key: non_empty("LIROX_GIT_SSH_KEY").map(PathBuf::from),
            ssh_agent: env::var_os("SSH_AUTH_SOCK").is_some(),
            known_hosts: non_empty("LIROX_GIT_KNOWN_HOSTS")
                .map(PathBuf::from)
                .or_else(|| home.as_ref().map(|home| home.join(".ssh/known_hosts"))),
            home,
            token: non_empty("LIROX_GIT_TOKEN"),
            username: non_empty("LIROX_GIT_USERNAME").unwrap_or_else(|| "x-access-token".into()),
            token_hosts: non_empty("LIROX_GIT_TOKEN_HOSTS")
                .unwrap_or_else(|| "github.com".into())
                .split(',')
                .map(|host| host.trim().to_ascii_lowercase())
                .filter(|host| !host.is_empty())
                .collect(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Credential {
    SshKey {
        username: String,
        private_key: PathBuf,
    },
    SshAgent {
        username: String,
    },
    Token {
        username: String,
        token: String,
    },
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Transport {
    Ssh,
    Https,
    Other,
}

/// Transport, host and port of a remote URL, including scp-like
/// `user@host:path` remotes.
fn remote_endpoint(url: &str) -> Option<(Transport, String, u16)> {
    let (transport, rest, default_port) = if let Some(rest) = url.strip_prefix("ssh://") {
        (Transport::Ssh, rest, 22)
    } else if let Some(rest) = url.strip_prefix("https://") {
        (Transport::Https, rest, 443)
    } else if url.contains("://") {
        return Some((Transport::Other, String::new(), 0));
    } else {
        // scp-like: [user@]host:path
        let (authority, _) = url.split_once(':')?;
        let host = authority.rsplit('@').next()?;
        return Some((Transport::Ssh, host.to_ascii_lowercase(), 22));
    };
    let authority = rest.split('/').next()?;
    let host_port = authority.rsplit('@').next()?;
    let (host, port) = match host_port.rsplit_once(':') {
        Some((host, port)) if !host.ends_with(']') || host.starts_with('[') => {
            (host, port.parse().ok()?)
        }
        _ => (host_port, default_port),
    };
    Some((
        transport,
        host.trim_matches(['[', ']']).to_ascii_lowercase(),
        port,
    ))
}

/// Credentials to offer for `url`, in order. The list is finite so a
/// rejecting server cannot make the credential callback loop forever.
pub fn credential_candidates(
    url: &str,
    url_username: Option<&str>,
    env: &GitEnv,
    exists: impl Fn(&Path) -> bool,
) -> Vec<Credential> {
    let Some((transport, host, _)) = remote_endpoint(url) else {
        return Vec::new();
    };
    match transport {
        Transport::Ssh => {
            let username = url_username.unwrap_or("git").to_string();
            let mut candidates = Vec::new();
            if let Some(key) = &env.ssh_key {
                candidates.push(Credential::SshKey {
                    username: username.clone(),
                    private_key: key.clone(),
                });
            }
            if env.ssh_agent {
                candidates.push(Credential::SshAgent {
                    username: username.clone(),
                });
            }
            if let Some(home) = &env.home {
                for name in ["id_ed25519", "id_rsa"] {
                    let key = home.join(".ssh").join(name);
                    if exists(&key) {
                        candidates.push(Credential::SshKey {
                            username: username.clone(),
                            private_key: key,
                        });
                    }
                }
            }
            candidates
        }
        Transport::Https => match &env.token {
            Some(token) if env.token_hosts.contains(&host) => {
                vec![Credential::Token {
                    username: env.username.clone(),
                    token: token.clone(),
                }]
            }
            _ => Vec::new(),
        },
        Transport::Other => Vec::new(),
    }
}

fn next_credential(candidates: &[Credential], attempt: usize) -> Option<&Credential> {
    candidates.get(attempt)
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum HostKeyCheck {
    Match,
    Mismatch,
    Unknown,
}

fn host_pattern_matches(pattern: &str, host: &str, port: u16) -> bool {
    let name = if port == 22 {
        host.to_string()
    } else {
        format!("[{host}]:{port}")
    };
    if let Some(hashed) = pattern.strip_prefix("|1|") {
        let Some((salt, hash)) = hashed.split_once('|') else {
            return false;
        };
        let (Ok(salt), Ok(hash)) = (STANDARD.decode(salt), STANDARD.decode(hash)) else {
            return false;
        };
        let Ok(mut mac) = Hmac::<Sha1>::new_from_slice(&salt) else {
            return false;
        };
        mac.update(name.as_bytes());
        return mac.verify_slice(&hash).is_ok();
    }
    pattern.split(',').any(|candidate| {
        let candidate = candidate.to_ascii_lowercase();
        candidate == name || (port == 22 && candidate == format!("[{host}]:22"))
    })
}

/// Checks a server's host key against `known_hosts` content.
pub fn check_host_key(
    known_hosts: &str,
    host: &str,
    port: u16,
    key_type: &str,
    key: &[u8],
) -> HostKeyCheck {
    let host = host.to_ascii_lowercase();
    let mut result = HostKeyCheck::Unknown;
    for line in known_hosts.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let mut fields = line.split_whitespace();
        let mut first = fields.next().unwrap_or_default();
        let marker = first.starts_with('@').then_some(first);
        if marker.is_some() {
            first = fields.next().unwrap_or_default();
        }
        let (Some(entry_type), Some(entry_key)) = (fields.next(), fields.next()) else {
            continue;
        };
        // Entries of another key type say nothing about this key (OpenSSH
        // treats the offered type as unknown, not as a changed key).
        if entry_type != key_type || !host_pattern_matches(first, &host, port) {
            continue;
        }
        let same_key = STANDARD
            .decode(entry_key)
            .is_ok_and(|decoded| decoded == key);
        match marker {
            Some("@revoked") if same_key => return HostKeyCheck::Mismatch,
            Some(_) => {}
            None if same_key => result = HostKeyCheck::Match,
            None if result == HostKeyCheck::Unknown => result = HostKeyCheck::Mismatch,
            None => {}
        }
    }
    result
}

const DEFAULT_NAME: &str = "LiroxNotes";
const DEFAULT_EMAIL: &str = "liroxnotes@example.local";

fn io_error(error: git2::Error) -> io::Error {
    io::Error::other(error.message().to_string())
}

fn open(path: &Path) -> io::Result<Repository> {
    Repository::discover(path).map_err(io_error)
}

fn workdir(repository: &Repository) -> io::Result<PathBuf> {
    repository
        .workdir()
        .map(Path::to_path_buf)
        .ok_or_else(|| io::Error::other("repository has no working directory"))
}

/// Whether `path` is inside a Git working tree (searching parent directories).
pub fn is_inside_repository(path: &Path) -> bool {
    open(path).is_ok_and(|repository| !repository.is_bare())
}

pub fn init(path: &Path) -> io::Result<()> {
    Repository::init(path).map(|_| ()).map_err(io_error)
}

pub fn repository_root(path: &Path) -> io::Result<PathBuf> {
    let root = workdir(&open(path)?)?;
    Ok(root.components().collect())
}

pub fn current_branch(path: &Path) -> io::Result<String> {
    let repository = open(path)?;
    let branch = match repository.head() {
        Ok(head) => Ok(head.shorthand().unwrap_or("HEAD").to_string()),
        // Unborn branch: HEAD still names its symbolic target.
        Err(error) if error.code() == ErrorCode::UnbornBranch => {
            let head = repository.find_reference("HEAD").map_err(io_error)?;
            let target = head
                .symbolic_target()
                .ok()
                .flatten()
                .ok_or_else(|| io::Error::other("HEAD is not a branch"))?;
            Ok(target.trim_start_matches("refs/heads/").to_string())
        }
        Err(error) => Err(io_error(error)),
    };
    branch
}

pub fn origin_url(path: &Path) -> io::Result<String> {
    let repository = open(path)?;
    let remote = repository.find_remote("origin").map_err(io_error)?;
    remote
        .url()
        .map(str::to_string)
        .map_err(|_| io::Error::other("origin has no URL"))
}

pub fn set_origin(path: &Path, url: &str) -> io::Result<()> {
    let repository = open(path)?;
    if repository.find_remote("origin").is_ok() {
        repository.remote_set_url("origin", url).map_err(io_error)
    } else {
        repository
            .remote("origin", url)
            .map(|_| ())
            .map_err(io_error)
    }
}

pub fn remove_origin(path: &Path) -> io::Result<()> {
    open(path)?.remote_delete("origin").map_err(io_error)
}

/// Number of entries `git status --porcelain` would print.
pub fn changed_count(path: &Path) -> io::Result<usize> {
    let repository = open(path)?;
    let mut options = StatusOptions::new();
    options
        .include_untracked(true)
        .recurse_untracked_dirs(false)
        .include_ignored(false);
    let count = repository
        .statuses(Some(&mut options))
        .map_err(io_error)?
        .len();
    Ok(count)
}

fn ensure_identity(repository: &Repository) -> io::Result<()> {
    let config = repository.config().map_err(io_error)?;
    let mut local = config.open_level(ConfigLevel::Local).map_err(io_error)?;
    for (key, default) in [("user.name", DEFAULT_NAME), ("user.email", DEFAULT_EMAIL)] {
        if local.get_string(key).map_or(true, |value| value.is_empty()) {
            local.set_str(key, default).map_err(io_error)?;
        }
    }
    Ok(())
}

/// Stages and commits `paths` (relative to `path`, which may be a
/// subdirectory of the working tree), including deletions. Returns `false`
/// when none of them changed.
pub fn commit_paths(path: &Path, paths: &[PathBuf]) -> io::Result<bool> {
    let Some(first) = paths.first() else {
        return Ok(false);
    };
    let repository = open(path)?;
    let root = fs::canonicalize(workdir(&repository)?)?;
    let prefix = fs::canonicalize(path)?
        .strip_prefix(&root)
        .map(Path::to_path_buf)
        .map_err(|_| io::Error::other("workspace is outside the repository"))?;
    let relative: Vec<PathBuf> = paths.iter().map(|path| prefix.join(path)).collect();

    let mut options = StatusOptions::new();
    options
        .include_untracked(true)
        .recurse_untracked_dirs(true)
        .disable_pathspec_match(true);
    for path in &relative {
        options.pathspec(path);
    }
    if repository
        .statuses(Some(&mut options))
        .map_err(io_error)?
        .is_empty()
    {
        return Ok(false);
    }

    ensure_identity(&repository)?;
    let mut index = repository.index().map_err(io_error)?;
    for path in &relative {
        if root.join(path).exists() {
            index.add_path(path).map_err(io_error)?;
        } else if index.get_path(path, 0).is_some() {
            index.remove_path(path).map_err(io_error)?;
        }
    }
    index.write().map_err(io_error)?;
    let tree = repository
        .find_tree(index.write_tree().map_err(io_error)?)
        .map_err(io_error)?;
    let signature = repository.signature().map_err(io_error)?;
    let parent = repository
        .head()
        .ok()
        .and_then(|head| head.peel_to_commit().ok());
    let parents: Vec<&git2::Commit> = parent.iter().collect();
    repository
        .commit(
            Some("HEAD"),
            &signature,
            &signature,
            &format!("Update {}", first.to_string_lossy()),
            &tree,
            &parents,
        )
        .map_err(io_error)?;
    Ok(true)
}

/// Commits on HEAD that `origin/<branch>` does not have; every commit when
/// there is no tracking ref yet.
pub fn unpushed_count(path: &Path, branch: &str) -> io::Result<usize> {
    let repository = open(path)?;
    let Ok(head) = repository.head() else {
        return Ok(0);
    };
    let mut walk = repository.revwalk().map_err(io_error)?;
    walk.push(head.peel_to_commit().map_err(io_error)?.id())
        .map_err(io_error)?;
    if let Ok(tracking) = repository.find_reference(&format!("refs/remotes/origin/{branch}")) {
        walk.hide(tracking.peel_to_commit().map_err(io_error)?.id())
            .map_err(io_error)?;
    }
    Ok(walk.count())
}

const NETWORK_TIMEOUT: Duration = Duration::from_secs(60);

fn configure_timeouts() {
    static ONCE: Once = Once::new();
    ONCE.call_once(|| {
        // SAFETY: called once, before any network operation starts.
        unsafe {
            let _ = git2::opts::set_server_connect_timeout_in_milliseconds(15_000);
            let _ = git2::opts::set_server_timeout_in_milliseconds(60_000);
        }
    });
}

/// State shared by the callbacks of one network operation.
struct Session<'a> {
    url: String,
    env: &'a GitEnv,
    attempt: Cell<usize>,
    deadline: Instant,
    timed_out: Cell<bool>,
    rejected: RefCell<Option<String>>,
    /// libgit2 replaces callback error messages; keep ours to report it.
    host_key_error: RefCell<Option<String>>,
}

impl<'a> Session<'a> {
    fn new(url: &str, env: &'a GitEnv) -> Self {
        configure_timeouts();
        Session {
            url: url.to_string(),
            env,
            attempt: Cell::new(0),
            deadline: Instant::now() + NETWORK_TIMEOUT,
            timed_out: Cell::new(false),
            rejected: RefCell::new(None),
            host_key_error: RefCell::new(None),
        }
    }

    fn in_time(&self) -> bool {
        let in_time = Instant::now() < self.deadline;
        if !in_time {
            self.timed_out.set(true);
        }
        in_time
    }

    fn credential(
        &self,
        url: &str,
        url_username: Option<&str>,
        allowed: CredentialType,
    ) -> Result<Cred, git2::Error> {
        if allowed.contains(CredentialType::USERNAME) {
            return Cred::username(url_username.unwrap_or("git"));
        }
        // `url` is the URL libgit2 is authenticating against, which differs
        // from the configured remote after a redirect.
        let candidates = credential_candidates(url, url_username, self.env, |path| path.is_file());
        loop {
            let attempt = self.attempt.get();
            self.attempt.set(attempt + 1);
            let Some(candidate) = next_credential(&candidates, attempt) else {
                return Err(git2::Error::from_str(&format!(
                    "authentication failed for {}; check LIROX_GIT_SSH_KEY or LIROX_GIT_TOKEN",
                    self.url
                )));
            };
            match candidate {
                Credential::SshKey {
                    username,
                    private_key,
                } if allowed.contains(CredentialType::SSH_KEY) => {
                    return Cred::ssh_key(username, None, private_key, None)
                }
                Credential::SshAgent { username } if allowed.contains(CredentialType::SSH_KEY) => {
                    return Cred::ssh_key_from_agent(username)
                }
                Credential::Token { username, token }
                    if allowed.contains(CredentialType::USER_PASS_PLAINTEXT) =>
                {
                    return Cred::userpass_plaintext(username, token)
                }
                _ => {}
            }
        }
    }

    fn certificate(
        &self,
        cert: &Cert<'_>,
        host: &str,
    ) -> Result<CertificateCheckStatus, git2::Error> {
        let Some(hostkey) = cert.as_hostkey() else {
            // TLS: libgit2 already validated the chain against the CA store.
            return Ok(CertificateCheckStatus::CertificatePassthrough);
        };
        let (Some(key), Some(key_type)) = (hostkey.hostkey(), hostkey.hostkey_type()) else {
            return Err(git2::Error::from_str(&format!(
                "SSH host key for {host} could not be read"
            )));
        };
        let port = remote_endpoint(&self.url).map_or(22, |(_, _, port)| port);
        let known_hosts = self
            .env
            .known_hosts
            .as_ref()
            .and_then(|path| fs::read_to_string(path).ok())
            .unwrap_or_default();
        let message = match check_host_key(&known_hosts, host, port, key_type.name(), key) {
            HostKeyCheck::Match => return Ok(CertificateCheckStatus::CertificateOk),
            HostKeyCheck::Unknown => format!(
                "unknown SSH host key ({}) for {host}; add it to known_hosts",
                key_type.name()
            ),
            HostKeyCheck::Mismatch => format!("SSH host key for {host} does not match known_hosts"),
        };
        *self.host_key_error.borrow_mut() = Some(message.clone());
        Err(git2::Error::from_str(&message))
    }

    fn callbacks(&self) -> RemoteCallbacks<'_> {
        let mut callbacks = RemoteCallbacks::new();
        callbacks
            .credentials(|url, username, allowed| self.credential(url, username, allowed))
            .certificate_check(|cert, host| self.certificate(cert, host))
            .transfer_progress(|_| self.in_time())
            .sideband_progress(|_| self.in_time())
            .push_update_reference(|reference, status| {
                if let Some(status) = status {
                    *self.rejected.borrow_mut() = Some(format!("{reference}: {status}"));
                }
                Ok(())
            });
        callbacks
    }

    fn fetch_options(&self) -> FetchOptions<'_> {
        let mut options = FetchOptions::new();
        options.remote_callbacks(self.callbacks());
        options
    }

    fn error(&self, operation: &str, error: git2::Error) -> io::Error {
        if self.timed_out.get() {
            io::Error::new(
                io::ErrorKind::TimedOut,
                format!("Git {operation} timed out after 60 seconds"),
            )
        } else if let Some(message) = self.host_key_error.borrow_mut().take() {
            io::Error::other(message)
        } else {
            io_error(error)
        }
    }
}

fn clear_destination(destination: &Path, existed: bool) {
    if !existed {
        let _ = fs::remove_dir_all(destination);
    } else if let Ok(entries) = fs::read_dir(destination) {
        for entry in entries.flatten() {
            let path = entry.path();
            let _ = if path.is_dir() {
                fs::remove_dir_all(path)
            } else {
                fs::remove_file(path)
            };
        }
    }
}

/// Clones `url` at `branch`, falling back to the remote's default branch when
/// `branch` does not exist there.
pub fn clone(url: &str, branch: &str, destination: &Path, env: &GitEnv) -> io::Result<()> {
    let existed = destination.exists();
    let attempt = |branch: Option<&str>| {
        let session = Session::new(url, env);
        let mut builder = RepoBuilder::new();
        builder.fetch_options(session.fetch_options());
        if let Some(branch) = branch {
            builder.branch(branch);
        }
        let result = builder
            .clone(url, destination)
            .map(|_| ())
            .map_err(|error| (error.code(), session.error("clone", error)));
        if result.is_err() {
            clear_destination(destination, existed);
        }
        result
    };
    match attempt(Some(branch)) {
        Err((ErrorCode::NotFound, _)) => attempt(None).map_err(|(_, error)| error),
        result => result.map_err(|(_, error)| error),
    }
}

/// Pushes HEAD to `origin/<branch>`; rejected updates are errors.
pub fn push(path: &Path, branch: &str, env: &GitEnv) -> io::Result<()> {
    let repository = open(path)?;
    let head = repository.head().map_err(io_error)?;
    let head = head
        .name()
        .map_err(|_| io::Error::other("HEAD has no name"))?
        .to_string();
    let mut remote = repository.find_remote("origin").map_err(io_error)?;
    let session = Session::new(remote.url().unwrap_or_default(), env);
    let mut options = PushOptions::new();
    options.remote_callbacks(session.callbacks());
    remote
        .push(&[format!("{head}:refs/heads/{branch}")], Some(&mut options))
        .map_err(|error| session.error("push", error))?;
    if let Some(rejected) = session.rejected.borrow_mut().take() {
        return Err(io::Error::other(format!("push rejected: {rejected}")));
    }
    Ok(())
}

/// Fetches `origin/<branch>` and fast-forwards HEAD; diverged history is an
/// error.
pub fn pull_ff_only(path: &Path, branch: &str, env: &GitEnv) -> io::Result<()> {
    let repository = open(path)?;
    let tracking = format!("refs/remotes/origin/{branch}");
    {
        let mut remote = repository.find_remote("origin").map_err(io_error)?;
        let session = Session::new(remote.url().unwrap_or_default(), env);
        remote
            .fetch(
                &[format!("+refs/heads/{branch}:{tracking}")],
                Some(&mut session.fetch_options()),
                None,
            )
            .map_err(|error| session.error("fetch", error))?;
    }
    let fetched = repository.find_reference(&tracking).map_err(io_error)?;
    let target = repository
        .reference_to_annotated_commit(&fetched)
        .map_err(io_error)?;
    let (analysis, _) = repository.merge_analysis(&[&target]).map_err(io_error)?;
    if analysis.is_up_to_date() {
        return Ok(());
    }
    if !analysis.is_fast_forward() {
        return Err(io::Error::other(format!(
            "Not possible to fast-forward; local and origin/{branch} have diverged"
        )));
    }
    let commit = repository
        .find_object(target.id(), None)
        .map_err(io_error)?;
    repository
        .checkout_tree(&commit, Some(CheckoutBuilder::new().safe()))
        .map_err(io_error)?;
    let mut head = repository.head().map_err(io_error)?;
    head.set_target(
        target.id(),
        &format!("pull: fast-forward to origin/{branch}"),
    )
    .map_err(io_error)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::{engine::general_purpose::STANDARD, Engine};
    use hmac::{Hmac, Mac};
    use sha1::Sha1;
    use std::path::{Path, PathBuf};

    fn env() -> GitEnv {
        GitEnv {
            ssh_key: None,
            ssh_agent: false,
            home: None,
            token: None,
            username: "x-access-token".into(),
            token_hosts: vec!["github.com".into()],
            known_hosts: None,
        }
    }

    #[test]
    fn ssh_url_offers_configured_key_then_agent_then_home_keys() {
        let env = GitEnv {
            ssh_key: Some("/k".into()),
            ssh_agent: true,
            home: Some("/h".into()),
            ..env()
        };
        let candidates = credential_candidates("git@github.com:o/r.git", None, &env, |path| {
            path == Path::new("/h/.ssh/id_ed25519")
        });
        assert_eq!(
            candidates,
            vec![
                Credential::SshKey {
                    username: "git".into(),
                    private_key: PathBuf::from("/k")
                },
                Credential::SshAgent {
                    username: "git".into()
                },
                Credential::SshKey {
                    username: "git".into(),
                    private_key: PathBuf::from("/h/.ssh/id_ed25519")
                },
            ]
        );
    }

    #[test]
    fn ssh_username_comes_from_the_url() {
        let env = GitEnv {
            ssh_agent: true,
            ..env()
        };
        assert_eq!(
            credential_candidates(
                "ssh://deploy@example.com:2222/r.git",
                Some("deploy"),
                &env,
                |_| false
            ),
            vec![Credential::SshAgent {
                username: "deploy".into()
            }]
        );
    }

    #[test]
    fn https_token_only_for_listed_hosts() {
        let env = GitEnv {
            token: Some("t".into()),
            ..env()
        };
        let token = vec![Credential::Token {
            username: "x-access-token".into(),
            token: "t".into(),
        }];
        assert_eq!(
            credential_candidates("https://github.com/o/r.git", None, &env, |_| false),
            token
        );
        assert_eq!(
            credential_candidates("https://GitHub.com/o/r.git", None, &env, |_| false),
            token
        );
        assert!(
            credential_candidates("https://evil.example/o/r.git", None, &env, |_| false).is_empty()
        );
        assert!(
            credential_candidates("https://github.com.evil.example/r.git", None, &env, |_| {
                false
            })
            .is_empty()
        );
        assert!(
            credential_candidates("http://github.com/o/r.git", None, &env, |_| false).is_empty()
        );
    }

    #[test]
    fn token_is_not_sent_to_a_redirect_target_outside_token_hosts() {
        // libgit2 follows an initial redirect and asks for credentials with
        // the redirected URL; the configured remote URL must not decide.
        let env = GitEnv {
            token: Some("t".into()),
            ..env()
        };
        let session = Session::new("https://github.com/o/r.git", &env);
        assert!(session
            .credential(
                "https://evil.example/o/r.git",
                None,
                CredentialType::USER_PASS_PLAINTEXT
            )
            .is_err());
        let session = Session::new("https://github.com/o/r.git", &env);
        assert!(session
            .credential(
                "https://github.com/o/r.git",
                None,
                CredentialType::USER_PASS_PLAINTEXT
            )
            .is_ok());
    }

    #[test]
    fn candidates_are_finite_and_callback_gives_up() {
        let env = GitEnv {
            ssh_key: Some("/k".into()),
            ssh_agent: true,
            home: Some("/h".into()),
            ..env()
        };
        let candidates = credential_candidates("git@github.com:o/r.git", None, &env, |_| true);
        assert!(candidates.len() <= 4);
        assert_eq!(next_credential(&candidates, 0), candidates.first());
        assert_eq!(next_credential(&candidates, candidates.len()), None);
        assert_eq!(next_credential(&candidates, 99), None);
    }

    const KEY: &[u8] = b"host-key-bytes";

    fn line(hosts: &str, key: &[u8]) -> String {
        format!("{hosts} ssh-ed25519 {}\n", STANDARD.encode(key))
    }

    #[test]
    fn plain_entry_matches() {
        let known = format!("# comment\n\n{}", line("gitlab.com,github.com", KEY));
        assert_eq!(
            check_host_key(&known, "github.com", 22, "ssh-ed25519", KEY),
            HostKeyCheck::Match
        );
    }

    #[test]
    fn bracketed_port_entry_matches() {
        let known = line("[git.example.com]:2222", KEY);
        assert_eq!(
            check_host_key(&known, "git.example.com", 2222, "ssh-ed25519", KEY),
            HostKeyCheck::Match
        );
        assert_eq!(
            check_host_key(&known, "git.example.com", 22, "ssh-ed25519", KEY),
            HostKeyCheck::Unknown
        );
        assert_eq!(
            check_host_key(
                &line("[github.com]:22", KEY),
                "github.com",
                22,
                "ssh-ed25519",
                KEY
            ),
            HostKeyCheck::Match
        );
    }

    #[test]
    fn hashed_entry_matches() {
        let salt = [1u8; 20];
        let mut mac = Hmac::<Sha1>::new_from_slice(&salt).unwrap();
        mac.update(b"github.com");
        let hashed = format!(
            "|1|{}|{}",
            STANDARD.encode(salt),
            STANDARD.encode(mac.finalize().into_bytes())
        );
        let known = line(&hashed, KEY);
        assert_eq!(
            check_host_key(&known, "github.com", 22, "ssh-ed25519", KEY),
            HostKeyCheck::Match
        );
        assert_eq!(
            check_host_key(&known, "gitlab.com", 22, "ssh-ed25519", KEY),
            HostKeyCheck::Unknown
        );
    }

    #[test]
    fn changed_key_is_mismatch() {
        let known = line("github.com", KEY);
        assert_eq!(
            check_host_key(&known, "github.com", 22, "ssh-ed25519", b"other"),
            HostKeyCheck::Mismatch
        );
    }

    #[test]
    fn other_key_type_is_unknown_not_mismatch() {
        // Like OpenSSH: a host pinned only with ed25519 that offers an ECDSA
        // key has no key of that type on record, which is not a key change.
        let known = line("github.com", KEY);
        assert_eq!(
            check_host_key(&known, "github.com", 22, "ecdsa-sha2-nistp256", KEY),
            HostKeyCheck::Unknown
        );
    }

    #[test]
    fn missing_host_is_unknown() {
        assert_eq!(
            check_host_key(
                &line("gitlab.com", KEY),
                "github.com",
                22,
                "ssh-ed25519",
                KEY
            ),
            HostKeyCheck::Unknown
        );
        assert_eq!(
            check_host_key("", "github.com", 22, "ssh-ed25519", KEY),
            HostKeyCheck::Unknown
        );
    }

    #[test]
    fn revoked_key_is_mismatch() {
        let known = format!(
            "@revoked {}{}",
            line("github.com", KEY),
            line("github.com", KEY)
        );
        assert_eq!(
            check_host_key(&known, "github.com", 22, "ssh-ed25519", KEY),
            HostKeyCheck::Mismatch
        );
    }

    #[test]
    fn cert_authority_lines_are_ignored() {
        let known = format!("@cert-authority {}", line("github.com", KEY));
        assert_eq!(
            check_host_key(&known, "github.com", 22, "ssh-ed25519", KEY),
            HostKeyCheck::Unknown
        );
    }
}
