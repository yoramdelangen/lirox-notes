use crate::AppContext;
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
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct SetupFields {
    pub slug: String,
    pub name: String,
    pub repo_url: String,
    pub branch: String,
    pub remote: bool,
}

impl Default for SetupFields {
    fn default() -> Self {
        Self {
            slug: String::new(),
            name: "My Workspace".into(),
            repo_url: String::new(),
            branch: "main".into(),
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
            workspace: None,
        }
    }
}

pub fn screen_for(bootstrap: &BootstrapState) -> Screen {
    if !bootstrap.installed || bootstrap.onboarding == OnboardingStatus::NotStarted {
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

#[component]
pub fn AuthShell() -> Element {
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let auth = state.read().auth.clone();
    let register = context.dispatcher.clone();
    let create = context.dispatcher.clone();
    let login = context.dispatcher.clone();
    let retry = context.dispatcher.clone();
    let failure = auth.failure.clone().unwrap_or_else(|| "Try again.".into());
    let content = match auth.screen {
        Screen::Loading => {
            rsx! { h1 { "Welcome to LiroxNotes" } p { "Checking secure access..." } }
        }
        Screen::RegisterPasskey => {
            rsx! { h1 { "Secure access" } p { "Create a passkey to protect your notes." } button { autofocus: true, disabled: auth.operation != AuthOperation::None, aria_label: "Create passkey", onclick: move |_| register.dispatch_auth_command(&mut state.write(), crate::app::AuthCommand::RegisterPasskey), "Create passkey" } }
        }
        Screen::WorkspaceSetup => {
            rsx! { h1 { "Passkey ready" } p { "Choose where your notes workspace should live." } form { onsubmit: move |event| { event.prevent_default(); let fields = state.read().auth.setup.clone(); create.dispatch_auth_command(&mut state.write(), crate::app::AuthCommand::CreateWorkspace(fields)); }, fieldset { legend { "Repository source" } label { r#for: "repo-new", input { id: "repo-new", r#type: "radio", name: "repo_mode", checked: !auth.setup.remote, onchange: move |_| state.write().auth.setup.remote = false } " Create new local repository" } label { r#for: "repo-remote", input { id: "repo-remote", r#type: "radio", name: "repo_mode", checked: auth.setup.remote, onchange: move |_| state.write().auth.setup.remote = true } " Use existing remote" } } label { r#for: "workspace-slug", "Workspace slug", input { id: "workspace-slug", autofocus: true, required: true, value: "{auth.setup.slug}", oninput: move |event| state.write().auth.setup.slug = event.value() } } label { r#for: "workspace-name", "Workspace name", input { id: "workspace-name", required: true, value: "{auth.setup.name}", oninput: move |event| state.write().auth.setup.name = event.value() } } label { r#for: "repo-url", "Git remote URL", input { id: "repo-url", r#type: "url", required: auth.setup.remote, value: "{auth.setup.repo_url}", oninput: move |event| state.write().auth.setup.repo_url = event.value() } } label { r#for: "branch", "Branch", input { id: "branch", required: true, value: "{auth.setup.branch}", oninput: move |event| state.write().auth.setup.branch = event.value() } } button { r#type: "submit", disabled: auth.operation != AuthOperation::None, aria_label: if auth.operation == AuthOperation::CreatingWorkspace { "Creating workspace" } else { "Create workspace" }, if auth.operation == AuthOperation::CreatingWorkspace { "Creating workspace..." } else { "Create workspace" } } } }
        }
        Screen::CreatingWorkspace => {
            rsx! { h1 { "Creating workspace" } p { "Preparing your notes..." } }
        }
        Screen::Login => {
            rsx! { h1 { "Welcome back" } p { "Use your passkey to continue." } button { autofocus: true, disabled: auth.operation != AuthOperation::None, aria_label: if auth.operation == AuthOperation::LoggingIn { "Signing in" } else { "Sign in with passkey" }, onclick: move |_| login.dispatch_auth_command(&mut state.write(), crate::app::AuthCommand::Login), if auth.operation == AuthOperation::LoggingIn { "Signing in..." } else { "Sign in with passkey" } } }
        }
        Screen::Failure => {
            rsx! { h1 { "Something went wrong" } p { "{failure}" } button { onclick: move |_| retry.dispatch_auth_command(&mut state.write(), crate::app::AuthCommand::Retry), "Retry" } }
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
