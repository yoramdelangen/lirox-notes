use crate::command::{CommandArgs, CommandId};
use crate::input::{InputMode, InputScope, KeySequence, KeyStroke};

#[derive(Clone, Debug, PartialEq)]
pub struct KeymapConfig {
    pub leader: KeyStroke,
    pub bindings: Vec<crate::input::KeyBinding>,
}

impl KeymapConfig {
    pub fn new(leader: KeyStroke, bindings: Vec<crate::input::KeyBinding>) -> Self {
        Self { leader, bindings }
    }
}

pub(crate) fn binding(
    scope: InputScope,
    mode: Option<InputMode>,
    sequence: KeySequence,
    command: &str,
    args: CommandArgs,
) -> crate::input::KeyBinding {
    crate::input::KeyBinding::new(scope, mode, sequence, CommandId::new(command), args)
}
