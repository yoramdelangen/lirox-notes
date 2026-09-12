use liroxnotes_shared::{
    workspace_view_from_notes, workspace_view_with_virtual_notes, TreeKind, WorkspaceNote,
};

fn test_notes() -> Vec<WorkspaceNote> {
    vec![
        WorkspaceNote {
            path: "notes/welcome.md".to_string(),
            body: "---\ntitle: Welcome\n---\n# Welcome\n\n#overview #welcome\nSee [Roadmap](notes/roadmap.md).".to_string(),
        },
        WorkspaceNote {
            path: "notes/roadmap.md".to_string(),
            body: "# Roadmap\n\n#welcome".to_string(),
        },
    ]
}

#[test]
fn parses_note_meta_from_explicit_records() {
    let notes = test_notes();
    let view = workspace_view_from_notes(
        "test",
        "Test Workspace",
        "main",
        "local",
        "",
        "notes/welcome.md",
        0,
        &notes,
    );

    assert_eq!(view.selected_note.title, "Welcome");
    assert_eq!(view.selected_note.labels, vec!["overview", "welcome"]);
    assert!(view
        .selected_note
        .links
        .contains(&"notes/roadmap.md".to_string()));
}

#[test]
fn builds_tree_and_selects_note_from_explicit_records() {
    let notes = test_notes();
    let view = workspace_view_from_notes(
        "test",
        "Test Workspace",
        "main",
        "local",
        "",
        "notes/roadmap.md",
        0,
        &notes,
    );

    assert_eq!(view.selected_note.path, "notes/roadmap.md");
    assert!(view
        .tree
        .iter()
        .any(|row| row.label == "notes" && matches!(row.kind, TreeKind::Folder)));
    assert!(view.labels.iter().any(|label| label.name == "welcome"));
}

#[test]
fn empty_selection_uses_the_effective_default_note() {
    let notes = test_notes();
    let view = workspace_view_from_notes(
        "test",
        "Test Workspace",
        "main",
        "local",
        "notes/roadmap.md",
        "",
        0,
        &notes,
    );

    assert_eq!(view.selected_note.path, "notes/roadmap.md");
    assert!(view.selected_note.active);
    assert_eq!(view.selected_note_body, "# Roadmap\n\n#welcome");
}

#[test]
fn overrides_selected_note_body_for_labels() {
    let notes = [WorkspaceNote {
        path: "notes/welcome.md".to_string(),
        body: "# Welcome\n\n#alpha #beta".to_string(),
    }];
    let view = workspace_view_from_notes(
        "test",
        "Test Workspace",
        "main",
        "local",
        "",
        "notes/welcome.md",
        0,
        &notes,
    );

    assert!(view.selected_note.labels.contains(&"alpha".to_string()));
    assert!(view.labels.iter().any(|label| label.name == "alpha"));
}

#[test]
fn ignores_labels_in_code_and_links() {
    let notes = [WorkspaceNote {
        path: "notes/welcome.md".to_string(),
        body: "# Heading\n#real `#inline` [#link](notes/#target.md)\n```\n#code\n```\n#done"
            .to_string(),
    }];
    let view = workspace_view_from_notes(
        "test",
        "Test Workspace",
        "main",
        "local",
        "",
        "notes/welcome.md",
        0,
        &notes,
    );

    assert_eq!(view.selected_note.labels, vec!["done", "real"]);
}

#[test]
fn empty_workspace_has_empty_selected_note() {
    let view = workspace_view_from_notes(
        "test",
        "Empty Workspace",
        "main",
        "local git",
        "",
        "",
        0,
        &[],
    );

    assert_eq!(view.note_count, 0);
    assert!(view.selected_note.path.is_empty());
    assert_eq!(view.selected_note_body, "");
    assert!(view.notes.is_empty());
}

#[test]
fn drops_virtual_legacy_note_after_folder_promotion() {
    let view = workspace_view_from_notes(
        "test",
        "Test",
        "main",
        "local",
        "project-planning/another-nested/README.md",
        "project-planning/another-nested/deeper-level.md",
        0,
        &[
            WorkspaceNote {
                path: "project-planning/another-nested/README.md".to_string(),
                body: "# Another nested\n".to_string(),
            },
            WorkspaceNote {
                path: "project-planning/another-nested/deeper-level.md".to_string(),
                body: "# Deeper level\n".to_string(),
            },
        ],
    );
    let merged = workspace_view_with_virtual_notes(
        view,
        "project-planning/another-nested/deeper-level.md",
        &["project-planning/another-nested.md".to_string()],
    );

    assert!(merged
        .notes
        .iter()
        .all(|note| note.path != "project-planning/another-nested.md"));
    assert!(merged.tree.iter().any(|row| {
        row.kind == TreeKind::File
            && row.path == "project-planning/another-nested/deeper-level.md"
            && row.depth == 2
    }));
}
