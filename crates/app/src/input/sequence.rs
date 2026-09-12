use super::KeyStroke;

#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct KeySequence(pub Vec<KeyStroke>);

impl KeySequence {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn push(&mut self, stroke: KeyStroke) {
        self.0.push(stroke);
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn starts_with(&self, prefix: &KeySequence) -> bool {
        self.0.starts_with(&prefix.0)
    }
}

impl From<Vec<KeyStroke>> for KeySequence {
    fn from(strokes: Vec<KeyStroke>) -> Self {
        Self(strokes)
    }
}
