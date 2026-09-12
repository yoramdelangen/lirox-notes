use dioxus::prelude::*;
use liroxnotes_shared::{TreeKind, WorkspaceView};

use crate::{
    app::{ApplicationState, Dispatcher},
    command::{CommandArgs, CommandId, CommandInvocation, CommandSource, SurfaceId},
    AppAction, AppContext, FocusTarget, SidebarMode,
};

#[component]
pub fn FileTreeSurface(
    view: WorkspaceView,
    active: bool,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let context = use_context::<AppContext>();
    let active_class = if active {
        "border-l-2 border-[var(--lirox-accent)]"
    } else {
        ""
    };
    let state = context.state;
    let dispatcher = context.dispatcher.clone();
    let heading = if sidebar_mode == SidebarMode::Tree {
        "File Tree"
    } else {
        "Browser"
    };
    rsx! {
        aside {
            class: "flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--lirox-bg-alt)] {active_class}",
            aria_label: "{heading}",
            header { class: "flex items-center justify-between border-b border-[var(--lirox-border)] px-3 py-3",
                div {
                    h2 { class: "text-sm font-semibold", "{heading}" }
                    p { class: "text-xs text-[var(--lirox-muted)]", "{browser_dir}" }
                }
                kbd { class: "text-xs text-[var(--lirox-subtle)]", "j/k · Enter" }
            }
            ul { class: "min-h-0 flex-1 overflow-auto p-2", role: "tree",
                for entry in view.tree {
                    li { key: "{entry.path}", role: "treeitem", aria_selected: "{entry.active}",
                        button {
                            class: "flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-[var(--lirox-surface-alt)] focus:outline-none focus:ring-1 focus:ring-[var(--lirox-accent)]",
                            class: if entry.active { "bg-[var(--lirox-selection)] text-[var(--lirox-fg)]" } else { "text-[var(--lirox-muted)]" },
                            style: "padding-left: {entry.depth * 12 + 8}px;",
                            aria_label: "Open {entry.label}",
                            onclick: {
                                let path = entry.path.clone();
                                let dispatcher = dispatcher.clone();
                                let on_select_note = on_select_note.clone();
                                move |_| open_note(dispatcher.clone(), state, on_select_note.clone(), path.clone())
                            },
                            span { class: "w-4 text-[var(--lirox-accent)]", if entry.kind == TreeKind::Folder { "▾" } else { "·" } }
                            span { "{entry.label}" }
                        }
                    }
                }
            }
            footer { class: "border-t border-[var(--lirox-border)] px-3 py-2 text-xs text-[var(--lirox-subtle)]",
                "{focus:?} · {view.note_count} notes"
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
        state
            .workspace
            .surface_mut(SurfaceId::FILE_TREE)
            .map(|surface| surface.select(path.clone()));
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
