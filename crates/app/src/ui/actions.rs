use dioxus::prelude::{ReadableExt, WritableExt};

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

/// Runs the command bound to `event` in one keymap table (`menu`, `palette`
/// or `cheat-sheet`). Returns true, after stopping the event, if one ran.
pub fn handle_key(
    context: &AppContext,
    table: &str,
    event: &dioxus::prelude::KeyboardEvent,
) -> bool {
    use crate::input::{InputEvent, InputMode, InputScope, InputState, ResolveResult};
    let Some(InputEvent::Key(stroke)) =
        crate::platform::web::keyboard::normalize_keyboard_event(event)
    else {
        return false;
    };
    let bindings = context.state.peek().config.keymaps.bindings.clone();
    // A fresh state per key: these tables bind single keys, and insert mode
    // keeps digits from being read as a count.
    let mut input = InputState {
        mode: InputMode::Insert,
        ..InputState::default()
    };
    let scope = InputScope::SurfaceInstance(crate::command::SurfaceId::new(table));
    let ResolveResult::Matched(invocation) =
        crate::input::resolve(&bindings, &mut input, stroke, &[scope])
    else {
        return false;
    };
    event.prevent_default();
    event.stop_propagation();
    let mut state = context.state;
    context.dispatcher.dispatch(&mut state.write(), invocation);
    true
}
