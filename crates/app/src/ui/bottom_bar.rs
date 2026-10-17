use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{input::InputMode, AppContext};

#[component]
pub fn BottomBar(view: WorkspaceView, active: bool) -> Element {
    let _ = &view;
    let context = use_context::<AppContext>();
    let state = context.state.read();
    let mode = match state.input.mode {
        InputMode::Normal => "NORMAL",
        InputMode::Insert => "INSERT",
        InputMode::Visual => "VISUAL",
        InputMode::VisualLine => "VISUAL LINE",
        InputMode::VisualBlock => "VISUAL BLOCK",
        InputMode::Replace => "REPLACE",
    };

    let message = state
        .status
        .message
        .clone()
        .unwrap_or_else(|| "Ready".into());

    rsx! {
        footer {
            class: "editor-status-bar pointer-events-none absolute z-10 flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 text-xs",
            span { class: "font-bold text-[var(--lirox-accent)]", "{mode}" }
            span { class: "ml-auto text-[var(--lirox-info)]", "{message}" }
        }
    }
}
