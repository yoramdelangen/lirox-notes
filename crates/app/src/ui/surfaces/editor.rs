use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{input::InputMode, AppContext};

#[component]
pub fn EditorSurface(view: WorkspaceView, active: bool) -> Element {
    let mode = use_context::<AppContext>().state.read().input.mode;
    let insert = mode == InputMode::Insert;
    let active_class = if active {
        "ring-1 ring-inset ring-[var(--lirox-accent)]"
    } else {
        ""
    };
    let mode_class = if insert {
        "text-[var(--lirox-accent)]"
    } else {
        "text-[var(--lirox-muted)]"
    };
    rsx! {
        article {
            class: "flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--lirox-surface)] {active_class}",
            aria_label: "Editor",
            header { class: "flex items-center justify-between border-b border-[var(--lirox-border)] px-4 py-3",
                div {
                    h1 { class: "text-sm font-semibold", "{view.selected_note.title}" }
                    p { class: "text-xs text-[var(--lirox-muted)]", "{view.selected_note.path}" }
                }
                span { class: "text-xs {mode_class}", if insert { "INSERT" } else { "NORMAL" } }
            }
            div { class: "min-h-0 flex-1 overflow-auto p-4",
                if insert {
                    textarea {
                        class: "h-full min-h-64 w-full resize-none border-0 bg-transparent font-mono text-sm leading-6 text-[var(--lirox-fg)] outline-none",
                        value: "{view.selected_note_body}",
                        aria_label: "Edit note",
                    }
                } else {
                    pre { class: "whitespace-pre-wrap font-mono text-sm leading-6", "{view.selected_note_body}" }
                }
            }
        }
    }
}
