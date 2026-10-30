//! Reads keymaps and editor options from TOML: the built-in
//! `default_keymap.toml`, then the user's `~/.config/lirox-notes/config.toml`
//! merged on top.

use crate::command::{CommandArgs, CommandId, Direction, SurfaceId};
use crate::input::{
    InputMode, InputScope, Key, KeyBinding, KeySequence, KeyStroke, Modifiers, SurfaceKind,
};

use super::{AppConfig, KeymapConfig};

pub const DEFAULT_CONFIG: &str = include_str!("default_keymap.toml");

/// A key mapping run inside Vim normal mode by the editor bundle.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct VimMapping {
    /// Vim notation, e.g. `<Space>h`.
    pub keys: String,
    pub command: String,
    pub arg: Option<String>,
}

/// Editor options from the `[editor]` table; `None` keeps the current value.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct EditorOptions {
    pub vim: Option<bool>,
    pub action_bar: Option<bool>,
    pub key_hints: Option<bool>,
    pub font_size: Option<u8>,
}

/// Where a `[keymap.<table>]` applies.
fn table_target(table: &str) -> Option<(InputScope, Option<InputMode>)> {
    let normal = Some(InputMode::Normal);
    Some(match table {
        "global" => (InputScope::Global, None),
        "normal" => (InputScope::Global, normal),
        "insert" => (InputScope::Global, Some(InputMode::Insert)),
        "visual" => (InputScope::Global, Some(InputMode::Visual)),
        "workspace" => (InputScope::Workspace, normal),
        "editor" => (InputScope::Surface(SurfaceKind::Editor), normal),
        "file_tree" => (InputScope::Surface(SurfaceKind::FileTree), normal),
        "menu" => (InputScope::SurfaceInstance(SurfaceId::new("menu")), None),
        "palette" => (InputScope::SurfaceInstance(SurfaceId::new("palette")), None),
        "cheat_sheet" => (
            InputScope::SurfaceInstance(SurfaceId::new("cheat-sheet")),
            None,
        ),
        _ => return None,
    })
}

fn mode_named(mode: &str) -> Option<InputMode> {
    Some(match mode {
        "normal" => InputMode::Normal,
        "insert" => InputMode::Insert,
        "visual" => InputMode::Visual,
        _ => return None,
    })
}

fn named_key(name: &str) -> Option<Key> {
    Some(match name.to_ascii_lowercase().as_str() {
        "esc" | "escape" => Key::Escape,
        "cr" | "enter" | "return" => Key::Enter,
        "tab" => Key::Tab,
        "bs" | "backspace" => Key::Backspace,
        "space" => Key::Space,
        "up" => Key::ArrowUp,
        "down" => Key::ArrowDown,
        "lt" => Key::Char('<'),
        _ => return None,
    })
}

/// One `<…>` token: a named key, or modifiers plus a key such as `C-k`.
fn parse_token(token: &str) -> Result<KeyStroke, String> {
    let mut modifiers = Modifiers::NONE;
    let mut rest = token;
    while rest.len() > 2 && rest.as_bytes()[1] == b'-' {
        match rest.as_bytes()[0].to_ascii_uppercase() {
            b'C' => modifiers.ctrl = true,
            b'D' => modifiers.meta = true,
            b'A' | b'M' => modifiers.alt = true,
            b'S' => modifiers.shift = true,
            _ => return Err(format!("unknown modifier in <{token}>")),
        }
        rest = &rest[2..];
    }
    let key = match named_key(rest) {
        Some(key) => key,
        None => {
            let mut chars = rest.chars();
            match (chars.next(), chars.next()) {
                (Some(ch), None) => Key::Char(ch),
                _ => return Err(format!("unknown key <{token}>")),
            }
        }
    };
    Ok(KeyStroke::new(key, modifiers))
}

/// Parses `"<leader>e"`, `"<C-w>h"` or `"gg"` into a key sequence.
pub fn parse_keys(keys: &str, leader: &KeyStroke) -> Result<KeySequence, String> {
    let mut strokes = Vec::new();
    let mut chars = keys.chars().peekable();
    while let Some(ch) = chars.next() {
        if ch == '<' {
            let token: String = chars.by_ref().take_while(|ch| *ch != '>').collect();
            if token.eq_ignore_ascii_case("leader") {
                strokes.push(leader.clone());
            } else {
                strokes.push(parse_token(&token)?);
            }
        } else if ch == ' ' {
            strokes.push(KeyStroke::new(Key::Space, Modifiers::NONE));
        } else {
            strokes.push(KeyStroke::new(Key::Char(ch), Modifiers::NONE));
        }
    }
    if strokes.is_empty() {
        return Err("empty key sequence".into());
    }
    Ok(KeySequence::from(strokes))
}

/// Short label for a sequence, as shown in the keys sheet.
pub fn format_keys(sequence: &KeySequence, leader: &KeyStroke) -> String {
    sequence
        .0
        .iter()
        .map(|stroke| {
            if stroke == leader {
                return "␣".to_string();
            }
            let mut label = String::new();
            let m = stroke.modifiers;
            if m.ctrl {
                label.push('^');
            }
            if m.alt {
                label.push('⌥');
            }
            if m.shift {
                label.push('⇧');
            }
            if m.meta {
                label.push('⌘');
            }
            label.push_str(&match &stroke.key {
                Key::Char(ch) if m.ctrl || m.meta => ch.to_uppercase().to_string(),
                Key::Char(ch) => ch.to_string(),
                Key::Enter => "↵".into(),
                Key::ArrowUp => "↑".into(),
                Key::ArrowDown => "↓".into(),
                Key::Escape => "esc".into(),
                Key::Space => "␣".into(),
                Key::Tab => "tab".into(),
                Key::Backspace => "⌫".into(),
            });
            label
        })
        .collect::<Vec<_>>()
        .join(" ")
}

/// Vim notation for the editor bundle: the leader becomes `<Space>` etc.
fn vim_keys(keys: &str, leader: &str) -> String {
    let leader = match leader {
        "space" | " " => "<Space>".to_string(),
        other if other.chars().count() == 1 => other.to_string(),
        other => format!("<{other}>"),
    };
    keys.replace("<leader>", &leader)
}

fn action(value: &toml::Value) -> Result<(String, Option<String>), String> {
    match value {
        toml::Value::String(command) => Ok((command.clone(), None)),
        toml::Value::Table(table) => {
            let command = table
                .get("command")
                .and_then(toml::Value::as_str)
                .ok_or("expected { command = \"...\" }")?;
            let arg = match table.get("arg") {
                None => None,
                Some(toml::Value::String(arg)) => Some(arg.clone()),
                Some(toml::Value::Integer(arg)) => Some(arg.to_string()),
                Some(_) => return Err("arg must be a string or number".into()),
            };
            Ok((command.to_string(), arg))
        }
        _ => Err("expected a command id or { command, arg }".into()),
    }
}

pub fn command_args(arg: Option<String>) -> CommandArgs {
    match arg.as_deref() {
        None => CommandArgs::None,
        Some("up") => CommandArgs::Direction(Direction::Up),
        Some("down") => CommandArgs::Direction(Direction::Down),
        Some("left") => CommandArgs::Direction(Direction::Left),
        Some("right") => CommandArgs::Direction(Direction::Right),
        Some(text) => CommandArgs::Text(text.to_string()),
    }
}

/// Merges `source` into `config`: bindings for the same keys are replaced,
/// `"<unbind>" = [...]` removes keys, and `[editor]` options are returned.
pub fn apply_config(config: &mut AppConfig, source: &str) -> Result<EditorOptions, String> {
    apply(config, source, true)
}

/// The built-in keymap merged with the user's `source`. The user's leader is
/// applied before the defaults, so `<leader>` bindings follow it.
pub fn config_with_user(source: &str) -> Result<(AppConfig, EditorOptions), String> {
    let root: toml::Table = source
        .parse()
        .map_err(|error: toml::de::Error| error.message().to_string())?;
    let mut config = default_config();
    if let Some(leader) = root.get("keymap").and_then(|keymap| keymap.get("leader")) {
        let mut base = empty_config();
        apply(&mut base, &format!("[keymap]\nleader = {leader}"), true)?;
        apply(&mut base, DEFAULT_CONFIG, false).expect("built-in keymap is valid");
        config = base;
    }
    let options = apply(&mut config, source, true)?;
    Ok((config, options))
}

fn apply(config: &mut AppConfig, source: &str, with_leader: bool) -> Result<EditorOptions, String> {
    let root: toml::Table = source
        .parse()
        .map_err(|error: toml::de::Error| error.message().to_string())?;
    let keymaps = &mut config.keymaps;

    let keymap = match root.get("keymap") {
        Some(toml::Value::Table(keymap)) => Some(keymap),
        Some(_) => return Err("[keymap] must be a table".into()),
        None => None,
    };
    if let Some(leader) = keymap
        .and_then(|keymap| keymap.get("leader"))
        .filter(|_| with_leader)
    {
        let leader = leader.as_str().ok_or("keymap.leader must be a string")?;
        keymaps.leader_name = leader.to_string();
        keymaps.leader = match leader {
            "space" | " " => KeyStroke::new(Key::Space, Modifiers::NONE),
            other => parse_keys(other, &keymaps.leader)?
                .0
                .first()
                .cloned()
                .ok_or("keymap.leader is empty")?,
        };
    }
    let leader = keymaps.leader.clone();

    for (table, value) in keymap.into_iter().flatten() {
        if table == "leader" {
            continue;
        }
        let entries = value
            .as_table()
            .ok_or_else(|| format!("[keymap.{table}] must be a table"))?;
        if table == "vim" {
            for (keys, value) in entries {
                if keys == "<unbind>" {
                    for keys in unbind_list(value, table)? {
                        let keys = vim_keys(&keys, &keymaps.leader_name);
                        keymaps.vim.retain(|mapping| mapping.keys != keys);
                    }
                    continue;
                }
                let (command, arg) =
                    action(value).map_err(|error| format!("keymap.vim.{keys}: {error}"))?;
                let keys = vim_keys(keys, &keymaps.leader_name);
                keymaps.vim.retain(|mapping| mapping.keys != keys);
                keymaps.vim.push(VimMapping { keys, command, arg });
            }
            continue;
        }
        let (scope, mode) =
            table_target(table).ok_or_else(|| format!("unknown keymap table [keymap.{table}]"))?;
        apply_table(&mut keymaps.bindings, entries, table, &scope, mode, &leader)?;
    }

    let mut options = EditorOptions::default();
    if let Some(editor) = root.get("editor").and_then(toml::Value::as_table) {
        let flag = |name: &str| editor.get(name).and_then(toml::Value::as_bool);
        options.vim = flag("vim");
        options.action_bar = flag("action_bar");
        options.key_hints = flag("key_hints");
        options.font_size = editor
            .get("font_size")
            .and_then(toml::Value::as_integer)
            .map(|size| size.clamp(10, 28) as u8);
        if let Some(vim) = options.vim {
            config.editor.vim_mode_enabled = vim;
        }
    }
    Ok(options)
}

fn unbind_list(value: &toml::Value, table: &str) -> Result<Vec<String>, String> {
    value
        .as_array()
        .ok_or_else(|| format!("keymap.{table}.<unbind> must be a list of keys"))?
        .iter()
        .map(|keys| {
            keys.as_str()
                .map(str::to_string)
                .ok_or_else(|| format!("keymap.{table}.<unbind> must contain strings"))
        })
        .collect()
}

fn apply_table(
    bindings: &mut Vec<KeyBinding>,
    entries: &toml::Table,
    table: &str,
    scope: &InputScope,
    mode: Option<InputMode>,
    leader: &KeyStroke,
) -> Result<(), String> {
    for (keys, value) in entries {
        // `[keymap.editor.insert]` binds the same scope in another mode.
        if let Some(sub_mode) =
            mode_named(keys).filter(|_| value.get("command").is_none() && value.is_table())
        {
            let entries = value.as_table().expect("checked above");
            apply_table(
                bindings,
                entries,
                &format!("{table}.{keys}"),
                scope,
                Some(sub_mode),
                leader,
            )?;
            continue;
        }
        if keys == "<unbind>" {
            for keys in unbind_list(value, table)? {
                let sequence = parse_keys(&keys, leader)
                    .map_err(|error| format!("keymap.{table}: {error}"))?;
                bindings.retain(|binding| {
                    !(binding.scope == *scope
                        && binding.mode == mode
                        && binding.sequence == sequence)
                });
            }
            continue;
        }
        let sequence =
            parse_keys(keys, leader).map_err(|error| format!("keymap.{table}: {error}"))?;
        let (command, arg) =
            action(value).map_err(|error| format!("keymap.{table}.{keys}: {error}"))?;
        bindings.retain(|binding| {
            !(binding.scope == *scope && binding.mode == mode && binding.sequence == sequence)
        });
        bindings.push(KeyBinding::new(
            scope.clone(),
            mode,
            sequence,
            CommandId::new(command),
            command_args(arg),
        ));
    }
    Ok(())
}

fn empty_config() -> AppConfig {
    AppConfig {
        keymaps: KeymapConfig::new(KeyStroke::new(Key::Space, Modifiers::NONE), Vec::new()),
        ui: super::UiConfig {
            show_top_bar: true,
            show_bottom_bar: true,
        },
        editor: super::EditorConfig {
            tab_width: 4,
            vim_mode_enabled: true,
        },
    }
}

/// The built-in keymap and editor options.
pub fn default_config() -> AppConfig {
    let mut config = empty_config();
    apply_config(&mut config, DEFAULT_CONFIG).expect("built-in keymap is valid");
    config
}

#[cfg(test)]
mod tests {
    use super::*;

    fn space() -> KeyStroke {
        KeyStroke::new(Key::Space, Modifiers::NONE)
    }

    fn find<'a>(config: &'a AppConfig, keys: &str, scope: &InputScope) -> Option<&'a KeyBinding> {
        let sequence = parse_keys(keys, &config.keymaps.leader).unwrap();
        config
            .keymaps
            .bindings
            .iter()
            .find(|binding| binding.sequence == sequence && binding.scope == *scope)
    }

    #[test]
    fn parses_leader_named_keys_and_modifiers() {
        let sequence = parse_keys("<leader>e", &space()).unwrap();
        assert_eq!(
            sequence.0,
            vec![space(), KeyStroke::new(Key::Char('e'), Modifiers::NONE)]
        );
        let chord = parse_keys("<C-w>h", &space()).unwrap();
        assert_eq!(
            chord.0[0],
            KeyStroke::new(Key::Char('w'), Modifiers::new(true, false, false, false))
        );
        assert_eq!(
            parse_keys("<S-tab>", &space()).unwrap().0[0]
                .modifiers
                .shift,
            true
        );
        assert_eq!(
            parse_keys("<D-\\>", &space()).unwrap().0[0].key,
            Key::Char('\\')
        );
        assert!(parse_keys("<nope>", &space()).is_err());
        assert_eq!(
            format_keys(&parse_keys("<leader>h", &space()).unwrap(), &space()),
            "␣ h"
        );
        assert_eq!(
            format_keys(&parse_keys("<D-k>", &space()).unwrap(), &space()),
            "⌘K"
        );
    }

    #[test]
    fn default_keymap_loads_every_table() {
        let config = default_config();
        assert!(find(&config, "<D-k>", &InputScope::Global).is_some());
        assert!(find(&config, "j", &InputScope::Surface(SurfaceKind::FileTree)).is_some());
        assert!(find(
            &config,
            "<esc>",
            &InputScope::SurfaceInstance(SurfaceId::new("menu"))
        )
        .is_some());
        let insert_escape =
            find(&config, "<esc>", &InputScope::Surface(SurfaceKind::Editor)).unwrap();
        assert_eq!(insert_escape.mode, Some(InputMode::Insert));
        assert!(config
            .keymaps
            .vim
            .iter()
            .any(|mapping| mapping.keys == "<Space>h"));
    }

    #[test]
    fn user_config_overrides_unbinds_and_sets_editor_options() {
        let mut config = default_config();
        let options = apply_config(
            &mut config,
            r#"
            [keymap.file_tree]
            j = "file_tree.move_up"
            "<unbind>" = ["q"]

            [keymap.normal]
            "<leader>p" = { command = "ui.open_palette", arg = "> theme" }

            [keymap.vim]
            "<leader>h" = "ui.open_palette"

            [editor]
            vim = false
            font_size = 17
            "#,
        )
        .unwrap();
        let tree = InputScope::Surface(SurfaceKind::FileTree);
        assert_eq!(
            find(&config, "j", &tree).unwrap().command.as_str(),
            "file_tree.move_up"
        );
        assert_eq!(
            config
                .keymaps
                .bindings
                .iter()
                .filter(|b| b.scope == tree && b.sequence == parse_keys("j", &space()).unwrap())
                .count(),
            1
        );
        assert!(find(&config, "q", &tree).is_none());
        assert_eq!(
            find(&config, "<leader>p", &InputScope::Global)
                .unwrap()
                .args,
            CommandArgs::Text("> theme".into())
        );
        assert_eq!(
            config
                .keymaps
                .vim
                .iter()
                .find(|m| m.keys == "<Space>h")
                .unwrap()
                .command,
            "ui.open_palette"
        );
        assert!(!config.editor.vim_mode_enabled);
        assert_eq!(options.font_size, Some(17));
    }

    #[test]
    fn a_new_leader_moves_the_default_leader_bindings() {
        let (config, _) = config_with_user("[keymap]\nleader = \",\"").unwrap();
        let comma = KeyStroke::new(Key::Char(','), Modifiers::NONE);
        let toggle = parse_keys("<leader>e", &comma).unwrap();
        assert!(config.keymaps.bindings.iter().any(|b| b.sequence == toggle));
        assert!(config.keymaps.vim.iter().any(|m| m.keys == ",h"));
    }

    #[test]
    fn invalid_config_reports_the_location() {
        let mut config = default_config();
        let error = apply_config(&mut config, "[keymap.nowhere]\nj = \"x\"").unwrap_err();
        assert!(error.contains("keymap.nowhere"));
        let error = apply_config(&mut config, "[keymap.normal]\n\"<bogus>\" = \"x\"").unwrap_err();
        assert!(error.contains("<bogus>"));
    }
}
