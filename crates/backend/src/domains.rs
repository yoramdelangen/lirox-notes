//! The domains (origins) LiroxNotes is served on, which decide where passkeys
//! work. Chosen during onboarding and stored next to the application config;
//! `LIROX_RP_ID` / `LIROX_RP_ORIGIN` override them.

use crate::RuntimePaths;
use std::{fmt, fs, io, io::Write, path::PathBuf};
use uuid::Uuid;
use webauthn_rs::prelude::Url;

/// Origins served before the domain step existed; kept for installs that
/// already registered a passkey without storing domains.
const DEVELOPMENT_ORIGINS: [&str; 2] = ["http://localhost:8989", "http://localhost:3010"];

/// The WebAuthn relying party: the domain passkeys are bound to, and every
/// origin (`scheme://host[:port]`) allowed to use them.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DomainConfig {
    pub rp_id: String,
    pub origins: Vec<String>,
}

impl DomainConfig {
    /// Cookies are `Secure` when the primary origin is HTTPS.
    pub fn secure(&self) -> bool {
        self.origins
            .first()
            .is_some_and(|origin| origin.starts_with("https://"))
    }

    pub fn urls(&self) -> Result<Vec<Url>, DomainError> {
        self.origins
            .iter()
            .map(|origin| Url::parse(origin).map_err(|_| invalid(origin)))
            .collect()
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DomainSource {
    Environment,
    Stored,
    /// Legacy development origins for installs predating the domain step.
    Default,
    None,
}

/// A user-facing reason a domain list was rejected.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DomainError(String);

impl fmt::Display for DomainError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(&self.0)
    }
}

impl std::error::Error for DomainError {}

impl DomainError {
    pub fn new(message: &str) -> Self {
        DomainError(message.to_string())
    }
}

fn invalid(input: &str) -> DomainError {
    DomainError(format!(
        "`{}` is not a URL like https://notes.example.com",
        input.trim()
    ))
}

/// Validates and normalises the domains entered during onboarding. The first
/// origin's host becomes the RP ID; every other origin must be that host or a
/// subdomain of it, because a passkey only works within one RP ID.
pub fn normalize_domains(inputs: &[String]) -> Result<DomainConfig, DomainError> {
    let mut origins: Vec<String> = Vec::new();
    let mut rp_id: Option<String> = None;
    for input in inputs.iter().filter(|input| !input.trim().is_empty()) {
        let url = Url::parse(input.trim()).map_err(|_| invalid(input))?;
        let origin = url.origin().ascii_serialization();
        let host = match url.host() {
            Some(url::Host::Domain(host)) => host.to_string(),
            Some(_) => {
                return Err(DomainError(format!(
                    "`{origin}`: passkeys need a host name, not an IP address"
                )))
            }
            None => return Err(invalid(input)),
        };
        let localhost = host == "localhost" || host.ends_with(".localhost");
        match url.scheme() {
            "https" => {}
            "http" if localhost => {}
            _ => {
                return Err(DomainError(format!(
                    "`{origin}` must use https (plain http only works for localhost)"
                )))
            }
        }
        let rp_id = rp_id.get_or_insert_with(|| host.clone());
        if host != *rp_id && !host.ends_with(&format!(".{rp_id}")) {
            return Err(DomainError(format!(
                "`{origin}` cannot share a passkey with {rp_id}; use {rp_id} or one of its subdomains"
            )));
        }
        if !origins.contains(&origin) {
            origins.push(origin);
        }
    }
    let rp_id = rp_id.ok_or_else(|| DomainError("add at least one domain".into()))?;
    Ok(DomainConfig { rp_id, origins })
}

fn domains_file(paths: &RuntimePaths) -> PathBuf {
    paths.config_file.with_file_name("domains")
}

pub fn load_domains(paths: &RuntimePaths) -> io::Result<Option<DomainConfig>> {
    let contents = match fs::read_to_string(domains_file(paths)) {
        Ok(contents) => contents,
        Err(error) if error.kind() == io::ErrorKind::NotFound => return Ok(None),
        Err(error) => return Err(error),
    };
    let mut rp_id = None;
    let mut origins = Vec::new();
    for line in contents.lines() {
        match line.trim().split_once('=') {
            Some(("rp_id", value)) => rp_id = Some(value.trim().to_string()),
            Some(("origin", value)) => origins.push(value.trim().to_string()),
            _ => {}
        }
    }
    Ok(rp_id
        .filter(|_| !origins.is_empty())
        .map(|rp_id| DomainConfig { rp_id, origins }))
}

pub fn save_domains(paths: &RuntimePaths, config: &DomainConfig) -> io::Result<()> {
    let path = domains_file(paths);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let mut contents = format!("rp_id={}\n", config.rp_id);
    for origin in &config.origins {
        contents.push_str(&format!("origin={origin}\n"));
    }
    let temporary = path.with_file_name(format!(".domains.{}.tmp", Uuid::new_v4()));
    let result = (|| {
        let mut file = fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temporary)?;
        file.write_all(contents.as_bytes())?;
        file.sync_all()?;
        fs::rename(&temporary, &path)
    })();
    if result.is_err() {
        let _ = fs::remove_file(&temporary);
    }
    result
}

/// `LIROX_RP_ID` and `LIROX_RP_ORIGIN` from the environment, when
/// `LIROX_RP_ORIGIN` is set.
pub fn environment_domains() -> Option<(String, String)> {
    let value = |name| {
        std::env::var(name)
            .ok()
            .filter(|value: &String| !value.trim().is_empty())
    };
    environment_pair(value("LIROX_RP_ID"), value("LIROX_RP_ORIGIN"))
}

/// The RP ID defaults to the host of the first origin.
fn environment_pair(rp_id: Option<String>, origins: Option<String>) -> Option<(String, String)> {
    let origins = origins?;
    let rp_id = match rp_id {
        Some(rp_id) => rp_id,
        None => Url::parse(origins.split(',').next()?.trim())
            .ok()?
            .host_str()?
            .to_string(),
    };
    Some((rp_id, origins))
}

/// Picks the domains in effect: the environment, then the stored domains, then
/// (only when a passkey already exists) the legacy development origins.
pub fn resolve_domains(
    environment: Option<(String, String)>,
    stored: Option<DomainConfig>,
    passkey_exists: bool,
) -> Result<(Option<DomainConfig>, DomainSource), DomainError> {
    if let Some((rp_id, origins)) = environment {
        let origins = origins
            .split(',')
            .filter(|origin| !origin.trim().is_empty())
            .map(|origin| {
                Url::parse(origin.trim())
                    .map(|url| url.origin().ascii_serialization())
                    .map_err(|_| invalid(origin))
            })
            .collect::<Result<Vec<_>, _>>()?;
        return Ok((
            Some(DomainConfig {
                rp_id: rp_id.trim().to_string(),
                origins,
            }),
            DomainSource::Environment,
        ));
    }
    if let Some(stored) = stored {
        return Ok((Some(stored), DomainSource::Stored));
    }
    if passkey_exists {
        return Ok((
            Some(DomainConfig {
                rp_id: "localhost".into(),
                origins: DEVELOPMENT_ORIGINS.map(str::to_string).to_vec(),
            }),
            DomainSource::Default,
        ));
    }
    Ok((None, DomainSource::None))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn origins(values: &[&str]) -> Vec<String> {
        values.iter().map(|value| value.to_string()).collect()
    }

    fn strings(config: &DomainConfig) -> Vec<String> {
        config.origins.clone()
    }

    #[test]
    fn origins_are_normalised_deduplicated_and_keep_order() {
        let config = normalize_domains(&origins(&[
            " https://Notes.Example.com/some/path?x=1 ",
            "https://notes.example.com:6789",
            "https://notes.example.com",
        ]))
        .unwrap();

        assert_eq!(config.rp_id, "notes.example.com");
        assert_eq!(
            strings(&config),
            vec![
                "https://notes.example.com",
                "https://notes.example.com:6789"
            ]
        );
    }

    #[test]
    fn localhost_may_use_http_with_a_port() {
        let config = normalize_domains(&origins(&["http://localhost:8989"])).unwrap();
        assert_eq!(config.rp_id, "localhost");
        assert_eq!(strings(&config), vec!["http://localhost:8989"]);
        assert!(!config.secure());
    }

    #[test]
    fn http_is_rejected_for_other_hosts() {
        let error = normalize_domains(&origins(&["http://notes.example.com"])).unwrap_err();
        assert!(error.to_string().contains("https"), "{error}");
    }

    #[test]
    fn ip_addresses_and_odd_schemes_are_rejected() {
        assert!(normalize_domains(&origins(&["http://127.0.0.1:8080"])).is_err());
        assert!(normalize_domains(&origins(&["https://192.168.1.4"])).is_err());
        assert!(normalize_domains(&origins(&["ftp://notes.example.com"])).is_err());
        assert!(normalize_domains(&origins(&["notes.example.com"])).is_err());
        assert!(normalize_domains(&origins(&[])).is_err());
    }

    #[test]
    fn subdomains_of_the_first_host_share_its_passkeys() {
        let config = normalize_domains(&origins(&[
            "https://example.com",
            "https://notes.example.com",
        ]))
        .unwrap();
        assert_eq!(config.rp_id, "example.com");
        assert!(config.secure());
    }

    #[test]
    fn unrelated_domains_are_rejected() {
        for list in [
            ["http://localhost:8989", "https://notes.example.com"],
            ["https://notes.example.com", "https://example.com"],
            ["https://example.com", "https://badexample.com"],
        ] {
            let error = normalize_domains(&origins(&list)).unwrap_err();
            assert!(error.to_string().contains("passkey"), "{list:?}: {error}");
        }
    }

    #[test]
    fn domains_round_trip_through_the_domains_file() {
        let root = std::env::temp_dir().join(format!("lirox-domains-{}", Uuid::new_v4()));
        let paths = crate::RuntimePaths {
            config_file: root.join("config"),
            default_workspace: root.join("data"),
        };
        assert_eq!(load_domains(&paths).unwrap(), None);
        let config = normalize_domains(&origins(&[
            "https://notes.example.com",
            "https://notes.example.com:6789",
        ]))
        .unwrap();

        save_domains(&paths, &config).unwrap();

        assert_eq!(load_domains(&paths).unwrap(), Some(config));
        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn environment_rp_id_defaults_to_the_first_origin_host() {
        assert_eq!(
            environment_pair(
                None,
                Some("https://Notes.example.com:8443, https://x.example.com".into())
            ),
            Some((
                "notes.example.com".into(),
                "https://Notes.example.com:8443, https://x.example.com".into()
            ))
        );
        assert_eq!(
            environment_pair(
                Some("example.com".into()),
                Some("https://notes.example.com".into())
            ),
            Some(("example.com".into(), "https://notes.example.com".into()))
        );
        assert_eq!(environment_pair(Some("example.com".into()), None), None);
        assert_eq!(environment_pair(None, Some("not a url".into())), None);
    }

    #[test]
    fn environment_overrides_stored_domains() {
        let stored = normalize_domains(&origins(&["https://notes.example.com"])).unwrap();
        let (config, source) = resolve_domains(
            Some(("localhost".into(), "http://localhost:8080".into())),
            Some(stored.clone()),
            true,
        )
        .unwrap();
        assert_eq!(source, DomainSource::Environment);
        assert_eq!(config.unwrap().rp_id, "localhost");

        let (config, source) = resolve_domains(None, Some(stored.clone()), true).unwrap();
        assert_eq!(source, DomainSource::Stored);
        assert_eq!(config, Some(stored));
    }

    #[test]
    fn existing_installs_keep_the_development_default() {
        let (config, source) = resolve_domains(None, None, true).unwrap();
        assert_eq!(source, DomainSource::Default);
        assert_eq!(
            strings(&config.unwrap()),
            vec!["http://localhost:8989", "http://localhost:3010"]
        );

        let (config, source) = resolve_domains(None, None, false).unwrap();
        assert_eq!(source, DomainSource::None);
        assert_eq!(config, None);
    }
}
