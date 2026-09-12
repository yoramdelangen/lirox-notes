mod note;

pub use note::{DomainState, Note};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_domain_has_no_workspace_or_notes() {
        let domain = DomainState::empty();
        assert!(domain.workspace_name.is_empty());
        assert!(domain.notes.is_empty());
        assert!(domain.selected_note.is_none());
        assert!(domain.document.is_empty());
    }

    #[test]
    fn opening_note_updates_path_and_document_without_io() {
        let mut domain = DomainState::empty();
        assert!(!domain.open_note("missing.md"));
    }
}
