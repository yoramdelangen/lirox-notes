use liroxnotes_app::{
    frontend_state_from_auth_flags, sidebar_context_directory_for_note, sidebar_create_path,
    workspace_location_for_note_path, workspace_note_path_from_location, FrontendState,
    SidebarCreateKind, SidebarCreateState,
};

#[test]
fn auth_state_prefers_onboarding_over_login() {
    assert_eq!(
        frontend_state_from_auth_flags(false, false, true),
        FrontendState::Install
    );
    assert_eq!(
        frontend_state_from_auth_flags(true, false, true),
        FrontendState::Login
    );
    assert_eq!(
        frontend_state_from_auth_flags(true, true, true),
        FrontendState::Setup
    );
    assert_eq!(
        frontend_state_from_auth_flags(true, true, false),
        FrontendState::Ready
    );
}

#[test]
fn parses_selected_note_from_workspace_route() {
    assert_eq!(
        workspace_note_path_from_location("/workspace/notes/note/notes/roadmap"),
        Some("notes/roadmap.md".to_string())
    );
    assert_eq!(workspace_note_path_from_location("/workspace/notes"), None);
    assert_eq!(
        workspace_note_path_from_location("/workspace/notes/projects/demo/"),
        Some("projects/demo/README.md".to_string())
    );
}

#[test]
fn builds_folder_friendly_workspace_routes() {
    assert_eq!(
        workspace_location_for_note_path("notes", "projects/demo/README.md"),
        "/workspace/notes/projects/demo/"
    );
    assert_eq!(
        workspace_location_for_note_path("notes", "projects/demo/todo.md"),
        "/workspace/notes/note/projects/demo/todo"
    );
}

#[test]
fn builds_nested_sidebar_create_paths() {
    assert_eq!(
        sidebar_create_path(&SidebarCreateState {
            dir: "projects".to_string(),
            kind: SidebarCreateKind::Folder,
            value: "Client A/Phase 1".to_string(),
        }),
        Some("projects/Client-A/Phase-1/README.md".to_string())
    );
    assert_eq!(
        sidebar_create_path(&SidebarCreateState {
            dir: "projects".to_string(),
            kind: SidebarCreateKind::Note,
            value: "Client A/Phase 1/".to_string(),
        }),
        Some("projects/Client-A/Phase-1/README.md".to_string())
    );
    assert_eq!(
        sidebar_create_path(&SidebarCreateState {
            dir: "projects/client-a".to_string(),
            kind: SidebarCreateKind::Note,
            value: "Sprint Notes".to_string(),
        }),
        Some("projects/client-a/Sprint-Notes.md".to_string())
    );
    assert_eq!(
        sidebar_create_path(&SidebarCreateState {
            dir: "projects/client-a".to_string(),
            kind: SidebarCreateKind::Note,
            value: "Sprint Notes.md".to_string(),
        }),
        Some("projects/client-a/Sprint-Notes.md".to_string())
    );
}

#[test]
fn creates_notes_beneath_the_context_note() {
    assert_eq!(
        sidebar_context_directory_for_note("notes/roadmap.md"),
        "notes/roadmap"
    );
    assert_eq!(
        sidebar_context_directory_for_note("projects/README.md"),
        "projects"
    );
    assert_eq!(sidebar_context_directory_for_note("HOME.md"), "HOME");
}
