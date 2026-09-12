use super::KeymapConfig;

#[derive(Clone, Debug, PartialEq)]
pub struct AppConfig {
    pub keymaps: KeymapConfig,
    pub ui: UiConfig,
    pub editor: EditorConfig,
}

#[derive(Clone, Debug, PartialEq)]
pub struct UiConfig {
    pub show_top_bar: bool,
    pub show_bottom_bar: bool,
}

#[derive(Clone, Debug, PartialEq)]
pub struct EditorConfig {
    pub tab_width: u8,
}

impl AppConfig {
    pub fn defaults() -> Self {
        super::defaults()
    }
}
