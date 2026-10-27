use crate::{
    auth::AuthState,
    command::SurfaceId,
    config::AppConfig,
    domain::DomainState,
    input::{InputScope, InputState, SurfaceKind},
    workspace::WorkspaceState,
};
use liroxnotes_shared::WorkspaceTheme;
use liroxnotes_shared::WorkspaceView;

#[derive(Clone, PartialEq)]
pub struct ApplicationState {
    pub input: InputState,
    pub workspace: WorkspaceState,
    pub domain: DomainState,
    pub config: AppConfig,
    pub status: StatusState,
    pub ui: UiState,
    pub auth: AuthState,
    pub theme: WorkspaceTheme,
    pub theme_preview: Option<WorkspaceTheme>,
    pub effect_version: u64,
}

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct StatusState {
    pub message: Option<String>,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum SidebarTab {
    #[default]
    Files,
    Settings,
}

/// Popovers anchored in the sidebar; at most one is open.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Popover {
    Workspaces,
    Git,
    UserMenu,
}

/// Dropdowns opened from the action bar.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ActionMenu {
    Heading,
    Lists,
    Format,
    More,
}

impl ActionMenu {
    pub fn parse(id: &str) -> Option<Self> {
        match id {
            "heading" => Some(Self::Heading),
            "lists" => Some(Self::Lists),
            "format" => Some(Self::Format),
            "more" => Some(Self::More),
            _ => None,
        }
    }
}

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct PaletteState {
    pub query: String,
    pub index: usize,
}

/// Interface state that is not part of the document or workspace: open
/// popovers and overlays, editor chrome preferences and the input device.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct UiState {
    pub sidebar_tab: SidebarTab,
    pub popover: Option<Popover>,
    pub palette: Option<PaletteState>,
    pub cheat_sheet: bool,
    pub outline: bool,
    pub action_menu: Option<ActionMenu>,
    pub action_menu_index: usize,
    pub action_bar: bool,
    pub key_hints: bool,
    pub font_size: u8,
    /// True after a touch on the document; a physical keypress clears it.
    pub touch: bool,
    /// The H1 that has scrolled out of view, shown in the top bar.
    pub sticky_heading: String,
    /// 1-based line and column of the editor cursor.
    pub cursor: (usize, usize),
    /// Folder paths folded in the file tree.
    pub collapsed: std::collections::BTreeSet<String>,
}

impl Default for UiState {
    fn default() -> Self {
        Self {
            sidebar_tab: SidebarTab::Files,
            popover: None,
            palette: None,
            cheat_sheet: false,
            outline: false,
            action_menu: None,
            action_menu_index: 0,
            action_bar: true,
            key_hints: true,
            font_size: 15,
            touch: false,
            sticky_heading: String::new(),
            cursor: (1, 1),
            collapsed: Default::default(),
        }
    }
}

impl UiState {
    /// Closes the topmost overlay, popover or menu; false if nothing was open.
    pub fn close_top(&mut self) -> bool {
        if self.palette.take().is_some() {
            return true;
        }
        if std::mem::take(&mut self.cheat_sheet) {
            return true;
        }
        if self.action_menu.take().is_some() {
            return true;
        }
        if self.popover.take().is_some() {
            return true;
        }
        if std::mem::take(&mut self.outline) {
            return true;
        }
        if self.sidebar_tab == SidebarTab::Settings {
            self.sidebar_tab = SidebarTab::Files;
            return true;
        }
        false
    }
}

impl ApplicationState {
    pub fn empty() -> Self {
        Self {
            input: InputState::default(),
            workspace: WorkspaceState::empty(),
            domain: DomainState::empty(),
            config: AppConfig::defaults(),
            status: StatusState::default(),
            ui: UiState::default(),
            auth: AuthState::default(),
            theme: WorkspaceTheme::default(),
            theme_preview: None,
            effect_version: 0,
        }
    }

    pub fn from_workspace_view(view: &WorkspaceView) -> Self {
        let mut state = Self::empty();
        state.theme = view.theme.clone();
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
                if let Some(surface) = state.workspace.surface_mut(SurfaceId::FILE_TREE) {
                    surface.select(path);
                }
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
