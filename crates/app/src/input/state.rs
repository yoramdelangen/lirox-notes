use super::{InputMode, KeySequence};

#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct InputState {
    pub mode: InputMode,
    pub pending: KeySequence,
    pub count: Option<u32>,
    pub operator: Option<()>,
}
