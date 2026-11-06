use liroxnotes_shared::{workspace_view_from_notes, WorkspaceNote};
use serde::{Deserialize, Serialize};
use std::{
    collections::BTreeMap,
    env, fs,
    io::Write,
    path::{Component, Path, PathBuf},
};
use uuid::Uuid;

use crate::{
    git, repository_name_from_url, safe_note_path, slugify, workspace_slug_from_repo_url,
    GatewayConfig,
};

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct WorkspaceSetup {
    pub existing_repository: bool,
    pub slug: String,
    pub name: String,
    pub repo_url: String,
    pub repository_path: String,
    pub workspace_path: String,
    pub branch: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ExistingWorkspace {
    pub repository: String,
    pub branch: String,
    pub path: String,
    pub workspace_name: Option<String>,
}

/// Top-level folders of every cloned repository under `root` that can still be
/// registered as a workspace: hidden folders and folders already registered
/// in the application are left out.
pub fn existing_workspaces(
    root: &Path,
    registered: &[GatewayConfig],
) -> std::io::Result<Vec<ExistingWorkspace>> {
    fs::create_dir_all(root)?;
    let registered: Vec<(PathBuf, PathBuf)> = registered
        .iter()
        .filter_map(|workspace| {
            let repository = fs::canonicalize(&workspace.workspace_path).ok()?;
            Some((repository, PathBuf::from(&workspace.relative_path)))
        })
        .collect();
    let mut repositories = Vec::new();
    discover_repositories(root, &mut repositories)?;
    repositories.sort();
    let mut workspaces = Vec::new();
    for repository in repositories {
        let branch = git::current_branch(&repository).unwrap_or_else(|_| "main".into());
        let repository_name = repository
            .strip_prefix(root)
            .unwrap_or(&repository)
            .to_string_lossy()
            .trim_matches('/')
            .to_string();
        let repository_name = if repository_name.is_empty() {
            ".".into()
        } else {
            repository_name
        };
        let canonical_repository = fs::canonicalize(&repository)?;
        let mut folders: Vec<String> = fs::read_dir(&repository)?
            .filter_map(|entry| {
                let path = entry.ok()?.path();
                let name = path.file_name()?.to_str()?.to_owned();
                (path.is_dir() && !name.starts_with('.')).then_some(name)
            })
            .filter(|name| {
                !registered.iter().any(|(repository, relative_path)| {
                    repository == &canonical_repository && relative_path == Path::new(name)
                })
            })
            .collect();
        folders.sort();
        workspaces.extend(folders.into_iter().map(|path| ExistingWorkspace {
            repository: repository_name.clone(),
            branch: branch.clone(),
            path,
            workspace_name: None,
        }));
    }
    Ok(workspaces)
}

fn discover_repositories(dir: &Path, repositories: &mut Vec<PathBuf>) -> std::io::Result<()> {
    if dir.join(".git").exists() {
        repositories.push(dir.to_path_buf());
        return Ok(());
    }
    for entry in fs::read_dir(dir)? {
        let path = entry?.path();
        if path.is_dir() && path.file_name().and_then(|name| name.to_str()) != Some(".git") {
            discover_repositories(&path, repositories)?;
        }
    }
    Ok(())
}

pub fn create_workspace(
    paths: &crate::RuntimePaths,
    setup: &WorkspaceSetup,
) -> std::io::Result<GatewayConfig> {
    let workspace_root = crate::app_workspace_root(paths)?;
    // `workspace_path` is the git root; the subpath is stored next to it in the
    // application config, relative to that root.
    let (repo_url, workspace_path, relative_path) = if setup.existing_repository {
        let repository_path = validate_repository_path(&setup.repository_path)?;
        let subpath = validate_relative_path(&setup.workspace_path)?;
        let repository = workspace_root.join(repository_path);
        let canonical_root = fs::canonicalize(&workspace_root)?;
        let canonical_repository = fs::canonicalize(&repository)?;
        if !canonical_repository.starts_with(&canonical_root) || !repository.join(".git").exists() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::InvalidInput,
                "repository not found",
            ));
        }
        let repo_url = git::origin_url(&repository).unwrap_or_default();
        (repo_url, repository, subpath)
    } else {
        let slug = slugify(&setup.slug)
            .or_else(|| workspace_slug_from_repo_url(&setup.repo_url))
            .unwrap_or_else(|| "workspace".to_string());
        let subpath = setup.workspace_path.trim().trim_end_matches('/');
        let subpath = if subpath.is_empty() {
            PathBuf::new()
        } else {
            validate_relative_path(subpath)?
        };
        (setup.repo_url.clone(), workspace_root.join(slug), subpath)
    };

    let workspace_slug = slugify(&setup.slug)
        .or_else(|| workspace_slug_from_repo_url(&repo_url))
        .unwrap_or_else(|| "workspace".to_string());
    let config = GatewayConfig {
        workspace_slug,
        workspace_name: if setup.name.trim().is_empty() {
            "My Workspace".into()
        } else {
            setup.name.trim().to_owned()
        },
        workspace_path,
        relative_path: relative_path.to_string_lossy().into_owned(),
        repo_url,
        branch: if setup.branch.trim().is_empty() {
            "main".into()
        } else {
            setup.branch.trim().to_owned()
        },
    };
    let same_location = |workspace: &GatewayConfig| {
        fs::canonicalize(&workspace.workspace_path).ok()
            == fs::canonicalize(&config.workspace_path).ok()
            && workspace.relative_path == config.relative_path
    };
    if crate::load_app_config(&paths.config_file)?
        .workspaces
        .iter()
        .any(|workspace| {
            workspace.workspace_slug == config.workspace_slug && !same_location(workspace)
        })
    {
        return Err(std::io::Error::new(
            std::io::ErrorKind::AlreadyExists,
            "workspace slug is already registered",
        ));
    }
    create_configured_workspace(paths, &config)?;
    Ok(config)
}

fn validate_relative_path(value: &str) -> std::io::Result<PathBuf> {
    if value.trim().is_empty()
        || value.starts_with(['/', '\\'])
        || value
            .split(['/', '\\'])
            .any(|part| matches!(part, "" | "." | ".."))
        || Path::new(value)
            .components()
            .any(|component| !matches!(component, Component::Normal(_)))
    {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "path must be a non-empty relative path",
        ));
    }
    Ok(PathBuf::from(value))
}

fn validate_repository_path(value: &str) -> std::io::Result<PathBuf> {
    if value.trim() == "." {
        Ok(PathBuf::new())
    } else {
        validate_relative_path(value)
    }
}

fn clone_git(repo_url: &str, branch: &str, destination: &Path) -> std::io::Result<()> {
    git::clone(repo_url, branch, destination, &git::GitEnv::from_env())
}

pub fn inspect_repository(repo_url: &str, branch: &str) -> std::io::Result<RepositoryMetadata> {
    let destination = env::temp_dir().join(format!("lirox-inspect-{}", Uuid::new_v4()));
    let result = clone_git(repo_url, branch, &destination).map(|_| {
        let config = [".lirox.toml", ".liroxnotes.toml"]
            .iter()
            .map(|name| destination.join(name))
            .find(|path| path.is_file());
        let mut metadata: RepositoryMetadata = config
            .and_then(|path| fs::read_to_string(path).ok())
            .and_then(|contents| parse_lirox_toml(&contents))
            .unwrap_or_default();
        // Without a configured name, suggest the repository's own name.
        metadata.name = metadata.name.or_else(|| repository_name_from_url(repo_url));
        metadata.slug = metadata
            .slug
            .or_else(|| workspace_slug_from_repo_url(repo_url));
        metadata
    });
    let _ = fs::remove_dir_all(&destination);
    result
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
pub struct RepositoryConfig {
    #[serde(default)]
    pub format_version: u32,
    #[serde(default)]
    pub workspaces: BTreeMap<String, RepositoryWorkspace>,
}

#[derive(Clone, Debug, PartialEq, Eq, Deserialize, Serialize)]
/// Repository-level settings for a workspace slug. Which folder a workspace
/// uses is application-level state and is never stored here.
pub struct RepositoryWorkspace {
    #[serde(default)]
    pub theme: liroxnotes_shared::WorkspaceTheme,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct RepositoryMetadata {
    pub name: Option<String>,
    pub slug: Option<String>,
}

pub fn parse_lirox_toml(input: &str) -> Option<RepositoryMetadata> {
    let document = input.parse::<toml_edit::DocumentMut>().ok()?;
    if let Some(workspaces) = document
        .get("workspaces")
        .and_then(toml_edit::Item::as_table)
    {
        if let Some((slug, workspace)) = workspaces.iter().next() {
            let name = workspace
                .get("name")
                .and_then(toml_edit::Item::as_str)
                .map(str::to_owned);
            return Some(RepositoryMetadata {
                name,
                slug: slugify(slug),
            });
        }
    }
    let workspace = document.get("workspace")?.as_table()?;
    let name = workspace.get("name")?.as_str().map(str::to_owned);
    let slug = workspace
        .get("slug")
        .and_then(toml_edit::Item::as_str)
        .and_then(slugify);
    (name.is_some() || slug.is_some()).then_some(RepositoryMetadata { name, slug })
}

const REPOSITORY_CONFIG_FILE: &str = ".lirox.toml";
const REPOSITORY_CONFIG_VERSION: u32 = 1;

pub fn load_repository_config(root: &Path) -> std::io::Result<RepositoryConfig> {
    let path = root.join(REPOSITORY_CONFIG_FILE);
    let contents = match fs::read_to_string(path) {
        Ok(contents) => contents,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            return Ok(RepositoryConfig {
                format_version: REPOSITORY_CONFIG_VERSION,
                ..RepositoryConfig::default()
            })
        }
        Err(error) => return Err(error),
    };
    let document = parse_repository_document(&contents)?;
    let mut config: RepositoryConfig = toml_edit::de::from_str(&contents).map_err(invalid_toml)?;
    let version = document
        .get("format_version")
        .and_then(toml_edit::Item::as_integer)
        .unwrap_or(0);
    if version > i64::from(REPOSITORY_CONFIG_VERSION) {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("unsupported .lirox.toml format version {version}"),
        ));
    }
    config.format_version = REPOSITORY_CONFIG_VERSION;
    Ok(config)
}

/// Stores the theme for workspace `slug` in the repository's `.lirox.toml`,
/// creating the entry on first save.
pub fn save_workspace_theme(
    root: &Path,
    slug: &str,
    theme: &liroxnotes_shared::WorkspaceTheme,
) -> std::io::Result<()> {
    validate_workspace_slug(slug)?;
    let mut document = load_repository_document(root)?;
    let workspaces = ensure_table(document.as_table_mut(), "workspaces")?;
    workspaces.set_implicit(true);
    // Older versions also kept application-level registration here.
    for (_, workspace) in workspaces.iter_mut() {
        if let Some(workspace) = workspace.as_table_mut() {
            workspace.remove("name");
            workspace.remove("relative_path");
            workspace.set_implicit(true);
        }
    }
    let workspace = ensure_table(workspaces, slug)?;
    workspace.set_implicit(true);
    workspace.insert("theme", theme_item(theme)?);
    persist_repository_document(root, document)
}

fn parse_repository_document(input: &str) -> std::io::Result<toml_edit::DocumentMut> {
    input.parse().map_err(invalid_toml)
}

fn invalid_toml(error: impl std::fmt::Display) -> std::io::Error {
    std::io::Error::new(std::io::ErrorKind::InvalidData, error.to_string())
}

fn load_repository_document(root: &Path) -> std::io::Result<toml_edit::DocumentMut> {
    let contents = match fs::read_to_string(root.join(REPOSITORY_CONFIG_FILE)) {
        Ok(contents) => contents,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => String::new(),
        Err(error) => return Err(error),
    };
    let mut document = parse_repository_document(&contents)?;
    let version = document
        .get("format_version")
        .and_then(toml_edit::Item::as_integer)
        .unwrap_or(0);
    if version > i64::from(REPOSITORY_CONFIG_VERSION) {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("unsupported .lirox.toml format version {version}"),
        ));
    }
    document["format_version"] = toml_edit::value(i64::from(REPOSITORY_CONFIG_VERSION));
    Ok(document)
}

fn ensure_table<'a>(
    table: &'a mut toml_edit::Table,
    key: &str,
) -> std::io::Result<&'a mut toml_edit::Table> {
    if !table.contains_key(key) {
        table.insert(key, toml_edit::Item::Table(toml_edit::Table::new()));
    }
    table
        .get_mut(key)
        .and_then(toml_edit::Item::as_table_mut)
        .ok_or_else(|| {
            std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                format!("{key} must be a table"),
            )
        })
}

fn theme_item(theme: &liroxnotes_shared::WorkspaceTheme) -> std::io::Result<toml_edit::Item> {
    let document = toml_edit::ser::to_document(theme).map_err(invalid_toml)?;
    Ok(toml_edit::Item::Table(document.into_table()))
}

fn validate_workspace_slug(slug: &str) -> std::io::Result<()> {
    if slug.is_empty()
        || !slug
            .bytes()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-')
    {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "invalid workspace slug",
        ));
    }
    Ok(())
}

fn validate_relative_workspace_path(path: &str) -> std::io::Result<()> {
    if path.starts_with(['/', '\\'])
        || path
            .split(['/', '\\'])
            .any(|part| matches!(part, ".." | "."))
        || Path::new(path).components().any(|component| {
            matches!(
                component,
                Component::ParentDir
                    | Component::RootDir
                    | Component::Prefix(_)
                    | Component::CurDir
            )
        })
    {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "workspace path must be relative",
        ));
    }
    Ok(())
}

fn persist_repository_document(
    root: &Path,
    document: toml_edit::DocumentMut,
) -> std::io::Result<()> {
    fs::create_dir_all(root)?;
    let path = root.join(REPOSITORY_CONFIG_FILE);
    let temporary = root.join(format!(".{REPOSITORY_CONFIG_FILE}.{}.tmp", Uuid::new_v4()));
    let result = (|| {
        let mut file = fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temporary)?;
        file.write_all(document.to_string().as_bytes())?;
        file.sync_all()?;
        fs::rename(&temporary, &path)
    })();
    if result.is_err() {
        let _ = fs::remove_file(temporary);
    }
    result
}

pub fn ensure_workspace(workspace: &Path) -> std::io::Result<()> {
    fs::create_dir_all(workspace)?;

    if !git::is_inside_repository(workspace) {
        git::init(workspace)?;
    }

    Ok(())
}

pub fn ensure_workspace_for_config(config: &GatewayConfig) -> std::io::Result<()> {
    if config.repo_url.trim().is_empty() {
        return ensure_workspace(&config.workspace_path);
    }

    if let Ok(root) = git::repository_root(&config.workspace_path) {
        let root = fs::canonicalize(root)?;
        let workspace = fs::canonicalize(&config.workspace_path)?;
        if root == workspace
            || git::origin_url(&config.workspace_path)
                .is_ok_and(|origin| origin == config.repo_url.trim())
        {
            return Ok(());
        }
    }

    if config.workspace_path.exists() {
        let mut entries = fs::read_dir(&config.workspace_path)?;
        if entries.next().is_some() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::AlreadyExists,
                "workspace directory already exists and is not empty",
            ));
        }
    } else if let Some(parent) = config.workspace_path.parent() {
        fs::create_dir_all(parent)?;
    }

    clone_git(&config.repo_url, &config.branch, &config.workspace_path)
}

pub fn read_notes(root: &Path, dir: &Path, notes: &mut Vec<WorkspaceNote>) -> std::io::Result<()> {
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        // Hidden entries (`.git`, config) are not notes, and symlinks could
        // point outside the workspace; `file_type` does not follow links.
        let file_type = entry.file_type()?;
        if entry.file_name().to_string_lossy().starts_with('.') || file_type.is_symlink() {
            continue;
        }
        if file_type.is_dir() {
            read_notes(root, &path, notes)?;
            continue;
        }
        if path.extension().and_then(|ext| ext.to_str()) != Some("md") {
            continue;
        }

        let relative = path
            .strip_prefix(root)
            .unwrap_or(&path)
            .to_string_lossy()
            .replace('\\', "/");
        notes.push(WorkspaceNote {
            path: relative,
            body: fs::read_to_string(path)?,
        });
    }

    notes.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(())
}

pub fn changed_count(workspace: &Path) -> usize {
    git::changed_count(workspace).unwrap_or(0)
}

pub fn current_branch(workspace: &Path, config: &GatewayConfig) -> String {
    git::current_branch(workspace).unwrap_or_else(|_| config.branch.clone())
}

pub fn unpushed_commit_count(config: &GatewayConfig) -> usize {
    if config.repo_url.trim().is_empty() {
        return 0;
    }
    git::unpushed_count(&config.workspace_path, &config.branch).unwrap_or(0)
}

pub fn commit_note(workspace: &Path, path: &str) -> std::io::Result<bool> {
    commit_note_paths(workspace, &[PathBuf::from(path)])
}

fn commit_note_paths(workspace: &Path, paths: &[PathBuf]) -> std::io::Result<bool> {
    git::commit_paths(workspace, paths)
}

pub fn push_workspace(config: &GatewayConfig) -> std::io::Result<bool> {
    if config.repo_url.trim().is_empty() {
        return Ok(false);
    }

    git::push(
        &config.workspace_path,
        &config.branch,
        &git::GitEnv::from_env(),
    )?;
    Ok(true)
}

pub fn pull_workspace(config: &GatewayConfig) -> std::io::Result<bool> {
    if config.repo_url.trim().is_empty() {
        return Ok(false);
    }

    git::pull_ff_only(
        &config.workspace_path,
        &config.branch,
        &git::GitEnv::from_env(),
    )?;
    Ok(true)
}

pub fn save_note_body(config: &GatewayConfig, path: &str, body: String) -> std::io::Result<bool> {
    let (notes, relative, absolute) = note_location(config, path)?;
    let mut changed_paths = vec![relative.clone()];

    // A note saved below `ideas/` turns a sibling `ideas.md` into
    // `ideas/README.md`. Every move is checked before anything changes.
    let mut moves = Vec::new();
    let mut directory = relative.parent();
    while let Some(directory_path) = directory {
        if directory_path.as_os_str().is_empty() {
            break;
        }

        let name = directory_path.file_name().unwrap();
        let legacy = directory_path
            .parent()
            .unwrap_or_else(|| Path::new(""))
            .join(format!("{}.md", name.to_string_lossy()));
        let readme = directory_path.join("README.md");
        let legacy_absolute = resolve_note_path(&notes, &legacy)?;
        if legacy_absolute.is_file() {
            let readme_absolute = resolve_note_path(&notes, &readme)?;
            if readme_absolute.exists() {
                return Err(std::io::Error::new(
                    std::io::ErrorKind::AlreadyExists,
                    format!(
                        "cannot move {} to existing {}",
                        legacy.display(),
                        readme.display()
                    ),
                ));
            }
            moves.push((legacy_absolute, readme_absolute));
            changed_paths.push(legacy);
            changed_paths.push(readme);
        }

        directory = directory_path.parent();
    }

    for (legacy, readme) in moves {
        if let Some(parent) = readme.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::rename(legacy, readme)?;
    }
    if let Some(parent) = absolute.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(&absolute, body)?;
    commit_note_paths(&notes, &changed_paths)
}

/// Writes a new note, refusing to overwrite a note or to sit next to a
/// folder of the same name. The file name must be a slug (`my-note.md`);
/// folders on the way may have any safe name.
pub fn create_note(config: &GatewayConfig, path: &str, body: String) -> std::io::Result<bool> {
    let (_, relative, absolute) = note_location(config, path)?;
    let name = relative
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
        .unwrap_or_default();
    if !is_slug(name.trim_end_matches(".md")) {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "note names use lowercase letters, numbers and dashes",
        ));
    }
    if fs::symlink_metadata(&absolute).is_ok() || absolute.with_extension("").exists() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::AlreadyExists,
            format!("`{path}` already exists"),
        ));
    }
    save_note_body(config, path, body)
}

/// `[a-z0-9]+(-[a-z0-9]+)*`
fn is_slug(value: &str) -> bool {
    !value.is_empty()
        && value.split('-').all(|part| {
            !part.is_empty()
                && part
                    .bytes()
                    .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit())
        })
}

pub fn delete_note_file(config: &GatewayConfig, path: &str) -> std::io::Result<bool> {
    let (notes, relative, absolute) = note_location(config, path)?;
    if !absolute.is_file() {
        return Ok(false);
    }

    fs::remove_file(&absolute)?;
    commit_note(&notes, &relative.to_string_lossy())
}

pub fn read_note_body(config: &GatewayConfig, path: &str) -> std::io::Result<String> {
    let (_, _, absolute) = note_location(config, path)?;
    fs::read_to_string(absolute)
}

/// The notes root, the checked relative path and its absolute location.
fn note_location(
    config: &GatewayConfig,
    path: &str,
) -> std::io::Result<(PathBuf, PathBuf, PathBuf)> {
    let Some(relative) = safe_note_path(path) else {
        return Err(invalid_note_path());
    };
    let notes = notes_root(config)?;
    let absolute = resolve_note_path(&notes, &relative)?;
    Ok((notes, relative, absolute))
}

/// Joins a `safe_note_path` result to the notes root, refusing it when any
/// existing component below the root is a symlink, so the result can never
/// lead outside the root.
fn resolve_note_path(notes: &Path, relative: &Path) -> std::io::Result<PathBuf> {
    let mut path = notes.to_path_buf();
    for component in relative.components() {
        path.push(component);
        match fs::symlink_metadata(&path) {
            Ok(metadata) if metadata.file_type().is_symlink() => {
                return Err(invalid_note_path());
            }
            Ok(_) => {}
            // Nothing below a missing component can exist either.
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => break,
            Err(error) => return Err(error),
        }
    }
    Ok(notes.join(relative))
}

fn invalid_note_path() -> std::io::Error {
    std::io::Error::new(std::io::ErrorKind::InvalidInput, "invalid note path")
}

pub fn configure_git_remote(config: &GatewayConfig) -> std::io::Result<()> {
    if config.repo_url.trim().is_empty() {
        return Ok(());
    }
    git::set_origin(&config.workspace_path, &config.repo_url)
}

/// Removes `origin`; a workspace without one is already disconnected.
pub fn disconnect_git_remote(config: &GatewayConfig) -> std::io::Result<()> {
    if git::origin_url(&config.workspace_path).is_err() {
        return Ok(());
    }
    git::remove_origin(&config.workspace_path)
}

pub fn workspace_view_for_config(
    config: &GatewayConfig,
    selected_note_path: &str,
) -> std::io::Result<liroxnotes_shared::WorkspaceView> {
    let notes_root = notes_root(config)?;
    let mut notes = Vec::new();
    if notes_root.is_dir() {
        read_notes(&notes_root, &notes_root, &mut notes)?;
    }

    let default_note = notes
        .first()
        .map(|record| record.path.as_str())
        .unwrap_or("");

    let mut view = workspace_view_from_notes(
        &config.workspace_slug,
        &config.workspace_name,
        &current_branch(&config.workspace_path, config),
        if config.repo_url.is_empty() {
            "local git"
        } else {
            &config.repo_url
        },
        default_note,
        selected_note_path,
        changed_count(&config.workspace_path),
        &notes,
    );
    view.unpushed_commits = unpushed_commit_count(config);
    let repository_root = repository_root(config);
    if let Some(theme) = load_repository_config(&repository_root)?
        .workspaces
        .get(&config.workspace_slug)
        .map(|workspace| workspace.theme.clone())
    {
        view.theme = theme;
    }
    Ok(view)
}

pub fn repository_root(config: &GatewayConfig) -> PathBuf {
    git::repository_root(&config.workspace_path).unwrap_or_else(|_| config.workspace_path.clone())
}

/// The directory holding this workspace's notes: the git root joined with the
/// workspace's application-level `relative_path`.
pub fn notes_root(config: &GatewayConfig) -> std::io::Result<PathBuf> {
    let relative_path = config.relative_path.trim().trim_end_matches('/');
    if relative_path.is_empty() {
        return Ok(config.workspace_path.clone());
    }
    validate_relative_workspace_path(relative_path)?;
    Ok(config.workspace_path.join(relative_path))
}

pub fn configured_profile(paths: &crate::RuntimePaths) -> std::io::Result<Option<GatewayConfig>> {
    let Some(config) = crate::load_config(&paths.config_file)? else {
        return Ok(None);
    };

    ensure_workspace_for_config(&config)?;
    configure_git_remote(&config)?;
    Ok(Some(config))
}

/// Sets up the checkout at `config.workspace_path` (the git root), creates the
/// notes folder and registers the workspace as the active one.
pub fn create_configured_workspace(
    paths: &crate::RuntimePaths,
    config: &GatewayConfig,
) -> std::io::Result<()> {
    let workspace_root = crate::app_workspace_root(paths)?;
    ensure_workspace_for_config(config)?;
    configure_git_remote(config)?;
    fs::create_dir_all(notes_root(config)?)?;
    crate::save_config(&paths.config_file, config)?;
    crate::mark_workspace_ready(paths, &workspace_root)
}
