#[cfg(target_arch = "wasm32")]
use dioxus::prelude::spawn;
use dioxus::prelude::{Signal, WritableExt};
use liroxnotes_shared::WorkspaceView;
use serde::{Deserialize, Serialize};

mod components;
pub use components::AuthShell;

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub enum OnboardingStatus {
    NotStarted,
    WorkspaceRequired,
    Complete,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct BootstrapState {
    pub installed: bool,
    pub passkey_exists: bool,
    pub onboarding: OnboardingStatus,
    pub authenticated: bool,
    pub user: Option<String>,
    pub display_name: Option<String>,
    pub workspace: Option<WorkspaceSummary>,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct WorkspaceSummary {
    pub slug: String,
    pub name: String,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct RepositoryMetadata {
    pub name: Option<String>,
    pub slug: Option<String>,
}

impl BootstrapState {
    pub fn not_started() -> Self {
        Self::new(false, OnboardingStatus::NotStarted, false)
    }
    pub fn workspace_required() -> Self {
        Self::new(true, OnboardingStatus::WorkspaceRequired, true)
    }
    pub fn unauthenticated_complete() -> Self {
        Self::new(true, OnboardingStatus::Complete, false)
    }
    pub fn authenticated_complete() -> Self {
        Self::new(true, OnboardingStatus::Complete, true)
    }

    fn new(installed: bool, onboarding: OnboardingStatus, authenticated: bool) -> Self {
        Self {
            installed,
            passkey_exists: false,
            onboarding,
            authenticated,
            user: None,
            display_name: None,
            workspace: None,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Screen {
    Loading,
    RegisterPasskey,
    WorkspaceSetup,
    CreatingWorkspace,
    Login,
    Workbench,
    Failure,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum AuthOperation {
    None,
    Registering,
    LoggingIn,
    LoggingOut,
    CreatingWorkspace,
    InspectingRepository,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct SetupFields {
    pub step: SetupStep,
    pub slug: String,
    /// The person's display name, persisted with the installation.
    pub display_name: String,
    /// The workspace name; never prefilled from the display name.
    pub name: String,
    pub repo_url: String,
    pub repository_path: String,
    pub branch: String,
    pub path: String,
    pub remote: bool,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub enum SetupStep {
    Name,
    ChooseWorkspace,
    ConnectRepository,
    ExistingWorkspace,
    Finish,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct ExistingWorkspace {
    pub repository: String,
    pub branch: String,
    pub path: String,
    pub workspace_name: Option<String>,
}

/// A workspace registered in the application, as listed in the switcher.
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct RegisteredWorkspace {
    pub slug: String,
    pub name: String,
    /// The repository folder, relative to the application's workspace root.
    pub repository: String,
    /// The workspace folder relative to the git root; empty for the root.
    pub path: String,
    pub active: bool,
}

impl Default for SetupFields {
    fn default() -> Self {
        Self {
            step: SetupStep::ChooseWorkspace,
            slug: String::new(),
            display_name: String::new(),
            name: String::new(),
            repo_url: String::new(),
            repository_path: String::new(),
            branch: "main".into(),
            path: String::new(),
            remote: false,
        }
    }
}

#[derive(Clone, PartialEq, Eq)]
pub struct AuthState {
    pub bootstrap: Option<BootstrapState>,
    pub screen: Screen,
    pub operation: AuthOperation,
    pub failure: Option<String>,
    pub setup: SetupFields,
    pub existing_workspaces: Vec<ExistingWorkspace>,
    pub registered_workspaces: Vec<RegisteredWorkspace>,
    pub workspace: Option<WorkspaceView>,
}

impl Default for AuthState {
    fn default() -> Self {
        Self {
            bootstrap: None,
            screen: Screen::Loading,
            operation: AuthOperation::None,
            failure: None,
            setup: SetupFields::default(),
            existing_workspaces: Vec::new(),
            registered_workspaces: Vec::new(),
            workspace: None,
        }
    }
}

pub fn screen_for(bootstrap: &BootstrapState) -> Screen {
    if bootstrap.onboarding == OnboardingStatus::NotStarted {
        return Screen::RegisterPasskey;
    }
    if bootstrap.onboarding == OnboardingStatus::WorkspaceRequired {
        return if bootstrap.authenticated {
            Screen::WorkspaceSetup
        } else {
            Screen::RegisterPasskey
        };
    }
    if bootstrap.authenticated {
        Screen::Workbench
    } else {
        Screen::Login
    }
}

pub fn slug_from_name(value: &str) -> String {
    let mut slug = String::new();
    let mut last_dash = false;
    for ch in value.chars() {
        if ch.is_ascii_alphanumeric() {
            slug.push(ch.to_ascii_lowercase());
            last_dash = false;
        } else if !slug.is_empty() && !last_dash {
            slug.push('-');
            last_dash = true;
        }
    }
    slug.trim_end_matches('-').to_string()
}

pub fn valid_workspace_subpath(value: &str) -> bool {
    let path = value.trim();
    !path.is_empty()
        && path != "."
        && !std::path::Path::new(path).is_absolute()
        && std::path::Path::new(path)
            .components()
            .all(|component| !matches!(component, std::path::Component::ParentDir))
}

pub(crate) fn dispatch_auth(
    mut state: Signal<crate::app::ApplicationState>,
    dispatcher: crate::app::Dispatcher,
    command: crate::app::AuthCommand,
) {
    dispatcher.dispatch_auth_command(&mut state.write(), command);
    #[cfg(target_arch = "wasm32")]
    spawn(async move {
        for effect in dispatcher.take_effects() {
            crate::execute_effect(state, dispatcher.clone(), effect).await;
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::app::{ApplicationEvent, AuthEvent};

    #[test]
    fn bootstrap_state_selects_the_correct_screen() {
        assert_eq!(
            screen_for(&BootstrapState::not_started()),
            Screen::RegisterPasskey
        );
        assert_eq!(
            screen_for(&BootstrapState::workspace_required()),
            Screen::WorkspaceSetup
        );
        assert_eq!(
            screen_for(&BootstrapState::unauthenticated_complete()),
            Screen::Login
        );
        assert_eq!(
            screen_for(&BootstrapState::authenticated_complete()),
            Screen::Workbench
        );
        let mut authenticated_workspace_required = BootstrapState::workspace_required();
        authenticated_workspace_required.installed = false;
        assert_eq!(
            screen_for(&authenticated_workspace_required),
            Screen::WorkspaceSetup
        );
    }

    #[test]
    fn workspace_name_derives_a_slug() {
        assert_eq!(slug_from_name("My Team Notes"), "my-team-notes");
    }

    #[test]
    fn onboarding_starts_at_workspace_choice_after_new_passkey() {
        let mut state = crate::app::ApplicationState::empty();
        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::RegistrationSucceeded),
        );

        assert_eq!(state.auth.setup.step, SetupStep::ChooseWorkspace);
    }

    #[test]
    fn new_passkey_registration_persists_the_submitted_name() {
        let mut state = crate::app::ApplicationState::empty();
        state.auth.setup.display_name = "Example User".into();
        let dispatcher = crate::app::Dispatcher::new();

        dispatcher.dispatch_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::RegistrationSucceeded),
        );

        assert_eq!(
            dispatcher.take_effects(),
            vec![crate::app::Effect::SetupInstallation("Example User".into())]
        );
    }

    #[test]
    fn authenticated_existing_passkey_without_name_stays_on_name_step() {
        let mut state = crate::app::ApplicationState::empty();
        let dispatcher = crate::app::Dispatcher::new();
        let mut bootstrap = BootstrapState::workspace_required();
        bootstrap.display_name = Some("Example User".into());

        dispatcher.dispatch_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(bootstrap)),
        );
        dispatcher.dispatch_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::LoginSucceeded { user: None }),
        );

        assert_eq!(state.auth.setup.step, SetupStep::ChooseWorkspace);
    }

    #[test]
    fn bootstrap_restores_saved_name_for_workspace_greeting() {
        let mut state = crate::app::ApplicationState::empty();
        let dispatcher = crate::app::Dispatcher::new();
        let mut bootstrap = BootstrapState::workspace_required();
        bootstrap.display_name = Some("Example User".into());

        dispatcher.dispatch_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(bootstrap)),
        );

        assert_eq!(state.auth.setup.display_name, "Example User");
        assert_eq!(state.auth.setup.name, "");
    }

    #[test]
    fn workspace_name_is_not_prefilled_with_display_name() {
        let mut state = crate::app::ApplicationState::empty();
        state.auth.setup.display_name = "Example User".into();
        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::RegistrationSucceeded),
        );
        state.auth.setup.step = SetupStep::ConnectRepository;
        state.auth.operation = AuthOperation::InspectingRepository;

        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::RepositoryInspected {
                name: None,
                slug: None,
            }),
        );

        assert_eq!(state.auth.setup.step, SetupStep::Finish);
        assert_eq!(state.auth.setup.name, "");
        assert_eq!(state.auth.setup.display_name, "Example User");
    }

    #[test]
    fn switching_workspace_schedules_activation_of_that_slug() {
        let mut state = crate::app::ApplicationState::empty();
        let dispatcher = crate::app::Dispatcher::new();

        dispatcher.dispatch_auth_command(
            &mut state,
            crate::app::AuthCommand::SwitchWorkspace("work".into()),
        );

        assert_eq!(
            dispatcher.take_effects(),
            vec![crate::app::Effect::SwitchWorkspace("work".into())]
        );
    }

    #[test]
    fn workspace_lists_keep_registered_and_addable_folders_apart() {
        let mut state = crate::app::ApplicationState::empty();
        let registered = vec![RegisteredWorkspace {
            slug: "my-notes".into(),
            name: "my-notes".into(),
            repository: "my-notes".into(),
            path: String::new(),
            active: true,
        }];
        let available = vec![ExistingWorkspace {
            repository: "my-notes".into(),
            branch: "main".into(),
            path: "work".into(),
            workspace_name: None,
        }];

        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::ExistingWorkspacesLoaded {
                registered: registered.clone(),
                available: available.clone(),
            }),
        );

        assert_eq!(state.auth.registered_workspaces, registered);
        assert_eq!(state.auth.existing_workspaces, available);
    }

    #[test]
    fn failed_auto_login_keeps_returning_user_on_login() {
        let mut state = crate::app::ApplicationState::empty();
        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(
                BootstrapState::unauthenticated_complete(),
            )),
        );
        crate::app::apply_event(&mut state, ApplicationEvent::Auth(AuthEvent::AutoLogin));
        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::AutoLoginFailed),
        );

        assert_eq!(state.auth.screen, Screen::Login);
        assert_eq!(state.auth.operation, AuthOperation::None);
    }

    #[test]
    fn inspecting_repository_schedules_clone_check() {
        let mut state = crate::app::ApplicationState::empty();
        let dispatcher = crate::app::Dispatcher::new();
        dispatcher.dispatch_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::InspectRepository {
                repo_url: "https://example.com/notes.git".into(),
                branch: "main".into(),
            }),
        );

        assert_eq!(state.auth.operation, AuthOperation::InspectingRepository);
        assert_eq!(
            dispatcher.take_effects(),
            vec![crate::app::Effect::InspectRepository {
                repo_url: "https://example.com/notes.git".into(),
                branch: "main".into(),
            }]
        );
    }

    #[test]
    fn successful_repository_inspection_advances_to_workspace_details() {
        let mut state = crate::app::ApplicationState::empty();
        state.auth.screen = Screen::WorkspaceSetup;
        state.auth.setup.step = SetupStep::ConnectRepository;
        state.auth.operation = AuthOperation::InspectingRepository;

        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::RepositoryInspected {
                name: Some("Notes".into()),
                slug: Some("notes".into()),
            }),
        );

        assert_eq!(state.auth.setup.step, SetupStep::Finish);
        assert_eq!(state.auth.setup.name, "Notes");
        assert_eq!(state.auth.setup.slug, "notes");
    }

    #[test]
    fn failed_repository_inspection_keeps_connection_form_open() {
        let mut state = crate::app::ApplicationState::empty();
        state.auth.screen = Screen::WorkspaceSetup;
        state.auth.setup.step = SetupStep::ConnectRepository;
        state.auth.operation = AuthOperation::InspectingRepository;

        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::OperationFailed("clone failed".into())),
        );

        assert_eq!(state.auth.screen, Screen::WorkspaceSetup);
        assert_eq!(state.auth.setup.step, SetupStep::ConnectRepository);
        assert_eq!(state.auth.failure.as_deref(), Some("clone failed"));
        assert_eq!(state.auth.operation, AuthOperation::None);
    }

    #[test]
    fn submitting_name_schedules_display_name_persistence() {
        let mut state = crate::app::ApplicationState::empty();
        state.auth.setup.display_name = "Example User".into();
        state.auth.setup.step = SetupStep::Name;
        let dispatcher = crate::app::Dispatcher::new();

        dispatcher.dispatch_auth_command(
            &mut state,
            crate::app::AuthCommand::SetSetupStep(SetupStep::ChooseWorkspace),
        );

        assert_eq!(
            dispatcher.take_effects(),
            vec![crate::app::Effect::SetupInstallation("Example User".into())]
        );
    }

    #[test]
    fn existing_workspace_requires_a_relative_subpath() {
        assert!(!valid_workspace_subpath(""));
        assert!(!valid_workspace_subpath("."));
        assert!(!valid_workspace_subpath("../notes"));
        assert!(!valid_workspace_subpath("notes/../../outside"));
        assert!(valid_workspace_subpath("projects/notes"));
    }

    #[test]
    fn setup_failure_keeps_setup_fields_for_retry() {
        let fields = SetupFields {
            slug: "notes".into(),
            ..SetupFields::default()
        };
        let mut state = crate::app::ApplicationState::empty();
        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::CreateWorkspace(fields.clone())),
        );
        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::OperationFailed("offline".into())),
        );
        assert_eq!(state.auth.setup, fields);
        assert_eq!(state.auth.screen, Screen::Failure);
    }

    #[test]
    fn unauthenticated_workspace_setup_requires_fresh_passkey() {
        let mut bootstrap = BootstrapState::workspace_required();
        bootstrap.authenticated = false;
        assert_eq!(screen_for(&bootstrap), Screen::RegisterPasskey);
    }

    #[test]
    fn workspace_requires_authoritative_view_before_workbench() {
        let mut state = crate::app::ApplicationState::empty();
        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(
                BootstrapState::authenticated_complete(),
            )),
        );
        assert_ne!(state.auth.screen, Screen::Workbench);
        assert!(state.auth.workspace.is_none());
    }

    #[test]
    fn semantic_command_emits_effect_and_fact_does_not() {
        let mut state = crate::app::ApplicationState::empty();
        let dispatcher = crate::app::Dispatcher::new();
        dispatcher.dispatch_auth_command(&mut state, crate::app::AuthCommand::Login);
        assert_eq!(state.auth.operation, AuthOperation::LoggingIn);
        assert_eq!(dispatcher.take_effects(), vec![crate::app::Effect::Login]);
    }

    #[test]
    fn create_workspace_command_emits_backend_effect() {
        let mut state = crate::app::ApplicationState::empty();
        let dispatcher = crate::app::Dispatcher::new();
        let fields = SetupFields::default();

        dispatcher.dispatch_auth_command(
            &mut state,
            crate::app::AuthCommand::CreateWorkspace(fields.clone()),
        );

        assert_eq!(state.auth.screen, Screen::CreatingWorkspace);
        assert_eq!(
            dispatcher.take_effects(),
            vec![crate::app::Effect::CreateWorkspace(fields)]
        );
    }

    #[test]
    fn bootstrap_and_logout_facts_schedule_the_expected_transitions() {
        let mut state = crate::app::ApplicationState::empty();
        let bootstrap = crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(
                BootstrapState::authenticated_complete(),
            )),
        );
        assert_eq!(bootstrap, vec![crate::app::Effect::LoadWorkspace]);
        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::SessionExpired),
        );
        assert_eq!(state.auth.screen, Screen::Login);
        assert_eq!(state.auth.operation, AuthOperation::None);
    }

    #[test]
    fn workspace_creation_waits_for_complete_authenticated_bootstrap() {
        let mut state = crate::app::ApplicationState::empty();
        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(
                BootstrapState::workspace_required(),
            )),
        );
        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::WorkspaceLoaded(Box::new(WorkspaceView::empty()))),
        );
        assert_ne!(state.auth.screen, Screen::Workbench);
    }

    #[test]
    fn workspace_loaded_hydrates_the_active_workspace_state() {
        let mut state = crate::app::ApplicationState::empty();
        let mut view = WorkspaceView::empty();
        view.notes = vec![liroxnotes_shared::NoteSummary {
            path: "notes/welcome.md".into(),
            title: "Welcome".into(),
            labels: Vec::new(),
            links: Vec::new(),
            active: true,
        }];
        view.selected_note = view.notes[0].clone();
        view.selected_note_body = "# Welcome".into();

        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::WorkspaceLoaded(Box::new(view))),
        );

        assert_eq!(
            state.domain.selected_note.as_deref(),
            Some("notes/welcome.md")
        );
        assert_eq!(state.domain.document, "# Welcome");
    }

    #[test]
    fn queued_effects_advance_the_reactive_version_without_operation_state() {
        let mut state = crate::app::ApplicationState::empty();
        let dispatcher = crate::app::Dispatcher::new();
        dispatcher.dispatch_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(
                BootstrapState::authenticated_complete(),
            )),
        );
        assert_eq!(state.auth.operation, AuthOperation::None);
        assert_eq!(state.effect_version, 1);
        assert_eq!(
            dispatcher.take_effects(),
            vec![crate::app::Effect::LoadWorkspace]
        );
    }
}
