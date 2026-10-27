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
            InputScope::Workspace,
            normal,
            keys([Key::Tab]),
            "workspace.focus_next_surface",
            CommandArgs::None,
        ),
        binding(
            InputScope::Workspace,
            normal,
            KeySequence::from(vec![KeyStroke::new(
                Key::Tab,
                Modifiers::new(false, false, true, false),
            )]),
            "workspace.focus_previous_surface",
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
            file_tree.clone(),
            normal,
            keys([Key::ArrowUp]),
            "file_tree.move_up",
            CommandArgs::Direction(Direction::Up),
        ),
        binding(
            file_tree.clone(),
            normal,
            keys([Key::ArrowDown]),
            "file_tree.move_down",
            CommandArgs::Direction(Direction::Down),
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

    let mut bindings = bindings;
    // Shortcuts that work anywhere, also while typing: each is bound to both
    // ⌘ (macOS) and Ctrl.
    let anywhere = [
        ('k', "ui.open_palette", CommandArgs::None),
        ('/', "ui.toggle_cheat_sheet", CommandArgs::None),
        ('.', "ui.toggle_action_bar", CommandArgs::None),
        ('\\', "workspace.focus_file_tree", CommandArgs::None),
        (',', "ui.show_settings", CommandArgs::None),
        ('b', "editor.action", CommandArgs::Text("bold".into())),
        ('i', "editor.action", CommandArgs::Text("italic".into())),
        ('e', "editor.action", CommandArgs::Text("code".into())),
    ];
    for (key, command, args) in anywhere {
        for modifiers in [
            Modifiers::new(false, false, false, true),
            Modifiers::new(true, false, false, false),
        ] {
            bindings.push(binding(
                InputScope::Global,
                None,
                KeySequence::from(vec![KeyStroke::new(Key::Char(key), modifiers)]),
                command,
                args.clone(),
            ));
        }
    }
    bindings.push(binding(
        InputScope::Global,
        normal,
        KeySequence::from(vec![KeyStroke::new(
            Key::Char('?'),
            Modifiers::new(false, false, true, false),
        )]),
        "ui.toggle_cheat_sheet",
        CommandArgs::None,
    ));
    bindings.extend([
        binding(
            InputScope::Surface(SurfaceKind::FileTree),
            normal,
            keys([Key::Char('h')]),
            "file_tree.collapse",
            CommandArgs::None,
        ),
        binding(
            InputScope::Surface(SurfaceKind::FileTree),
            normal,
            keys([Key::Char('l')]),
            "file_tree.expand",
            CommandArgs::None,
        ),
        binding(
            InputScope::Surface(SurfaceKind::FileTree),
            normal,
            keys([Key::Char('q')]),
            "workspace.focus_next_surface",
            CommandArgs::None,
        ),
    ]);

    AppConfig {
        keymaps: KeymapConfig::new(leader, bindings),
        ui: UiConfig {
            show_top_bar: true,
            show_bottom_bar: true,
        },
        editor: EditorConfig {
            tab_width: 4,
            vim_mode_enabled: true,
        },
    }
}
