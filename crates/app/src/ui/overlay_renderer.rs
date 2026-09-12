use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    ui::surfaces::FileTreeSurface,
    workspace::{OverlayInputPolicy, OverlayPlacement},
    AppAction, AppContext,
};

#[component]
pub fn OverlayRenderer(
    view: WorkspaceView,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let context = use_context::<AppContext>();
    let Some(entry) = context.state.read().workspace.overlays.top().cloned() else {
        return rsx! {};
    };
    if entry.input_policy != OverlayInputPolicy::Modal
        || entry.placement != OverlayPlacement::LeftPanel
    {
        return rsx! {};
    }
    rsx! {
        div {
            class: "absolute inset-0 z-10 bg-black/40",
            aria_hidden: "true",
            div {
                class: "h-full w-full max-w-sm border-r border-[var(--lirox-border)] bg-[var(--lirox-bg-alt)] shadow-xl",
                role: "dialog",
                aria_label: "File tree overlay",
                FileTreeSurface {
                    view,
                    active: true,
                    focus: crate::FocusTarget::Sidebar,
                    sidebar_mode: crate::SidebarMode::Tree,
                    browser_dir: String::new(),
                    on_action,
                    on_select_note,
                }
            }
        }
    }
}
