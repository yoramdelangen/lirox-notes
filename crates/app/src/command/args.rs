use serde::{Deserialize, Serialize};
use std::borrow::Cow;

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub enum CommandArgs {
    None,
    Count(u32),
    Direction(Direction),
    Surface(SurfaceId),
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

#[derive(Clone, Debug, Eq, Hash, PartialEq, Serialize, Deserialize)]
pub struct SurfaceId(Cow<'static, str>);

impl SurfaceId {
    pub const EDITOR: Self = Self(Cow::Borrowed("editor"));
    pub const FILE_TREE: Self = Self(Cow::Borrowed("file-tree"));

    pub fn new(id: impl Into<String>) -> Self {
        Self(Cow::Owned(id.into()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
