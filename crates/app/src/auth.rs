use crate::{
    app::{ApplicationEvent, AuthEvent},
    AppContext,
};
use dioxus::prelude::*;
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
    Welcome,
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

#[derive(Clone, Debug, PartialEq, Eq)]
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

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AuthState {
    pub bootstrap: Option<BootstrapState>,
    pub screen: Screen,
    pub operation: AuthOperation,
    pub failure: Option<String>,
    pub setup: SetupFields,
}

impl Default for AuthState {
    fn default() -> Self {
        Self {
            bootstrap: None,
            screen: Screen::Loading,
            operation: AuthOperation::None,
            failure: None,
            setup: SetupFields::default(),
        }
    }
}

pub fn screen_for(bootstrap: &BootstrapState) -> Screen {
    if !bootstrap.installed || bootstrap.onboarding == OnboardingStatus::NotStarted {
        return Screen::RegisterPasskey;
    }
    if bootstrap.onboarding == OnboardingStatus::WorkspaceRequired {
        return Screen::WorkspaceSetup;
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
            rsx! { h1 { "Secure access" } p { "Create a passkey to protect your notes." } button { onclick: move |_| register.dispatch_event(&mut state.write(), ApplicationEvent::Auth(AuthEvent::RegisterPasskey)), "Create passkey" } }
        }
        Screen::WorkspaceSetup => {
            rsx! { h1 { "Passkey ready" } p { "Choose where your notes workspace should live." } button { onclick: move |_| create.dispatch_event(&mut state.write(), ApplicationEvent::Auth(AuthEvent::CreateWorkspace(SetupFields::default()))), "Create workspace" } }
        }
        Screen::CreatingWorkspace => {
            rsx! { h1 { "Creating workspace" } p { "Preparing your notes..." } }
        }
        Screen::Login => {
            rsx! { h1 { "Welcome back" } p { "Use your passkey to continue." } button { onclick: move |_| login.dispatch_event(&mut state.write(), ApplicationEvent::Auth(AuthEvent::Login)), "Sign in with passkey" } }
        }
        Screen::Failure => {
            rsx! { h1 { "Something went wrong" } p { "{failure}" } button { onclick: move |_| retry.dispatch_event(&mut state.write(), ApplicationEvent::Auth(AuthEvent::Retry)), "Retry" } }
        }
        Screen::Workbench => rsx! {},
        Screen::Welcome => rsx! { h1 { "Welcome to LiroxNotes" } },
    };
    rsx! { main { id: "auth-shell", class: "grid min-h-screen place-items-center bg-[var(--lirox-bg)] p-6 text-[var(--lirox-fg)]", section { class: "w-full max-w-md space-y-4 rounded-xl border border-[var(--lirox-border)] bg-[var(--lirox-panel)] p-8", {content} } } }
}

#[cfg(test)]
mod tests {
    use super::*;

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
}
