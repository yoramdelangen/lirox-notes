use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    command::{CommandArgs, CommandId, CommandInvocation, CommandSource},
    AppAction, AppContext,
};

#[component]
pub fn TopBar(view: WorkspaceView, on_action: Option<EventHandler<AppAction>>) -> Element {
    let context = use_context::<AppContext>();
    let tree_action = on_action.clone();
    let focus_action = on_action;
    let state = context.state;
    let tree_dispatcher = context.dispatcher.clone();
    let focus_dispatcher = context.dispatcher.clone();

    rsx! {
        header {
            class: "flex shrink-0 items-center justify-between gap-4 border-b border-[var(--lirox-border)] bg-[var(--lirox-bg-alt)] px-4 py-3",
            div { class: "min-w-0",
                p { class: "text-sm font-semibold tracking-wide", "{view.name}" }
                p { class: "truncate text-xs text-[var(--lirox-muted)]", "{view.branch} · {view.selected_note.path}" }
            }
            nav { class: "flex shrink-0 gap-2", "aria-label": "Workspace actions",
                button {
                    class: "rounded border border-[var(--lirox-border)] px-2 py-1 text-xs hover:bg-[var(--lirox-surface-alt)] focus:outline-none focus:ring-1 focus:ring-[var(--lirox-accent)]",
                    "aria-label": "Toggle file tree",
                    onclick: move |_| {
                        if let Some(handler) = tree_action.as_ref() {
                            handler.call(AppAction::CycleSidebarMode);
                        }
                        let mut state = state;
                        tree_dispatcher.dispatch(&mut state.write(), CommandInvocation {
                            id: CommandId::new("workspace.toggle_file_tree"),
                            args: CommandArgs::None,
                            source: CommandSource::Pointer,
                        });
                    },
                    "Tree"
                }
                button {
                    class: "rounded border border-[var(--lirox-border)] px-2 py-1 text-xs hover:bg-[var(--lirox-surface-alt)] focus:outline-none focus:ring-1 focus:ring-[var(--lirox-accent)]",
                    "aria-label": "Toggle focus mode",
                    onclick: move |_| {
                        if let Some(handler) = focus_action.as_ref() {
                            handler.call(AppAction::FocusEditor);
                        }
                        let mut state = state;
                        focus_dispatcher.dispatch(&mut state.write(), CommandInvocation {
                            id: CommandId::new("workspace.toggle_focus_mode"),
                            args: CommandArgs::None,
                            source: CommandSource::Pointer,
                        });
                    },
                    "Focus"
                }
            }
        }
    }
}
