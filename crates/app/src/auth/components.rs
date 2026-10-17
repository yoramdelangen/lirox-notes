use super::{
    dispatch_auth, slug_from_name, AuthOperation, AuthState, ExistingWorkspace, Screen, SetupStep,
};
use crate::{
    components::{
        button::{Button, ButtonVariant},
        input::Input,
    },
    AppContext,
};
use dioxus::prelude::*;

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
        SetupStep::Name => {
            let name_dispatcher = dispatcher.clone();
            rsx! {
                h1 { "What should we call you?" }
                p { "Your name is used to personalize LiroxNotes." }
                label { r#for: "display-name", "Your name"
                    Input {
                        id: "display-name",
                        required: true,
                        value: "{setup.name}",
                        oninput: move |event: FormEvent| state.write().auth.setup.name = event.value()
                    }
                }
                form {
                    onsubmit: move |event| {
                        event.prevent_default();
                        dispatch_auth(state, name_dispatcher.clone(), crate::app::AuthCommand::SetSetupStep(SetupStep::ChooseWorkspace));
                    },
                    Button { button_type: "submit", "Continue" }
                }
            }
        }
        SetupStep::ChooseWorkspace => {
            let new_dispatcher = dispatcher.clone();
            let existing_dispatcher = dispatcher.clone();
            let load_dispatcher = dispatcher.clone();
            rsx! {
            h1 { "Hi {auth.setup.name}," }
            p { "Set up a workspace to start writing." }
            div { class: "onboarding-choice-grid",
                Button {
                    button_type: "button",
                    onclick: move |_| dispatch_auth(state, new_dispatcher.clone(), crate::app::AuthCommand::SetSetupStep(SetupStep::ConnectRepository)),
                    "New repository"
                }
                Button {
                    button_type: "button",
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
                Input {
                    id: "repo-url",
                    name: "repo-url",
                    required: true,
                    value: "{setup.repo_url}",
                    oninput: move |event: FormEvent| state.write().auth.setup.repo_url = event.value()
                }
                label { r#for: "branch", "Branch" }
                Input {
                    id: "branch",
                    name: "branch",
                    required: true,
                    value: "{setup.branch}",
                    oninput: move |event: FormEvent| state.write().auth.setup.branch = event.value()
                }
                Button { button_type: "submit", "Connect" }
            }
            Button {
                button_type: "button",
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
                button_type: "button",
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
                Input {
                    id: "workspace-name",
                    required: true,
                    value: "{setup.name}",
                    oninput: move |event: FormEvent| {
                        let name = event.value();
                        let mut state = state.write();
                        state.auth.setup.name = name.clone();
                        state.auth.setup.slug = slug_from_name(&name);
                    }
                }
                label { r#for: "workspace-path", "Path (optional)" }
                Input {
                    id: "workspace-path",
                    value: "{setup.path}",
                    placeholder: "my-work",
                    oninput: move |event: FormEvent| state.write().auth.setup.path = event.value()
                }
                Button { button_type: "submit", disabled: operation != AuthOperation::None, "Save" }
            }
            Button {
                button_type: "button",
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
            rsx! {
                div { class: "auth-heading",
                    h1 { "Welcome to LiroxNotes" }
                    p { "Checking secure access..." }
                }
                div { class: "auth-loading", aria_live: "polite",
                    span { class: "auth-loading-dot" }
                    "Preparing your secure workspace"
                }
            }
        }
        Screen::RegisterPasskey => {
            rsx! {
                div { class: "auth-heading",
                    h1 { "Secure access" }
                    p { "Create a passkey to keep your notes private. No password to remember." }
                }
                div { class: "auth-step", "Step 1 of 2" }
                div { class: "auth-field",
                    label { r#for: "display-name", "Your name"
                        Input {
                            id: "display-name",
                            required: true,
                            placeholder: "e.g. Alex Morgan",
                            value: "{auth.setup.name}",
                            oninput: move |event: FormEvent| state.write().auth.setup.name = event.value()
                        }
                    }
                }
                Input { class: "sr-only", autocomplete: "username webauthn", aria_label: "Use an existing passkey" }
                div { class: "auth-actions",
                    Button { autofocus: true, disabled: auth.operation != AuthOperation::None || auth.setup.name.trim().is_empty(), aria_label: if auth.operation == AuthOperation::Registering { "Creating passkey" } else { "Create passkey" }, onclick: move |_| dispatch_auth(state, register.clone(), crate::app::AuthCommand::RegisterPasskey), if auth.operation == AuthOperation::Registering { "Creating passkey..." } else { "Create passkey" } }
                    if auth.bootstrap.as_ref().is_some_and(|bootstrap| bootstrap.passkey_exists) {
                    Button { button_type: "button", variant: ButtonVariant::Outline, disabled: auth.operation != AuthOperation::None, onclick: move |_| dispatch_auth(state, login.clone(), crate::app::AuthCommand::Login), "Use existing passkey" }
                    }
                }
                p { class: "auth-help", "Your browser will ask you to confirm this passkey." }
            }
        }
        Screen::WorkspaceSetup => {
            rsx! { WorkspaceSetupForm { auth } }
        }
        Screen::CreatingWorkspace => {
            rsx! {
                div { class: "auth-heading",
                    h1 { "Creating workspace" }
                    p { "Preparing your notes..." }
                }
                div { class: "auth-loading", aria_live: "polite",
                    span { class: "auth-loading-dot" }
                    "This usually takes a moment"
                }
            }
        }
        Screen::Login => {
            rsx! {
                div { class: "auth-heading",
                    h1 { "Welcome back" }
                    p { "Use your passkey to return to your notes." }
                }
                div { class: "auth-actions",
                    Button { autofocus: true, disabled: auth.operation != AuthOperation::None, aria_label: if auth.operation == AuthOperation::LoggingIn { "Signing in" } else { "Sign in with passkey" }, onclick: move |_| dispatch_auth(state, login.clone(), crate::app::AuthCommand::Login), if auth.operation == AuthOperation::LoggingIn { "Signing in..." } else { "Sign in with passkey" } }
                }
                p { class: "auth-help", "Your browser will ask you to confirm this passkey." }
            }
        }
        Screen::Failure => {
            rsx! {
                div { class: "auth-heading",
                    h1 { "Something went wrong" }
                    p { "{failure}" }
                }
                div { class: "auth-actions",
                    Button { onclick: move |_| dispatch_auth(state, retry.clone(), crate::app::AuthCommand::Retry), "Try again" }
                }
            }
        }
        Screen::Workbench => rsx! {},
    };
    rsx! {
        main { id: "auth-shell", class: "grid min-h-screen place-items-center bg-[var(--lirox-bg)] p-6 text-[var(--lirox-fg)]",
            section { class: "auth-card w-full max-w-md",
                header { class: "auth-topline",
                    strong { "LIROXNOTES" }
                    span { "PRIVATE BY DEFAULT" }
                }
                {content}
            }
        }
    }
}
