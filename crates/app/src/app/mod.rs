mod dispatcher;
mod event;
mod reducer;
mod state;

pub use dispatcher::{dispatch, Dispatcher};
pub use event::{ApplicationEvent, StatusEvent, WorkspaceEvent};
pub use reducer::{apply_event, Effect};
pub use state::{ApplicationState, StatusState};

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::{CommandArgs, CommandId, CommandInvocation, CommandSource, SurfaceId};
    use crate::input::InputMode;
    use crate::workspace::{OverlayEntry, OverlayInputPolicy, OverlayPlacement, UiMode};

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

    #[test]
    fn moving_file_tree_selection_with_no_notes_sets_status_without_panicking() {
        let mut state = ApplicationState::demo();
        state.domain.notes.clear();

        dispatch(&mut state, command("file_tree.move_down"));

        assert_eq!(
            state.status.message.as_deref(),
            Some("Cannot move file-tree selection: no notes")
        );
    }

    #[test]
    fn opening_selected_note_only_closes_the_file_tree_overlay() {
        let mut state = ApplicationState::demo();
        state.workspace.overlays.push(OverlayEntry::file_tree());
        state.workspace.overlays.push(OverlayEntry {
            id: 2,
            surface: SurfaceId::EDITOR,
            placement: OverlayPlacement::Centered,
            input_policy: OverlayInputPolicy::Modal,
        });

        dispatch(&mut state, command("file_tree.open_selected"));
        assert_eq!(
            state.workspace.overlays.top().map(|overlay| overlay.id),
            Some(2)
        );
        assert!(!state
            .workspace
            .overlays
            .contains_surface(SurfaceId::FILE_TREE));

        let mut docked = ApplicationState::demo();
        dispatch(&mut docked, command("file_tree.open_selected"));
        assert_eq!(docked.workspace.overlays.top(), None);
    }
}
