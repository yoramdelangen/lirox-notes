use liroxnotes_app::{
    frontend_state_from_auth_flags, workspace_note_path_from_location, FrontendState,
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
        workspace_note_path_from_location("/workspace/notes/note/notes/roadmap.md"),
        Some("notes/roadmap.md")
    );
    assert_eq!(workspace_note_path_from_location("/workspace/notes"), None);
}
