use super::AppConfig;

/// The built-in configuration, read from `default_keymap.toml`.
pub fn defaults() -> AppConfig {
    super::toml_config::default_config()
}
