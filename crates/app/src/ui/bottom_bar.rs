use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{command::SurfaceId, input::InputMode, workspace::UiMode, AppContext};

#[component]
pub fn BottomBar(view: WorkspaceView, browser_dir: String) -> Element {
    let context = use_context::<AppContext>();
    let state = context.state.read();
    let mode = match state.input.mode {
        InputMode::Normal => "NORMAL",
        InputMode::Insert => "INSERT",
    };
    let surface = if state.workspace.focus.active_surface == SurfaceId::FILE_TREE {
        "FILE TREE"
    } else {
        "EDITOR"
    };
    let ui_mode = match state.workspace.ui_mode {
        UiMode::Standard => "STANDARD",
        UiMode::Focus => "FOCUS",
    };
    let pending = if state.input.pending.is_empty() {
        "-".to_string()
    } else {
        format!("{} key(s)", state.input.pending.len())
    };
    let message = state
        .status
        .message
        .clone()
        .unwrap_or_else(|| "Ready".into());

    rsx! {
        footer {
            class: "flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--lirox-border)] bg-[var(--lirox-bg-alt)] px-4 py-2 text-xs",
            span { class: "font-bold text-[var(--lirox-accent)]", "{mode}" }
            span { "{ui_mode}" }
            span { class: "text-[var(--lirox-muted)]", "Workspace: {view.slug}" }
            span { class: "text-[var(--lirox-muted)]", "Surface: {surface}" }
            span { class: "text-[var(--lirox-muted)]", "Path: {browser_dir} / {view.selected_note.path}" }
            span { class: "text-[var(--lirox-muted)]", "Pending: {pending}" }
            span { class: "ml-auto text-[var(--lirox-info)]", "{message}" }
        }
    }
}
