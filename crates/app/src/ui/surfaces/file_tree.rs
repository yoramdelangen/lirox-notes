use dioxus::prelude::*;
use liroxnotes_shared::{TreeEntry, TreeKind, WorkspaceView};

use crate::{
    app::{ApplicationState, AuthCommand, Dispatcher},
    command::{CommandArgs, CommandId, CommandInvocation, CommandSource, SurfaceId},
    components::button::{Button, ButtonSize, ButtonVariant},
    ui::top_bar::WorkspaceTopBar,
    AppContext, FocusTarget, SidebarMode,
};

#[component]
pub fn FileTreeSurface(
    view: WorkspaceView,
    active: bool,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    #[props(default = false)] in_sheet: bool,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let context = use_context::<AppContext>();
    let active_class = if active {
        "ring-1 ring-inset ring-[var(--lirox-accent)] transition-shadow duration-150"
    } else {
        ""
    };
    let mut state = context.state;
    let mut active_sidebar_mode = use_signal(|| sidebar_mode);
    let selected_path = state.read().domain.selected_note.clone();
    let note_count = state.read().domain.notes.len();
    let profile_name = state
        .read()
        .auth
        .bootstrap
        .as_ref()
        .and_then(|bootstrap| {
            bootstrap
                .display_name
                .clone()
                .or_else(|| bootstrap.user.clone())
        })
        .unwrap_or_else(|| "User".into());
    let heading = match active_sidebar_mode() {
        SidebarMode::Tree => "File Tree",
        SidebarMode::LabelsNotes => "Labels & Notes",
        SidebarMode::Files => "Files",
    };
    let modebar_safe_area = if in_sheet {
        "!pb-[max(.375rem,env(safe-area-inset-bottom))]"
    } else {
        ""
    };
    rsx! {
        aside {
            class: "flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--lirox-bg-alt)] {active_class}",
            onpointerdown: move |_| state.write().workspace.focus.active_surface = SurfaceId::FILE_TREE,
            onfocusin: move |_| state.write().workspace.focus.active_surface = SurfaceId::FILE_TREE,
            aria_label: "{heading}",
            WorkspaceTopBar { view: view.clone(), in_sheet }
            FileTreeList { entries: view.tree, selected_path, on_select_note }
            ProfileFooter { focus, profile_name, note_count }
            footer { class: "workspace-sidebar-modebar flex shrink-0 items-center gap-1 border-t border-[var(--lirox-border)] p-1 {modebar_safe_area}", aria_label: "Sidebar views",
                Button {
                     size: ButtonSize::IconXs,
                    variant: ButtonVariant::Ghost,
                    class: if active_sidebar_mode() == SidebarMode::Tree { "workspace-sidebar-mode is-active" } else { "workspace-sidebar-mode" },
                    aria_label: "Show file tree",
                    title: "File tree",
                    onclick: move |_| active_sidebar_mode.set(SidebarMode::Tree),
                    svg { view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "1.7",
                        path { d: "M4 5.5h6l2 2h8v11H4z" }
                    }
                }
                Button {
                     size: ButtonSize::IconXs,
                    variant: ButtonVariant::Ghost,
                    class: if active_sidebar_mode() == SidebarMode::LabelsNotes { "workspace-sidebar-mode is-active" } else { "workspace-sidebar-mode" },
                    aria_label: "Show labels and notes",
                    title: "Labels and notes",
                    onclick: move |_| active_sidebar_mode.set(SidebarMode::LabelsNotes),
                    svg { view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "1.7",
                        path { d: "M5 5h14v14H5zM8 9h8M8 12h8M8 15h5" }
                    }
                }
                Button {
                     size: ButtonSize::IconXs,
                    variant: ButtonVariant::Ghost,
                    class: if active_sidebar_mode() == SidebarMode::Files { "workspace-sidebar-mode is-active" } else { "workspace-sidebar-mode" },
                    aria_label: "Show files",
                    title: "Files",
                    onclick: move |_| active_sidebar_mode.set(SidebarMode::Files),
                    svg { view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "1.7",
                        path { d: "M4 6h6l2 2h8v10H4zM7 12h10M7 15h6" }
                    }
                }
            }
        }
    }
}

#[component]
fn FileTreeList(
    entries: Vec<TreeEntry>,
    selected_path: Option<String>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let context = use_context::<AppContext>();
    let state = context.state;
    let dispatcher = context.dispatcher;
    rsx! {
        ul { class: "min-h-0 flex-1 overflow-auto p-2", role: "tree",
            if entries.is_empty() {
                li { class: "p-3 text-sm text-[var(--lirox-muted)]", "No notes available" }
            } else {
                for entry in entries {
                    li { key: "{entry.path}", role: "treeitem", aria_selected: "{selected_path.as_deref() == Some(entry.path.as_str())}",
                        Button {
                            variant: ButtonVariant::Ghost,
                            size: ButtonSize::Sm,
                            class: if selected_path.as_deref() == Some(entry.path.as_str()) {
                                "flex w-full items-center justify-start gap-2 rounded bg-[var(--lirox-selection)] px-2 py-1 text-left text-sm text-[var(--lirox-fg)] hover:bg-[var(--lirox-surface-alt)] focus:outline-none focus:ring-1 focus:ring-[var(--lirox-accent)]"
                            } else {
                                "flex w-full items-center justify-start gap-2 rounded px-2 py-1 text-left text-sm text-[var(--lirox-muted)] hover:bg-[var(--lirox-surface-alt)] focus:outline-none focus:ring-1 focus:ring-[var(--lirox-accent)]"
                            },
                            style: "padding-left: {entry.depth * 12 + 8}px;",
                            aria_label: "Open {entry.label}",
                            onclick: {
                                let path = entry.path.clone();
                                let dispatcher = dispatcher.clone();
                                let on_select_note = on_select_note;
                                move |_| open_note(dispatcher.clone(), state, on_select_note, path.clone())
                            },
                            span { class: "w-4 text-[var(--lirox-accent)]", if entry.kind == TreeKind::Folder { "▾" } else { "·" } }
                            span { "{entry.label}" }
                        }
                    }
                }
            }
        }
    }
}

#[component]
fn ProfileFooter(focus: FocusTarget, profile_name: String, note_count: usize) -> Element {
    let context = use_context::<AppContext>();
    let state = context.state;
    let dispatcher = context.dispatcher;
    let mut profile_menu = use_signal(|| false);
    rsx! {
        footer { class: "workspace-sidebar-footer border-t border-[var(--lirox-border)] px-3 py-2",
            div { class: "flex items-center justify-between gap-2",
                div { class: "min-w-0",
                    strong { class: "block truncate text-sm text-[var(--lirox-fg)]", "{profile_name}" }
                    span { class: "block truncate text-[.7rem] text-[var(--lirox-subtle)]", "{focus:?} · {note_count} notes" }
                }
                div { class: "workspace-profile-wrap",
                    Button {
                        class: "workspace-more",
                        size: ButtonSize::IconXs,
                        variant: ButtonVariant::Ghost,
                        aria_label: "Open user menu",
                        onclick: move |_| profile_menu.toggle(),
                        "..."
                    }
                    if profile_menu() {
                        div { class: "workspace-profile-menu", role: "menu",
                            Button {
                                variant: ButtonVariant::Ghost,
                                class: "workspace-profile-action",
                                onclick: move |_| crate::auth::dispatch_auth(
                                    state,
                                    dispatcher.clone(),
                                    AuthCommand::Logout,
                                ),
                                "Log out"
                            }
                        }
                    }
                }
            }
        }
    }
}

fn open_note(
    dispatcher: Dispatcher,
    mut state: Signal<ApplicationState>,
    on_select_note: Option<EventHandler<String>>,
    path: String,
) {
    {
        let mut state = state.write();
        if let Some(surface) = state.workspace.surface_mut(SurfaceId::FILE_TREE) {
            surface.select(path.clone());
        }
        state.domain.selected_note = Some(path.clone());
    }
    if let Some(handler) = on_select_note.as_ref() {
        handler.call(path.clone());
    }
    dispatcher.dispatch(
        &mut state.write(),
        CommandInvocation {
            id: CommandId::new("file_tree.open_selected"),
            args: CommandArgs::None,
            source: CommandSource::Pointer,
        },
    );
}
