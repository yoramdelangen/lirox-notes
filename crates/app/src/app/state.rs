use crate::{
    command::SurfaceId,
    config::AppConfig,
    domain::DomainState,
    input::{InputScope, InputState, SurfaceKind},
    workspace::WorkspaceState,
};
use liroxnotes_shared::WorkspaceView;

#[derive(Clone, Debug, PartialEq)]
pub struct ApplicationState {
    pub input: InputState,
    pub workspace: WorkspaceState,
    pub domain: DomainState,
    pub config: AppConfig,
    pub status: StatusState,
}

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct StatusState {
    pub message: Option<String>,
}

impl ApplicationState {
    pub fn empty() -> Self {
        Self {
            input: InputState::default(),
            workspace: WorkspaceState::empty(),
            domain: DomainState::empty(),
            config: AppConfig::defaults(),
            status: StatusState::default(),
        }
    }

    pub fn from_workspace_view(view: &WorkspaceView) -> Self {
        let mut state = Self::empty();
        state.domain.workspace_name = view.name.clone();
        state.domain.notes = view
            .notes
            .iter()
            .map(|note| crate::domain::Note {
                path: note.path.clone(),
                title: note.title.clone(),
                body: if note.path == view.selected_note.path {
                    view.selected_note_body.clone()
                } else {
                    String::new()
                },
            })
            .collect();
        if !state.domain.notes.is_empty() {
            let selected = view
                .notes
                .iter()
                .find(|note| note.active)
                .or_else(|| view.notes.first())
                .map(|note| note.path.clone());
            if let Some(path) = selected {
                state.domain.open_note(&path);
                state
                    .workspace
                    .surface_mut(SurfaceId::FILE_TREE)
                    .map(|surface| surface.select(path));
            }
        }
        state
    }

    pub fn set_document(&mut self, document: String) {
        self.domain.document = document;
    }

    pub fn active_input_scopes(&self) -> Vec<InputScope> {
        let mut scopes = Vec::new();
        if let Some(overlay) = self.workspace.overlays.top() {
            if overlay.input_policy == crate::workspace::OverlayInputPolicy::Modal {
                scopes.push(InputScope::Overlay);
                scopes.push(InputScope::SurfaceInstance(overlay.surface.clone()));
                scopes.push(InputScope::Surface(surface_kind(&overlay.surface)));
            }
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

fn surface_kind(surface: &SurfaceId) -> SurfaceKind {
    if *surface == SurfaceId::FILE_TREE {
        SurfaceKind::FileTree
    } else {
        SurfaceKind::Editor
    }
}
