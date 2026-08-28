use crate::{AppAction, FocusTarget, SidebarMode, APP_CSS, EDITOR_BRIDGE_JS, EDITOR_JS};
use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use super::super::components::{EditorPane, Sidebar, StatusBar, TopBar};
use super::super::layouts::WorkspaceLayout;

#[component]
pub fn WorkspaceShell(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let labels_notes = false;

    rsx! {
        document::Link { rel: "icon", href: "data:," }
        document::Stylesheet { href: APP_CSS }
        document::Script { src: EDITOR_JS, r#type: "module" }
        document::Script { src: EDITOR_BRIDGE_JS }
        WorkspaceLayout {
            labels_notes,
            top_bar: rsx! {
                TopBar { workspace_name: view.name.clone(), note_title: view.selected_note.title.clone(), source: view.source.clone() }
            },
            sidebar: rsx! {
                Sidebar {
                    view: view.clone(),
                    focus,
                    sidebar_mode,
                    browser_dir,
                    pending_create: None,
                    on_action: on_action.clone(),
                    on_select_note: on_select_note.clone(),
                    on_create_change: None,
                    on_create_submit: None,
                    on_create_cancel: None,
                }
            },
            editor: rsx! {
                EditorPane { view: view.clone(), on_action: on_action.clone() }
            },
            status_bar: rsx! {
                StatusBar {
                    note_path: view.selected_note.path.clone(),
                    branch: view.branch.clone(),
                    changed_notes: view.changed_notes,
                    note_count: view.note_count,
                    source: view.source.clone(),
                    focus,
                    sidebar_mode,
                    on_action,
                }
            },
        }
    }
}
