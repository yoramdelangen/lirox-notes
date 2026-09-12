use crate::{config::AppConfig, domain::DemoDomain, input::InputState, workspace::WorkspaceState};

#[derive(Clone, Debug, PartialEq)]
pub struct ApplicationState {
    pub input: InputState,
    pub workspace: WorkspaceState,
    pub domain: DemoDomain,
    pub config: AppConfig,
    pub status: StatusState,
}

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct StatusState {
    pub message: Option<String>,
}

impl ApplicationState {
    pub fn demo() -> Self {
        Self {
            input: InputState::default(),
            workspace: WorkspaceState::demo(),
            domain: DemoDomain::demo(),
            config: AppConfig::defaults(),
            status: StatusState::default(),
        }
    }
}
