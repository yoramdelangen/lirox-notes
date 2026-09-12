use serde::{Deserialize, Serialize};

use super::{CommandArgs, CommandId};

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub enum CommandSource {
    Keyboard,
    Pointer,
    CommandPalette,
    Menu,
    System,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct CommandInvocation {
    pub id: CommandId,
    pub args: CommandArgs,
    pub source: CommandSource,
}
