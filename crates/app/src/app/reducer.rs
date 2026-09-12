use super::{ApplicationEvent, ApplicationState, AuthEvent, StatusEvent, WorkspaceEvent};
use crate::auth::{screen_for, AuthOperation, OnboardingStatus, Screen};
use crate::{
    command::{CommandArgs, CommandInvocation, Direction},
    input::InputMode,
    workspace::UiMode,
};

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Effect {
    OpenCommandPalette,
    SaveDocument { path: String, content: String },
    Bootstrap,
    RegisterPasskey,
    Login,
    Logout,
    CreateWorkspace(crate::auth::SetupFields),
}

pub fn apply_event(state: &mut ApplicationState, event: ApplicationEvent) -> Vec<Effect> {
    match event {
        ApplicationEvent::Status(StatusEvent::Message(message)) => {
            state.status.message = Some(message)
        }
        ApplicationEvent::Status(StatusEvent::Cleared) => state.status.message = None,
        ApplicationEvent::Workspace(WorkspaceEvent::OverlayClosed) => {
            state.workspace.overlays.pop();
            state.workspace.focus.active_surface = crate::command::SurfaceId::EDITOR;
        }
        ApplicationEvent::Auth(event) => return apply_auth_event(state, event),
    }
    Vec::new()
}

fn apply_auth_event(state: &mut ApplicationState, event: AuthEvent) -> Vec<Effect> {
    let auth = &mut state.auth;
    match event {
        AuthEvent::BootstrapRequested => vec![Effect::Bootstrap],
        AuthEvent::BootstrapLoaded(bootstrap) => {
            auth.screen = screen_for(&bootstrap);
            auth.bootstrap = Some(bootstrap);
            auth.failure = None;
            vec![]
        }
        AuthEvent::RegisterPasskey => {
            auth.operation = AuthOperation::Registering;
            vec![Effect::RegisterPasskey]
        }
        AuthEvent::Login => {
            auth.operation = AuthOperation::LoggingIn;
            vec![Effect::Login]
        }
        AuthEvent::Logout => {
            auth.operation = AuthOperation::LoggingOut;
            vec![Effect::Logout]
        }
        AuthEvent::CreateWorkspace(fields) => {
            auth.setup = fields.clone();
            auth.operation = AuthOperation::CreatingWorkspace;
            auth.screen = Screen::CreatingWorkspace;
            vec![Effect::CreateWorkspace(fields)]
        }
        AuthEvent::Retry => {
            auth.failure = None;
            auth.operation = AuthOperation::None;
            auth.screen = auth
                .bootstrap
                .as_ref()
                .map(screen_for)
                .unwrap_or(Screen::Loading);
            vec![Effect::Bootstrap]
        }
        AuthEvent::OperationFailed(message) => {
            auth.failure = Some(message);
            auth.operation = AuthOperation::None;
            auth.screen = Screen::Failure;
            vec![]
        }
        AuthEvent::RegistrationSucceeded => {
            auth.operation = AuthOperation::None;
            auth.screen = Screen::WorkspaceSetup;
            if let Some(bootstrap) = auth.bootstrap.as_mut() {
                bootstrap.onboarding = OnboardingStatus::WorkspaceRequired;
                bootstrap.authenticated = true;
            }
            vec![]
        }
        AuthEvent::LoginSucceeded { user } => {
            auth.operation = AuthOperation::None;
            if let Some(bootstrap) = auth.bootstrap.as_mut() {
                bootstrap.authenticated = true;
                bootstrap.user = user;
                auth.screen = screen_for(bootstrap);
            }
            vec![]
        }
        AuthEvent::WorkspaceCreated { slug, name } => {
            auth.operation = AuthOperation::None;
            if let Some(bootstrap) = auth.bootstrap.as_mut() {
                bootstrap.onboarding = OnboardingStatus::Complete;
                bootstrap.authenticated = true;
                bootstrap.workspace = Some(crate::auth::WorkspaceSummary { slug, name });
                auth.screen = Screen::Workbench;
            }
            vec![]
        }
        AuthEvent::SessionExpired => {
            auth.operation = AuthOperation::None;
            if let Some(bootstrap) = auth.bootstrap.as_mut() {
                bootstrap.authenticated = false;
                auth.screen = Screen::Login;
            } else {
                auth.screen = Screen::Loading;
            }
            vec![]
        }
    }
}

pub(crate) fn reduce(state: &mut ApplicationState, invocation: CommandInvocation) -> Vec<Effect> {
    let id = invocation.id.as_str();
    match id {
        "app.open_command_palette" => vec![Effect::OpenCommandPalette],
        "workspace.toggle_file_tree" => {
            if state.workspace.ui_mode == UiMode::Focus {
                state.workspace.open_file_tree_overlay();
            } else {
                state.workspace.toggle_file_tree();
            }
            Vec::new()
        }
        "workspace.toggle_focus_mode" => {
            state.workspace.toggle_focus_mode();
            Vec::new()
        }
        "workspace.focus_next_surface" => {
            if state
                .workspace
                .layout
                .contains(crate::command::SurfaceId::FILE_TREE)
            {
                state.workspace.focus.active_surface = crate::command::SurfaceId::FILE_TREE;
            }
            Vec::new()
        }
        "workspace.focus_previous_surface" => {
            if state.workspace.focus.active_surface == crate::command::SurfaceId::FILE_TREE {
                state.workspace.focus.active_surface = crate::command::SurfaceId::EDITOR;
            }
            Vec::new()
        }
        "overlay.close_top" => apply_event(
            state,
            ApplicationEvent::Workspace(WorkspaceEvent::OverlayClosed),
        ),
        "editor.enter_normal_mode" => {
            state.input.mode = InputMode::Normal;
            Vec::new()
        }
        "editor.enter_insert_mode" => {
            state.input.mode = InputMode::Insert;
            Vec::new()
        }
        "file_tree.move_up" | "file_tree.move_down" => {
            move_selection(state, direction(&invocation.args, id))
        }
        "file_tree.open_selected" => open_selected(state),
        "editor.save" => save_document(state),
        _ => {
            state.status.message = Some(format!("Unknown command: {id}"));
            Vec::new()
        }
    }
}

fn direction(args: &CommandArgs, id: &str) -> Direction {
    match args {
        CommandArgs::Direction(direction) => *direction,
        _ if id.ends_with("move_up") => Direction::Up,
        _ => Direction::Down,
    }
}

fn move_selection(state: &mut ApplicationState, direction: Direction) -> Vec<Effect> {
    if state.domain.notes.is_empty() {
        state.status.message = Some("Cannot move file-tree selection: no notes".into());
        return Vec::new();
    }
    let current = state.domain.selected_note.as_deref().unwrap_or("");
    let index = state
        .domain
        .notes
        .iter()
        .position(|note| note.path == current)
        .unwrap_or(0);
    let next = match direction {
        Direction::Up => index.saturating_sub(1),
        Direction::Down => (index + 1).min(state.domain.notes.len().saturating_sub(1)),
        _ => index,
    };
    let path = state.domain.notes[next].path.clone();
    state
        .workspace
        .surface_mut(crate::command::SurfaceId::FILE_TREE)
        .map(|surface| surface.select(path.clone()));
    state.domain.selected_note = Some(path);
    Vec::new()
}

fn open_selected(state: &mut ApplicationState) -> Vec<Effect> {
    let path = state.domain.selected_note.clone();
    if let Some(path) = path.as_deref() {
        state.domain.open_note(path);
    }
    state.workspace.focus.active_surface = crate::command::SurfaceId::EDITOR;
    state
        .workspace
        .overlays
        .remove_surface(crate::command::SurfaceId::FILE_TREE);
    Vec::new()
}

fn save_document(state: &mut ApplicationState) -> Vec<Effect> {
    state
        .domain
        .selected_note
        .clone()
        .map(|path| Effect::SaveDocument {
            path,
            content: state.domain.document.clone(),
        })
        .into_iter()
        .collect()
}
