#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Note {
    pub path: String,
    pub title: String,
    pub body: String,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DemoDomain {
    pub workspace_name: String,
    pub notes: Vec<Note>,
    pub selected_note: Option<String>,
    pub document: String,
}
impl DemoDomain {
    pub fn demo() -> Self {
        let notes = vec![
            Note {
                path: "notes/welcome.md".into(),
                title: "Welcome".into(),
                body: "Welcome to LiroxNotes.".into(),
            },
            Note {
                path: "notes/deep.md".into(),
                title: "Deep Notes".into(),
                body: "A nested note for deterministic demos.".into(),
            },
            Note {
                path: "projects/roadmap.md".into(),
                title: "Roadmap".into(),
                body: "Build the calm workbench.".into(),
            },
        ];
        let selected_note = Some(notes[0].path.clone());
        let document = notes[0].body.clone();
        Self {
            workspace_name: "LiroxNotes".into(),
            notes,
            selected_note,
            document,
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
