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
    LoadWorkspace,
    LoadWorkspaceNote(String),
    RegisterPasskey,
    Login,
    AutoLogin,
    Logout,
    CreateWorkspace(crate::auth::SetupFields),
    LoadExistingWorkspaces,
    InspectRepository { repo_url: String, branch: String },
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
            auth.workspace = None;
            auth.screen = if bootstrap.authenticated
                && bootstrap.onboarding == OnboardingStatus::Complete
                && auth.workspace.is_none()
            {
                Screen::Loading
            } else {
                screen_for(&bootstrap)
            };
            auth.bootstrap = Some(bootstrap);
            auth.operation = AuthOperation::None;
            auth.failure = None;
            if auth.screen == Screen::Loading {
                vec![Effect::LoadWorkspace]
            } else {
                vec![]
            }
        }
        AuthEvent::RegisterPasskey => {
            auth.operation = AuthOperation::Registering;
            vec![Effect::RegisterPasskey]
        }
        AuthEvent::Login => {
            auth.operation = AuthOperation::LoggingIn;
            vec![Effect::Login]
        }
        AuthEvent::AutoLogin => {
            auth.operation = AuthOperation::LoggingIn;
            vec![Effect::AutoLogin]
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
        AuthEvent::SetSetupStep(step) => {
            auth.setup.step = step;
            auth.failure = None;
            auth.operation = AuthOperation::None;
            vec![]
        }
        AuthEvent::SelectExistingWorkspace(workspace) => {
            auth.setup.remote = true;
            auth.setup.repository_path = workspace.repository;
            auth.setup.branch = workspace.branch;
            auth.setup.path = workspace.path;
            if let Some(name) = workspace.workspace_name {
                auth.setup.name = name.clone();
                auth.setup.slug = crate::auth::slug_from_name(&name);
            }
            auth.setup.step = crate::auth::SetupStep::Finish;
            auth.operation = AuthOperation::None;
            vec![]
        }
        AuthEvent::LoadExistingWorkspaces => vec![Effect::LoadExistingWorkspaces],
        AuthEvent::ExistingWorkspacesLoaded(workspaces) => {
            auth.existing_workspaces = workspaces;
            auth.operation = AuthOperation::None;
            vec![]
        }
        AuthEvent::InspectRepository { repo_url, branch } => {
            auth.operation = AuthOperation::InspectingRepository;
            vec![Effect::InspectRepository { repo_url, branch }]
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
        AuthEvent::AutoLoginFailed => {
            auth.operation = AuthOperation::None;
            auth.screen = Screen::RegisterPasskey;
            vec![]
        }
        AuthEvent::RegistrationSucceeded => {
            auth.operation = AuthOperation::None;
            auth.screen = Screen::WorkspaceSetup;
            auth.setup.step = crate::auth::SetupStep::ChooseWorkspace;
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
                auth.screen = if bootstrap.onboarding == OnboardingStatus::Complete
                    && bootstrap.workspace.is_none()
                {
                    Screen::Loading
                } else {
                    screen_for(bootstrap)
                };
                if auth.screen == Screen::Loading {
                    return vec![Effect::LoadWorkspace];
                }
            }
            vec![]
        }
        AuthEvent::WorkspaceCreated { slug, name } => {
            auth.operation = AuthOperation::None;
            if let Some(bootstrap) = auth.bootstrap.as_mut() {
                bootstrap.onboarding = OnboardingStatus::Complete;
                bootstrap.authenticated = true;
                bootstrap.workspace = Some(crate::auth::WorkspaceSummary { slug, name });
            }
            vec![]
        }
        AuthEvent::WorkspaceLoaded(view) => {
            let hydrated = ApplicationState::from_workspace_view(&view);
            state.domain = hydrated.domain;
            state.workspace = hydrated.workspace;
            auth.operation = AuthOperation::None;
            auth.workspace = Some(view);
            if auth.bootstrap.as_ref().is_some_and(|bootstrap| {
                bootstrap.authenticated && bootstrap.onboarding == OnboardingStatus::Complete
            }) {
                auth.screen = Screen::Workbench;
            }
            vec![]
        }
        AuthEvent::RepositoryInspected { name, slug } => {
            if let Some(name) = name {
                auth.setup.name = name;
            }
            if let Some(slug) = slug {
                auth.setup.slug = slug;
            }
            auth.operation = AuthOperation::None;
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
            if state.workspace.focus.active_surface == crate::command::SurfaceId::FILE_TREE {
                state.workspace.focus.active_surface = crate::command::SurfaceId::EDITOR;
            }
            Vec::new()
        }
        "workspace.focus_previous_surface" => {
            if state.workspace.focus.active_surface == crate::command::SurfaceId::EDITOR
                && state
                    .workspace
                    .layout
                    .contains(crate::command::SurfaceId::FILE_TREE)
            {
                state.workspace.focus.active_surface = crate::command::SurfaceId::FILE_TREE;
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
    state.workspace.focus.active_surface = crate::command::SurfaceId::EDITOR;
    state
        .workspace
        .overlays
        .remove_surface(crate::command::SurfaceId::FILE_TREE);
    path.map(Effect::LoadWorkspaceNote).into_iter().collect()
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
