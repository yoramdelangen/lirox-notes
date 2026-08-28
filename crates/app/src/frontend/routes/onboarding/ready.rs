use dioxus::prelude::*;
use liroxnotes_shared::{NoteSummary, WorkspaceView};

#[cfg(target_arch = "wasm32")]
use crate::{fetch_workspace_view, workspace_note_path_from_location};
use crate::{AppAction, FocusTarget, SidebarMode, EDITOR_BRIDGE_JS, EDITOR_JS};

use super::super::super::components::{EditorPane, Sidebar, StatusBar, TopBar};

fn parent_directory(path: &str) -> &str {
    path.rsplit_once('/').map(|(dir, _)| dir).unwrap_or("")
}

fn fallback_title(path: &str) -> String {
    path.rsplit('/').next().unwrap_or(path).trim_end_matches(".md").replace('-', " ")
}

fn virtual_workspace_view(view: WorkspaceView, path: &str) -> WorkspaceView {
    let mut notes = view.notes.clone();
    if !notes.iter().any(|note| note.path == path) {
        notes.push(NoteSummary {
            path: path.to_string(),
            title: fallback_title(path),
            labels: Vec::new(),
            links: Vec::new(),
            active: false,
        });
    }
    for note in &mut notes {
        note.active = note.path == path;
    }

    WorkspaceView {
        selected_note: notes.iter().find(|note| note.path == path).cloned().unwrap_or(NoteSummary {
            path: path.to_string(),
            title: fallback_title(path),
            labels: Vec::new(),
            links: Vec::new(),
            active: true,
        }),
        selected_note_body: String::new(),
        notes,
        ..view
    }
}

#[component]
pub(crate) fn ReadyRoute() -> Element {
    let workspace = use_signal(|| None::<WorkspaceView>);
    let requested = use_signal(|| false);
    let mut focus = use_signal(|| FocusTarget::Editor);
    let mut sidebar_mode = use_signal(|| SidebarMode::Tree);
    let mut browser_dir = use_signal(String::new);

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
            let mut browser_dir = browser_dir;
            let mut requested = requested;
            requested.set(true);
            spawn(async move {
                browser_dir.set(selected.as_deref().map(parent_directory).unwrap_or("").to_string());
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

    let sidebar_on_select_note = move |path: String| {
        focus.set(FocusTarget::Editor);
        browser_dir.set(parent_directory(&path).to_string());

        #[cfg(target_arch = "wasm32")]
        {
            let mut workspace = workspace;
            let current_view = view.clone();
            spawn(async move {
                let next_view = fetch_workspace_view(Some(&path))
                    .await
                    .map(|next| {
                        if next.selected_note.path == path {
                            next
                        } else {
                            virtual_workspace_view(next, &path)
                        }
                    })
                    .or_else(|| Some(virtual_workspace_view(current_view, &path)));
                workspace.set(next_view);
            });
        }
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
                Sidebar {
                    view: view.clone(),
                    focus: *focus.read(),
                    sidebar_mode: *sidebar_mode.read(),
                    browser_dir: browser_dir.read().clone(),
                    on_action: move |action: AppAction| match action {
                        AppAction::FocusSidebar => focus.set(FocusTarget::Sidebar),
                        AppAction::FocusEditor => focus.set(FocusTarget::Editor),
                        AppAction::CycleSidebarMode => {
                            let next_mode = sidebar_mode.read().next();
                            sidebar_mode.set(next_mode);
                        }
                        AppAction::SetSidebarMode(mode) => sidebar_mode.set(mode),
                        AppAction::SetBrowserDir(path) => browser_dir.set(path),
                        AppAction::GoUpDirectory => {
                            let next_dir = parent_directory(&browser_dir.read()).to_string();
                            browser_dir.set(next_dir);
                        }
                    },
                    on_select_note: sidebar_on_select_note,
                }
                EditorPane { view: view.clone(), on_action: None }
            }
            StatusBar {
                note_path: view.selected_note.path.clone(),
                branch: view.branch.clone(),
                changed_notes: view.changed_notes,
                note_count: view.note_count,
                source: view.source.clone(),
                focus: *focus.read(),
                sidebar_mode: *sidebar_mode.read(),
                on_action: move |action: AppAction| match action {
                    AppAction::FocusSidebar => focus.set(FocusTarget::Sidebar),
                    AppAction::FocusEditor => focus.set(FocusTarget::Editor),
                    AppAction::CycleSidebarMode => {
                        let next_mode = sidebar_mode.read().next();
                        sidebar_mode.set(next_mode);
                    }
                    AppAction::SetSidebarMode(mode) => sidebar_mode.set(mode),
                    AppAction::SetBrowserDir(path) => browser_dir.set(path),
                    AppAction::GoUpDirectory => {
                        let next_dir = parent_directory(&browser_dir.read()).to_string();
                        browser_dir.set(next_dir);
                    }
                },
            }
        }
    }
}
