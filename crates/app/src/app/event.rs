use crate::auth::{BootstrapState, ExistingWorkspace, RegisteredWorkspace, SetupFields, SetupStep};
use liroxnotes_shared::WorkspaceView;

#[derive(Clone, PartialEq, Eq)]
#[allow(clippy::large_enum_variant)]
pub enum ApplicationEvent {
    /// The user's `config.toml`; empty when there is none.
    ConfigLoaded(String),
    Workspace(WorkspaceEvent),
    Theme(ThemeEvent),
    Status(StatusEvent),
    Auth(AuthEvent),
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ThemeEvent {
    PreviewChanged(Option<liroxnotes_shared::WorkspaceTheme>),
    SaveSucceeded(liroxnotes_shared::WorkspaceTheme),
    SaveFailed(String),
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
    SwitchWorkspace(String),
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
    WorkspaceLoaded(Box<WorkspaceView>),
    RepositoryInspected {
        name: Option<String>,
        slug: Option<String>,
    },
    ExistingWorkspacesLoaded {
        registered: Vec<RegisteredWorkspace>,
        available: Vec<ExistingWorkspace>,
    },
    SessionExpired,
}

#[derive(Clone, PartialEq, Eq)]
pub enum WorkspaceEvent {
    OverlayClosed,
    /// A pull or push finished; `view` is the reloaded workspace.
    Synced {
        view: Box<WorkspaceView>,
        message: String,
    },
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
    SwitchWorkspace(String),
    InspectRepository { repo_url: String, branch: String },
    Retry,
}

#[cfg(test)]
mod tests {
    #[test]
    fn auth_events_store_workspace_views_indirectly() {
        assert!(
            std::mem::size_of::<super::AuthEvent>()
                < std::mem::size_of::<liroxnotes_shared::WorkspaceView>()
        );
    }
}
