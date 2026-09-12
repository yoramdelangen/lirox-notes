use crate::command::SurfaceId;
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, Serialize, Deserialize)]
pub enum SurfaceKind {
    Editor,
    FileTree,
    Search,
    Diagnostics,
    Help,
}

#[derive(Clone, Debug, Eq, Hash, PartialEq, Serialize, Deserialize)]
pub enum InputScope {
    Global,
    Workspace,
    Surface(SurfaceKind),
    SurfaceInstance(SurfaceId),
    Overlay,
}
