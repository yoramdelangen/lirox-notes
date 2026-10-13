use crate::{
    components::button::{Button, ButtonVariant},
    AppContext,
};
use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;
use serde::{Deserialize, Serialize};

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
    pub workspace_root: String,
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
            workspace_root: String::new(),
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
    pub name: String,
    pub repo_url: String,
    pub repository_path: String,
    pub branch: String,
    pub path: String,
    pub remote: bool,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub enum SetupStep {
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

impl Default for SetupFields {
    fn default() -> Self {
        Self {
            step: SetupStep::ChooseWorkspace,
            slug: String::new(),
            name: "My Workspace".into(),
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

#[component]
fn ExistingWorkspaceCard(workspace: ExistingWorkspace) -> Element {
    let context = use_context::<AppContext>();
    let state = context.state;
    let dispatcher = context.dispatcher;
    rsx! {
        button {
            r#type: "button",
            class: "onboarding-workspace-card",
            onclick: move |_| dispatch_auth(state, dispatcher.clone(), crate::app::AuthCommand::SelectExistingWorkspace(workspace.clone())),
            strong { "{workspace.workspace_name.as_deref().unwrap_or(\"Workspace\")}" }
            span { "{workspace.repository}" }
            span { "{workspace.branch} · {workspace.path}" }
        }
    }
}

#[component]
fn WorkspaceSetupForm(auth: AuthState) -> Element {
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let dispatcher = context.dispatcher;
    let operation = auth.operation.clone();
    let setup = auth.setup.clone();
    let step = setup.step;
    let content = match step {
        SetupStep::ChooseWorkspace => {
            let new_dispatcher = dispatcher.clone();
            let existing_dispatcher = dispatcher.clone();
            let load_dispatcher = dispatcher.clone();
            rsx! {
            h1 { "Hi {auth.setup.name}," }
            p { "Set up a workspace to start writing." }
            div { class: "onboarding-choice-grid",
                Button {
                    r#type: "button",
                    onclick: move |_| dispatch_auth(state, new_dispatcher.clone(), crate::app::AuthCommand::SetSetupStep(SetupStep::ConnectRepository)),
                    "New repository"
                }
                Button {
                    r#type: "button",
                    variant: ButtonVariant::Outline,
                    onclick: move |_| {
                        dispatch_auth(state, existing_dispatcher.clone(), crate::app::AuthCommand::SetSetupStep(SetupStep::ExistingWorkspace));
                        dispatch_auth(state, load_dispatcher.clone(), crate::app::AuthCommand::LoadExistingWorkspaces);
                    },
                    "Existing repository"
                }
            }
            }
        }
        SetupStep::ConnectRepository => {
            let back_dispatcher = dispatcher.clone();
            rsx! {
            h1 { "Setup workspace" }
            p { "Connect a new repository, then name the workspace." }
            form {
                onsubmit: move |event| {
                    event.prevent_default();
                    state.write().auth.setup.step = SetupStep::Finish;
                },
                label { r#for: "repo-url", "Repository URL" }
                input {
                    id: "repo-url",
                    name: "repo-url",
                    required: true,
                    value: "{setup.repo_url}",
                    oninput: move |event| state.write().auth.setup.repo_url = event.value()
                }
                label { r#for: "branch", "Branch" }
                input {
                    id: "branch",
                    name: "branch",
                    required: true,
                    value: "{setup.branch}",
                    oninput: move |event| state.write().auth.setup.branch = event.value()
                }
                Button { r#type: "submit", "Connect" }
            }
            Button {
                r#type: "button",
                variant: ButtonVariant::Ghost,
                onclick: move |_| dispatch_auth(state, back_dispatcher.clone(), crate::app::AuthCommand::SetSetupStep(SetupStep::ChooseWorkspace)),
                "Back"
            }
            }
        }
        SetupStep::ExistingWorkspace => {
            let back_dispatcher = dispatcher.clone();
            rsx! {
            h1 { "Setup existing workspace" }
            p { "Choose a workspace inside an existing repository. Repository roots cannot be reused." }
            if auth.existing_workspaces.is_empty() {
                p { class: "text-[var(--lirox-muted)]", "No reusable repository subpaths found." }
            }
            div { class: "onboarding-workspace-list", role: "list",
                for workspace in auth.existing_workspaces.iter() {
                    ExistingWorkspaceCard { workspace: workspace.clone() }
                }
            }
            Button {
                r#type: "button",
                variant: ButtonVariant::Ghost,
                onclick: move |_| dispatch_auth(state, back_dispatcher.clone(), crate::app::AuthCommand::SetSetupStep(SetupStep::ChooseWorkspace)),
                "Back"
            }
            }
        }
        SetupStep::Finish => {
            let submit_dispatcher = dispatcher.clone();
            let back_dispatcher = dispatcher.clone();
            rsx! {
            h1 { "Finish workspace" }
            p { "Confirm the workspace details before entering LiroxNotes." }
            form {
                onsubmit: move |event| {
                    event.prevent_default();
                    let fields = state.read().auth.setup.clone();
                    dispatch_auth(state, submit_dispatcher.clone(), crate::app::AuthCommand::CreateWorkspace(fields));
                },
                label { r#for: "workspace-name", "Workspace name" }
                input {
                    id: "workspace-name",
                    required: true,
                    value: "{setup.name}",
                    oninput: move |event| {
                        let name = event.value();
                        let mut state = state.write();
                        state.auth.setup.name = name.clone();
                        state.auth.setup.slug = slug_from_name(&name);
                    }
                }
                label { r#for: "workspace-path", "Path (optional)" }
                input {
                    id: "workspace-path",
                    value: "{setup.path}",
                    placeholder: "my-work",
                    oninput: move |event| state.write().auth.setup.path = event.value()
                }
                Button { r#type: "submit", disabled: operation != AuthOperation::None, "Save" }
            }
            Button {
                r#type: "button",
                variant: ButtonVariant::Ghost,
                onclick: move |_| dispatch_auth(state, back_dispatcher.clone(), crate::app::AuthCommand::SetSetupStep(if setup.remote { SetupStep::ExistingWorkspace } else { SetupStep::ConnectRepository })),
                "Back"
            }
            }
        }
    };
    rsx! {
        {content}
    }
}

#[component]
pub fn AuthShell() -> Element {
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let auth = state.read().auth.clone();
    let register = context.dispatcher.clone();
    let login = context.dispatcher.clone();
    let retry = context.dispatcher.clone();
    let failure = auth.failure.clone().unwrap_or_else(|| "Try again.".into());
    let auto_login = context.dispatcher.clone();
    let mut auto_login_attempted = use_signal(|| false);
    use_effect(move || {
        let should_check = {
            let state = state.read();
            matches!(state.auth.screen, Screen::RegisterPasskey | Screen::Login)
                && state.auth.operation == AuthOperation::None
                && !auto_login_attempted()
                && state
                    .auth
                    .bootstrap
                    .as_ref()
                    .is_some_and(|bootstrap| bootstrap.passkey_exists)
        };
        if should_check {
            auto_login_attempted.set(true);
            dispatch_auth(
                state,
                auto_login.clone(),
                crate::app::AuthCommand::AutoLogin,
            );
        }
    });
    let content = match auth.screen {
        Screen::Loading => {
            rsx! { h1 { "Welcome to LiroxNotes" } p { "Checking secure access..." } }
        }
        Screen::RegisterPasskey => {
            rsx! {
                h1 { "Secure access" }
                p { "Create a passkey to protect your notes." }
                label { r#for: "display-name", "Your name"
                    input {
                        id: "display-name",
                        required: true,
                        value: "{auth.setup.name}",
                        oninput: move |event| state.write().auth.setup.name = event.value()
                    }
                }
                input { class: "sr-only", autocomplete: "username webauthn", aria_label: "Use an existing passkey" }
                 Button { autofocus: true, disabled: auth.operation != AuthOperation::None, aria_label: "Create passkey", onclick: move |_| dispatch_auth(state, register.clone(), crate::app::AuthCommand::RegisterPasskey), "Create passkey" }
                 if auth.bootstrap.as_ref().is_some_and(|bootstrap| bootstrap.passkey_exists) {
                     Button { r#type: "button", variant: ButtonVariant::Outline, disabled: auth.operation != AuthOperation::None, onclick: move |_| dispatch_auth(state, login.clone(), crate::app::AuthCommand::Login), "Use existing passkey" }
                 }
            }
        }
        Screen::WorkspaceSetup => {
            rsx! { WorkspaceSetupForm { auth } }
        }
        Screen::CreatingWorkspace => {
            rsx! { h1 { "Creating workspace" } p { "Preparing your notes..." } }
        }
        Screen::Login => {
            rsx! { h1 { "Welcome back" } p { "Use your passkey to continue." } Button { autofocus: true, disabled: auth.operation != AuthOperation::None, aria_label: if auth.operation == AuthOperation::LoggingIn { "Signing in" } else { "Sign in with passkey" }, onclick: move |_| dispatch_auth(state, login.clone(), crate::app::AuthCommand::Login), if auth.operation == AuthOperation::LoggingIn { "Signing in..." } else { "Sign in with passkey" } } }
        }
        Screen::Failure => {
            rsx! { h1 { "Something went wrong" } p { "{failure}" } Button { onclick: move |_| dispatch_auth(state, retry.clone(), crate::app::AuthCommand::Retry), "Retry" } }
        }
        Screen::Workbench => rsx! {},
    };
    rsx! { main { id: "auth-shell", class: "grid min-h-screen place-items-center bg-[var(--lirox-bg)] p-6 text-[var(--lirox-fg)]", section { class: "w-full max-w-md space-y-4 rounded-xl border border-[var(--lirox-border)] bg-[var(--lirox-surface)] p-8", {content} } } }
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
    fn onboarding_starts_at_workspace_choice_after_registration() {
        let mut state = crate::app::ApplicationState::empty();
        crate::app::apply_event(
            &mut state,
            ApplicationEvent::Auth(AuthEvent::RegistrationSucceeded),
        );

        assert_eq!(state.auth.setup.step, SetupStep::ChooseWorkspace);
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
            ApplicationEvent::Auth(AuthEvent::WorkspaceLoaded(WorkspaceView::empty())),
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
            ApplicationEvent::Auth(AuthEvent::WorkspaceLoaded(view)),
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
