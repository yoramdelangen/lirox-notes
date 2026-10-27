use super::{
    ActionMenu, ApplicationEvent, ApplicationState, AuthEvent, PaletteState, Popover, SidebarTab,
    StatusEvent, ThemeEvent, WorkspaceEvent,
};
use crate::auth::{screen_for, AuthOperation, OnboardingStatus, Screen};
use crate::{
    command::{CommandArgs, CommandInvocation, Direction},
    input::InputMode,
    workspace::UiMode,
};
use liroxnotes_shared::{TreeKind, WorkspaceTheme};

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Effect {
    OpenCommandPalette,
    SaveDocument {
        path: String,
        content: String,
    },
    Bootstrap,
    LoadWorkspace,
    LoadWorkspaceNote(String),
    RegisterPasskey,
    SetupInstallation(String),
    Login,
    AutoLogin,
    Logout,
    CreateWorkspace(crate::auth::SetupFields),
    LoadExistingWorkspaces,
    SwitchWorkspace(String),
    InspectRepository {
        repo_url: String,
        branch: String,
    },
    SaveWorkspaceTheme {
        slug: String,
        theme: Box<WorkspaceTheme>,
    },
    /// Pull, then reload the open note.
    PullWorkspace(Option<String>),
    /// Push committed notes, then reload the open note.
    PushWorkspace(Option<String>),
    /// Runs a formatting action in the mounted editor, e.g. `bold` or `h2`.
    EditorAction(String),
    /// Moves the editor cursor to a 1-based line.
    EditorGotoLine(usize),
    EditorFocus,
    SetEditorVimMode(bool),
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
        ApplicationEvent::Workspace(WorkspaceEvent::Synced { view, message }) => {
            let effects = apply_auth_event(state, AuthEvent::WorkspaceLoaded(view));
            state.status.message = Some(message);
            return effects;
        }
        ApplicationEvent::Theme(event) => apply_theme_event(state, event),
        ApplicationEvent::Auth(event) => return apply_auth_event(state, event),
    }
    Vec::new()
}

fn apply_theme_event(state: &mut ApplicationState, event: ThemeEvent) {
    match event {
        ThemeEvent::PreviewChanged(theme) => state.theme_preview = theme,
        ThemeEvent::SaveSucceeded(theme) => {
            state.theme = theme;
            state.theme_preview = None;
            state.status.message = None;
        }
        ThemeEvent::SaveFailed(message) => state.status.message = Some(message),
    }
}

fn apply_auth_event(state: &mut ApplicationState, event: AuthEvent) -> Vec<Effect> {
    let auth = &mut state.auth;
    match event {
        AuthEvent::BootstrapRequested => vec![Effect::Bootstrap],
        AuthEvent::BootstrapLoaded(bootstrap) => {
            auth.workspace = None;
            if let Some(display_name) = bootstrap.display_name.as_ref() {
                auth.setup.display_name = display_name.clone();
            }
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
            if auth.screen == Screen::WorkspaceSetup {
                auth.setup.step = if auth
                    .bootstrap
                    .as_ref()
                    .and_then(|bootstrap| bootstrap.display_name.as_ref())
                    .is_some()
                {
                    crate::auth::SetupStep::ChooseWorkspace
                } else {
                    crate::auth::SetupStep::Name
                };
            }
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
            let persist_name = auth.setup.step == crate::auth::SetupStep::Name
                && step == crate::auth::SetupStep::ChooseWorkspace;
            auth.setup.step = step;
            auth.failure = None;
            auth.operation = AuthOperation::None;
            if persist_name {
                vec![Effect::SetupInstallation(auth.setup.display_name.clone())]
            } else {
                vec![]
            }
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
        AuthEvent::SwitchWorkspace(slug) => vec![Effect::SwitchWorkspace(slug)],
        AuthEvent::ExistingWorkspacesLoaded {
            registered,
            available,
        } => {
            auth.registered_workspaces = registered;
            auth.existing_workspaces = available;
            auth.operation = AuthOperation::None;
            vec![]
        }
        AuthEvent::InspectRepository { repo_url, branch } => {
            auth.operation = AuthOperation::InspectingRepository;
            auth.failure = None;
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
            let keep_setup_open = auth.operation == AuthOperation::InspectingRepository;
            auth.failure = Some(message);
            auth.operation = AuthOperation::None;
            if !keep_setup_open {
                auth.screen = Screen::Failure;
            }
            vec![]
        }
        AuthEvent::AutoLoginFailed => {
            auth.operation = AuthOperation::None;
            // Fall back to the screen bootstrap prescribes: a completed
            // installation must keep offering login, not a new registration.
            auth.screen = auth
                .bootstrap
                .as_ref()
                .map(screen_for)
                .unwrap_or(Screen::RegisterPasskey);
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
            vec![Effect::SetupInstallation(auth.setup.display_name.clone())]
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
                if bootstrap.onboarding == OnboardingStatus::WorkspaceRequired {
                    auth.setup.step = if bootstrap.display_name.is_some() {
                        crate::auth::SetupStep::ChooseWorkspace
                    } else {
                        crate::auth::SetupStep::Name
                    };
                }
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
            state.theme = hydrated.theme;
            auth.operation = AuthOperation::None;
            auth.workspace = Some(*view);
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
            auth.failure = None;
            auth.setup.step = crate::auth::SetupStep::Finish;
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
            let sidebar_visible = state
                .workspace
                .layout
                .contains(crate::command::SurfaceId::FILE_TREE)
                || state
                    .workspace
                    .overlays
                    .top()
                    .is_some_and(|entry| entry.surface == crate::command::SurfaceId::FILE_TREE);
            state.workspace.focus.active_surface = if sidebar_visible {
                crate::command::SurfaceId::FILE_TREE
            } else {
                crate::command::SurfaceId::EDITOR
            };
            Vec::new()
        }
        "workspace.toggle_focus_mode" => {
            state.workspace.toggle_focus_mode();
            state.workspace.focus.active_surface = crate::command::SurfaceId::EDITOR;
            Vec::new()
        }
        "workspace.focus_next_surface" => {
            if state.workspace.focus.active_surface == crate::command::SurfaceId::FILE_TREE {
                state.workspace.focus.active_surface = crate::command::SurfaceId::EDITOR;
                state
                    .workspace
                    .overlays
                    .remove_surface(crate::command::SurfaceId::FILE_TREE);
                return vec![Effect::EditorFocus];
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
        "overlay.close_top" => {
            if state.ui.close_top() {
                return vec![Effect::EditorFocus];
            }
            let mut effects = apply_event(
                state,
                ApplicationEvent::Workspace(WorkspaceEvent::OverlayClosed),
            );
            effects.push(Effect::EditorFocus);
            effects
        }
        "workspace.focus_file_tree" => {
            show_sidebar(state);
            state.ui.sidebar_tab = SidebarTab::Files;
            state.workspace.focus.active_surface = crate::command::SurfaceId::FILE_TREE;
            state.input.mode = InputMode::Normal;
            if let Some(path) = state.domain.selected_note.clone() {
                if let Some(surface) = state
                    .workspace
                    .surface_mut(crate::command::SurfaceId::FILE_TREE)
                {
                    surface.select(path);
                }
            }
            Vec::new()
        }
        "ui.toggle_action_bar" => {
            state.ui.action_bar = !state.ui.action_bar;
            state.ui.action_menu = None;
            Vec::new()
        }
        "ui.toggle_outline" => {
            state.ui.outline = !state.ui.outline;
            state.ui.action_menu = None;
            state.ui.palette = None;
            Vec::new()
        }
        "ui.toggle_cheat_sheet" => {
            state.ui.cheat_sheet = !state.ui.cheat_sheet;
            state.ui.palette = None;
            state.ui.action_menu = None;
            Vec::new()
        }
        "ui.toggle_key_hints" => {
            state.ui.key_hints = !state.ui.key_hints;
            Vec::new()
        }
        "ui.cycle_font_size" => {
            state.ui.font_size = if state.ui.font_size >= 18 {
                13
            } else {
                state.ui.font_size + 1
            };
            Vec::new()
        }
        "ui.open_palette" => {
            let query = match &invocation.args {
                CommandArgs::Text(query) => query.clone(),
                _ => String::new(),
            };
            state.ui.palette = Some(PaletteState { query, index: 0 });
            state.ui.action_menu = None;
            state.ui.cheat_sheet = false;
            Vec::new()
        }
        "ui.palette_query" => {
            if let (Some(palette), CommandArgs::Text(query)) =
                (state.ui.palette.as_mut(), &invocation.args)
            {
                palette.query = query.clone();
                palette.index = 0;
            }
            Vec::new()
        }
        "ui.palette_move" => {
            let count = palette_results(state).len();
            if let Some(palette) = state.ui.palette.as_mut() {
                palette.index = step(palette.index, count, direction(&invocation.args, id));
            }
            Vec::new()
        }
        "ui.palette_accept" => {
            let results = palette_results(state);
            let index = match invocation.args {
                CommandArgs::Count(index) => index as usize,
                _ => state.ui.palette.as_ref().map_or(0, |palette| palette.index),
            };
            state.ui.palette = None;
            let Some(item) = results.into_iter().nth(index) else {
                return vec![Effect::EditorFocus];
            };
            let mut effects = reduce(
                state,
                CommandInvocation {
                    id: crate::command::CommandId::new(item.command),
                    args: item.args,
                    source: crate::command::CommandSource::CommandPalette,
                },
            );
            if !effects.contains(&Effect::EditorFocus) {
                effects.push(Effect::EditorFocus);
            }
            effects
        }
        "ui.open_action_menu" => {
            let menu = match &invocation.args {
                CommandArgs::Text(menu) => ActionMenu::parse(menu),
                _ => None,
            };
            state.ui.action_menu = if state.ui.action_menu == menu {
                None
            } else {
                menu
            };
            state.ui.action_menu_index = 0;
            Vec::new()
        }
        "ui.action_menu_move" => {
            if let Some(menu) = state.ui.action_menu {
                let count = crate::ui::model::action_menu_items(menu).len();
                state.ui.action_menu_index = step(
                    state.ui.action_menu_index,
                    count,
                    direction(&invocation.args, id),
                );
            }
            Vec::new()
        }
        "ui.action_menu_accept" => {
            let Some(menu) = state.ui.action_menu.take() else {
                return Vec::new();
            };
            let index = match invocation.args {
                CommandArgs::Count(index) => index as usize,
                _ => state.ui.action_menu_index,
            };
            crate::ui::model::action_menu_items(menu)
                .get(index)
                .map(|item| {
                    vec![
                        Effect::EditorAction(item.action.into()),
                        Effect::EditorFocus,
                    ]
                })
                .unwrap_or_default()
        }
        "editor.action" => {
            state.ui.action_menu = None;
            match &invocation.args {
                CommandArgs::Text(action) => vec![Effect::EditorAction(action.clone())],
                _ => Vec::new(),
            }
        }
        "editor.goto_line" => {
            state.ui.outline = false;
            match invocation.args {
                CommandArgs::Count(line) => {
                    vec![Effect::EditorGotoLine(line as usize), Effect::EditorFocus]
                }
                _ => Vec::new(),
            }
        }
        "editor.toggle_vim" => {
            state.config.editor.vim_mode_enabled = !state.config.editor.vim_mode_enabled;
            vec![Effect::SetEditorVimMode(effective_vim(state))]
        }
        "ui.set_input_device" => {
            let touch = matches!(&invocation.args, CommandArgs::Text(device) if device == "touch");
            if state.ui.touch == touch {
                return Vec::new();
            }
            state.ui.touch = touch;
            state.status.message = Some(if touch {
                "touch · on-screen keyboard".into()
            } else if state.config.editor.vim_mode_enabled {
                "keyboard detected · NORMAL".into()
            } else {
                "keyboard detected".into()
            });
            vec![Effect::SetEditorVimMode(effective_vim(state))]
        }
        "ui.toggle_popover" => {
            let popover = match &invocation.args {
                CommandArgs::Text(name) => match name.as_str() {
                    "workspaces" => Some(Popover::Workspaces),
                    "git" => Some(Popover::Git),
                    "user" => Some(Popover::UserMenu),
                    _ => None,
                },
                _ => None,
            };
            let opening = popover.is_some() && state.ui.popover != popover;
            state.ui.popover = if opening { popover } else { None };
            if opening {
                show_sidebar(state);
            }
            if opening && popover == Some(Popover::Workspaces) {
                return apply_auth_event(state, AuthEvent::LoadExistingWorkspaces);
            }
            Vec::new()
        }
        "ui.show_settings" => {
            state.ui.sidebar_tab = SidebarTab::Settings;
            state.ui.popover = None;
            show_sidebar(state);
            Vec::new()
        }
        "ui.show_files" => {
            state.ui.sidebar_tab = SidebarTab::Files;
            Vec::new()
        }
        "theme.select" => {
            let Some(preset) = (match &invocation.args {
                CommandArgs::Text(id) => crate::theme::theme_presets()
                    .into_iter()
                    .find(|preset| preset.id == id),
                _ => None,
            }) else {
                return Vec::new();
            };
            apply_theme(state, preset.theme)
        }
        "theme.import" => {
            let CommandArgs::Text(source) = &invocation.args else {
                return Vec::new();
            };
            match crate::theme::parse_scheme(source) {
                Ok(imported) => {
                    let name = imported.scheme.unwrap_or_else(|| "theme".into());
                    let effects = apply_theme(state, imported.theme);
                    state.status.message = Some(format!("imported {name}"));
                    effects
                }
                Err(error) => {
                    state.status.message = Some(format!("theme import failed: {error}"));
                    Vec::new()
                }
            }
        }
        "git.pull" => {
            state.ui.popover = None;
            state.status.message = Some("pulling…".into());
            vec![Effect::PullWorkspace(state.domain.selected_note.clone())]
        }
        "git.push" => {
            state.ui.popover = None;
            state.status.message = Some("pushing…".into());
            vec![Effect::PushWorkspace(state.domain.selected_note.clone())]
        }
        "workspace.add" => {
            state.ui.popover = None;
            let auth = &mut state.auth;
            auth.screen = crate::auth::Screen::WorkspaceSetup;
            auth.setup.step = crate::auth::SetupStep::ChooseWorkspace;
            auth.failure = None;
            auth.operation = AuthOperation::None;
            Vec::new()
        }
        "workspace.cancel_setup" => {
            if state.auth.workspace.is_some() {
                state.auth.screen = crate::auth::Screen::Workbench;
                state.auth.failure = None;
            }
            Vec::new()
        }
        "file_tree.toggle_folder" => {
            if let CommandArgs::Text(path) = &invocation.args {
                toggle_folder(state, path);
            }
            Vec::new()
        }
        "file_tree.collapse" | "file_tree.expand" => {
            if let Some(path) = tree_cursor(state) {
                let collapsed = state.ui.collapsed.contains(&path);
                let is_folder = state.auth.workspace.as_ref().is_some_and(|view| {
                    view.tree
                        .iter()
                        .any(|entry| entry.path == path && entry.kind == TreeKind::Folder)
                });
                if is_folder && collapsed == (id == "file_tree.expand") {
                    toggle_folder(state, &path);
                }
            }
            Vec::new()
        }
        "file_tree.open_path" => {
            let CommandArgs::Text(path) = &invocation.args else {
                return Vec::new();
            };
            if let Some(surface) = state
                .workspace
                .surface_mut(crate::command::SurfaceId::FILE_TREE)
            {
                surface.select(path.clone());
            }
            state.ui.palette = None;
            open_selected(state)
        }
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
        "editor.create_note" => create_note(state),
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

fn step(index: usize, count: usize, direction: Direction) -> usize {
    match direction {
        Direction::Up => index.saturating_sub(1),
        Direction::Down => (index + 1).min(count.saturating_sub(1)),
        _ => index,
    }
}

fn palette_results(state: &ApplicationState) -> Vec<crate::ui::model::PaletteItem> {
    let Some(palette) = state.ui.palette.as_ref() else {
        return Vec::new();
    };
    let notes: Vec<String> = state
        .domain
        .notes
        .iter()
        .map(|note| note.path.clone())
        .collect();
    crate::ui::model::palette_items(&palette.query, &notes, state.config.editor.vim_mode_enabled)
}

/// Vim keys only make sense with a physical keyboard.
pub(crate) fn effective_vim(state: &ApplicationState) -> bool {
    state.config.editor.vim_mode_enabled && !state.ui.touch
}

/// Makes the sidebar visible: docked on wide screens, as a sheet on narrow ones.
fn show_sidebar(state: &mut ApplicationState) {
    let workspace = &mut state.workspace;
    if workspace.viewport == crate::workspace::ViewportMode::Narrow
        || workspace.ui_mode == UiMode::Focus
    {
        workspace.open_file_tree_overlay();
    } else if !workspace
        .layout
        .contains(crate::command::SurfaceId::FILE_TREE)
    {
        workspace.toggle_file_tree();
    }
}

/// Shows `theme` right away and saves it to the open workspace.
fn apply_theme(state: &mut ApplicationState, theme: WorkspaceTheme) -> Vec<Effect> {
    match state.auth.workspace.as_ref() {
        Some(view) => {
            state.theme_preview = Some(theme.clone());
            vec![Effect::SaveWorkspaceTheme {
                slug: view.slug.clone(),
                theme: Box::new(theme),
            }]
        }
        None => {
            state.theme = theme;
            Vec::new()
        }
    }
}

fn toggle_folder(state: &mut ApplicationState, path: &str) {
    if !state.ui.collapsed.remove(path) {
        state.ui.collapsed.insert(path.to_string());
    }
}

/// The row under the file-tree cursor, falling back to the open note.
fn tree_cursor(state: &ApplicationState) -> Option<String> {
    state
        .workspace
        .surface(crate::command::SurfaceId::FILE_TREE)
        .and_then(|surface| surface.selected_path())
        .map(str::to_string)
        .or_else(|| state.domain.selected_note.clone())
}

/// Moves the tree cursor over visible rows without opening anything.
fn move_selection(state: &mut ApplicationState, direction: Direction) -> Vec<Effect> {
    let rows: Vec<String> = match state.auth.workspace.as_ref() {
        Some(view) if !view.tree.is_empty() => {
            crate::ui::model::tree_rows(&view.tree, &state.ui.collapsed)
                .into_iter()
                .map(|row| row.path)
                .collect()
        }
        _ => state
            .domain
            .notes
            .iter()
            .map(|note| note.path.clone())
            .collect(),
    };
    if rows.is_empty() {
        state.status.message = Some("Cannot move file-tree selection: no notes".into());
        return Vec::new();
    }
    let current = tree_cursor(state).unwrap_or_default();
    let index = rows.iter().position(|path| *path == current).unwrap_or(0);
    let path = rows[step(index, rows.len(), direction)].clone();
    if let Some(surface) = state
        .workspace
        .surface_mut(crate::command::SurfaceId::FILE_TREE)
    {
        surface.select(path);
    }
    Vec::new()
}

fn open_selected(state: &mut ApplicationState) -> Vec<Effect> {
    let path = tree_cursor(state);
    if let Some(folder) = path.as_ref().filter(|path| {
        state.auth.workspace.as_ref().is_some_and(|view| {
            view.tree
                .iter()
                .any(|entry| entry.path == **path && entry.kind == TreeKind::Folder)
        })
    }) {
        let folder = folder.clone();
        toggle_folder(state, &folder);
        return Vec::new();
    }
    // The open note only changes once its body has loaded, so a save in
    // between never writes the old document to the new path.
    state.ui.popover = None;
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

fn create_note(state: &mut ApplicationState) -> Vec<Effect> {
    let path = "new-note.md".to_string();
    state.domain.notes.push(crate::domain::Note {
        path: path.clone(),
        title: "New Note".into(),
        body: String::new(),
    });
    state.domain.selected_note = Some(path.clone());
    state.domain.document.clear();
    state.status.message = Some("New note created".into());
    vec![Effect::SaveDocument {
        path,
        content: String::new(),
    }]
}

#[cfg(test)]
mod layout_tests {
    #[test]
    fn effects_store_workspace_themes_indirectly() {
        assert!(
            std::mem::size_of::<super::Effect>()
                < std::mem::size_of::<liroxnotes_shared::WorkspaceTheme>()
        );
    }
}
