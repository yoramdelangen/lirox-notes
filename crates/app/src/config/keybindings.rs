use crate::input::KeyStroke;

#[derive(Clone, Debug, PartialEq)]
pub struct KeymapConfig {
    pub leader: KeyStroke,
    /// The leader as written in the config, e.g. `space`.
    pub leader_name: String,
    pub bindings: Vec<crate::input::KeyBinding>,
    /// Keys the editor handles inside Vim normal mode.
    pub vim: Vec<super::toml_config::VimMapping>,
}

impl KeymapConfig {
    pub fn new(leader: KeyStroke, bindings: Vec<crate::input::KeyBinding>) -> Self {
        Self {
            leader,
            leader_name: "space".into(),
            bindings,
            vim: Vec::new(),
        }
    }
}
