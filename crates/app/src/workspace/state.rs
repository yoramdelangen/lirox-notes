use super::{FocusState, LayoutNode, OverlayEntry, OverlayStack, SurfaceRegistry, SurfaceState};
use crate::command::SurfaceId;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum UiMode {
    Standard,
    Focus,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ViewportMode {
    Wide,
    Narrow,
}

#[derive(Clone, Debug, PartialEq)]
pub struct WorkspaceState {
    pub ui_mode: UiMode,
    pub viewport: ViewportMode,
    pub layout: LayoutNode,
    pub surfaces: SurfaceRegistry,
    pub focus: FocusState,
    pub overlays: OverlayStack,
    standard_layout: LayoutNode,
}
impl WorkspaceState {
    pub fn empty() -> Self {
        let layout = LayoutNode::standard();
        Self {
            ui_mode: UiMode::Standard,
            viewport: ViewportMode::Wide,
            layout: layout.clone(),
            standard_layout: layout,
            surfaces: SurfaceRegistry::empty(),
            focus: FocusState::default(),
            overlays: OverlayStack::default(),
        }
    }
    pub fn surface(&self, id: SurfaceId) -> Option<&SurfaceState> {
        self.surfaces.get(id)
    }
    pub fn surface_mut(&mut self, id: SurfaceId) -> Option<&mut SurfaceState> {
        self.surfaces.get_mut(id)
    }
    pub fn toggle_focus_mode(&mut self) {
        match self.ui_mode {
            UiMode::Standard => {
                self.ui_mode = UiMode::Focus;
                self.layout = LayoutNode::focus();
            }
            UiMode::Focus => {
                self.ui_mode = UiMode::Standard;
                self.layout = self.standard_layout.clone();
            }
        }
    }
    pub fn toggle_file_tree(&mut self) {
        if self.viewport == ViewportMode::Narrow || self.ui_mode == UiMode::Focus {
            self.open_file_tree_overlay();
        } else if self.layout.contains(SurfaceId::FILE_TREE) {
            self.layout = LayoutNode::focus();
        } else {
            self.layout = self.standard_layout.clone();
        }
    }
    pub fn open_file_tree_overlay(&mut self) {
        if self.overlays.top().map(|entry| entry.surface.clone()) != Some(SurfaceId::FILE_TREE) {
            self.overlays.push(OverlayEntry::file_tree());
        }
    }

    pub fn set_viewport(&mut self, viewport: ViewportMode) {
        self.viewport = viewport;
    }

    pub fn render_layout(&self) -> LayoutNode {
        if self.viewport == ViewportMode::Narrow {
            LayoutNode::focus()
        } else {
            self.layout.clone()
        }
    }
}
