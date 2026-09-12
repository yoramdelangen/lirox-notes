use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    command::SurfaceId,
    ui::surfaces::{EditorSurface, FileTreeSurface},
    workspace::{Axis, LayoutNode},
    AppAction, AppContext, FocusTarget, SidebarMode,
};

#[component]
pub fn LayoutRenderer(
    node: LayoutNode,
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let context = use_context::<AppContext>();
    let active = context.state.read().workspace.focus.active_surface.clone();
    match node {
        LayoutNode::Surface(id) if id == SurfaceId::EDITOR => rsx! {
            EditorSurface { view, active: active == SurfaceId::EDITOR }
        },
        LayoutNode::Surface(id) if id == SurfaceId::FILE_TREE => rsx! {
            FileTreeSurface {
                view,
                active: active == SurfaceId::FILE_TREE,
                focus,
                sidebar_mode,
                browser_dir,
                on_action,
                on_select_note,
            }
        },
        LayoutNode::Surface(_) => {
            rsx! { div { class: "p-4 text-[var(--lirox-muted)]", "Unknown surface" } }
        }
        LayoutNode::Split {
            axis,
            ratio,
            first,
            second,
        } => {
            let direction = match axis {
                Axis::Horizontal => "flex-row",
                Axis::Vertical => "flex-col",
            };
            let first_style = match axis {
                Axis::Horizontal => format!("width: {}%;", ratio * 100.0),
                Axis::Vertical => format!("height: {}%;", ratio * 100.0),
            };
            rsx! {
                div { class: "flex min-h-0 min-w-0 flex-1 {direction}",
                    div { class: "min-h-0 min-w-0 shrink-0", style: first_style,
                        LayoutRenderer {
                            node: *first,
                            view: view.clone(),
                            focus,
                            sidebar_mode,
                            browser_dir: browser_dir.clone(),
                            on_action,
                            on_select_note,
                        }
                    }
                    div { class: "min-h-0 min-w-0 flex-1 border-l border-[var(--lirox-border)]",
                        LayoutRenderer {
                            node: *second,
                            view,
                            focus,
                            sidebar_mode,
                            browser_dir,
                            on_action,
                            on_select_note,
                        }
                    }
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn split_ratio_is_rendered_as_a_percentage() {
        let ratio = 0.25_f32;
        assert_eq!(format!("width: {}%;", ratio * 100.0), "width: 25%;");
    }
}
