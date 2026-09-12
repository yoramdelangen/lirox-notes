mod note;

pub use note::{DemoDomain, Note};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn demo_notes_are_deterministic_and_nested() {
        let domain = DemoDomain::demo();
        assert_eq!(domain.workspace_name, "LiroxNotes");
        assert!(domain.notes.iter().any(|note| note.path == "notes/deep.md"));
        assert!(domain
            .notes
            .iter()
            .any(|note| note.path.starts_with("projects/")));
    }

    #[test]
    fn opening_note_updates_path_and_document_without_io() {
        let mut domain = DemoDomain::demo();
        assert!(domain.open_note("notes/deep.md"));
        assert_eq!(domain.selected_note.as_deref(), Some("notes/deep.md"));
        assert!(domain.document.contains("nested"));
        assert!(!domain.open_note("missing.md"));
    }
}
