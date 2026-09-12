use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    ui::{layout_renderer::LayoutRenderer, overlay_renderer::OverlayRenderer},
    AppAction, AppContext, FocusTarget, SidebarMode,
};

#[component]
pub fn WorkspaceRenderer(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let context = use_context::<AppContext>();
    let state = context.state.read();
    rsx! {
        section {
            class: "relative flex min-h-0 min-w-0 flex-1",
            aria_label: "Workspace",
            LayoutRenderer {
                node: state.workspace.layout.clone(),
                view: view.clone(),
                focus,
                sidebar_mode,
                browser_dir: browser_dir.clone(),
                on_action,
                on_select_note,
            }
            OverlayRenderer {
                view,
                on_action,
                on_select_note,
            }
        }
    }
}
