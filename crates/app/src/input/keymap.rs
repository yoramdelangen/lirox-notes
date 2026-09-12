use crate::command::{CommandArgs, CommandId};

use super::{InputMode, InputScope, KeySequence};

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct KeyBinding {
    pub scope: InputScope,
    pub mode: Option<InputMode>,
    pub sequence: KeySequence,
    pub command: CommandId,
    pub args: CommandArgs,
}

impl KeyBinding {
    pub fn new(
        scope: InputScope,
        mode: Option<InputMode>,
        sequence: KeySequence,
        command: CommandId,
        args: CommandArgs,
    ) -> Self {
        Self {
            scope,
            mode,
            sequence,
            command,
            args,
        }
    }
}
