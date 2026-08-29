use dioxus::prelude::*;
use liroxnotes_shared::{workspace_view_with_virtual_notes, WorkspaceView};

use crate::{
    current_workspace_note_path, delete_note, fetch_workspace_view, on_create_virtual_note,
    on_delete_workspace_target, on_start_sidebar_create, on_workspace_popstate,
    prime_virtual_note_draft, pull_workspace, push_workspace, request_virtual_note_creation,
    sidebar_create_path, sync_workspace_location, AppAction, FocusTarget, SidebarCreateState,
    SidebarMode, EDITOR_BRIDGE_JS, EDITOR_JS,
};

use super::super::super::components::{EditorPane, Sidebar, StatusBar, TopBar};

fn parent_directory(path: &str) -> &str {
    path.rsplit_once('/').map(|(dir, _)| dir).unwrap_or("")
}

fn merged_workspace_view(
    view: WorkspaceView,
    path: &str,
    virtual_notes: &[String],
) -> WorkspaceView {
    let mut paths = virtual_notes.to_vec();
    if !paths.iter().any(|virtual_path| virtual_path == path)
        && !view.notes.iter().any(|note| note.path == path)
    {
        paths.push(path.to_string());
    }

    workspace_view_with_virtual_notes(view, path, &paths)
}

fn upsert_virtual_note_path(paths: &mut Vec<String>, path: &str) {
    if !paths.iter().any(|virtual_path| virtual_path == path) {
        paths.push(path.to_string());
    }
}

fn delete_matches(path: &str, kind: &str, note_path: &str) -> bool {
    match kind {
        "folder" => note_path.starts_with(&format!("{path}/")),
        _ => note_path == path,
    }
}

fn next_selected_path(view: &WorkspaceView, path: &str, kind: &str) -> Option<String> {
    if !delete_matches(path, kind, &view.selected_note.path) {
        return Some(view.selected_note.path.clone());
    }

    view.notes
        .iter()
        .find(|note| !delete_matches(path, kind, &note.path))
        .map(|note| note.path.clone())
}

fn pruned_workspace_view(view: WorkspaceView, path: &str, kind: &str) -> WorkspaceView {
    let notes = view
        .notes
        .into_iter()
        .filter(|note| !delete_matches(path, kind, &note.path))
        .collect::<Vec<_>>();

    WorkspaceView { notes, ..view }
}

#[component]
pub(crate) fn ReadyRoute() -> Element {
    let workspace = use_signal(|| None::<WorkspaceView>);
    let requested = use_signal(|| false);
    let mut focus = use_signal(|| FocusTarget::Editor);
    let mut sidebar_mode = use_signal(|| SidebarMode::Tree);
    let mut browser_dir = use_signal(String::new);
    #[allow(unused_mut, unused_variables)]
    let mut virtual_notes = use_signal(Vec::<String>::new);
    let mut pending_create = use_signal(|| None::<SidebarCreateState>);
    let mut create_listener_ready = use_signal(|| false);

    use_effect(move || {
        if *requested.read() {
            return;
        }

        let selected = current_workspace_note_path();
        let mut workspace = workspace;
        let mut browser_dir = browser_dir;
        let mut requested = requested;
        requested.set(true);
        spawn(async move {
            browser_dir.set(
                selected
                    .as_deref()
                    .map(parent_directory)
                    .unwrap_or("")
                    .to_string(),
            );
            workspace.set(fetch_workspace_view(selected.as_deref()).await);
        });
    });

    use_effect(move || {
        if *create_listener_ready.read() {
            return;
        }

        create_listener_ready.set(true);

        let mut create_workspace = workspace;
        let mut create_virtual_notes = virtual_notes;
        let mut create_browser_dir = browser_dir;
        let mut create_focus = focus;
        let mut create_pending = pending_create;
        on_create_virtual_note(move |path| {
            let Some(current_view) = create_workspace.read().clone() else {
                return;
            };

            let mut next_virtual_notes = create_virtual_notes.read().clone();
            upsert_virtual_note_path(&mut next_virtual_notes, &path);
            create_browser_dir.set(parent_directory(&path).to_string());
            create_focus.set(FocusTarget::Editor);
            create_pending.set(None);
            sync_workspace_location(&current_view.slug, &path);
            create_workspace.set(Some(merged_workspace_view(
                current_view,
                &path,
                &next_virtual_notes,
            )));
            create_virtual_notes.set(next_virtual_notes);
        });

        let mut start_create_pending = pending_create;
        let mut start_create_browser_dir = browser_dir;
        on_start_sidebar_create(move |dir, kind| {
            start_create_browser_dir.set(dir.clone());
            start_create_pending.set(Some(SidebarCreateState {
                dir,
                kind,
                value: String::new(),
            }));
        });

        let mut popstate_workspace = workspace;
        let popstate_virtual_notes = virtual_notes;
        let mut popstate_browser_dir = browser_dir;
        on_workspace_popstate(move |path| {
            let current_view = popstate_workspace.read().clone();
            let virtual_note_paths = popstate_virtual_notes.read().clone();
            popstate_browser_dir.set(parent_directory(&path).to_string());
            spawn(async move {
                let next_view = fetch_workspace_view(Some(&path))
                    .await
                    .map(|next| merged_workspace_view(next, &path, &virtual_note_paths))
                    .or_else(|| {
                        current_view
                            .map(|view| merged_workspace_view(view, &path, &virtual_note_paths))
                    });
                popstate_workspace.set(next_view);
            });
        });

        let delete_workspace = workspace;
        let mut delete_virtual_notes = virtual_notes;
        let mut delete_browser_dir = browser_dir;
        on_delete_workspace_target(move |path, kind| {
            let Some(current_view) = delete_workspace.read().clone() else {
                return;
            };
            let Some(next_selected) = next_selected_path(&current_view, &path, &kind) else {
                return;
            };
            let remaining_virtual_notes = delete_virtual_notes
                .read()
                .iter()
                .filter(|virtual_path| !delete_matches(&path, &kind, virtual_path))
                .cloned()
                .collect::<Vec<_>>();
            let deleted_paths = current_view
                .notes
                .iter()
                .filter(|note| delete_matches(&path, &kind, &note.path))
                .map(|note| note.path.clone())
                .collect::<Vec<_>>();

            delete_virtual_notes.set(remaining_virtual_notes.clone());
            delete_browser_dir.set(parent_directory(&next_selected).to_string());
            sync_workspace_location(&current_view.slug, &next_selected);

            let mut delete_workspace = delete_workspace;
            spawn(async move {
                for note_path in &deleted_paths {
                    let _ = delete_note(&current_view.slug, note_path).await;
                }

                let pruned_view = pruned_workspace_view(current_view, &path, &kind);

                let next_view = fetch_workspace_view(Some(&next_selected))
                    .await
                    .map(|view| {
                        workspace_view_with_virtual_notes(
                            view,
                            &next_selected,
                            &remaining_virtual_notes,
                        )
                    })
                    .or_else(|| {
                        Some(workspace_view_with_virtual_notes(
                            pruned_view,
                            &next_selected,
                            &remaining_virtual_notes,
                        ))
                    });
                delete_workspace.set(next_view);
            });
        });
    });

    let Some(view) = workspace.read().clone() else {
        return rsx! {
            section { class: "mt-3 space-y-4",
                h1 { class: "text-3xl font-semibold", "Loading workspace" }
                p { class: "text-sm text-theme-muted", "Opening the first file..." }
            }
        };
    };

    let view_for_sidebar = view.clone();
    let sidebar_on_select_note = move |path: String| {
        focus.set(FocusTarget::Editor);
        browser_dir.set(parent_directory(&path).to_string());

        let mut workspace = workspace;
        let current_view = view_for_sidebar.clone();
        let virtual_note_paths = virtual_notes.read().clone();
        sync_workspace_location(&current_view.slug, &path);
        spawn(async move {
            let next_view = fetch_workspace_view(Some(&path))
                .await
                .map(|next| merged_workspace_view(next, &path, &virtual_note_paths))
                .or_else(|| {
                    Some(merged_workspace_view(
                        current_view,
                        &path,
                        &virtual_note_paths,
                    ))
                });
            workspace.set(next_view);
        });
    };

    let sidebar_on_create_change = move |value: String| {
        let current = pending_create.read().clone();
        if let Some(mut create) = current {
            create.value = value;
            pending_create.set(Some(create));
        }
    };

    let sidebar_on_create_cancel = move |_| pending_create.set(None);

    let sidebar_on_create_submit = move |_| {
        let Some(create) = pending_create.read().clone() else {
            return;
        };
        let Some(path) = sidebar_create_path(&create) else {
            pending_create.set(None);
            return;
        };

        prime_virtual_note_draft(&path);
        request_virtual_note_creation(&path);
    };

    rsx! {
        document::Script { src: EDITOR_JS, r#type: "module" }
        document::Script { src: EDITOR_BRIDGE_JS }
        div { class: "grid h-screen overflow-hidden grid-rows-[2.75rem_minmax(0,1fr)_2.25rem] bg-shell-bg text-theme-text antialiased",
            TopBar {
                workspace_name: view.name.clone(),
                note_title: view.selected_note.title.clone(),
                source: view.source.clone(),
                unpushed_commits: view.unpushed_commits,
                on_pull: move |_| {
                    let Some(current_view) = workspace.read().clone() else {
                        return;
                    };
                    let selected_path = current_view.selected_note.path.clone();
                    let current_slug = current_view.slug.clone();
                    let mut workspace = workspace;
                    let virtual_note_paths = virtual_notes.read().clone();
                    spawn(async move {
                        let _ = pull_workspace(&current_slug).await;
                        let next_view = fetch_workspace_view(Some(&selected_path)).await.map(|view| {
                            workspace_view_with_virtual_notes(view, &selected_path, &virtual_note_paths)
                        });
                        workspace.set(next_view);
                    });
                },
                on_push: move |_| {
                    let Some(current_view) = workspace.read().clone() else {
                        return;
                    };
                    let selected_path = current_view.selected_note.path.clone();
                    let current_slug = current_view.slug.clone();
                    let mut workspace = workspace;
                    let virtual_note_paths = virtual_notes.read().clone();
                    spawn(async move {
                        let _ = push_workspace(&current_slug).await;
                        let next_view = fetch_workspace_view(Some(&selected_path)).await.map(|view| {
                            workspace_view_with_virtual_notes(view, &selected_path, &virtual_note_paths)
                        });
                        workspace.set(next_view);
                    });
                },
            }
            div { class: "grid min-h-0 h-full grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]",
                Sidebar {
                    view: view.clone(),
                    focus: *focus.read(),
                    sidebar_mode: *sidebar_mode.read(),
                    browser_dir: browser_dir.read().clone(),
                    pending_create: pending_create.read().clone(),
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
                    on_create_change: sidebar_on_create_change,
                    on_create_submit: sidebar_on_create_submit,
                    on_create_cancel: sidebar_on_create_cancel,
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
