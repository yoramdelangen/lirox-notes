use liroxnotes_app::workspace_note_path_from_location;

#[test]
fn parses_selected_note_from_workspace_route() {
    assert_eq!(
        workspace_note_path_from_location("/workspace/demo/note/notes/roadmap.md"),
        Some("notes/roadmap.md")
    );
    assert_eq!(workspace_note_path_from_location("/workspace/demo"), None);
}
