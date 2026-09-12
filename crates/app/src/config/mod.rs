mod app_config;
mod defaults;
mod keybindings;

pub use app_config::{AppConfig, EditorConfig, UiConfig};
pub use defaults::defaults;
pub(crate) use keybindings::binding;
pub use keybindings::KeymapConfig;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::input::{InputMode, InputScope, Key, SurfaceKind};

    #[test]
    fn defaults_use_space_leader_and_include_core_bindings() {
        let config = defaults();

        assert_eq!(config.keymaps.leader.key, Key::Space);
        assert!(config.keymaps.bindings.iter().any(|binding| {
            binding.command.as_str() == "workspace.toggle_file_tree"
                && binding.scope == InputScope::Global
                && binding.mode == Some(InputMode::Normal)
        }));
        assert!(config.keymaps.bindings.iter().any(|binding| {
            binding.command.as_str() == "file_tree.move_down"
                && binding.scope == InputScope::Surface(SurfaceKind::FileTree)
        }));
    }
}
