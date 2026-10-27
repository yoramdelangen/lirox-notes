#[cfg(any(target_arch = "wasm32", feature = "desktop"))]
use super::WorkspaceEvent;
#[cfg(any(target_arch = "wasm32", feature = "desktop", test))]
use super::{ApplicationEvent, AuthEvent, StatusEvent, ThemeEvent};
use super::{ApplicationState, Dispatcher, Effect};
#[cfg(any(target_arch = "wasm32", feature = "desktop"))]
use crate::server;
use dioxus::prelude::Signal;
#[cfg(any(target_arch = "wasm32", feature = "desktop"))]
use dioxus::prelude::WritableExt;

pub(crate) async fn execute_effect(
    state: Signal<ApplicationState>,
    dispatcher: Dispatcher,
    effect: Effect,
) {
    #[cfg(any(target_arch = "wasm32", feature = "desktop"))]
    {
        let mut state = state;
        let result = platform_effect(effect.clone()).await;
        let event = match result {
            Ok(Some(event)) => event,
            Ok(None) => return,
            Err(message) => auth_error_event(&effect, message),
        };
        dispatcher.dispatch_event(&mut state.write(), event);
    }
    #[cfg(not(any(target_arch = "wasm32", feature = "desktop")))]
    let _ = (state, dispatcher, effect);
}

#[cfg(any(target_arch = "wasm32", feature = "desktop", test))]
pub(crate) fn auth_error_event(effect: &Effect, message: String) -> ApplicationEvent {
    if matches!(effect, Effect::SaveWorkspaceTheme { .. }) {
        ApplicationEvent::Theme(ThemeEvent::SaveFailed(message))
    } else if matches!(
        effect,
        Effect::SwitchWorkspace(_) | Effect::PullWorkspace(_) | Effect::PushWorkspace(_)
    ) {
        // Keep the current workspace open; only report why switching failed.
        ApplicationEvent::Status(StatusEvent::Message(message))
    } else if matches!(effect, Effect::AutoLogin) {
        ApplicationEvent::Auth(AuthEvent::AutoLoginFailed)
    } else if matches!(effect, Effect::Login) {
        ApplicationEvent::Auth(AuthEvent::OperationFailed(message))
    } else if message.starts_with("server returned 401") {
        ApplicationEvent::Auth(AuthEvent::SessionExpired)
    } else {
        ApplicationEvent::Auth(AuthEvent::OperationFailed(message))
    }
}

#[cfg(any(target_arch = "wasm32", feature = "desktop"))]
async fn platform_effect(effect: Effect) -> Result<Option<ApplicationEvent>, String> {
    use crate::platform::web::webauthn;
    match effect {
        Effect::Bootstrap => Ok(Some(ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(
            server::bootstrap_server_function()
                .await
                .map_err(server_error_message)?,
        )))),
        Effect::LoadWorkspace => Ok(Some(ApplicationEvent::Auth(AuthEvent::WorkspaceLoaded(
            Box::new(
                server::workspace_server_function(None)
                    .await
                    .map_err(server_error_message)?,
            ),
        )))),
        Effect::LoadWorkspaceNote(path) => Ok(Some(ApplicationEvent::Auth(
            AuthEvent::WorkspaceLoaded(Box::new(
                server::workspace_server_function(Some(path))
                    .await
                    .map_err(server_error_message)?,
            )),
        ))),
        Effect::SaveDocument { path, content } => Ok(Some(ApplicationEvent::Auth(
            AuthEvent::WorkspaceLoaded(Box::new(
                server::save_document_server_function(path, content)
                    .await
                    .map_err(server_error_message)?,
            )),
        ))),
        Effect::EditorAction(action) => {
            crate::platform::web::editor::run_action(&action);
            Ok(None)
        }
        Effect::EditorGotoLine(line) => {
            crate::platform::web::editor::goto_line(line);
            Ok(None)
        }
        Effect::EditorFocus => {
            crate::platform::web::editor::focus();
            Ok(None)
        }
        Effect::SetEditorVimMode(enabled) => {
            crate::platform::web::editor::set_vim_mode(enabled);
            Ok(None)
        }
        Effect::PullWorkspace(note) => {
            let pulled = server::pull_workspace_server_function()
                .await
                .map_err(server_error_message)?;
            let view = server::workspace_server_function(note)
                .await
                .map_err(server_error_message)?;
            let message = if pulled {
                format!("pulled origin/{}", view.branch)
            } else {
                "no remote to pull from".into()
            };
            Ok(Some(ApplicationEvent::Workspace(WorkspaceEvent::Synced {
                view: Box::new(view),
                message,
            })))
        }
        Effect::PushWorkspace(note) => {
            let pushed = server::push_workspace_server_function()
                .await
                .map_err(server_error_message)?;
            let view = server::workspace_server_function(note)
                .await
                .map_err(server_error_message)?;
            let message = if pushed {
                format!("pushed → origin/{}", view.branch)
            } else {
                "no remote to push to".into()
            };
            Ok(Some(ApplicationEvent::Workspace(WorkspaceEvent::Synced {
                view: Box::new(view),
                message,
            })))
        }
        Effect::SaveWorkspaceTheme { slug, theme } => {
            let theme = server::save_workspace_theme_server_function(slug, *theme)
                .await
                .map_err(server_error_message)?;
            Ok(Some(ApplicationEvent::Theme(ThemeEvent::SaveSucceeded(
                theme,
            ))))
        }
        Effect::RegisterPasskey => {
            let options = server::passkey_registration_options_server_function()
                .await
                .map_err(server_error_message)?;
            let challenge = options["challenge_id"]
                .as_str()
                .ok_or("missing challenge")?
                .to_string();
            let credential =
                webauthn::credentials("create", public_key_options(&options)?, None).await?;
            server::passkey_registration_verify_server_function(challenge, credential)
                .await
                .map_err(server_error_message)?;
            Ok(Some(ApplicationEvent::Auth(
                AuthEvent::RegistrationSucceeded,
            )))
        }
        Effect::SetupInstallation(user_name) => {
            server::setup_installation_server_function(Some(user_name))
                .await
                .map_err(server_error_message)?;
            Ok(None)
        }
        effect @ (Effect::Login | Effect::AutoLogin) => {
            let auto = matches!(&effect, Effect::AutoLogin);
            let options = server::passkey_login_options_server_function()
                .await
                .map_err(server_error_message)?;
            let challenge = options["challenge_id"]
                .as_str()
                .ok_or("missing challenge")?
                .to_string();
            let credential = webauthn::credentials(
                "get",
                login_public_key_options(&options, auto)?,
                auto.then_some("conditional"),
            )
            .await?;
            server::passkey_login_verify_server_function(challenge, credential)
                .await
                .map_err(server_error_message)?;
            Ok(Some(ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(
                server::bootstrap_server_function()
                    .await
                    .map_err(server_error_message)?,
            ))))
        }
        Effect::Logout => {
            server::logout_server_function()
                .await
                .map_err(server_error_message)?;
            Ok(Some(ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(
                server::bootstrap_server_function()
                    .await
                    .map_err(server_error_message)?,
            ))))
        }
        Effect::CreateWorkspace(fields) => {
            Ok(Some(ApplicationEvent::Auth(AuthEvent::BootstrapLoaded({
                server::create_workspace_server_function(
                    fields.remote,
                    fields.slug,
                    fields.name,
                    fields.repo_url,
                    fields.repository_path,
                    fields.path,
                    fields.branch,
                )
                .await
                .map_err(server_error_message)?;
                server::bootstrap_server_function()
                    .await
                    .map_err(server_error_message)?
            }))))
        }
        Effect::InspectRepository { repo_url, branch } => {
            let metadata = server::inspect_repository_server_function(repo_url, Some(branch))
                .await
                .map_err(server_error_message)?;
            Ok(Some(ApplicationEvent::Auth(
                AuthEvent::RepositoryInspected {
                    name: metadata.name,
                    slug: metadata.slug,
                },
            )))
        }
        Effect::LoadExistingWorkspaces => {
            let registered = server::registered_workspaces_server_function()
                .await
                .map_err(server_error_message)?;
            let available = server::existing_workspaces_server_function()
                .await
                .map_err(server_error_message)?;
            Ok(Some(ApplicationEvent::Auth(
                AuthEvent::ExistingWorkspacesLoaded {
                    registered,
                    available,
                },
            )))
        }
        Effect::SwitchWorkspace(slug) => Ok(Some(ApplicationEvent::Auth(
            AuthEvent::WorkspaceLoaded(Box::new(
                server::switch_workspace_server_function(slug)
                    .await
                    .map_err(server_error_message)?,
            )),
        ))),
        _ => Ok(None),
    }
}

#[cfg(any(target_arch = "wasm32", feature = "desktop", test))]
fn server_error_message(error: dioxus::prelude::ServerFnError) -> String {
    match error {
        dioxus::prelude::ServerFnError::ServerError { code: 401, .. } => {
            "server returned 401".into()
        }
        error => error.to_string(),
    }
}

#[cfg(any(target_arch = "wasm32", feature = "desktop", test))]
pub(crate) fn public_key_options(options: &serde_json::Value) -> Result<serde_json::Value, String> {
    let options = options
        .get("publicKey")
        .ok_or_else(|| "missing publicKey options".to_string())?;
    if options.get("challenge").is_some() {
        Ok(options.clone())
    } else {
        options
            .get("publicKey")
            .cloned()
            .ok_or_else(|| "missing publicKey options".into())
    }
}

#[cfg(any(target_arch = "wasm32", feature = "desktop", test))]
pub(crate) fn discoverable_public_key_options(
    options: &serde_json::Value,
) -> Result<serde_json::Value, String> {
    let mut options = public_key_options(options)?;
    options
        .as_object_mut()
        .ok_or_else(|| "invalid publicKey options".to_string())?
        .remove("allowCredentials");
    Ok(options)
}

#[cfg(any(target_arch = "wasm32", feature = "desktop", test))]
pub(crate) fn login_public_key_options(
    options: &serde_json::Value,
    conditional: bool,
) -> Result<serde_json::Value, String> {
    if conditional {
        discoverable_public_key_options(options)
    } else {
        public_key_options(options)
    }
}

#[cfg(test)]
mod effect_tests {
    use super::*;

    #[test]
    fn server_unauthorized_error_has_transport_neutral_message() {
        let error = dioxus::prelude::ServerFnError::ServerError {
            code: 401,
            message: "authentication required".into(),
            details: None,
        };

        assert_eq!(server_error_message(error), "server returned 401");
    }

    #[test]
    fn theme_save_errors_return_a_retryable_theme_event() {
        let event = auth_error_event(
            &Effect::SaveWorkspaceTheme {
                slug: "notes".into(),
                theme: Box::new(liroxnotes_shared::WorkspaceTheme::default()),
            },
            "offline".into(),
        );

        assert!(
            matches!(event, ApplicationEvent::Theme(ThemeEvent::SaveFailed(message)) if message == "offline")
        );
    }
}
