use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ThemeColors {
    pub bg: String,
    pub bg_alt: String,
    pub surface: String,
    pub surface_alt: String,
    pub fg: String,
    pub muted: String,
    pub subtle: String,
    pub border: String,
    pub accent: String,
    pub selection: String,
    pub success: String,
    pub warning: String,
    pub error: String,
    pub info: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ThemeSource {
    Preset(String),
    Imported {
        scheme: Option<String>,
        author: Option<String>,
    },
    Custom,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceTheme {
    pub colors: ThemeColors,
    pub source: ThemeSource,
}

impl WorkspaceTheme {
    pub fn catppuccin_mocha() -> Self {
        Self {
            colors: ThemeColors {
                bg: "#1e1e2e".into(),
                bg_alt: "#181825".into(),
                surface: "#313244".into(),
                surface_alt: "#45475a".into(),
                fg: "#cdd6f4".into(),
                muted: "#a6adc8".into(),
                subtle: "#6c7086".into(),
                border: "#45475a".into(),
                accent: "#89b4fa".into(),
                selection: "#45475a".into(),
                success: "#a6e3a1".into(),
                warning: "#f9e2af".into(),
                error: "#f38ba8".into(),
                info: "#89dceb".into(),
            },
            source: ThemeSource::Preset("catppuccin-mocha".into()),
        }
    }
}

impl Default for WorkspaceTheme {
    fn default() -> Self {
        Self::catppuccin_mocha()
    }
}
