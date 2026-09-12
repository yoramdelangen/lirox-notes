use crate::command::SurfaceId;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct FocusState {
    pub active_surface: SurfaceId,
}

impl Default for FocusState {
    fn default() -> Self {
        Self {
            active_surface: SurfaceId::EDITOR,
        }
    }
}
