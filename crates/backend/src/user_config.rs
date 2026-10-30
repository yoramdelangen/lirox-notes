//! The user's `config.toml` (keymaps and editor options), as opposed to the
//! application's workspace registry in `runtime_paths().config_file`.

use std::{env, fs, io, path::PathBuf};

/// `$LIROX_APP_CONFIG`, else `$XDG_CONFIG_HOME/lirox-notes/config.toml`, else
/// `~/.config/lirox-notes/config.toml`.
pub fn user_config_path() -> Option<PathBuf> {
    env::var_os("LIROX_APP_CONFIG")
        .map(PathBuf::from)
        .or_else(|| {
            env::var_os("XDG_CONFIG_HOME")
                .map(|home| PathBuf::from(home).join("lirox-notes/config.toml"))
        })
        .or_else(|| {
            env::var_os("HOME")
                .map(|home| PathBuf::from(home).join(".config/lirox-notes/config.toml"))
        })
}

/// The file's contents, or an empty string when it does not exist.
pub fn read_user_config(path: &std::path::Path) -> io::Result<String> {
    match fs::read_to_string(path) {
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(String::new()),
        result => result,
    }
}

/// Settings the app writes back to the `[editor]` table.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct EditorOptions {
    pub vim: bool,
    pub action_bar: bool,
    pub key_hints: bool,
    pub font_size: u8,
}

/// Sets the `[editor]` keys in `source`, keeping every other line, comment
/// and table as written. Fails if `source` is not valid TOML.
pub fn update_editor_options(
    source: &str,
    options: EditorOptions,
) -> Result<String, toml_edit::TomlError> {
    let mut document = source.parse::<toml_edit::DocumentMut>()?;
    let editor = document
        .entry("editor")
        .or_insert_with(|| toml_edit::Item::Table(toml_edit::Table::new()));
    set_keeping_comment(editor, "vim", options.vim.into());
    set_keeping_comment(editor, "action_bar", options.action_bar.into());
    set_keeping_comment(editor, "key_hints", options.key_hints.into());
    set_keeping_comment(editor, "font_size", i64::from(options.font_size).into());
    Ok(document.to_string())
}

/// Replaces `table[key]`, keeping a trailing `# comment` on an existing value.
fn set_keeping_comment(table: &mut toml_edit::Item, key: &str, mut value: toml_edit::Value) {
    if let Some(existing) = table.get(key).and_then(toml_edit::Item::as_value) {
        *value.decor_mut() = existing.decor().clone();
    }
    table[key] = toml_edit::Item::Value(value);
}

/// Writes `options` into the config file at `path`, creating it if needed.
pub fn save_editor_options(path: &std::path::Path, options: EditorOptions) -> io::Result<()> {
    let source = read_user_config(path)?;
    let updated = update_editor_options(&source, options)
        .map_err(|error| io::Error::new(io::ErrorKind::InvalidData, error.to_string()))?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(path, updated)
}

#[cfg(test)]
mod tests {
    use super::*;

    const OPTIONS: EditorOptions = EditorOptions {
        vim: false,
        action_bar: true,
        key_hints: false,
        font_size: 17,
    };

    #[test]
    fn updates_editor_keys_and_keeps_comments_and_keymaps() {
        let source = "# my keys\n[keymap.global]\n\"<D-j>\" = \"ui.toggle_outline\" # outline\n\n[editor]\nvim = true # vim!\nfont_size = 15\n";
        let updated = update_editor_options(source, OPTIONS).unwrap();
        assert!(updated.contains("# my keys"));
        assert!(updated.contains("\"<D-j>\" = \"ui.toggle_outline\" # outline"));
        assert!(updated.contains("vim = false # vim!"));
        assert!(updated.contains("font_size = 17"));
        assert!(updated.contains("key_hints = false"));
    }

    #[test]
    fn creates_the_file_and_rejects_invalid_toml() {
        let dir = std::env::temp_dir().join(format!("lirox-user-config-{}", std::process::id()));
        let path = dir.join("nested/config.toml");
        save_editor_options(&path, OPTIONS).unwrap();
        assert!(fs::read_to_string(&path).unwrap().contains("[editor]"));
        fs::write(&path, "[editor\nbroken").unwrap();
        assert!(save_editor_options(&path, OPTIONS).is_err());
        assert_eq!(fs::read_to_string(&path).unwrap(), "[editor\nbroken");
        let _ = fs::remove_dir_all(dir);
    }
}
