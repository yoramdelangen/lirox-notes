use std::{
    collections::HashMap,
    env, fs,
    io::Write,
    path::{Component, Path, PathBuf},
    sync::Mutex,
};

pub mod auth;
pub mod workspace;
pub use workspace::{
    changed_count, commit_note, configure_git_remote, configured_profile,
    create_configured_workspace, create_workspace, delete_note_file, ensure_workspace,
    ensure_workspace_for_config, existing_workspaces, inspect_repository, load_repository_config,
    notes_root, pull_workspace, push_workspace, read_note_body, save_note_body,
    save_workspace_theme, unpushed_commit_count, workspace_view_for_config, ExistingWorkspace,
    RepositoryConfig, RepositoryMetadata, RepositoryWorkspace, WorkspaceSetup,
};

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct RuntimePaths {
    pub config_file: PathBuf,
    pub default_workspace: PathBuf,
}

pub fn runtime_paths() -> RuntimePaths {
    let config_file = env::var_os("LIROX_CONFIG_FILE").map(PathBuf::from);
    let default_workspace = env::var_os("LIROX_WORKSPACE_DIR").map(PathBuf::from);

    if cfg!(debug_assertions) {
        return RuntimePaths {
            config_file: config_file.unwrap_or_else(|| PathBuf::from(".lirox-runtime/config")),
            default_workspace: default_workspace
                .unwrap_or_else(|| PathBuf::from(".lirox-runtime/workspace")),
        };
    }

    let home = env::var_os("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."));
    let config_home = env::var_os("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| home.join(".config"));
    let data_home = env::var_os("XDG_DATA_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| home.join(".local/share"));

    RuntimePaths {
        config_file: config_file.unwrap_or_else(|| config_home.join("liroxnotes/config")),
        default_workspace: default_workspace
            .unwrap_or_else(|| data_home.join("liroxnotes/workspace")),
    }
}

/// One workspace registered in the application.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct GatewayConfig {
    pub workspace_slug: String,
    pub workspace_name: String,
    /// The git root of the checkout holding this workspace.
    pub workspace_path: PathBuf,
    /// Where the notes live inside `workspace_path`; empty for the git root.
    pub relative_path: String,
    pub repo_url: String,
    pub branch: String,
}

/// The application's workspace registry. Which folders of a repository are
/// registered as workspaces is application-level state; the repository's own
/// `.lirox.toml` never records it.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct AppConfig {
    pub active: String,
    pub workspaces: Vec<GatewayConfig>,
}

impl AppConfig {
    pub fn active_workspace(&self) -> Option<&GatewayConfig> {
        self.workspaces
            .iter()
            .find(|workspace| workspace.workspace_slug == self.active)
            .or_else(|| self.workspaces.first())
    }

    /// Registers `workspace` (replacing one with the same slug) and makes it active.
    pub fn activate(&mut self, workspace: GatewayConfig) {
        self.active = workspace.workspace_slug.clone();
        match self
            .workspaces
            .iter_mut()
            .find(|registered| registered.workspace_slug == workspace.workspace_slug)
        {
            Some(registered) => *registered = workspace,
            None => self.workspaces.push(workspace),
        }
    }
}

/// Reads the registry. A config written before multiple workspaces existed
/// (flat `workspace_*` keys, no sections) is read as one registered workspace.
pub fn parse_app_config(input: &str) -> AppConfig {
    let mut top = HashMap::new();
    let mut sections: Vec<(String, HashMap<&str, &str>)> = Vec::new();
    for line in input.lines() {
        let line = line.trim();
        if let Some(slug) = line
            .strip_prefix("[workspace.")
            .and_then(|rest| rest.strip_suffix(']'))
        {
            sections.push((slug.trim().to_owned(), HashMap::new()));
            continue;
        }
        let Some((key, value)) = line.split_once('=') else {
            continue;
        };
        match sections.last_mut() {
            Some((_, values)) => values.insert(key.trim(), value.trim()),
            None => top.insert(key.trim(), value.trim()),
        };
    }

    let workspaces: Vec<GatewayConfig> = if sections.is_empty() {
        parse_workspace(None, &top).into_iter().collect()
    } else {
        sections
            .iter()
            .filter_map(|(slug, values)| parse_workspace(Some(slug), values))
            .collect()
    };
    let active = top
        .get("active")
        .map(|slug| slug.to_string())
        .filter(|slug| workspaces.iter().any(|w| &w.workspace_slug == slug))
        .or_else(|| workspaces.first().map(|w| w.workspace_slug.clone()))
        .unwrap_or_default();
    AppConfig { active, workspaces }
}

fn parse_workspace(slug: Option<&str>, values: &HashMap<&str, &str>) -> Option<GatewayConfig> {
    let value = |keys: &[&str]| {
        keys.iter()
            .find_map(|key| values.get(key).copied())
            .filter(|value| !value.is_empty())
    };
    let workspace_path = value(&["repository", "workspace_path"])?;
    let workspace_slug = slug
        .filter(|slug| !slug.is_empty())
        .map(str::to_string)
        .or_else(|| value(&["workspace_slug"]).map(str::to_string))
        .or_else(|| value(&["repo_url"]).and_then(workspace_slug_from_repo_url))
        .unwrap_or_else(|| "workspace".to_string());

    Some(GatewayConfig {
        workspace_slug,
        workspace_name: value(&["name", "workspace_name"])
            .unwrap_or("My Workspace")
            .to_string(),
        workspace_path: PathBuf::from(workspace_path),
        relative_path: value(&["relative_path"]).unwrap_or_default().to_string(),
        repo_url: value(&["repo_url"]).unwrap_or_default().to_string(),
        branch: value(&["branch"]).unwrap_or("main").to_string(),
    })
}

pub fn format_app_config(config: &AppConfig) -> String {
    let mut output = format!("active={}\n", config.active);
    for workspace in &config.workspaces {
        output.push_str(&format!(
            "\n[workspace.{}]\nname={}\nrepository={}\nrelative_path={}\nrepo_url={}\nbranch={}\n",
            workspace.workspace_slug,
            workspace.workspace_name,
            workspace.workspace_path.display(),
            workspace.relative_path,
            workspace.repo_url,
            workspace.branch
        ));
    }
    output
}

/// The repository's own name from an HTTPS, SSH or file URL, e.g.
/// `git@github.com:owner/my-notes.git` -> `my-notes`.
pub fn repository_name_from_url(repo_url: &str) -> Option<String> {
    let tail = repo_url
        .trim()
        .trim_end_matches('/')
        .rsplit(['/', ':'])
        .next()?;
    let repo = tail.strip_suffix(".git").unwrap_or(tail).trim();
    (!repo.is_empty()).then(|| repo.to_owned())
}

pub fn workspace_slug_from_repo_url(repo_url: &str) -> Option<String> {
    slugify(&repository_name_from_url(repo_url)?)
}

pub fn slugify(value: &str) -> Option<String> {
    let mut slug = String::new();
    let mut last_dash = false;
    for ch in value.chars() {
        let normalized = ch.to_ascii_lowercase();
        if normalized.is_ascii_alphanumeric() {
            slug.push(normalized);
            last_dash = false;
        } else if !slug.is_empty() && !last_dash {
            slug.push('-');
            last_dash = true;
        }
    }
    while slug.ends_with('-') {
        slug.pop();
    }
    (!slug.is_empty()).then_some(slug)
}

pub fn load_app_config(path: &Path) -> std::io::Result<AppConfig> {
    match fs::read_to_string(path) {
        Ok(contents) => Ok(parse_app_config(&contents)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(AppConfig::default()),
        Err(error) => Err(error),
    }
}

pub fn save_app_config(path: &Path, config: &AppConfig) -> std::io::Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(path, format_app_config(config))
}

/// The active workspace.
pub fn load_config(path: &Path) -> std::io::Result<Option<GatewayConfig>> {
    Ok(load_app_config(path)?.active_workspace().cloned())
}

/// Registers (or updates) `config` and makes it the active workspace, keeping
/// every other registered workspace.
pub fn save_config(path: &Path, config: &GatewayConfig) -> std::io::Result<()> {
    let mut app = load_app_config(path)?;
    app.activate(config.clone());
    save_app_config(path, &app)
}

/// Makes the registered workspace `slug` active.
pub fn activate_workspace(path: &Path, slug: &str) -> std::io::Result<GatewayConfig> {
    let mut app = load_app_config(path)?;
    let workspace = app
        .workspaces
        .iter()
        .find(|workspace| workspace.workspace_slug == slug)
        .cloned()
        .ok_or_else(|| {
            std::io::Error::new(std::io::ErrorKind::NotFound, "workspace is not registered")
        })?;
    app.active = workspace.workspace_slug.clone();
    save_app_config(path, &app)?;
    Ok(workspace)
}

fn install_file(paths: &RuntimePaths) -> PathBuf {
    paths.config_file.with_file_name("install")
}

pub fn default_workspace_root(paths: &RuntimePaths) -> PathBuf {
    paths.default_workspace.clone()
}

pub fn app_workspace_root(paths: &RuntimePaths) -> std::io::Result<PathBuf> {
    match fs::read_to_string(install_file(paths)) {
        Ok(contents) => Ok(contents
            .lines()
            .find_map(|line| {
                let (key, value) = line.split_once('=')?;
                (key.trim() == "workspace_root" && !value.trim().is_empty())
                    .then(|| PathBuf::from(value.trim()))
            })
            .unwrap_or_else(|| default_workspace_root(paths))),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            if let Some(config) = load_config(&paths.config_file)? {
                Ok(config
                    .workspace_path
                    .parent()
                    .map(PathBuf::from)
                    .unwrap_or_else(|| default_workspace_root(paths)))
            } else {
                Ok(default_workspace_root(paths))
            }
        }
        Err(error) => Err(error),
    }
}

pub fn is_installed(paths: &RuntimePaths) -> std::io::Result<bool> {
    Ok(fs::metadata(install_file(paths)).is_ok() || load_config(&paths.config_file)?.is_some())
}

static INSTALL_MARKER_LOCK: Mutex<()> = Mutex::new(());

pub fn mark_installed(paths: &RuntimePaths, workspace_root: &Path) -> std::io::Result<()> {
    let _lock = INSTALL_MARKER_LOCK
        .lock()
        .map_err(|_| std::io::Error::other("install marker lock poisoned"))?;
    mark_installed_unlocked(paths, workspace_root)
}

fn mark_installed_unlocked(paths: &RuntimePaths, workspace_root: &Path) -> std::io::Result<()> {
    let path = install_file(paths);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let completed = match fs::read_to_string(&path) {
        Ok(contents) => contents
            .lines()
            .any(|line| line.trim() == "onboarding_complete=true"),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => false,
        Err(error) => return Err(error),
    };
    if completed {
        return Ok(());
    }
    fs::write(
        path,
        format!(
            "installed=true\nworkspace_root={}\n",
            workspace_root.display()
        ),
    )
}

pub fn mark_workspace_ready(paths: &RuntimePaths, workspace_root: &Path) -> std::io::Result<()> {
    let _lock = INSTALL_MARKER_LOCK
        .lock()
        .map_err(|_| std::io::Error::other("install marker lock poisoned"))?;
    mark_installed_unlocked(paths, workspace_root)?;
    mark_onboarding_complete_unlocked(paths)
}

fn mark_onboarding_complete_unlocked(paths: &RuntimePaths) -> std::io::Result<()> {
    let path = install_file(paths);
    let contents = fs::read_to_string(&path)?;
    if contents
        .lines()
        .any(|line| line.trim() == "onboarding_complete=true")
    {
        return Ok(());
    }
    let mut file = fs::OpenOptions::new().append(true).open(path)?;
    writeln!(file, "onboarding_complete=true")
}

pub fn safe_note_path(path: &str) -> Option<PathBuf> {
    if path.is_empty() || !path.ends_with(".md") {
        return None;
    }

    let path = Path::new(path);
    if path.is_absolute() {
        return None;
    }

    let mut clean = PathBuf::new();
    for component in path.components() {
        match component {
            Component::Normal(part) => clean.push(part),
            _ => return None,
        }
    }

    Some(clean)
}
