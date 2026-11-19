//! The "new note" draft: where a note will be created and what it will be
//! called, before it exists. Pure, so the naming rules are unit tested.

use liroxnotes_shared::{TreeEntry, TreeKind};

/// A note being named in the File Tree's inline row.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct NoteDraft {
    /// Folder the note lands in; `""` is the workspace root.
    pub folder: String,
    /// The file turned into `folder/README.md`, for a child note.
    pub child_of: Option<String>,
    pub title: String,
    pub error: Option<String>,
    /// The create request is in flight.
    pub pending: bool,
}

/// A draft anchored on a tree row: inside a folder, as a child of a file, or
/// at the root for no anchor.
pub fn draft_for(tree: &[TreeEntry], anchor: Option<&str>) -> NoteDraft {
    let anchor = anchor.unwrap_or("");
    match tree.iter().find(|entry| entry.path == anchor) {
        Some(entry) if entry.kind == TreeKind::File => NoteDraft {
            folder: anchor.trim_end_matches(".md").to_string(),
            child_of: Some(anchor.to_string()),
            ..NoteDraft::default()
        },
        Some(_) => NoteDraft {
            folder: anchor.to_string(),
            ..NoteDraft::default()
        },
        None => NoteDraft::default(),
    }
}

/// A draft next to `anchor`, in the folder that contains it.
pub fn sibling_draft(anchor: Option<&str>) -> NoteDraft {
    let folder = anchor
        .and_then(|path| path.rsplit_once('/'))
        .map(|(folder, _)| folder.to_string())
        .unwrap_or_default();
    NoteDraft {
        folder,
        ..NoteDraft::default()
    }
}

/// The note's path, `folder/<slug>.md`, or why it cannot be created. The
/// tree check is a convenience; the server makes the final call.
pub fn draft_path(draft: &NoteDraft, tree: &[TreeEntry]) -> Result<String, String> {
    let slug = crate::auth::slug_from_name(&draft.title);
    if slug.is_empty() {
        return Err("Use letters or numbers in the title".into());
    }
    let stem = if draft.folder.is_empty() {
        slug
    } else {
        format!("{}/{slug}", draft.folder)
    };
    let path = format!("{stem}.md");
    for entry in tree {
        if entry.path == path {
            return Err(format!("`{path}` already exists"));
        }
        if entry.kind == TreeKind::Folder && entry.path == stem {
            return Err(format!("a folder `{stem}/` already exists"));
        }
    }
    Ok(path)
}

/// A new note starts with its title as the heading.
pub fn note_body(title: &str) -> String {
    format!("# {}\n", title.trim())
}

#[cfg(test)]
mod tests {
    use super::*;
    use liroxnotes_shared::{TreeEntry, TreeKind};

    fn entry(kind: TreeKind, path: &str, depth: usize) -> TreeEntry {
        TreeEntry {
            kind,
            label: path.rsplit('/').next().unwrap().into(),
            path: path.into(),
            depth,
            active: false,
        }
    }

    fn tree() -> Vec<TreeEntry> {
        vec![
            entry(TreeKind::Folder, "work", 0),
            entry(TreeKind::File, "work/a.md", 1),
            entry(TreeKind::File, "b.md", 0),
        ]
    }

    fn draft(folder: &str, title: &str) -> NoteDraft {
        NoteDraft {
            folder: folder.into(),
            title: title.into(),
            ..NoteDraft::default()
        }
    }

    #[test]
    fn folder_anchor_creates_inside_it() {
        let draft = draft_for(&tree(), Some("work"));
        assert_eq!(draft.folder, "work");
        assert_eq!(draft.child_of, None);
    }

    #[test]
    fn file_anchor_creates_a_child() {
        let draft = draft_for(&tree(), Some("b.md"));
        assert_eq!(draft.folder, "b");
        assert_eq!(draft.child_of.as_deref(), Some("b.md"));
    }

    #[test]
    fn no_anchor_creates_at_root() {
        assert_eq!(draft_for(&tree(), None).folder, "");
        assert_eq!(draft_for(&tree(), Some("")).folder, "");
    }

    #[test]
    fn sibling_draft_uses_the_containing_folder() {
        let draft = sibling_draft(Some("work/a.md"));
        assert_eq!(draft.folder, "work");
        assert_eq!(draft.child_of, None);
        assert_eq!(sibling_draft(Some("b.md")).folder, "");
        assert_eq!(sibling_draft(None).folder, "");
    }

    #[test]
    fn path_is_slugified() {
        assert_eq!(
            draft_path(&draft("work", "Meeting notes Q4"), &tree()),
            Ok("work/meeting-notes-q4.md".to_string())
        );
        assert_eq!(
            draft_path(&draft("", "Meeting notes Q4"), &tree()),
            Ok("meeting-notes-q4.md".to_string())
        );
    }

    #[test]
    fn empty_slug_is_an_error() {
        for title in ["", "   ", "!!!"] {
            assert_eq!(
                draft_path(&draft("", title), &tree()),
                Err("Use letters or numbers in the title".to_string()),
                "{title:?}"
            );
        }
    }

    #[test]
    fn existing_file_is_an_error() {
        assert_eq!(
            draft_path(&draft("", "B"), &tree()),
            Err("`b.md` already exists".to_string())
        );
    }

    #[test]
    fn same_named_folder_is_an_error() {
        assert_eq!(
            draft_path(&draft("", "Work"), &tree()),
            Err("a folder `work/` already exists".to_string())
        );
    }

    #[test]
    fn note_body_is_a_heading() {
        assert_eq!(note_body("  Plan "), "# Plan\n");
    }
}
