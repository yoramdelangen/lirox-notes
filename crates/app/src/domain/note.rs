#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Note {
    pub path: String,
    pub title: String,
    pub body: String,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DomainState {
    pub workspace_name: String,
    pub notes: Vec<Note>,
    pub selected_note: Option<String>,
    pub document: String,
}
impl DomainState {
    pub fn empty() -> Self {
        Self {
            workspace_name: String::new(),
            notes: Vec::new(),
            selected_note: None,
            document: String::new(),
        }
    }
    pub fn open_note(&mut self, path: &str) -> bool {
        let Some(note) = self.notes.iter().find(|note| note.path == path) else {
            return false;
        };
        self.selected_note = Some(note.path.clone());
        self.document = note.body.clone();
        true
    }
}
