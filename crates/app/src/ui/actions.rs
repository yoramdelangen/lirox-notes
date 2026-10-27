use dioxus::prelude::WritableExt;

use crate::{
    command::{CommandArgs, CommandId, CommandInvocation, CommandSource},
    AppContext,
};

/// Dispatches command `id` from a pointer interaction.
pub fn run(context: &AppContext, id: &str, args: CommandArgs) {
    run_from(context, id, args, CommandSource::Pointer);
}

pub fn run_from(context: &AppContext, id: &str, args: CommandArgs, source: CommandSource) {
    let mut state = context.state;
    context.dispatcher.dispatch(
        &mut state.write(),
        CommandInvocation {
            id: CommandId::new(id),
            args,
            source,
        },
    );
}

pub fn text(value: impl Into<String>) -> CommandArgs {
    CommandArgs::Text(value.into())
}
