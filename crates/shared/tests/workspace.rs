use liroxnotes_shared::{
    mock_workspace_view, workspace_view_from_notes, workspace_view_with_body, TreeKind,
    DEMO_WORKSPACE,
};

#[test]
fn parses_demo_note_meta() {
    let view = mock_workspace_view("notes/welcome.md");

    assert_eq!(view.selected_note.title, "Welcome");
    assert_eq!(view.selected_note.labels, vec!["overview", "welcome"]);
    assert!(view
        .selected_note
        .links
        .contains(&"notes/roadmap.md".to_string()));
}

#[test]
fn builds_tree_and_selects_note() {
    let view = mock_workspace_view("notes/roadmap.md");

    assert_eq!(view.selected_note.path, "notes/roadmap.md");
    assert!(view
        .tree
        .iter()
        .any(|row| row.label == "notes" && matches!(row.kind, TreeKind::Folder)));
    assert!(view.labels.iter().any(|label| label.name == "welcome"));
}

#[test]
fn overrides_selected_note_body_for_labels() {
    let view = workspace_view_with_body(
        &DEMO_WORKSPACE,
        "notes/welcome.md",
        "# Welcome\n\n#alpha #beta",
    );

    assert!(view.selected_note.labels.contains(&"alpha".to_string()));
    assert!(view.labels.iter().any(|label| label.name == "alpha"));
}

#[test]
fn ignores_labels_in_code_and_links() {
    let view = workspace_view_with_body(
        &DEMO_WORKSPACE,
        "notes/welcome.md",
        "# Heading\n#real `#inline` [#link](notes/#target.md)\n```\n#code\n```\n#done",
    );

    assert_eq!(view.selected_note.labels, vec!["done", "real"]);
}

#[test]
fn empty_workspace_has_empty_selected_note() {
    let view = workspace_view_from_notes(
        "demo",
        "Empty Workspace",
        "main",
        "local git",
        "notes/welcome.md",
        "notes/welcome.md",
        0,
        &[],
    );

    assert_eq!(view.note_count, 0);
    assert_eq!(view.selected_note.path, "notes/welcome.md");
    assert_eq!(view.selected_note_body, "");
    assert!(view.notes.is_empty());
}
