mod focus;
mod layout;
mod overlay;
mod state;
mod surface;

pub use focus::FocusState;
pub use layout::{Axis, LayoutNode};
pub use overlay::{OverlayEntry, OverlayInputPolicy, OverlayPlacement, OverlayStack};
pub use state::{UiMode, ViewportMode, WorkspaceState};
pub use surface::{SurfaceKind, SurfaceRegistry, SurfaceState};

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::SurfaceId;

    #[test]
    fn standard_layout_contains_file_tree_and_editor() {
        let workspace = WorkspaceState::demo();
        assert!(workspace.layout.contains(SurfaceId::FILE_TREE));
        assert!(workspace.layout.contains(SurfaceId::EDITOR));
    }

    #[test]
    fn focus_mode_preserves_file_tree_state_and_restores_layout() {
        let mut workspace = WorkspaceState::demo();
        let standard = workspace.layout.clone();
        workspace
            .surface_mut(SurfaceId::FILE_TREE)
            .unwrap()
            .select("notes/deep.md");

        workspace.toggle_focus_mode();
        assert_eq!(workspace.ui_mode, UiMode::Focus);
        assert!(!workspace.layout.contains(SurfaceId::FILE_TREE));
        assert_eq!(
            workspace
                .surface(SurfaceId::FILE_TREE)
                .unwrap()
                .selected_path(),
            Some("notes/deep.md")
        );

        workspace.toggle_focus_mode();
        assert_eq!(workspace.ui_mode, UiMode::Standard);
        assert_eq!(workspace.layout, standard);
    }

    #[test]
    fn overlay_stack_is_lifo() {
        let mut stack = OverlayStack::default();
        stack.push(OverlayEntry::file_tree());
        assert_eq!(stack.pop().unwrap().surface, SurfaceId::FILE_TREE);
    }

    #[test]
    fn file_tree_overlay_reuses_registered_surface() {
        let mut workspace = WorkspaceState::demo();
        workspace.toggle_focus_mode();
        workspace.open_file_tree_overlay();
        assert_eq!(
            workspace.overlays.top().unwrap().surface,
            SurfaceId::FILE_TREE
        );
        assert!(workspace.surface(SurfaceId::FILE_TREE).is_some());
    }

    #[test]
    fn narrow_viewport_uses_editor_layout_and_opens_file_tree_as_overlay() {
        let mut workspace = WorkspaceState::demo();
        workspace.set_viewport(ViewportMode::Narrow);

        assert_eq!(workspace.render_layout(), LayoutNode::focus());
        workspace.toggle_file_tree();
        assert_eq!(
            workspace.overlays.top().map(|entry| entry.surface.clone()),
            Some(SurfaceId::FILE_TREE)
        );
        assert!(workspace.surface(SurfaceId::FILE_TREE).is_some());
    }
}
