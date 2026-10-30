#[cfg(feature = "server")]
use dioxus::fullstack::FullstackContext;
use dioxus::prelude::*;
#[cfg(feature = "server")]
use liroxnotes_backend::{
    activate_workspace, auth::AuthService, configured_profile, create_workspace,
    existing_workspaces, inspect_repository, load_app_config, read_note_body, save_note_body,
    save_workspace_theme, workspace::repository_root, workspace_view_for_config, WorkspaceSetup,
};
#[cfg(feature = "server")]
use liroxnotes_backend::{auth as backend_auth, auth::AuthStore, runtime_paths};

#[server]
pub async fn bootstrap_server_function() -> Result<crate::auth::BootstrapState, ServerFnError> {
    let paths = runtime_paths();
    let cookie = dioxus::fullstack::FullstackContext::current()
        .and_then(|context| context.parts_mut().headers.get("cookie").cloned())
        .and_then(|value| value.to_str().ok().map(str::to_owned));
    let session = cookie
        .as_deref()
        .and_then(session_token_from_cookie)
        .map(|token| AuthStore::new(paths.clone()).session_for_token(token))
        .transpose()
        .map_err(|_| ServerFnError::new("authentication storage unavailable"))?
        .flatten();

    let response = backend_auth::bootstrap_response(
        &paths,
        session.is_some(),
        session.map(|session| session.user),
    )
    .map_err(|_| ServerFnError::new("could not load application setup"))?;
    Ok(client_bootstrap_state(response))
}

#[server]
pub async fn workspace_server_function(
    selected_note_path: Option<String>,
) -> Result<liroxnotes_shared::WorkspaceView, ServerFnError> {
    let (_, config) = authenticated_workspace()?;
    workspace_view_for_config(&config, selected_note_path.as_deref().unwrap_or(""))
        .map_err(|_| internal_error("could not load workspace"))
}

#[server]
pub async fn save_document_server_function(
    path: String,
    content: String,
) -> Result<liroxnotes_shared::WorkspaceView, ServerFnError> {
    let (_, config) = authenticated_workspace()?;
    save_note_body(&config, &path, content)
        .map_err(|_| client_error(400, "could not save note"))?;
    workspace_view_for_config(&config, &path)
        .map_err(|_| internal_error("could not load workspace"))
}

#[server]
pub async fn save_workspace_theme_server_function(
    slug: String,
    theme: liroxnotes_shared::WorkspaceTheme,
) -> Result<liroxnotes_shared::WorkspaceTheme, ServerFnError> {
    let (_, config) = authenticated_workspace()?;
    if config.workspace_slug != slug {
        return Err(client_error(404, "workspace not found"));
    }
    if !crate::theme::validate_contrast(&theme.colors).is_empty() {
        return Err(client_error(
            400,
            "theme does not meet contrast requirements",
        ));
    }
    let root = repository_root(&config);
    save_workspace_theme(&root, &slug, &theme)
        .map_err(|_| client_error(400, "could not save workspace theme"))?;
    Ok(theme)
}

#[server]
pub async fn inspect_repository_server_function(
    repo_url: String,
    branch: Option<String>,
) -> Result<crate::auth::RepositoryMetadata, ServerFnError> {
    let _paths = authenticated_paths()?;
    let branch = branch
        .filter(|branch| !branch.trim().is_empty())
        .unwrap_or("main".into());
    let metadata = inspect_repository(&repo_url, &branch)
        .map_err(|_| client_error(400, "could not inspect repository"))?;
    Ok(crate::auth::RepositoryMetadata {
        name: metadata.name,
        slug: metadata.slug,
    })
}

#[server]
pub async fn existing_workspaces_server_function(
) -> Result<Vec<crate::auth::ExistingWorkspace>, ServerFnError> {
    let paths = authenticated_paths()?;
    let root = liroxnotes_backend::app_workspace_root(&paths)
        .map_err(|_| internal_error("workspace storage unavailable"))?;
    let registered = load_app_config(&paths.config_file)
        .map_err(|_| internal_error("workspace configuration unavailable"))?
        .workspaces;
    existing_workspaces(&root, &registered)
        .map(|workspaces| {
            workspaces
                .into_iter()
                .map(|workspace| crate::auth::ExistingWorkspace {
                    repository: workspace.repository,
                    branch: workspace.branch,
                    path: workspace.path,
                    workspace_name: workspace.workspace_name,
                })
                .collect()
        })
        .map_err(|_| internal_error("could not discover workspaces"))
}

#[server]
pub async fn registered_workspaces_server_function(
) -> Result<Vec<crate::auth::RegisteredWorkspace>, ServerFnError> {
    let paths = authenticated_paths()?;
    let root = liroxnotes_backend::app_workspace_root(&paths)
        .map_err(|_| internal_error("workspace storage unavailable"))?;
    let config = load_app_config(&paths.config_file)
        .map_err(|_| internal_error("workspace configuration unavailable"))?;
    let active = config
        .active_workspace()
        .map(|workspace| workspace.workspace_slug.clone());
    Ok(config
        .workspaces
        .iter()
        .map(|workspace| crate::auth::RegisteredWorkspace {
            slug: workspace.workspace_slug.clone(),
            name: workspace.workspace_name.clone(),
            // Never expose server paths: name the repository by its folder.
            repository: workspace
                .workspace_path
                .strip_prefix(&root)
                .ok()
                .or_else(|| {
                    workspace
                        .workspace_path
                        .file_name()
                        .map(std::path::Path::new)
                })
                .map(|path| path.to_string_lossy().into_owned())
                .unwrap_or_default(),
            path: workspace.relative_path.clone(),
            active: active.as_deref() == Some(workspace.workspace_slug.as_str()),
        })
        .collect())
}

#[server]
pub async fn switch_workspace_server_function(
    slug: String,
) -> Result<liroxnotes_shared::WorkspaceView, ServerFnError> {
    let paths = authenticated_paths()?;
    let config = activate_workspace(&paths.config_file, &slug).map_err(|error| {
        if error.kind() == std::io::ErrorKind::NotFound {
            client_error(404, "workspace not found")
        } else {
            internal_error("could not switch workspace")
        }
    })?;
    workspace_view_for_config(&config, "").map_err(|_| internal_error("could not load workspace"))
}

#[server]
pub async fn create_workspace_server_function(
    remote: bool,
    slug: String,
    name: String,
    repo_url: String,
    repository_path: String,
    workspace_path: String,
    branch: String,
) -> Result<liroxnotes_shared::WorkspaceView, ServerFnError> {
    let paths = authenticated_paths()?;
    let config = create_workspace(
        &paths,
        &WorkspaceSetup {
            existing_repository: remote,
            slug,
            name,
            repo_url,
            repository_path,
            workspace_path,
            branch,
        },
    )
    .map_err(|error| {
        if error.kind() == std::io::ErrorKind::AlreadyExists {
            client_error(409, "workspace slug already registered")
        } else if error.kind() == std::io::ErrorKind::InvalidInput
            || error.kind() == std::io::ErrorKind::NotFound
        {
            client_error(400, "invalid workspace setup")
        } else {
            internal_error("could not create workspace")
        }
    })?;
    workspace_view_for_config(&config, "")
        .map_err(|_| internal_error("could not load created workspace"))
}

#[server]
pub async fn read_workspace_file_server_function(
    path: String,
) -> Result<liroxnotes_shared::WorkspaceFile, ServerFnError> {
    let (_, config) = authenticated_workspace()?;
    let body = read_note_body(&config, &path).map_err(|error| {
        if error.kind() == std::io::ErrorKind::InvalidInput {
            client_error(400, "invalid note path")
        } else if error.kind() == std::io::ErrorKind::NotFound {
            client_error(404, "note not found")
        } else {
            internal_error("could not read note")
        }
    })?;
    Ok(liroxnotes_shared::WorkspaceFile { path, body })
}

#[server]
pub async fn delete_workspace_file_server_function(path: String) -> Result<bool, ServerFnError> {
    let (_, config) = authenticated_workspace()?;
    liroxnotes_backend::delete_note_file(&config, &path).map_err(|error| {
        if error.kind() == std::io::ErrorKind::InvalidInput {
            client_error(400, "invalid note path")
        } else {
            internal_error("could not delete note")
        }
    })
}

/// The user's `config.toml` (keymaps, editor options); empty if absent.
/// See `liroxnotes_backend::user_config::user_config_path` for its location.
#[server]
pub async fn app_config_server_function() -> Result<String, ServerFnError> {
    use liroxnotes_backend::user_config::{read_user_config, user_config_path};
    authenticated_paths()?;
    let Some(path) = user_config_path() else {
        return Ok(String::new());
    };
    read_user_config(&path).map_err(|_| internal_error("could not read config.toml"))
}

/// Writes the Settings' editor options into `config.toml`'s `[editor]` table,
/// keeping the rest of the file as written.
#[server]
pub async fn save_editor_options_server_function(
    vim: bool,
    action_bar: bool,
    key_hints: bool,
    font_size: u8,
) -> Result<(), ServerFnError> {
    use liroxnotes_backend::user_config::{save_editor_options, user_config_path, EditorOptions};
    authenticated_paths()?;
    let path = user_config_path().ok_or_else(|| internal_error("no config directory"))?;
    let options = EditorOptions {
        vim,
        action_bar,
        key_hints,
        font_size,
    };
    save_editor_options(&path, options).map_err(|error| {
        if error.kind() == std::io::ErrorKind::InvalidData {
            client_error(
                400,
                "config.toml is not valid TOML; fix it before saving settings",
            )
        } else {
            internal_error("could not write config.toml")
        }
    })
}

#[server]
pub async fn pull_workspace_server_function() -> Result<bool, ServerFnError> {
    let (_, config) = authenticated_workspace()?;
    liroxnotes_backend::pull_workspace(&config)
        .map_err(|_| client_error(400, "could not pull workspace"))
}

#[server]
pub async fn push_workspace_server_function() -> Result<bool, ServerFnError> {
    let (_, config) = authenticated_workspace()?;
    liroxnotes_backend::push_workspace(&config)
        .map_err(|_| client_error(400, "could not push workspace"))
}

#[server]
pub async fn sync_workspace_server_function(
) -> Result<liroxnotes_shared::WorkspaceSync, ServerFnError> {
    let (_, config) = authenticated_workspace()?;
    let pulled = liroxnotes_backend::pull_workspace(&config)
        .map_err(|_| client_error(400, "could not pull workspace"))?;
    let pushed = liroxnotes_backend::push_workspace(&config)
        .map_err(|_| client_error(400, "could not push workspace"))?;
    Ok(liroxnotes_shared::WorkspaceSync {
        ok: true,
        pulled,
        pushed,
        message: if pushed {
            "pushed".into()
        } else {
            "local workspace has no remote".into()
        },
    })
}

#[server]
pub async fn workspace_conflicts_server_function() -> Result<Vec<String>, ServerFnError> {
    let _ = authenticated_workspace()?;
    Ok(Vec::new())
}

#[server]
pub async fn workspace_trash_server_function() -> Result<Vec<String>, ServerFnError> {
    let _ = authenticated_workspace()?;
    Ok(Vec::new())
}

#[server]
pub async fn repositories_server_function(
) -> Result<Vec<liroxnotes_shared::RepositorySummary>, ServerFnError> {
    let (_, config) = authenticated_workspace()?;
    Ok(vec![repository_summary(&config)])
}

#[server]
pub async fn repository_server_function(
    repo_id: String,
) -> Result<liroxnotes_shared::RepositorySummary, ServerFnError> {
    let (_, config) = authenticated_workspace()?;
    if config.workspace_slug != repo_id {
        return Err(client_error(404, "repository not found"));
    }
    Ok(repository_summary(&config))
}

#[server]
pub async fn connect_repository_server_function(
    repo_url: String,
    branch: Option<String>,
) -> Result<liroxnotes_shared::RepositorySummary, ServerFnError> {
    let (paths, mut config) = authenticated_workspace()?;
    config.repo_url = repo_url;
    if let Some(branch) = branch.filter(|value| !value.trim().is_empty()) {
        config.branch = branch;
    }
    liroxnotes_backend::configure_git_remote(&config)
        .map_err(|_| client_error(400, "could not connect repository"))?;
    liroxnotes_backend::save_config(&paths.config_file, &config)
        .map_err(|_| internal_error("could not save repository configuration"))?;
    Ok(repository_summary(&config))
}

#[server]
pub async fn disconnect_repository_server_function(
) -> Result<liroxnotes_shared::RepositorySummary, ServerFnError> {
    let (paths, mut config) = authenticated_workspace()?;
    let _ = liroxnotes_backend::workspace::run_git(
        &config.workspace_path,
        &["remote", "remove", "origin"],
    );
    config.repo_url.clear();
    liroxnotes_backend::save_config(&paths.config_file, &config)
        .map_err(|_| internal_error("could not save repository configuration"))?;
    Ok(repository_summary(&config))
}

#[cfg(feature = "server")]
fn repository_summary(
    config: &liroxnotes_backend::GatewayConfig,
) -> liroxnotes_shared::RepositorySummary {
    liroxnotes_shared::RepositorySummary {
        id: config.workspace_slug.clone(),
        repo_url: config.repo_url.clone(),
        branch: config.branch.clone(),
        connected: !config.repo_url.trim().is_empty(),
    }
}

#[server]
pub async fn passkey_registration_options_server_function(
) -> Result<serde_json::Value, ServerFnError> {
    let service = auth_service()?;
    let (challenge_id, options) = service
        .registration_options()
        .map_err(|_| client_error(400, "passkey registration is unavailable"))?;
    Ok(serde_json::json!({
        "challenge_id": challenge_id,
        "publicKey": options,
    }))
}

#[server]
pub async fn passkey_registration_verify_server_function(
    challenge_id: String,
    credential: serde_json::Value,
) -> Result<bool, ServerFnError> {
    let service = auth_service()?;
    let credential = serde_json::from_value(credential)
        .map_err(|_| client_error(400, "invalid passkey credential"))?;
    let session = service
        .verify_registration(&challenge_id, &credential)
        .map_err(|_| client_error(401, "passkey registration failed"))?;
    set_session_cookie(&service, &session.token, false)?;
    Ok(true)
}

#[server]
pub async fn passkey_login_options_server_function() -> Result<serde_json::Value, ServerFnError> {
    let service = auth_service()?;
    let (challenge_id, options) = service
        .login_options()
        .map_err(|_| client_error(400, "passkey login is unavailable"))?;
    Ok(serde_json::json!({
        "challenge_id": challenge_id,
        "publicKey": options,
    }))
}

#[server]
pub async fn passkey_login_verify_server_function(
    challenge_id: String,
    credential: serde_json::Value,
) -> Result<bool, ServerFnError> {
    let service = auth_service()?;
    let credential = serde_json::from_value(credential)
        .map_err(|_| client_error(400, "invalid passkey credential"))?;
    let session = service
        .verify_login(&challenge_id, &credential)
        .map_err(|_| client_error(401, "passkey login failed"))?;
    set_session_cookie(&service, &session.token, false)?;
    Ok(true)
}

#[server]
pub async fn logout_server_function() -> Result<(), ServerFnError> {
    let paths = runtime_paths();
    AuthStore::new(paths.clone())
        .clear_session()
        .map_err(|_| internal_error("could not end session"))?;
    let service = auth_service()?;
    set_session_cookie(&service, "", true)
}

#[server]
pub async fn setup_installation_server_function(
    user_name: Option<String>,
) -> Result<(), ServerFnError> {
    let paths = authenticated_paths()?;
    if AuthStore::new(paths.clone())
        .load_account()
        .map_err(|_| internal_error("authentication storage unavailable"))?
        .is_none()
    {
        return Err(client_error(400, "passkey registration required"));
    }
    liroxnotes_backend::mark_installed(&paths, &liroxnotes_backend::default_workspace_root(&paths))
        .map_err(|_| internal_error("could not save installation"))?;
    if let Some(user_name) = user_name {
        backend_auth::save_install_user_name(&paths, &user_name)
            .map_err(|_| internal_error("could not save display name"))?;
    }
    Ok(())
}

#[cfg(feature = "server")]
fn authenticated_paths() -> Result<liroxnotes_backend::RuntimePaths, ServerFnError> {
    let paths = runtime_paths();
    let cookie = FullstackContext::current()
        .and_then(|context| context.parts_mut().headers.get("cookie").cloned())
        .and_then(|value| value.to_str().ok().map(str::to_owned));
    let session = cookie
        .as_deref()
        .and_then(session_token_from_cookie)
        .map(|token| AuthStore::new(paths.clone()).session_for_token(token))
        .transpose()
        .map_err(|_| internal_error("authentication storage unavailable"))?
        .flatten();
    session
        .map(|_| paths)
        .ok_or_else(|| client_error(401, "authentication required"))
}

#[cfg(feature = "server")]
fn authenticated_workspace() -> Result<
    (
        liroxnotes_backend::RuntimePaths,
        liroxnotes_backend::GatewayConfig,
    ),
    ServerFnError,
> {
    let paths = authenticated_paths()?;
    let config = configured_profile(&paths)
        .map_err(|_| internal_error("workspace unavailable"))?
        .ok_or_else(|| client_error(400, "workspace is not configured"))?;
    Ok((paths, config))
}

#[cfg(feature = "server")]
fn auth_service() -> Result<AuthService, ServerFnError> {
    AuthService::from_env(runtime_paths()).map_err(|_| internal_error("authentication unavailable"))
}

#[cfg(feature = "server")]
fn set_session_cookie(
    service: &AuthService,
    token: &str,
    clear: bool,
) -> Result<(), ServerFnError> {
    let mut cookie = format!(
        "lirox_session={}; Path=/; HttpOnly; SameSite=Lax",
        if clear { "" } else { token }
    );
    if clear {
        cookie.push_str("; Max-Age=0");
    }
    if service.secure_cookies() {
        cookie.push_str("; Secure");
    }
    let context = FullstackContext::current()
        .ok_or_else(|| internal_error("response context unavailable"))?;
    context.add_response_header(
        dioxus::fullstack::http::header::SET_COOKIE,
        dioxus::fullstack::http::HeaderValue::from_str(&cookie)
            .map_err(|_| internal_error("could not set session cookie"))?,
    );
    Ok(())
}

#[cfg(feature = "server")]
fn client_error(code: u16, message: &str) -> ServerFnError {
    ServerFnError::ServerError {
        message: message.to_string(),
        code,
        details: None,
    }
}

#[cfg(feature = "server")]
fn internal_error(message: &str) -> ServerFnError {
    client_error(500, message)
}

#[cfg(any(feature = "server", test))]
fn client_bootstrap_state(
    response: liroxnotes_shared::BootstrapResponse,
) -> crate::auth::BootstrapState {
    crate::auth::BootstrapState {
        installed: response.installed,
        passkey_exists: response.passkey_exists,
        onboarding: match response.onboarding {
            liroxnotes_shared::OnboardingStatus::NotStarted => {
                crate::auth::OnboardingStatus::NotStarted
            }
            liroxnotes_shared::OnboardingStatus::WorkspaceRequired => {
                crate::auth::OnboardingStatus::WorkspaceRequired
            }
            liroxnotes_shared::OnboardingStatus::Complete => {
                crate::auth::OnboardingStatus::Complete
            }
        },
        authenticated: response.authenticated,
        user: response.user,
        display_name: response.display_name,
        workspace: response
            .workspace
            .map(|workspace| crate::auth::WorkspaceSummary {
                slug: workspace.slug,
                name: workspace.name,
            }),
    }
}

#[cfg(any(feature = "server", test))]
fn session_token_from_cookie(cookie: &str) -> Option<&str> {
    cookie.split(';').find_map(|part| {
        let (name, value) = part.trim().split_once('=')?;
        (name == "lirox_session" && !value.is_empty()).then_some(value)
    })
}

#[cfg(test)]
mod tests {
    use super::{client_bootstrap_state, session_token_from_cookie};

    #[test]
    fn session_cookie_parser_requires_the_exact_session_cookie_name() {
        assert_eq!(
            session_token_from_cookie("theme=dark; lirox_session=abc123; other=x"),
            Some("abc123")
        );
        assert_eq!(
            session_token_from_cookie("lirox_session_extra=abc123"),
            None
        );
        assert_eq!(session_token_from_cookie("lirox_session="), None);
    }

    #[test]
    fn client_bootstrap_does_not_expose_the_server_workspace_root() {
        let state = client_bootstrap_state(liroxnotes_shared::BootstrapResponse {
            installed: true,
            passkey_exists: true,
            onboarding: liroxnotes_shared::OnboardingStatus::Complete,
            authenticated: true,
            user: Some("local".into()),
            display_name: Some("User".into()),
            workspace_root: "/private/workspace".into(),
            workspace: None,
        });

        assert!(!serde_json::to_value(state)
            .unwrap()
            .as_object()
            .unwrap()
            .contains_key("workspace_root"));
    }
}
