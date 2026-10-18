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

pub fn validate_contrast(colors: &ThemeColors) -> Vec<ContrastIssue> {
    let mut issues = Vec::new();
    for (role, foreground, background, required_ratio) in [
        ("fg", colors.fg.as_str(), colors.bg.as_str(), 4.5),
        ("fg", colors.fg.as_str(), colors.surface.as_str(), 4.5),
        ("fg", colors.fg.as_str(), colors.surface_alt.as_str(), 4.5),
        ("muted", colors.muted.as_str(), colors.bg.as_str(), 4.5),
        ("subtle", colors.subtle.as_str(), colors.bg.as_str(), 4.5),
        ("success", colors.success.as_str(), colors.bg.as_str(), 4.5),
        ("warning", colors.warning.as_str(), colors.bg.as_str(), 4.5),
        ("error", colors.error.as_str(), colors.bg.as_str(), 4.5),
        ("info", colors.info.as_str(), colors.bg.as_str(), 4.5),
        ("accent", colors.accent.as_str(), colors.bg.as_str(), 3.0),
        ("border", colors.border.as_str(), colors.bg.as_str(), 3.0),
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
}
