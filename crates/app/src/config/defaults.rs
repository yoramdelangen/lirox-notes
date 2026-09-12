use super::{binding, AppConfig, EditorConfig, KeymapConfig, UiConfig};
use crate::command::{CommandArgs, Direction};
use crate::input::{InputMode, InputScope, Key, KeySequence, KeyStroke, Modifiers, SurfaceKind};

fn keys(keys: impl IntoIterator<Item = Key>) -> KeySequence {
    KeySequence::from(
        keys.into_iter()
            .map(|key| KeyStroke::new(key, Modifiers::NONE))
            .collect::<Vec<_>>(),
    )
}

pub fn defaults() -> AppConfig {
    let leader = KeyStroke::new(Key::Space, Modifiers::NONE);
    let normal = Some(InputMode::Normal);
    let insert = Some(InputMode::Insert);
    let global = InputScope::Global;
    let workspace = InputScope::Workspace;
    let file_tree = InputScope::Surface(SurfaceKind::FileTree);
    let editor = InputScope::Surface(SurfaceKind::Editor);

    let bindings = vec![
        binding(
            global.clone(),
            normal,
            keys([Key::Space, Key::Char('e')]),
            "workspace.toggle_file_tree",
            CommandArgs::None,
        ),
        binding(
            global.clone(),
            normal,
            keys([Key::Space, Key::Char('z')]),
            "workspace.toggle_focus_mode",
            CommandArgs::None,
        ),
        binding(
            workspace.clone(),
            normal,
            KeySequence::from(vec![
                KeyStroke::new(Key::Char('w'), Modifiers::new(true, false, false, false)),
                KeyStroke::new(Key::Char('h'), Modifiers::NONE),
            ]),
            "workspace.focus_previous_surface",
            CommandArgs::None,
        ),
        binding(
            workspace,
            normal,
            KeySequence::from(vec![
                KeyStroke::new(Key::Char('w'), Modifiers::new(true, false, false, false)),
                KeyStroke::new(Key::Char('l'), Modifiers::NONE),
            ]),
            "workspace.focus_next_surface",
            CommandArgs::None,
        ),
        binding(
            global.clone(),
            None,
            keys([Key::Escape]),
            "overlay.close_top",
            CommandArgs::None,
        ),
        binding(
            file_tree.clone(),
            normal,
            keys([Key::Char('j')]),
            "file_tree.move_down",
            CommandArgs::Direction(Direction::Down),
        ),
        binding(
            file_tree.clone(),
            normal,
            keys([Key::Char('k')]),
            "file_tree.move_up",
            CommandArgs::Direction(Direction::Up),
        ),
        binding(
            file_tree,
            normal,
            keys([Key::Enter]),
            "file_tree.open_selected",
            CommandArgs::None,
        ),
        binding(
            editor.clone(),
            normal,
            keys([Key::Char('i')]),
            "editor.enter_insert_mode",
            CommandArgs::None,
        ),
        binding(
            editor,
            insert,
            keys([Key::Escape]),
            "editor.enter_normal_mode",
            CommandArgs::None,
        ),
        binding(
            global,
            normal,
            keys([Key::Space, Key::Char('s')]),
            "editor.save",
            CommandArgs::None,
        ),
    ];

    AppConfig {
        keymaps: KeymapConfig::new(leader, bindings),
        ui: UiConfig {
            show_top_bar: true,
            show_bottom_bar: true,
        },
        editor: EditorConfig { tab_width: 4 },
    }
}
