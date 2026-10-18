use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::command::SurfaceId;

pub mod app;
pub(crate) use app::execute_effect;
pub mod auth;
pub mod command;
mod components;
pub mod config;
pub mod domain;
pub mod input;
pub mod platform;
pub mod theme;
pub mod ui;
pub mod workspace;

use app::{ApplicationState, Dispatcher};
pub use ui::WorkspaceShell;

#[derive(Clone)]
pub struct AppContext {
    pub state: Signal<ApplicationState>,
    pub dispatcher: Dispatcher,
}

const MAIN_CSS: Asset = asset!("/assets/main.css");
const TAILWIND_CSS: Asset = asset!("/assets/tailwind.css");
const EDITOR_JS: Asset = asset!("/assets/editor.js");

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
        document::Script { src: EDITOR_JS }
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
                    on_select_note: None,
                }
            }
        } else {
            auth::AuthShell {}
        }
    }
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
            crate::app::gateway_url("/api/bootstrap"),
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
            crate::app::public_key_options(&options).unwrap(),
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
            crate::app::discoverable_public_key_options(&options).unwrap(),
            serde_json::json!({"challenge": "encoded"})
        );
    }

    #[test]
    fn login_verification_401_is_a_failed_login_not_a_session_expiry() {
        let event =
            crate::app::auth_error_event(&crate::app::Effect::Login, "gateway returned 401".into());

        assert!(matches!(
            event,
            crate::app::ApplicationEvent::Auth(crate::app::AuthEvent::OperationFailed(message))
                if message == "gateway returned 401"
        ));
    }
}
