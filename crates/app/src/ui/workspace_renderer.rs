use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    ui::{layout_renderer::LayoutRenderer, overlay_renderer::OverlayRenderer},
    AppContext, FocusTarget, SidebarMode,
};

#[component]
pub fn WorkspaceRenderer(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let context = use_context::<AppContext>();
    let state = context.state.read();
    rsx! {
        section {
            class: "relative flex min-h-0 min-w-0 flex-1",
            aria_label: "Workspace",
            LayoutRenderer {
                node: state.workspace.render_layout(),
                workspace: state.workspace.clone(),
                view: view.clone(),
                focus,
                sidebar_mode,
                on_select_note,
            }
            OverlayRenderer {
                view,
                on_select_note,
            }
        }
    }
}
