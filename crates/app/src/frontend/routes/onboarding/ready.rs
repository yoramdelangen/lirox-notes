use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

#[cfg(target_arch = "wasm32")]
use crate::{fetch_workspace_view, workspace_note_path_from_location};
use crate::{FocusTarget, SidebarMode, EDITOR_BRIDGE_JS, EDITOR_JS};

use super::super::super::components::{EditorPane, StatusBar, TopBar};

#[component]
pub(crate) fn ReadyRoute() -> Element {
    let workspace = use_signal(|| None::<WorkspaceView>);
    let requested = use_signal(|| false);

    use_effect(move || {
        if *requested.read() {
            return;
        }

        #[cfg(target_arch = "wasm32")]
        {
            let selected = web_sys::window()
                .and_then(|window| window.location().pathname().ok())
                .and_then(|path| workspace_note_path_from_location(&path).map(str::to_string));
            let mut workspace = workspace;
            let mut requested = requested;
            requested.set(true);
            spawn(async move {
                workspace.set(fetch_workspace_view(selected.as_deref()).await);
            });
        }

        #[cfg(not(target_arch = "wasm32"))]
        {
            let mut requested = requested;
            requested.set(true);
        }
    });

    let Some(view) = workspace.read().clone() else {
        return rsx! {
            section { class: "mt-3 space-y-4",
                h1 { class: "text-3xl font-semibold", "Loading workspace" }
                p { class: "text-sm text-theme-muted", "Opening the first file..." }
            }
        };
    };

    rsx! {
        document::Script { src: EDITOR_JS, r#type: "module" }
        document::Script { src: EDITOR_BRIDGE_JS }
        div { class: "grid h-screen overflow-hidden grid-rows-[2.75rem_minmax(0,1fr)_2.25rem] bg-shell-bg text-theme-text antialiased",
            TopBar {
                workspace_name: view.name.clone(),
                note_title: view.selected_note.title.clone(),
                source: view.source.clone(),
            }
            div { class: "grid min-h-0 h-full grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]",
                aside { class: "hidden border-r border-shell-border bg-shell-panel lg:block" }
                EditorPane { view: view.clone(), on_action: None }
            }
            StatusBar {
                note_path: view.selected_note.path.clone(),
                branch: view.branch.clone(),
                changed_notes: view.changed_notes,
                note_count: view.note_count,
                source: view.source.clone(),
                focus: FocusTarget::Editor,
                sidebar_mode: SidebarMode::Tree,
                on_action: None,
            }
        }
    }
}
