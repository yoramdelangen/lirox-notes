use super::{FocusState, LayoutNode, OverlayEntry, OverlayStack, SurfaceRegistry, SurfaceState};
use crate::command::SurfaceId;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum UiMode {
    Standard,
    Focus,
}
#[derive(Clone, Debug, PartialEq)]
pub struct WorkspaceState {
    pub ui_mode: UiMode,
    pub layout: LayoutNode,
    pub surfaces: SurfaceRegistry,
    pub focus: FocusState,
    pub overlays: OverlayStack,
    standard_layout: LayoutNode,
}
impl WorkspaceState {
    pub fn demo() -> Self {
        let layout = LayoutNode::standard();
        Self {
            ui_mode: UiMode::Standard,
            layout: layout.clone(),
            standard_layout: layout,
            surfaces: SurfaceRegistry::demo(),
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
        if self.layout.contains(SurfaceId::FILE_TREE) {
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
}
