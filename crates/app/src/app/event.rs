use crate::auth::{BootstrapState, SetupFields};
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
    Logout,
    CreateWorkspace(SetupFields),
    Retry,
    OperationFailed(String),
    RegistrationSucceeded,
    LoginSucceeded { user: Option<String> },
    WorkspaceCreated { slug: String, name: String },
    WorkspaceLoaded(WorkspaceView),
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
    Logout,
    CreateWorkspace(SetupFields),
    Retry,
}
