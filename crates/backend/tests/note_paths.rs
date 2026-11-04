use liroxnotes_backend::safe_note_path;

#[test]
fn backend_rejects_traversal_before_path_resolution() {
    assert!(safe_note_path("../secrets.md").is_none());
    assert!(safe_note_path("notes/welcome.md").is_some());
    assert!(safe_note_path("/tmp/secret.md").is_none());
    assert!(safe_note_path("notes/readme.txt").is_none());
}

#[test]
fn backend_rejects_hidden_segments() {
    assert!(safe_note_path(".git/config.md").is_none());
    assert!(safe_note_path("a/.hidden/x.md").is_none());
    assert!(safe_note_path(".lirox.md").is_none());
    assert!(safe_note_path(".md").is_none());
    assert!(safe_note_path("./x.md").is_none());
}

#[test]
fn backend_rejects_backslashes_and_control_characters() {
    assert!(safe_note_path("a\\..\\x.md").is_none());
    assert!(safe_note_path("a\0b.md").is_none());
    assert!(safe_note_path("a\nb.md").is_none());
    assert!(safe_note_path("").is_none());
}

#[test]
fn backend_rejects_empty_segments() {
    assert!(safe_note_path("a//x.md").is_none());
    assert!(safe_note_path("a/x.md/").is_none());
}
