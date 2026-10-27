use liroxnotes_shared::{ThemeColors, ThemeSource, WorkspaceTheme};
use serde::Deserialize;
use std::collections::BTreeMap;
use std::fmt;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ImportedTheme {
    pub theme: WorkspaceTheme,
    pub scheme: Option<String>,
    pub author: Option<String>,
    pub base24_swatches: BTreeMap<String, String>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ThemeImportError(pub String);

impl fmt::Display for ThemeImportError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl std::error::Error for ThemeImportError {}

#[derive(Clone, Debug, PartialEq)]
pub struct ContrastIssue {
    pub role: &'static str,
    pub required_ratio: f64,
    pub actual_ratio: f64,
}

#[derive(Deserialize)]
struct RawScheme {
    scheme: Option<String>,
    author: Option<String>,
    base00: Option<String>,
    base01: Option<String>,
    base02: Option<String>,
    base03: Option<String>,
    base04: Option<String>,
    base05: Option<String>,
    base06: Option<String>,
    base07: Option<String>,
    base08: Option<String>,
    base09: Option<String>,
    #[serde(rename = "base0A")]
    base0_a: Option<String>,
    #[serde(rename = "base0B")]
    base0_b: Option<String>,
    #[serde(rename = "base0C")]
    base0_c: Option<String>,
    #[serde(rename = "base0D")]
    base0_d: Option<String>,
    #[serde(rename = "base0E")]
    base0_e: Option<String>,
    #[serde(rename = "base0F")]
    base0_f: Option<String>,
    base10: Option<String>,
    base11: Option<String>,
    base12: Option<String>,
    base13: Option<String>,
    base14: Option<String>,
    base15: Option<String>,
    base16: Option<String>,
    base17: Option<String>,
}

impl RawScheme {
    fn color(&self, slot: &str) -> Option<&str> {
        match slot {
            "base00" => self.base00.as_deref(),
            "base01" => self.base01.as_deref(),
            "base02" => self.base02.as_deref(),
            "base03" => self.base03.as_deref(),
            "base04" => self.base04.as_deref(),
            "base05" => self.base05.as_deref(),
            "base06" => self.base06.as_deref(),
            "base07" => self.base07.as_deref(),
            "base08" => self.base08.as_deref(),
            "base09" => self.base09.as_deref(),
            "base0A" => self.base0_a.as_deref(),
            "base0B" => self.base0_b.as_deref(),
            "base0C" => self.base0_c.as_deref(),
            "base0D" => self.base0_d.as_deref(),
            "base0E" => self.base0_e.as_deref(),
            "base0F" => self.base0_f.as_deref(),
            "base10" => self.base10.as_deref(),
            "base11" => self.base11.as_deref(),
            "base12" => self.base12.as_deref(),
            "base13" => self.base13.as_deref(),
            "base14" => self.base14.as_deref(),
            "base15" => self.base15.as_deref(),
            "base16" => self.base16.as_deref(),
            "base17" => self.base17.as_deref(),
            _ => None,
        }
    }
}

pub fn parse_scheme(input: &str) -> Result<ImportedTheme, ThemeImportError> {
    let value: serde_yaml_ng::Value = serde_yaml_ng::from_str(input)
        .map_err(|error| ThemeImportError(format!("Invalid YAML: {error}")))?;
    if contains_yaml_tag(&value) {
        return Err(ThemeImportError("YAML tags are not supported".into()));
    }
    if !matches!(value, serde_yaml_ng::Value::Mapping(_)) {
        return Err(ThemeImportError(
            "Scheme must be a flat YAML mapping".into(),
        ));
    }

    let raw: RawScheme = serde_yaml_ng::from_str(input)
        .map_err(|error| ThemeImportError(format!("Invalid scheme: {error}")))?;
    let mut palette = BTreeMap::new();
    for index in 0..=0x0f {
        let slot = format!("base{index:02X}");
        let value = raw
            .color(&slot)
            .ok_or_else(|| ThemeImportError(format!("Missing required field {slot}")))?;
        palette.insert(slot, parse_hex(value)?);
    }

    let has_base24 = (0x10..=0x17).any(|index| raw.color(&format!("base{index:02X}")).is_some());
    if has_base24 {
        for index in 0x10..=0x17 {
            let slot = format!("base{index:02X}");
            let value = raw
                .color(&slot)
                .ok_or_else(|| ThemeImportError(format!("Missing required field {slot}")))?;
            palette.insert(slot, parse_hex(value)?);
        }
    }

    let color = |slot: &str| palette[slot].clone();
    let bg_alt = if has_base24 {
        color("base10")
    } else {
        color("base01")
    };
    let colors = ThemeColors {
        bg: color("base00"),
        bg_alt,
        surface: color("base01"),
        surface_alt: color("base02"),
        fg: color("base05"),
        muted: color("base04"),
        subtle: color("base03"),
        border: color("base03"),
        accent: color("base0D"),
        selection: color("base02"),
        success: color("base0B"),
        warning: color("base0A"),
        error: color("base08"),
        info: color("base0C"),
    };
    let theme = WorkspaceTheme {
        colors,
        source: ThemeSource::Imported {
            scheme: raw.scheme.clone(),
            author: raw.author.clone(),
        },
    };
    let base24_swatches = palette
        .into_iter()
        .filter(|(slot, _)| has_base24 && slot.as_str() >= "base10")
        .collect();

    Ok(ImportedTheme {
        theme,
        scheme: raw.scheme,
        author: raw.author,
        base24_swatches,
    })
}

fn parse_hex(value: &str) -> Result<String, ThemeImportError> {
    let color = value.strip_prefix('#').unwrap_or(value);
    if color.len() != 6 || !color.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        return Err(ThemeImportError(format!(
            "Invalid color '{value}': expected six hex digits"
        )));
    }
    Ok(format!("#{color}"))
}

fn contains_yaml_tag(value: &serde_yaml_ng::Value) -> bool {
    match value {
        serde_yaml_ng::Value::Tagged(_) => true,
        serde_yaml_ng::Value::Sequence(values) => values.iter().any(contains_yaml_tag),
        serde_yaml_ng::Value::Mapping(values) => values
            .iter()
            .any(|(key, value)| contains_yaml_tag(key) || contains_yaml_tag(value)),
        _ => false,
    }
}

/// Checks the roles people read: text and status colors need 4.5:1, the
/// accent 3:1. `subtle` and `border` are decorative (hints, 1px lines) and
/// may be quieter, which the TUI look depends on.
pub fn validate_contrast(colors: &ThemeColors) -> Vec<ContrastIssue> {
    let mut issues = Vec::new();
    for (role, foreground, background, required_ratio) in [
        ("fg", colors.fg.as_str(), colors.bg.as_str(), 4.5),
        ("fg", colors.fg.as_str(), colors.surface.as_str(), 4.5),
        ("fg", colors.fg.as_str(), colors.surface_alt.as_str(), 4.5),
        ("muted", colors.muted.as_str(), colors.bg.as_str(), 4.5),
        ("success", colors.success.as_str(), colors.bg.as_str(), 4.5),
        ("warning", colors.warning.as_str(), colors.bg.as_str(), 4.5),
        ("error", colors.error.as_str(), colors.bg.as_str(), 4.5),
        ("info", colors.info.as_str(), colors.bg.as_str(), 4.5),
        ("accent", colors.accent.as_str(), colors.bg.as_str(), 3.0),
    ] {
        let actual_ratio = contrast_ratio(foreground, background);
        if actual_ratio < required_ratio {
            issues.push(ContrastIssue {
                role,
                required_ratio,
                actual_ratio,
            });
        }
    }
    issues
}

pub fn theme_css_vars(theme: &WorkspaceTheme) -> String {
    let colors = &theme.colors;
    let roles = [
        &colors.bg,
        &colors.bg_alt,
        &colors.surface,
        &colors.surface_alt,
        &colors.fg,
        &colors.muted,
        &colors.subtle,
        &colors.border,
        &colors.accent,
        &colors.selection,
        &colors.success,
        &colors.warning,
        &colors.error,
        &colors.info,
    ];
    if roles.iter().any(|color| !valid_hex_color(color)) {
        return theme_css_vars(&WorkspaceTheme::default());
    }
    // The `--lirox-*` roles feed the editor bundle; the short TUI names
    // (`--bg`, `--line2`, `--coral`, ...) are what the interface is drawn with.
    format!(
        "--lirox-bg: {bg}; --lirox-bg-alt: {bg_alt}; --lirox-surface: {surface}; --lirox-surface-alt: {surface_alt}; --lirox-fg: {fg}; --lirox-muted: {muted}; --lirox-subtle: {subtle}; --lirox-border: {border}; --lirox-accent: {accent}; --lirox-accent-soft: color-mix(in srgb, {accent} 22%, {bg}); --lirox-selection: {selection}; --lirox-success: {success}; --lirox-warning: {warning}; --lirox-error: {error}; --lirox-info: {info}; --lirox-overlay: color-mix(in srgb, {bg} 72%, transparent); \
         --bg: {bg}; --bg2: {bg_alt}; --top: {bg}; --surface: {surface}; --line: color-mix(in srgb, {border} 50%, {bg}); --line2: {border}; --fg: {fg}; --dim: {muted}; --faint: {subtle}; --blue: {accent}; --coral: {error}; --kw: {info}; --str: {success}; --num: {warning}; --sel: color-mix(in srgb, {accent} 22%, transparent)",
        bg = colors.bg,
        bg_alt = colors.bg_alt,
        surface = colors.surface,
        surface_alt = colors.surface_alt,
        fg = colors.fg,
        muted = colors.muted,
        subtle = colors.subtle,
        border = colors.border,
        accent = colors.accent,
        selection = colors.selection,
        success = colors.success,
        warning = colors.warning,
        error = colors.error,
        info = colors.info,
    )
}

/// A built-in theme offered in Settings and the command palette.
#[derive(Clone, Debug, PartialEq)]
pub struct ThemePreset {
    pub id: &'static str,
    pub name: &'static str,
    /// The format the palette was taken from: built-in, base16, base24, neovim or zed.
    pub format: &'static str,
    pub theme: WorkspaceTheme,
}

impl ThemePreset {
    /// Swatches shown next to the theme in Settings.
    pub fn swatches(&self) -> [&str; 6] {
        let c = &self.theme.colors;
        [&c.bg, &c.fg, &c.accent, &c.error, &c.info, &c.success]
    }
}

/// Every format maps onto the same small set of roles, so only colors change
/// between themes: `[bg, bg2, surface, line2, fg, dim, faint, blue, coral, kw, str, num]`.
fn preset(
    id: &'static str,
    name: &'static str,
    format: &'static str,
    c: [&str; 12],
) -> ThemePreset {
    let [bg, bg2, surface, line2, fg, dim, faint, blue, coral, kw, str_, num] = c;
    ThemePreset {
        id,
        name,
        format,
        theme: WorkspaceTheme {
            colors: ThemeColors {
                bg: bg.into(),
                bg_alt: bg2.into(),
                surface: surface.into(),
                surface_alt: line2.into(),
                fg: fg.into(),
                muted: dim.into(),
                subtle: faint.into(),
                border: line2.into(),
                accent: blue.into(),
                selection: surface.into(),
                success: str_.into(),
                warning: num.into(),
                error: coral.into(),
                info: kw.into(),
            },
            source: ThemeSource::Preset(id.into()),
        },
    }
}

pub fn theme_presets() -> Vec<ThemePreset> {
    vec![
        preset(
            "lirox-dark",
            "Lirox Dark",
            "built-in",
            [
                "#1c1d26", "#16171f", "#262734", "#41445a", "#d4d6e1", "#8a8ea4", "#5a5e76",
                "#82b1ed", "#f17871", "#c39dee", "#7ccd8e", "#ebb25f",
            ],
        ),
        preset(
            "lirox-light",
            "Lirox Light",
            "built-in",
            [
                "#f8f8f9", "#efeff2", "#e7e7ec", "#c2c4cf", "#1c1d26", "#62667a", "#a2a5b4",
                "#2863ab", "#cb3f3f", "#7945ab", "#137738", "#a45e00",
            ],
        ),
        preset(
            "tomorrow-night",
            "Tomorrow Night",
            "base16",
            [
                "#1d1f21", "#18191b", "#282a2e", "#373b41", "#c5c8c6", "#969896", "#5f6264",
                "#81a2be", "#cc6868", "#b294bb", "#b5bd68", "#de935f",
            ],
        ),
        preset(
            "gruvbox-dark",
            "Gruvbox Dark",
            "base16",
            [
                "#282828", "#1d2021", "#3c3836", "#504945", "#d5c4a1", "#a89984", "#665c54",
                "#83a598", "#fe8019", "#f65942", "#b8bb26", "#d3869b",
            ],
        ),
        preset(
            "dracula",
            "Dracula",
            "base24",
            [
                "#282a36", "#21222c", "#363447", "#44475a", "#f8f8f2", "#9ea8c7", "#6272a4",
                "#bd93f9", "#ff5555", "#ff79c6", "#f1fa8c", "#ffb86c",
            ],
        ),
        preset(
            "tokyonight",
            "Tokyo Night",
            "neovim",
            [
                "#1a1b26", "#16161e", "#292e42", "#3b4261", "#c0caf5", "#7a81a9", "#565f89",
                "#7aa2f7", "#ff9e64", "#bb9af7", "#9ece6a", "#e0af68",
            ],
        ),
        preset(
            "catppuccin-mocha",
            "Catppuccin Mocha",
            "neovim",
            [
                "#1e1e2e", "#181825", "#313244", "#45475a", "#cdd6f4", "#a6adc8", "#6c7086",
                "#89b4fa", "#f38ba8", "#cba6f7", "#a6e3a1", "#fab387",
            ],
        ),
        preset(
            "rose-pine-dawn",
            "Rosé Pine Dawn",
            "neovim",
            [
                "#faf4ed", "#f2e9e1", "#f4ede8", "#dfdad9", "#575279", "#716d89", "#9893a5",
                "#286983", "#a45a6f", "#7a6890", "#467881", "#986622",
            ],
        ),
        preset(
            "one-dark",
            "One Dark",
            "zed",
            [
                "#282c34", "#21252b", "#2c313a", "#3e4451", "#abb2bf", "#8d939e", "#5c6370",
                "#61afef", "#db737c", "#c678dd", "#98c379", "#d19a66",
            ],
        ),
        preset(
            "ayu-light",
            "Ayu Light",
            "zed",
            [
                "#fcfcfc", "#f3f4f5", "#eef0f2", "#d8d9db", "#5a5f64", "#70757c", "#adaeb1",
                "#3799df", "#b65656", "#ac612b", "#5f7f00", "#8765a9",
            ],
        ),
    ]
}

/// The preset id `theme` was chosen from, if it is a built-in preset.
pub fn active_preset_id(theme: &WorkspaceTheme) -> Option<&str> {
    match &theme.source {
        ThemeSource::Preset(id) => Some(id.as_str()),
        _ => None,
    }
}

fn valid_hex_color(color: &str) -> bool {
    color.len() == 7
        && color.starts_with('#')
        && color[1..].bytes().all(|byte| byte.is_ascii_hexdigit())
}

fn contrast_ratio(foreground: &str, background: &str) -> f64 {
    let luminance = |color: &str| {
        let channel = |start: usize| {
            let value =
                u8::from_str_radix(&color[start..start + 2], 16).unwrap_or(0) as f64 / 255.0;
            if value <= 0.04045 {
                value / 12.92
            } else {
                ((value + 0.055) / 1.055).powf(2.4)
            }
        };
        0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
    };
    let (lighter, darker) = {
        let first = luminance(foreground);
        let second = luminance(background);
        (first.max(second), first.min(second))
    };
    (lighter + 0.05) / (darker + 0.05)
}

#[cfg(test)]
mod tests {
    use super::*;
    use liroxnotes_shared::{ThemeColors, ThemeSource};

    fn scheme(base24: bool) -> String {
        let mut yaml = String::from("scheme: Test Scheme\nauthor: Test Author\n");
        for slot in 0..=if base24 { 0x17 } else { 0x0f } {
            yaml.push_str(&format!("base{slot:02X}: '{:06X}'\n", slot * 0x10101));
        }
        yaml
    }

    #[test]
    fn maps_base16_palette_to_semantic_roles() {
        let imported = parse_scheme(&scheme(false)).unwrap();
        assert_eq!(imported.theme.colors.bg, "#000000");
        assert_eq!(imported.theme.colors.bg_alt, "#010101");
        assert_eq!(imported.theme.colors.surface, "#010101");
        assert_eq!(imported.theme.colors.surface_alt, "#020202");
        assert_eq!(imported.theme.colors.selection, "#020202");
        assert_eq!(imported.theme.colors.fg, "#050505");
        assert_eq!(imported.theme.colors.muted, "#040404");
        assert_eq!(imported.theme.colors.subtle, "#030303");
        assert_eq!(imported.theme.colors.border, "#030303");
        assert_eq!(imported.theme.colors.accent, "#0D0D0D");
        assert_eq!(imported.theme.colors.success, "#0B0B0B");
        assert_eq!(imported.theme.colors.warning, "#0A0A0A");
        assert_eq!(imported.theme.colors.error, "#080808");
        assert_eq!(imported.theme.colors.info, "#0C0C0C");
        assert_eq!(imported.scheme.as_deref(), Some("Test Scheme"));
        assert_eq!(imported.author.as_deref(), Some("Test Author"));
        assert!(imported.base24_swatches.is_empty());
    }

    #[test]
    fn maps_base24_background_and_retains_extended_swatches() {
        let imported = parse_scheme(&scheme(true)).unwrap();
        assert_eq!(imported.theme.colors.bg_alt, "#101010");
        assert_eq!(imported.theme.colors.surface, "#010101");
        assert_eq!(imported.base24_swatches.len(), 8);
        assert_eq!(imported.base24_swatches["base17"], "#171717");
    }

    #[test]
    fn rejects_missing_duplicate_tagged_and_invalid_colors() {
        let missing = scheme(false).replace("base0F: '0F0F0F'\n", "");
        assert!(parse_scheme(&missing).is_err());
        let duplicate = format!("{}base00: 'FFFFFF'\n", scheme(false));
        assert!(parse_scheme(&duplicate).is_err());
        assert!(parse_scheme(&scheme(false).replace("'000000'", "!ruby/object:foo {}")).is_err());
        assert!(parse_scheme(&scheme(false).replace("'000000'", "'#12345G'")).is_err());
    }

    #[test]
    fn rejects_partial_base24_palette() {
        let partial = scheme(true).replace("base17: '171717'\n", "");
        assert!(parse_scheme(&partial).is_err());
    }

    #[test]
    fn contrast_validation_reports_low_contrast_text_and_controls() {
        let mut colors = liroxnotes_shared::WorkspaceTheme::catppuccin_mocha().colors;
        colors.bg = "#ffffff".into();
        colors.fg = "#eeeeee".into();
        colors.accent = "#eeeeee".into();

        let issues = validate_contrast(&colors);

        assert!(issues
            .iter()
            .any(|issue| issue.role == "fg" && issue.required_ratio == 4.5));
        assert!(issues
            .iter()
            .any(|issue| issue.role == "accent" && issue.required_ratio == 3.0));
    }

    #[test]
    fn imported_theme_records_source_metadata() {
        let imported = parse_scheme(&scheme(false)).unwrap();
        assert_eq!(
            imported.theme.source,
            ThemeSource::Imported {
                scheme: Some("Test Scheme".into()),
                author: Some("Test Author".into()),
            }
        );
        let _: ThemeColors = imported.theme.colors;
    }

    #[test]
    fn presets_have_unique_ids_and_valid_palettes() {
        let presets = theme_presets();
        let mut ids: Vec<_> = presets.iter().map(|preset| preset.id).collect();
        ids.sort_unstable();
        ids.dedup();
        assert_eq!(ids.len(), presets.len());
        for preset in &presets {
            let css = theme_css_vars(&preset.theme);
            assert!(css.contains(&format!("--bg: {};", preset.theme.colors.bg)));
            assert_eq!(active_preset_id(&preset.theme), Some(preset.id));
        }
    }

    #[test]
    fn presets_pass_the_save_contrast_check() {
        for preset in theme_presets() {
            assert!(
                validate_contrast(&preset.theme.colors).is_empty(),
                "{} fails contrast",
                preset.id
            );
        }
        assert!(validate_contrast(&WorkspaceTheme::default().colors).is_empty());
    }

    #[test]
    fn css_variables_expose_tui_token_names() {
        let css = theme_css_vars(&liroxnotes_shared::WorkspaceTheme::default());
        for token in [
            "--bg:", "--bg2:", "--line:", "--line2:", "--dim:", "--faint:", "--blue:", "--coral:",
            "--kw:", "--str:", "--num:", "--sel:",
        ] {
            assert!(css.contains(token), "missing {token}");
        }
    }

    #[test]
    fn css_variables_map_semantic_colors_and_reject_invalid_css_values() {
        let mut theme = liroxnotes_shared::WorkspaceTheme::default();
        theme.colors.accent = "#123456".into();
        let css = theme_css_vars(&theme);
        assert!(css.contains("--lirox-accent: #123456;"));
        assert!(css.contains("--lirox-accent-soft:"));
        assert!(css.contains("--lirox-overlay:"));

        theme.colors.bg = "#000000; background-image: url(https://invalid)".into();
        let safe_css = theme_css_vars(&theme);
        assert!(!safe_css.contains("url("));
        assert_eq!(
            safe_css,
            theme_css_vars(&liroxnotes_shared::WorkspaceTheme::default())
        );
    }
}
