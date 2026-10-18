use liroxnotes_shared::{ThemeSource, WorkspaceTheme, WorkspaceView};

#[test]
fn catppuccin_mocha_has_expected_semantic_colors() {
    let theme = WorkspaceTheme::catppuccin_mocha();

    assert_eq!(theme.colors.bg, "#1e1e2e");
    assert_eq!(theme.colors.bg_alt, "#181825");
    assert_eq!(theme.colors.surface, "#313244");
    assert_eq!(theme.colors.surface_alt, "#45475a");
    assert_eq!(theme.colors.selection, "#45475a");
    assert_eq!(theme.colors.border, "#45475a");
    assert_eq!(theme.colors.fg, "#cdd6f4");
    assert_eq!(theme.colors.muted, "#a6adc8");
    assert_eq!(theme.colors.subtle, "#6c7086");
    assert_eq!(theme.colors.accent, "#89b4fa");
    assert_eq!(theme.colors.success, "#a6e3a1");
    assert_eq!(theme.colors.warning, "#f9e2af");
    assert_eq!(theme.colors.error, "#f38ba8");
    assert_eq!(theme.colors.info, "#89dceb");
    assert_eq!(theme.source, ThemeSource::Preset("catppuccin-mocha".into()));
}

#[test]
fn theme_serialization_round_trips() {
    let theme = WorkspaceTheme::catppuccin_mocha();
    let encoded = serde_json::to_string(&theme).unwrap();
    let decoded: WorkspaceTheme = serde_json::from_str(&encoded).unwrap();

    assert_eq!(decoded, theme);
}

#[test]
fn empty_workspace_defaults_to_catppuccin_mocha() {
    assert_eq!(WorkspaceView::empty().theme, WorkspaceTheme::catppuccin_mocha());
}
