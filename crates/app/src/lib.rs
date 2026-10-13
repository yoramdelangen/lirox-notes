use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::command::SurfaceId;
use crate::components::button::Button;

pub mod app;
pub mod auth;
pub mod command;
mod components;
pub mod config;
pub mod domain;
pub mod input;
pub mod platform;
pub mod ui;
pub mod workspace;

#[cfg(any(target_arch = "wasm32", test))]
use app::ApplicationEvent;
use app::{ApplicationState, Dispatcher, Effect};
pub use ui::WorkspaceShell;

#[derive(Clone)]
pub struct AppContext {
    pub state: Signal<ApplicationState>,
    pub dispatcher: Dispatcher,
}

const MAIN_CSS: Asset = asset!("/assets/main.css");
const TAILWIND_CSS: Asset = asset!("/assets/tailwind.css");

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum FocusTarget {
    Sidebar,
    Editor,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum SidebarMode {
    Tree,
    LabelsNotes,
    Files,
}

#[derive(Clone, PartialEq, Eq, Debug)]
pub enum AppAction {
    FocusSidebar,
    FocusEditor,
    CycleSidebarMode,
    SetSidebarMode(SidebarMode),
    SetBrowserDir(String),
    GoUpDirectory,
}

#[component]
pub fn App() -> Element {
    let mut state = use_signal(ApplicationState::empty);
    let dispatcher = use_hook(Dispatcher::new);
    use_context_provider(|| AppContext {
        state,
        dispatcher: dispatcher.clone(),
    });
    let bootstrap_dispatcher = dispatcher.clone();
    use_effect(move || {
        bootstrap_dispatcher.dispatch_event(
            &mut state.write(),
            app::ApplicationEvent::Auth(app::AuthEvent::BootstrapRequested),
        );
    });
    let authenticated = state.read().auth.screen == auth::Screen::Workbench
        && state.read().auth.workspace.is_some();
    let effect_dispatcher = dispatcher.clone();
    use_effect(move || {
        let _ = state.read().effect_version;
        let _ = state.read().auth.operation.clone();
        let effect_dispatcher = effect_dispatcher.clone();
        spawn(async move {
            for effect in effect_dispatcher.take_effects() {
                execute_effect(state, effect_dispatcher.clone(), effect).await;
            }
        });
    });
    rsx! {
        document::Link { rel: "stylesheet", href: MAIN_CSS }
        document::Link { rel: "stylesheet", href: TAILWIND_CSS }
        if authenticated {
            div {
                class: "relative min-h-screen",
                WorkspaceShell {
                    view: state.read().auth.workspace.clone().unwrap_or_else(WorkspaceView::empty),
                    focus: if state.read().workspace.focus.active_surface == SurfaceId::FILE_TREE {
                        FocusTarget::Sidebar
                    } else {
                        FocusTarget::Editor
                    },
                    sidebar_mode: SidebarMode::Tree,
                    browser_dir: String::new(),
                    on_action: None,
                    on_select_note: None,
                }
                 Button {
                     variant: crate::components::button::ButtonVariant::Outline,
                     "aria-label": "Log out",
                     class: "absolute right-4 top-3 z-10",
                     onclick: move |_| dispatcher.dispatch_auth_command(&mut state.write(), app::AuthCommand::Logout),
                     "Log out"
                 }
            }
        } else {
            auth::AuthShell {}
        }
    }
}

async fn execute_effect(state: Signal<ApplicationState>, dispatcher: Dispatcher, effect: Effect) {
    #[cfg(target_arch = "wasm32")]
    {
        let mut state = state;
        let auto_login = matches!(&effect, Effect::AutoLogin);
        let result = platform_effect(effect.clone()).await;
        let event = match result {
            Ok(Some(event)) => event,
            Ok(None) => return,
            Err(message) => auth_error_event(&effect, message),
        };
        dispatcher.dispatch_event(&mut state.write(), event);
    }
    #[cfg(not(target_arch = "wasm32"))]
    let _ = (state, dispatcher, effect);
}

#[cfg(any(target_arch = "wasm32", test))]
fn auth_error_event(effect: &Effect, message: String) -> ApplicationEvent {
    if matches!(effect, Effect::AutoLogin) {
        ApplicationEvent::Auth(app::AuthEvent::AutoLoginFailed)
    } else if matches!(effect, Effect::Login) {
        ApplicationEvent::Auth(app::AuthEvent::OperationFailed(message))
    } else if message.starts_with("gateway returned 401") {
        ApplicationEvent::Auth(app::AuthEvent::SessionExpired)
    } else {
        ApplicationEvent::Auth(app::AuthEvent::OperationFailed(message))
    }
}

#[cfg(target_arch = "wasm32")]
async fn platform_effect(effect: Effect) -> Result<Option<ApplicationEvent>, String> {
    use platform::web::webauthn;
    use serde_json::Value;
    match effect {
        Effect::Bootstrap => Ok(Some(ApplicationEvent::Auth(
            app::AuthEvent::BootstrapLoaded(
                response_json(web_json("/api/bootstrap", "GET", None).await?).await?,
            ),
        ))),
        Effect::LoadWorkspace => {
            let view: WorkspaceView =
                response_json(web_json("/api/workspace/", "GET", None).await?).await?;
            Ok(Some(ApplicationEvent::Auth(
                app::AuthEvent::WorkspaceLoaded(view),
            )))
        }
        Effect::LoadWorkspaceNote(path) => {
            let view: WorkspaceView =
                response_json(web_json(&format!("/api/workspace/{path}"), "GET", None).await?)
                    .await?;
            Ok(Some(ApplicationEvent::Auth(
                app::AuthEvent::WorkspaceLoaded(view),
            )))
        }
        Effect::RegisterPasskey => {
            let options: Value = response_json(
                web_json(
                    "/api/auth/passkeys/register/options",
                    "POST",
                    Some("{}".into()),
                )
                .await?,
            )
            .await?;
            let challenge = options["challenge_id"]
                .as_str()
                .ok_or("missing challenge")?
                .to_string();
            let credential = webauthn::credentials(
                "create",
                webauthn::prepare_options(public_key_options(&options)?)?,
                None,
            )
            .await?;
            let body = serde_json::json!({"challenge_id": challenge, "credential": webauthn::credential_json(credential)?}).to_string();
            web_json("/api/auth/passkeys/register/verify", "POST", Some(body)).await?;
            Ok(Some(ApplicationEvent::Auth(
                app::AuthEvent::RegistrationSucceeded,
            )))
        }
        Effect::SetupInstallation(user_name) => {
            web_json(
                "/api/setup",
                "POST",
                Some(serde_json::json!({"user_name": user_name}).to_string()),
            )
            .await?;
            Ok(None)
        }
        effect @ (Effect::Login | Effect::AutoLogin) => {
            let auto = matches!(&effect, Effect::AutoLogin);
            let options: Value = response_json(
                web_json(
                    "/api/auth/passkeys/login/options",
                    "POST",
                    Some("{}".into()),
                )
                .await?,
            )
            .await?;
            let challenge = options["challenge_id"]
                .as_str()
                .ok_or("missing challenge")?
                .to_string();
            let credential = webauthn::credentials(
                "get",
                webauthn::prepare_options(discoverable_public_key_options(&options)?)?,
                auto.then_some("conditional"),
            )
            .await?;
            let body = serde_json::json!({"challenge_id": challenge, "credential": webauthn::credential_json(credential)?}).to_string();
            web_json("/api/auth/passkeys/login/verify", "POST", Some(body)).await?;
            Ok(Some(ApplicationEvent::Auth(
                app::AuthEvent::BootstrapLoaded(
                    response_json(web_json("/api/bootstrap", "GET", None).await?).await?,
                ),
            )))
        }
        Effect::Logout => {
            web_json("/api/auth/logout", "POST", Some("{}".into())).await?;
            Ok(Some(ApplicationEvent::Auth(
                app::AuthEvent::BootstrapLoaded(
                    response_json(web_json("/api/bootstrap", "GET", None).await?).await?,
                ),
            )))
        }
        Effect::CreateWorkspace(fields) => {
            let body = serde_json::json!({
                "repo_mode": if fields.remote { "existing" } else { "new" },
                "workspace_slug": fields.slug,
                "workspace_name": fields.name,
                "repo_url": fields.repo_url,
                "repository_path": fields.repository_path,
                "branch": fields.branch,
                "workspace_path": fields.path,
            })
            .to_string();
            web_json("/api/workspaces", "POST", Some(body)).await?;
            Ok(Some(ApplicationEvent::Auth(
                app::AuthEvent::BootstrapLoaded(
                    response_json(web_json("/api/bootstrap", "GET", None).await?).await?,
                ),
            )))
        }
        Effect::InspectRepository { repo_url, branch } => {
            let body = serde_json::json!({"repo_url": repo_url, "branch": branch}).to_string();
            let metadata: auth::RepositoryMetadata =
                response_json(web_json("/api/workspaces/inspect", "POST", Some(body)).await?)
                    .await?;
            Ok(Some(ApplicationEvent::Auth(
                app::AuthEvent::RepositoryInspected {
                    name: metadata.name,
                    slug: metadata.slug,
                },
            )))
        }
        Effect::LoadExistingWorkspaces => {
            let workspaces: Vec<auth::ExistingWorkspace> =
                response_json(web_json("/api/workspaces", "GET", None).await?).await?;
            Ok(Some(ApplicationEvent::Auth(
                app::AuthEvent::ExistingWorkspacesLoaded(workspaces),
            )))
        }
        _ => Ok(None),
    }
}

#[cfg(any(target_arch = "wasm32", test))]
fn public_key_options(options: &serde_json::Value) -> Result<serde_json::Value, String> {
    options
        .get("publicKey")
        .cloned()
        .ok_or_else(|| "missing publicKey options".into())
}

#[cfg(any(target_arch = "wasm32", test))]
fn discoverable_public_key_options(
    options: &serde_json::Value,
) -> Result<serde_json::Value, String> {
    let mut options = public_key_options(options)?;
    options
        .as_object_mut()
        .ok_or_else(|| "invalid publicKey options".to_string())?
        .remove("allowCredentials");
    Ok(options)
}

#[cfg(target_arch = "wasm32")]
async fn response_json<T: serde::de::DeserializeOwned>(
    response: web_sys::Response,
) -> Result<T, String> {
    use wasm_bindgen_futures::JsFuture;
    let value = JsFuture::from(response.json().map_err(|_| "invalid JSON")?)
        .await
        .map_err(|_| "invalid JSON")?;
    serde_wasm_bindgen::from_value(value).map_err(|error| error.to_string())
}

#[cfg(target_arch = "wasm32")]
async fn web_json(
    url: &str,
    method: &str,
    body: Option<String>,
) -> Result<web_sys::Response, String> {
    use wasm_bindgen::JsCast;
    use wasm_bindgen_futures::JsFuture;
    let init = web_sys::RequestInit::new();
    init.set_method(method);
    init.set_credentials(web_sys::RequestCredentials::Include);
    if let Some(body) = body {
        init.set_body(&wasm_bindgen::JsValue::from_str(&body));
    }
    let request = web_sys::Request::new_with_str_and_init(&gateway_url(url), &init)
        .map_err(|_| "request failed")?;
    request
        .headers()
        .set("Content-Type", "application/json")
        .map_err(|_| "headers failed")?;
    let response = JsFuture::from(
        web_sys::window()
            .ok_or("browser unavailable")?
            .fetch_with_request(&request),
    )
    .await
    .map_err(|_| "network failure")?;
    let response: web_sys::Response = response.dyn_into().map_err(|_| "invalid response")?;
    if !response.ok() {
        return Err(format!("gateway returned {}", response.status()));
    }
    Ok(response)
}

#[cfg(any(target_arch = "wasm32", test))]
const GATEWAY_BASE_URL: &str = match option_env!("LIROX_GATEWAY_URL") {
    Some(url) => url,
    None => "http://localhost:3010",
};

#[cfg(any(target_arch = "wasm32", test))]
fn gateway_url(path: &str) -> String {
    format!("{}{}", GATEWAY_BASE_URL.trim_end_matches('/'), path)
}

pub fn workspace_note_path_from_location(path: &str) -> Option<String> {
    let (_, note_path) = path.strip_prefix("/workspace/")?.split_once('/')?;
    if let Some(note_path) = note_path.strip_prefix("note/") {
        return (!note_path.is_empty()).then(|| {
            if note_path.ends_with(".md") {
                note_path.to_string()
            } else {
                format!("{note_path}.md")
            }
        });
    }

    let folder_path = note_path.trim_matches('/');
    if folder_path.is_empty() || note_path == folder_path {
        return None;
    }

    Some(format!("{folder_path}/README.md"))
}

#[cfg(test)]
mod tests {
    use crate::app::Effect;

    #[test]
    fn parses_note_routes_and_folder_routes() {
        assert_eq!(
            super::workspace_note_path_from_location("/workspace/workspace/note/notes/welcome"),
            Some("notes/welcome.md".to_string())
        );
        assert_eq!(
            super::workspace_note_path_from_location("/workspace/workspace/notes/"),
            Some("notes/README.md".to_string())
        );
    }

    #[test]
    fn gateway_requests_use_the_configured_gateway() {
        assert_eq!(
            super::gateway_url("/api/bootstrap"),
            "http://localhost:3010/api/bootstrap"
        );
    }

    #[test]
    fn extracts_public_key_options_from_passkey_envelope() {
        let options = serde_json::json!({
            "challenge_id": "server-id",
            "publicKey": {"challenge": "encoded"}
        });
        assert_eq!(
            super::public_key_options(&options).unwrap(),
            serde_json::json!({"challenge": "encoded"})
        );
    }

    #[test]
    fn discoverable_options_omit_allow_credentials() {
        let options = serde_json::json!({
            "publicKey": {
                "challenge": "encoded",
                "allowCredentials": [{"id": "bad-for-browser", "type": "public-key"}]
            }
        });
        assert_eq!(
            super::discoverable_public_key_options(&options).unwrap(),
            serde_json::json!({"challenge": "encoded"})
        );
    }

    #[test]
    fn login_verification_401_is_a_failed_login_not_a_session_expiry() {
        let event = super::auth_error_event(&Effect::Login, "gateway returned 401".into());

        assert!(matches!(
            event,
            crate::app::ApplicationEvent::Auth(crate::app::AuthEvent::OperationFailed(message))
                if message == "gateway returned 401"
        ));
    }
}
