mod dispatcher;
mod event;
mod reducer;
mod state;

pub use dispatcher::dispatch;
pub use event::{ApplicationEvent, StatusEvent, WorkspaceEvent};
pub use reducer::{apply_event, Effect};
pub use state::{ApplicationState, StatusState};

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::{CommandArgs, CommandId, CommandInvocation, CommandSource, SurfaceId};
    use crate::input::InputMode;
    use crate::workspace::UiMode;

    fn command(id: &str) -> CommandInvocation {
        CommandInvocation {
            id: CommandId::new(id),
            args: CommandArgs::None,
            source: CommandSource::System,
        }
    }

    #[test]
    fn focus_mode_round_trip_restores_standard_layout() {
        let mut state = ApplicationState::demo();
        dispatch(&mut state, command("workspace.toggle_focus_mode"));
        assert_eq!(state.workspace.ui_mode, UiMode::Focus);
        dispatch(&mut state, command("workspace.toggle_focus_mode"));
        assert_eq!(state.workspace.ui_mode, UiMode::Standard);
        assert!(state.workspace.layout.contains(SurfaceId::FILE_TREE));
    }

    #[test]
    fn unknown_command_becomes_status_error() {
        let mut state = ApplicationState::demo();
        dispatch(&mut state, command("missing.command"));
        assert!(state.status.message.unwrap().contains("Unknown command"));
    }

    #[test]
    fn mode_commands_update_input_state() {
        let mut state = ApplicationState::demo();
        dispatch(&mut state, command("editor.enter_insert_mode"));
        assert_eq!(state.input.mode, InputMode::Insert);
        dispatch(&mut state, command("editor.enter_normal_mode"));
        assert_eq!(state.input.mode, InputMode::Normal);
    }
}
