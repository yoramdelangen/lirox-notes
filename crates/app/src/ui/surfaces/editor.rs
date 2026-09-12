use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{input::InputMode, AppContext};

#[component]
pub fn EditorSurface(view: WorkspaceView, active: bool) -> Element {
    let _ = view;
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let state_read = state.read();
    let mode = state_read.input.mode;
    let selected = state_read.domain.selected_note.as_deref().and_then(|path| {
        state_read
            .domain
            .notes
            .iter()
            .find(|note| note.path == path)
    });
    let title = selected.map(|note| note.title.clone()).unwrap_or_default();
    let path = selected.map(|note| note.path.clone()).unwrap_or_default();
    let document = state_read.domain.document.clone();
    let has_notes = !state_read.domain.notes.is_empty();
    drop(state_read);
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
                     h1 { class: "text-sm font-semibold", "{title}" }
                     p { class: "text-xs text-[var(--lirox-muted)]", "{path}" }
                }
                span { class: "text-xs {mode_class}", if insert { "INSERT" } else { "NORMAL" } }
            }
            div { class: "min-h-0 flex-1 overflow-auto p-4",
                 if !has_notes {
                    p { class: "text-sm text-[var(--lirox-muted)]", "No note selected" }
                } else if insert {
                    textarea {
                        class: "h-full min-h-64 w-full resize-none border-0 bg-transparent font-mono text-sm leading-6 text-[var(--lirox-fg)] outline-none",
                        value: "{document}",
                        oninput: move |event| state.write().set_document(event.value()),
                        aria_label: "Edit note",
                    }
                } else {
                    pre { class: "whitespace-pre-wrap font-mono text-sm leading-6", "{document}" }
                }
            }
        }
    }
}
