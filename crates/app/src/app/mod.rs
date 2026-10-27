mod dispatcher;
mod effects;
mod event;
mod reducer;
mod state;

pub use dispatcher::{dispatch, Dispatcher};
pub(crate) use effects::execute_effect;
#[cfg(test)]
pub(crate) use effects::{
    auth_error_event, discoverable_public_key_options, login_public_key_options, public_key_options,
};
pub use event::{
    ApplicationEvent, AuthCommand, AuthEvent, StatusEvent, ThemeEvent, WorkspaceEvent,
};
pub(crate) use reducer::effective_vim;
pub use reducer::{apply_event, Effect};
pub use state::{
    ActionMenu, ApplicationState, PaletteState, Popover, SidebarTab, StatusState, UiState,
};

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::{CommandArgs, CommandId, CommandInvocation, CommandSource, SurfaceId};
    use crate::input::{
        resolve, InputMode, InputScope, Key, KeyBinding, KeySequence, KeyStroke, Modifiers,
        ResolveResult, SurfaceKind,
    };
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
        let mut state = ApplicationState::empty();
        dispatch(&mut state, command("workspace.toggle_focus_mode"));
        assert_eq!(state.workspace.ui_mode, UiMode::Focus);
        dispatch(&mut state, command("workspace.toggle_focus_mode"));
        assert_eq!(state.workspace.ui_mode, UiMode::Standard);
        assert!(state.workspace.layout.contains(SurfaceId::FILE_TREE));
    }

    #[test]
    fn unknown_command_becomes_status_error() {
        let mut state = ApplicationState::empty();
        dispatch(&mut state, command("missing.command"));
        assert!(state.status.message.unwrap().contains("Unknown command"));
    }

    #[test]
    fn mode_commands_update_input_state() {
        let mut state = ApplicationState::empty();
        dispatch(&mut state, command("editor.enter_insert_mode"));
        assert_eq!(state.input.mode, InputMode::Insert);
        dispatch(&mut state, command("editor.enter_normal_mode"));
        assert_eq!(state.input.mode, InputMode::Normal);
    }

    #[test]
    fn focus_previous_from_editor_selects_the_file_tree() {
        let mut state = ApplicationState::empty();

        dispatch(&mut state, command("workspace.focus_previous_surface"));

        assert_eq!(state.workspace.focus.active_surface, SurfaceId::FILE_TREE);
    }

    #[test]
    fn sidebar_toggle_tracks_the_active_pane() {
        let mut state = ApplicationState::empty();

        dispatch(&mut state, command("workspace.toggle_file_tree"));
        assert_eq!(state.workspace.focus.active_surface, SurfaceId::EDITOR);

        dispatch(&mut state, command("workspace.toggle_file_tree"));
        assert_eq!(state.workspace.focus.active_surface, SurfaceId::FILE_TREE);
    }

    #[test]
    fn moving_file_tree_selection_with_no_notes_sets_status_without_panicking() {
        let mut state = ApplicationState::empty();

        dispatch(&mut state, command("file_tree.move_down"));

        assert_eq!(
            state.status.message.as_deref(),
            Some("Cannot move file-tree selection: no notes")
        );
    }

    #[test]
    fn opening_selected_note_only_closes_the_file_tree_overlay() {
        let mut state = ApplicationState::empty();
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

        let mut docked = ApplicationState::empty();
        dispatch(&mut docked, command("file_tree.open_selected"));
        assert_eq!(docked.workspace.overlays.top(), None);
    }

    #[test]
    fn opening_selected_note_requests_its_document() {
        let mut state = ApplicationState::empty();
        state.domain.notes = vec![crate::domain::Note {
            path: "notes/second.md".into(),
            title: "Second".into(),
            body: String::new(),
        }];
        state.domain.selected_note = Some("notes/second.md".into());

        assert_eq!(
            dispatch(&mut state, command("file_tree.open_selected")),
            vec![Effect::LoadWorkspaceNote("notes/second.md".into())]
        );
    }

    #[test]
    fn modal_overlay_routes_input_to_its_surface_before_focused_surface() {
        let mut state = ApplicationState::empty();
        state.workspace.ui_mode = UiMode::Focus;
        state.workspace.open_file_tree_overlay();

        let scopes = state.active_input_scopes();
        assert_eq!(scopes[0], InputScope::Overlay);
        assert_eq!(scopes[1], InputScope::SurfaceInstance(SurfaceId::FILE_TREE));
        assert_eq!(scopes[2], InputScope::Surface(SurfaceKind::FileTree));
        let result = resolve(
            &state.config.keymaps.bindings,
            &mut state.input,
            KeyStroke::new(Key::Char('j'), Modifiers::NONE),
            &scopes,
        );
        assert!(
            matches!(result, ResolveResult::Matched(invocation) if invocation.id.as_str() == "file_tree.move_down")
        );
    }

    #[test]
    fn non_modal_overlay_does_not_take_input_priority() {
        let mut state = ApplicationState::empty();
        state.workspace.overlays.push(OverlayEntry {
            id: 2,
            surface: SurfaceId::FILE_TREE,
            placement: OverlayPlacement::LeftPanel,
            input_policy: OverlayInputPolicy::NonModal,
        });

        let scopes = state.active_input_scopes();
        assert_eq!(scopes[0], InputScope::SurfaceInstance(SurfaceId::EDITOR));
        assert!(!scopes.contains(&InputScope::Overlay));
        assert!(!scopes.contains(&InputScope::Surface(SurfaceKind::FileTree)));

        state.config.keymaps.bindings.push(KeyBinding::new(
            InputScope::Global,
            Some(InputMode::Normal),
            KeySequence::from(vec![KeyStroke::new(Key::Char('j'), Modifiers::NONE)]),
            CommandId::new("global.j"),
            CommandArgs::None,
        ));
        let result = resolve(
            &state.config.keymaps.bindings,
            &mut state.input,
            KeyStroke::new(Key::Char('j'), Modifiers::NONE),
            &scopes,
        );
        assert!(
            matches!(result, ResolveResult::Matched(invocation) if invocation.id.as_str() == "global.j")
        );
    }

    #[test]
    fn dispatcher_preserves_effects_at_the_application_boundary() {
        let dispatcher = Dispatcher::new();
        let mut state = ApplicationState::empty();
        state.domain.selected_note = Some("notes/welcome.md".into());

        dispatcher.dispatch(&mut state, command("editor.save"));

        assert_eq!(
            dispatcher.take_effects(),
            vec![Effect::SaveDocument {
                path: "notes/welcome.md".into(),
                content: state.domain.document.clone(),
            }]
        );
    }

    #[test]
    fn workspace_view_adapts_into_selectable_domain_state() {
        let mut view = liroxnotes_shared::WorkspaceView::empty();
        view.name = "Notes".into();
        view.notes = vec![liroxnotes_shared::NoteSummary {
            path: "notes/one.md".into(),
            title: "One".into(),
            labels: Vec::new(),
            links: Vec::new(),
            active: true,
        }];
        view.note_count = 1;
        view.selected_note = view.notes[0].clone();
        view.selected_note_body = "# One".into();

        let state = ApplicationState::from_workspace_view(&view);

        assert_eq!(state.domain.workspace_name, "Notes");
        assert_eq!(state.domain.selected_note.as_deref(), Some("notes/one.md"));
        assert_eq!(state.domain.document, "# One");
        assert_eq!(
            state
                .workspace
                .surface(SurfaceId::FILE_TREE)
                .and_then(|surface| surface.selected_path()),
            Some("notes/one.md")
        );

        let mut state = ApplicationState::from_workspace_view(&view);
        dispatch(&mut state, command("file_tree.move_down"));
        assert_eq!(state.domain.selected_note.as_deref(), Some("notes/one.md"));
        dispatch(&mut state, command("file_tree.open_selected"));
        assert_eq!(state.domain.document, "# One");
    }

    #[test]
    fn workspace_loaded_applies_the_active_theme() {
        let mut view = liroxnotes_shared::WorkspaceView::empty();
        view.theme.colors.accent = "#123456".into();
        let expected = view.theme.clone();
        let mut state = ApplicationState::empty();

        apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::WorkspaceLoaded(Box::new(view))),
        );

        assert_eq!(state.theme, expected);
    }

    #[test]
    fn theme_preview_can_be_changed_and_cleared() {
        let mut state = ApplicationState::empty();
        let mut preview = liroxnotes_shared::WorkspaceTheme::default();
        preview.colors.accent = "#123456".into();

        apply_event(
            &mut state,
            ApplicationEvent::Theme(ThemeEvent::PreviewChanged(Some(preview.clone()))),
        );
        assert_eq!(state.theme_preview, Some(preview));

        apply_event(
            &mut state,
            ApplicationEvent::Theme(ThemeEvent::PreviewChanged(None)),
        );
        assert_eq!(state.theme_preview, None);
    }

    #[test]
    fn successful_theme_save_commits_preview_and_failed_save_keeps_it() {
        let mut state = ApplicationState::empty();
        let mut preview = liroxnotes_shared::WorkspaceTheme::default();
        preview.colors.accent = "#123456".into();
        apply_event(
            &mut state,
            ApplicationEvent::Theme(ThemeEvent::PreviewChanged(Some(preview.clone()))),
        );

        apply_event(
            &mut state,
            ApplicationEvent::Theme(ThemeEvent::SaveFailed("offline".into())),
        );
        assert_eq!(state.theme_preview, Some(preview.clone()));
        assert_eq!(state.theme, liroxnotes_shared::WorkspaceTheme::default());

        apply_event(
            &mut state,
            ApplicationEvent::Theme(ThemeEvent::SaveSucceeded(preview.clone())),
        );
        assert_eq!(state.theme, preview);
        assert_eq!(state.theme_preview, None);
    }

    #[test]
    fn document_updates_through_application_state() {
        let mut state = ApplicationState::empty();
        state.set_document("edited".into());
        assert_eq!(state.domain.document, "edited");
    }

    fn command_with(id: &str, args: CommandArgs) -> CommandInvocation {
        CommandInvocation {
            id: CommandId::new(id),
            args,
            source: CommandSource::System,
        }
    }

    fn workspace_with_tree() -> ApplicationState {
        use liroxnotes_shared::{TreeEntry, TreeKind};
        let mut state = ApplicationState::empty();
        let mut view = liroxnotes_shared::WorkspaceView::empty();
        view.slug = "notes".into();
        view.tree = vec![
            TreeEntry {
                kind: TreeKind::Folder,
                label: "work".into(),
                path: "work".into(),
                depth: 0,
                active: false,
            },
            TreeEntry {
                kind: TreeKind::File,
                label: "a.md".into(),
                path: "work/a.md".into(),
                depth: 1,
                active: false,
            },
            TreeEntry {
                kind: TreeKind::File,
                label: "b.md".into(),
                path: "b.md".into(),
                depth: 0,
                active: true,
            },
        ];
        state.auth.workspace = Some(view);
        state.domain.selected_note = Some("b.md".into());
        state
    }

    #[test]
    fn escape_closes_the_topmost_interface_layer_first() {
        let mut state = ApplicationState::empty();
        state.ui.outline = true;
        dispatch(&mut state, command("ui.open_palette"));

        let effects = dispatch(&mut state, command("overlay.close_top"));
        assert!(state.ui.palette.is_none());
        assert!(state.ui.outline);
        assert_eq!(effects, vec![Effect::EditorFocus]);

        dispatch(&mut state, command("overlay.close_top"));
        assert!(!state.ui.outline);
    }

    #[test]
    fn palette_accept_runs_the_selected_command() {
        let mut state = ApplicationState::empty();
        dispatch(
            &mut state,
            command_with(
                "ui.open_palette",
                CommandArgs::Text("> toggle action".into()),
            ),
        );
        assert!(state.ui.action_bar);

        let effects = dispatch(&mut state, command("ui.palette_accept"));
        assert!(!state.ui.action_bar);
        assert!(state.ui.palette.is_none());
        assert!(effects.contains(&Effect::EditorFocus));
    }

    #[test]
    fn selecting_a_theme_previews_and_saves_it_to_the_workspace() {
        let mut state = workspace_with_tree();
        let effects = dispatch(
            &mut state,
            command_with("theme.select", CommandArgs::Text("dracula".into())),
        );

        let preview = state.theme_preview.clone().expect("preview");
        assert_eq!(preview.colors.bg, "#282a36");
        assert_eq!(
            effects,
            vec![Effect::SaveWorkspaceTheme {
                slug: "notes".into(),
                theme: Box::new(preview)
            }]
        );
    }

    #[test]
    fn action_menu_accept_runs_the_item_in_the_editor() {
        let mut state = ApplicationState::empty();
        dispatch(
            &mut state,
            command_with("ui.open_action_menu", CommandArgs::Text("heading".into())),
        );
        assert_eq!(state.ui.action_menu, Some(ActionMenu::Heading));
        dispatch(
            &mut state,
            command_with(
                "ui.action_menu_move",
                CommandArgs::Direction(crate::command::Direction::Down),
            ),
        );

        let effects = dispatch(&mut state, command("ui.action_menu_accept"));
        assert_eq!(
            effects,
            vec![Effect::EditorAction("h2".into()), Effect::EditorFocus]
        );
        assert_eq!(state.ui.action_menu, None);
    }

    #[test]
    fn tree_cursor_moves_over_visible_rows_without_changing_the_open_note() {
        let mut state = workspace_with_tree();
        dispatch(&mut state, command("file_tree.move_up"));
        let cursor = |state: &ApplicationState| {
            state
                .workspace
                .surface(SurfaceId::FILE_TREE)
                .and_then(|surface| surface.selected_path())
                .map(str::to_string)
        };
        assert_eq!(cursor(&state).as_deref(), Some("work/a.md"));
        assert_eq!(state.domain.selected_note.as_deref(), Some("b.md"));

        dispatch(&mut state, command("file_tree.move_up"));
        assert_eq!(cursor(&state).as_deref(), Some("work"));
        assert!(dispatch(&mut state, command("file_tree.open_selected")).is_empty());
        assert!(state.ui.collapsed.contains("work"));

        dispatch(&mut state, command("file_tree.move_down"));
        assert_eq!(cursor(&state).as_deref(), Some("b.md"));
    }

    #[test]
    fn switching_to_touch_turns_vim_keys_off() {
        let mut state = ApplicationState::empty();
        let effects = dispatch(
            &mut state,
            command_with("ui.set_input_device", CommandArgs::Text("touch".into())),
        );
        assert!(state.ui.touch);
        assert_eq!(effects, vec![Effect::SetEditorVimMode(false)]);

        let effects = dispatch(
            &mut state,
            command_with("ui.set_input_device", CommandArgs::Text("keyboard".into())),
        );
        assert_eq!(effects, vec![Effect::SetEditorVimMode(true)]);
    }

    #[test]
    fn adding_a_workspace_opens_setup_and_cancel_returns_to_the_workbench() {
        let mut state = workspace_with_tree();
        state.auth.screen = crate::auth::Screen::Workbench;
        dispatch(&mut state, command("workspace.add"));
        assert_eq!(state.auth.screen, crate::auth::Screen::WorkspaceSetup);
        assert_eq!(
            state.auth.setup.step,
            crate::auth::SetupStep::ChooseWorkspace
        );

        dispatch(&mut state, command("workspace.cancel_setup"));
        assert_eq!(state.auth.screen, crate::auth::Screen::Workbench);
    }
}
