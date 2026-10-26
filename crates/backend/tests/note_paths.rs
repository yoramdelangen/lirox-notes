use liroxnotes_backend::safe_note_path;

#[test]
fn backend_rejects_traversal_before_path_resolution() {
    assert!(safe_note_path("../secrets.md").is_none());
    assert!(safe_note_path("notes/welcome.md").is_some());
    assert!(safe_note_path("/tmp/secret.md").is_none());
    assert!(safe_note_path("notes/readme.txt").is_none());
}
