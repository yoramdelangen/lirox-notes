use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{input::InputMode, AppContext};

#[component]
pub fn BottomBar(view: WorkspaceView, active: bool) -> Element {
    let _ = &view;
    let context = use_context::<AppContext>();
    let state = context.state.read();
    if !state.config.editor.vim_mode_enabled {
        return rsx! {};
    }
    let mode = match state.input.mode {
        InputMode::Normal => "NORMAL",
        InputMode::Insert => "INSERT",
        InputMode::Visual => "VISUAL",
        InputMode::VisualLine => "VISUAL LINE",
        InputMode::VisualBlock => "VISUAL BLOCK",
        InputMode::Replace => "REPLACE",
    };

    // let message = state
    //     .status
    //     .message
    //     .clone()
    //     .unwrap_or_else(|| "Ready".into());

    rsx! {
        footer {
            class: "editor-status-bar pointer-events-none absolute left-0 right-0 bottom-0 z-100 flex flex-wrap items-center px-4 py-2 gap-x-2 gap-y-1 text-sm",
            span { class: "font-bold text-[var(--lirox-accent)]", "{mode}" }
            // span { class: "ml-auto text-[var(--lirox-info)]", "{message}" }
        }
    }
}
