use crate::command::SurfaceId;
pub use crate::input::SurfaceKind;
use std::collections::HashMap;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct EditorSurfaceState;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct FileTreeSurfaceState {
    pub selected_path: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum SurfaceState {
    Editor(EditorSurfaceState),
    FileTree(FileTreeSurfaceState),
}

impl SurfaceState {
    pub fn editor() -> Self {
        Self::Editor(EditorSurfaceState)
    }
    pub fn file_tree() -> Self {
        Self::FileTree(FileTreeSurfaceState {
            selected_path: None,
        })
    }
    pub fn select(&mut self, path: impl Into<String>) {
        if let Self::FileTree(state) = self {
            state.selected_path = Some(path.into());
        }
    }
    pub fn selected_path(&self) -> Option<&str> {
        match self {
            Self::FileTree(state) => state.selected_path.as_deref(),
            Self::Editor(_) => None,
        }
    }
}

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct SurfaceRegistry {
    surfaces: HashMap<SurfaceId, SurfaceState>,
}

impl SurfaceRegistry {
    pub fn demo() -> Self {
        let mut surfaces = HashMap::new();
        surfaces.insert(SurfaceId::EDITOR, SurfaceState::editor());
        surfaces.insert(SurfaceId::FILE_TREE, SurfaceState::file_tree());
        Self { surfaces }
    }
    pub fn get(&self, id: SurfaceId) -> Option<&SurfaceState> {
        self.surfaces.get(&id)
    }
    pub fn get_mut(&mut self, id: SurfaceId) -> Option<&mut SurfaceState> {
        self.surfaces.get_mut(&id)
    }
}
