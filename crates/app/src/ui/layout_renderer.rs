use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;

use crate::{
    ui::surfaces::{EditorSurface, FileTreeSurface},
    workspace::{Axis, LayoutNode, SurfaceState, WorkspaceState},
    AppAction, FocusTarget, SidebarMode,
};

#[component]
pub fn LayoutRenderer(
    node: LayoutNode,
    workspace: WorkspaceState,
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let active = workspace.focus.active_surface.clone();
    match node {
        LayoutNode::Surface(id) => {
            let is_active = active == id;
            match workspace.surface(id).cloned() {
                Some(SurfaceState::Editor(_)) => rsx! {
                    EditorSurface {
                        view,
                        active: is_active,
                    }
                },
                Some(SurfaceState::FileTree(_)) => rsx! {
                    FileTreeSurface {
                        view,
                        active: is_active,
                        focus,
                        sidebar_mode,
                        browser_dir,
                        on_action,
                        on_select_note,
                    }
                },
                None => rsx! {
                    div { class: "p-4 text-[var(--lirox-muted)]", "Unknown surface" }
                },
            }
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
            let axis_class = match axis {
                Axis::Horizontal => "workspace-split-horizontal",
                Axis::Vertical => "workspace-split-vertical",
            };
            let divider_class = match axis {
                Axis::Horizontal => "border-l border-[var(--lirox-border)]",
                Axis::Vertical => "border-t border-[var(--lirox-border)]",
            };
            let first_style = match axis {
                Axis::Horizontal => format!("width: {}%;", ratio * 100.0),
                Axis::Vertical => format!("height: {}%;", ratio * 100.0),
            };
            let first_class = if contains_file_tree(&first, &workspace) {
                "workspace-tree-pane"
            } else {
                ""
            };
            rsx! {
                div { class: "workspace-split {axis_class} flex min-h-0 min-w-0 flex-1 {direction}",
                    div { class: "workspace-split-first {first_class} min-h-0 min-w-0 shrink-0", style: first_style,
                        LayoutRenderer {
                            node: *first,
                            workspace: workspace.clone(),
                            view: view.clone(),
                            focus,
                            sidebar_mode,
                            browser_dir: browser_dir.clone(),
                            on_action,
                            on_select_note,
                        }
                    }
                    div { class: "workspace-split-second min-h-0 min-w-0 flex-1 {divider_class}",
                        LayoutRenderer {
                            node: *second,
                            workspace,
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

fn contains_file_tree(node: &LayoutNode, workspace: &WorkspaceState) -> bool {
    match node {
        LayoutNode::Surface(id) => {
            matches!(
                workspace.surface(id.clone()),
                Some(SurfaceState::FileTree(_))
            )
        }
        LayoutNode::Split { first, second, .. } => {
            contains_file_tree(first, workspace) || contains_file_tree(second, workspace)
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
