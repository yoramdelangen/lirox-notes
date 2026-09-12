use crate::{
    command::SurfaceId,
    config::AppConfig,
    domain::DemoDomain,
    input::{InputScope, InputState, SurfaceKind},
    workspace::WorkspaceState,
};

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

    pub fn active_input_scopes(&self) -> Vec<InputScope> {
        let mut scopes = Vec::new();
        if self.workspace.overlays.top().is_some() {
            scopes.push(InputScope::Overlay);
        }
        let active = self.workspace.focus.active_surface.clone();
        scopes.push(InputScope::SurfaceInstance(active.clone()));
        scopes.push(InputScope::Surface(if active == SurfaceId::FILE_TREE {
            SurfaceKind::FileTree
        } else {
            SurfaceKind::Editor
        }));
        scopes.extend([InputScope::Workspace, InputScope::Global]);
        scopes
    }
}
