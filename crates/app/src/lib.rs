use dioxus::prelude::*;
use liroxnotes_shared::{mock_workspace_view, WorkspaceView};

pub mod app;
pub mod command;
pub mod config;
pub mod domain;
pub mod input;
pub mod platform;
pub mod workspace;

use app::{ApplicationState, Dispatcher};
use input::InputEvent;

#[derive(Clone, Copy)]
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
    let state = use_signal(ApplicationState::demo);
    use_context_provider(|| AppContext {
        state,
        dispatcher: Dispatcher,
    });
    rsx! {
        document::Link { rel: "stylesheet", href: MAIN_CSS }
        document::Link { rel: "stylesheet", href: TAILWIND_CSS }
        WorkspaceShell {
            view: mock_workspace_view("notes/welcome.md"),
            focus: FocusTarget::Editor,
            sidebar_mode: SidebarMode::Tree,
            browser_dir: String::new(),
            on_action: None,
            on_select_note: None,
        }
    }
}

#[component]
pub fn WorkspaceShell(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let context = use_context::<AppContext>();
    let onkeydown = move |event: KeyboardEvent| {
        let Some(InputEvent::Key(stroke)) =
            platform::web::keyboard::normalize_keyboard_event(&event)
        else {
            return;
        };
        if !platform::web::keyboard::should_intercept(&event) {
            return;
        }
        let mut state = context.state;
        let result = {
            let mut state = state.write();
            let bindings = state.config.keymaps.bindings.clone();
            let scopes = state.active_input_scopes();
            input::resolve(&bindings, &mut state.input, stroke, &scopes)
        };
        if let input::ResolveResult::Matched(invocation) = result {
            event.prevent_default();
            context.dispatcher.dispatch(&mut state.write(), invocation);
        }
    };
    let focus_label = match focus {
        FocusTarget::Sidebar => "sidebar",
        FocusTarget::Editor => "editor",
    };
    let sidebar_label = match sidebar_mode {
        SidebarMode::Tree => "tree",
        SidebarMode::LabelsNotes => "labels-notes",
        SidebarMode::Files => "files",
    };
    let note_path = view.selected_note.path.clone();
    rsx! {
        main {
            onkeydown: onkeydown,
            class: "min-h-screen bg-[var(--lirox-bg)] text-[var(--lirox-fg)]",
            id: "workspace-shell",
            h1 { class: "border-b border-[var(--lirox-border)] p-3 text-sm", "LiroxNotes" }
            section { class: "p-4",
                h2 { class: "text-lg", "{view.selected_note.title}" }
                p { class: "text-[var(--lirox-muted)]", "{view.selected_note.path}" }
                p { class: "text-[var(--lirox-subtle)]", "Focus: {focus_label} | Sidebar: {sidebar_label} | Directory: {browser_dir}" }
                pre { class: "mt-4 whitespace-pre-wrap", "{view.selected_note_body}" }
                button {
                    class: "mt-4",
                    onclick: move |_| {
                        if let Some(handler) = on_action.as_ref() {
                            handler.call(AppAction::FocusEditor);
                        }
                    },
                    "Focus editor"
                }
                button {
                    class: "ml-3 mt-4",
                    onclick: move |_| {
                        if let Some(handler) = on_select_note.as_ref() {
                            handler.call(note_path.clone());
                        }
                    },
                    "Select note"
                }
            }
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
            super::workspace_note_path_from_location("/workspace/demo/note/notes/welcome"),
            Some("notes/welcome.md".to_string())
        );
        assert_eq!(
            super::workspace_note_path_from_location("/workspace/demo/notes/"),
            Some("notes/README.md".to_string())
        );
    }
}
