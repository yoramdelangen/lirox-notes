use crate::auth::{BootstrapState, ExistingWorkspace, SetupFields, SetupStep};
use liroxnotes_shared::WorkspaceView;

#[derive(Clone, PartialEq, Eq)]
pub enum ApplicationEvent {
    Workspace(WorkspaceEvent),
    Status(StatusEvent),
    Auth(AuthEvent),
}

#[derive(Clone, PartialEq, Eq)]
pub enum AuthEvent {
    BootstrapRequested,
    BootstrapLoaded(BootstrapState),
    RegisterPasskey,
    Login,
    AutoLogin,
    Logout,
    CreateWorkspace(SetupFields),
    SetSetupStep(SetupStep),
    SelectExistingWorkspace(ExistingWorkspace),
    LoadExistingWorkspaces,
    InspectRepository {
        repo_url: String,
        branch: String,
    },
    Retry,
    OperationFailed(String),
    AutoLoginFailed,
    RegistrationSucceeded,
    LoginSucceeded {
        user: Option<String>,
    },
    WorkspaceCreated {
        slug: String,
        name: String,
    },
    WorkspaceLoaded(WorkspaceView),
    RepositoryInspected {
        name: Option<String>,
        slug: Option<String>,
    },
    ExistingWorkspacesLoaded(Vec<ExistingWorkspace>),
    SessionExpired,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum WorkspaceEvent {
    OverlayClosed,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum StatusEvent {
    Message(String),
    Cleared,
}

#[derive(Clone, PartialEq, Eq)]
pub enum AuthCommand {
    RegisterPasskey,
    Login,
    AutoLogin,
    Logout,
    CreateWorkspace(SetupFields),
    SetSetupStep(SetupStep),
    SelectExistingWorkspace(ExistingWorkspace),
    LoadExistingWorkspaces,
    InspectRepository { repo_url: String, branch: String },
    Retry,
}
