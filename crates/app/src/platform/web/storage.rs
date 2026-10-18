#[cfg(any(target_arch = "wasm32", test))]
use liroxnotes_shared::WorkspaceTheme;

#[cfg(target_arch = "wasm32")]
const THEME_KEY: &str = "liroxnotes.theme.v1";

#[cfg(any(target_arch = "wasm32", test))]
pub(crate) fn decode_theme(value: &str) -> Option<WorkspaceTheme> {
    serde_json::from_str(value).ok()
}

#[cfg(target_arch = "wasm32")]
pub(crate) fn load_theme() -> Option<WorkspaceTheme> {
    let storage = web_sys::window()?.local_storage().ok()??;
    decode_theme(&storage.get_item(THEME_KEY).ok()??)
}

#[cfg(target_arch = "wasm32")]
pub(crate) fn save_theme(theme: &WorkspaceTheme) {
    if let (Some(window), Ok(value)) = (web_sys::window(), serde_json::to_string(theme)) {
        if let Ok(Some(storage)) = window.local_storage() {
            let _ = storage.set_item(THEME_KEY, &value);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cached_theme_json_round_trips_and_invalid_data_is_ignored() {
        let theme = WorkspaceTheme::default();
        let encoded = serde_json::to_string(&theme).unwrap();

        assert_eq!(decode_theme(&encoded), Some(theme));
        assert_eq!(decode_theme("not a theme"), None);
    }
}
