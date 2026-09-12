use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

pub mod app;
pub mod command;
pub mod config;
pub mod domain;
pub mod input;
pub mod platform;
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
    let state = use_signal(ApplicationState::empty);
    use_context_provider(|| AppContext {
        state,
        dispatcher: Dispatcher::new(),
    });
    rsx! {
        document::Link { rel: "stylesheet", href: MAIN_CSS }
        document::Link { rel: "stylesheet", href: TAILWIND_CSS }
        WorkspaceShell {
            view: WorkspaceView::empty(),
            focus: FocusTarget::Editor,
            sidebar_mode: SidebarMode::Tree,
            browser_dir: String::new(),
            on_action: None,
            on_select_note: None,
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
}
