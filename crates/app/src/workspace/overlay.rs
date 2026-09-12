use crate::command::SurfaceId;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum OverlayPlacement {
    LeftPanel,
    Centered,
    Fullscreen,
}
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum OverlayInputPolicy {
    Modal,
    NonModal,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct OverlayEntry {
    pub id: u64,
    pub surface: SurfaceId,
    pub placement: OverlayPlacement,
    pub input_policy: OverlayInputPolicy,
}
impl OverlayEntry {
    pub fn file_tree() -> Self {
        Self {
            id: 1,
            surface: SurfaceId::FILE_TREE,
            placement: OverlayPlacement::LeftPanel,
            input_policy: OverlayInputPolicy::Modal,
        }
    }
}
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct OverlayStack {
    entries: Vec<OverlayEntry>,
}
impl OverlayStack {
    pub fn push(&mut self, entry: OverlayEntry) {
        self.entries.push(entry);
    }
    pub fn pop(&mut self) -> Option<OverlayEntry> {
        self.entries.pop()
    }
    pub fn top(&self) -> Option<&OverlayEntry> {
        self.entries.last()
    }
}
