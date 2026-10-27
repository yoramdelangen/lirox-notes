use super::{dispatch_auth, slug_from_name, AuthOperation, AuthState, Screen, SetupStep};
use crate::{app::AuthCommand, AppContext};
use dioxus::prelude::*;

/// The frame every onboarding screen shares: a top line with back and the
/// step, a title, and one box whose legend names the step.
#[component]
fn OnboardingFrame(
    title: String,
    legend: String,
    #[props(default)] step: String,
    #[props(default)] on_back: Option<EventHandler<()>>,
    #[props(default)] greeting: bool,
    children: Element,
) -> Element {
    rsx! {
        div { class: "lx-onb",
            div { class: "lx-onb-top",
                if let Some(on_back) = on_back {
                    button { r#type: "button", onclick: move |_| on_back.call(()), "‹ back" }
                } else {
                    span { "lirox" }
                }
                span { "{step}" }
            }
            div { class: "lx-onb-body",
                if greeting {
                    h1 { class: "lx-onb-hi", "{title}" }
                } else {
                    h1 { class: "lx-onb-title", "{title}" }
                }
                div { class: "lx-box lx-onb-card",
                    div { class: "lx-legend lx-legend-strong", "{legend}" }
                    {children}
                }
            }
        }
    }
}

fn step_label(step: SetupStep) -> &'static str {
    match step {
        SetupStep::Name => "1/3",
        SetupStep::ChooseWorkspace
        | SetupStep::ConnectRepository
        | SetupStep::ExistingWorkspace => "2/3",
        SetupStep::Finish => "3/3",
    }
}

#[component]
fn WorkspaceSetupForm(auth: AuthState) -> Element {
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let dispatcher = context.dispatcher.clone();
    let mut picked = use_signal(|| 0usize);
    let operation = auth.operation.clone();
    let busy = operation != AuthOperation::None;
    let setup = auth.setup.clone();
    let step = setup.step;
    let greeting = format!("Hi {},", setup.display_name.trim());
    let adding = auth.workspace.is_some();

    let go = {
        let dispatcher = dispatcher.clone();
        move |step: SetupStep| {
            dispatch_auth(state, dispatcher.clone(), AuthCommand::SetSetupStep(step))
        }
    };
    let back: Option<EventHandler<()>> = {
        let go = go.clone();
        let cancel = context.clone();
        match step {
            SetupStep::Name => None,
            SetupStep::ChooseWorkspace if adding => Some(EventHandler::new(move |_| {
                crate::ui::actions::run(
                    &cancel,
                    "workspace.cancel_setup",
                    crate::command::CommandArgs::None,
                )
            })),
            SetupStep::ChooseWorkspace => Some(EventHandler::new(move |_| go(SetupStep::Name))),
            SetupStep::ConnectRepository | SetupStep::ExistingWorkspace => {
                Some(EventHandler::new(move |_| go(SetupStep::ChooseWorkspace)))
            }
            SetupStep::Finish => {
                let previous = if setup.remote {
                    SetupStep::ExistingWorkspace
                } else {
                    SetupStep::ConnectRepository
                };
                Some(EventHandler::new(move |_| go(previous)))
            }
        }
    };

    match step {
        SetupStep::Name => {
            let next = go.clone();
            rsx! {
                OnboardingFrame { title: "Lirox Notes", legend: "Onboarding", step: step_label(step), on_back: back,
                    form {
                        class: "flex flex-col gap-[14px]",
                        onsubmit: move |event| {
                            event.prevent_default();
                            next(SetupStep::ChooseWorkspace);
                        },
                        label { class: "lx-field",
                            span { class: "lx-field-label", "Your name" }
                            input {
                                class: "lx-input",
                                required: true,
                                autofocus: true,
                                autocomplete: "name",
                                placeholder: "My name",
                                value: "{setup.display_name}",
                                oninput: move |event: FormEvent| state.write().auth.setup.display_name = event.value(),
                            }
                        }
                        button { class: "lx-btn-primary", r#type: "submit", "Continue" }
                    }
                }
            }
        }
        SetupStep::ChooseWorkspace => {
            let new_repo = go.clone();
            let existing = go.clone();
            let keys = go.clone();
            let load = dispatcher.clone();
            let load_keys = dispatcher.clone();
            rsx! {
                OnboardingFrame { title: greeting, greeting: true, legend: "Setup Workspace", step: step_label(step), on_back: back,
                    p { "Create a new workspace, or connect one that already exists?" }
                    div {
                        class: "lx-onb-choices",
                        tabindex: "-1",
                        onmounted: move |event| async move {
                            let _ = event.data().set_focus(true).await;
                        },
                        onkeydown: move |event: KeyboardEvent| match event.data().key().to_string().as_str() {
                            "1" => keys(SetupStep::ConnectRepository),
                            "2" => {
                                keys(SetupStep::ExistingWorkspace);
                                dispatch_auth(state, load_keys.clone(), AuthCommand::LoadExistingWorkspaces);
                            }
                            _ => {}
                        },
                        button {
                            class: "lx-btn",
                            r#type: "button",
                            onclick: move |_| new_repo(SetupStep::ConnectRepository),
                            span { class: "lx-key", "1" }
                            "New repo"
                        }
                        button {
                            class: "lx-btn",
                            r#type: "button",
                            onclick: move |_| {
                                existing(SetupStep::ExistingWorkspace);
                                dispatch_auth(state, load.clone(), AuthCommand::LoadExistingWorkspaces);
                            },
                            span { class: "lx-key", "2" }
                            "Existing"
                        }
                    }
                }
            }
        }
        SetupStep::ConnectRepository => {
            let inspect = dispatcher.clone();
            rsx! {
                OnboardingFrame { title: greeting, greeting: true, legend: "Setup Workspace ─ Connect", step: step_label(step), on_back: back,
                    form {
                        class: "flex flex-col gap-[14px]",
                        onsubmit: move |event| {
                            event.prevent_default();
                            let setup = state.read().auth.setup.clone();
                            dispatch_auth(
                                state,
                                inspect.clone(),
                                AuthCommand::InspectRepository {
                                    repo_url: setup.repo_url,
                                    branch: setup.branch,
                                },
                            );
                        },
                        p { "Uses your system Git user and public key." }
                        label { class: "lx-field",
                            span { class: "lx-field-label", "Repository URL" }
                            input {
                                class: "lx-input",
                                style: "font-size: 12.5px",
                                name: "repo-url",
                                required: true,
                                autofocus: true,
                                autocomplete: "off",
                                spellcheck: "false",
                                placeholder: "git@github.com:you/notes.git",
                                value: "{setup.repo_url}",
                                oninput: move |event: FormEvent| state.write().auth.setup.repo_url = event.value(),
                            }
                        }
                        label { class: "lx-field",
                            span { class: "lx-field-label", "Branch" }
                            input {
                                class: "lx-input",
                                style: "font-size: 12.5px",
                                name: "branch",
                                required: true,
                                autocomplete: "off",
                                placeholder: "e.g. main",
                                value: "{setup.branch}",
                                oninput: move |event: FormEvent| state.write().auth.setup.branch = event.value(),
                            }
                        }
                        if let Some(error) = auth.failure.as_deref() {
                            div { class: "lx-error", role: "alert", "! {error}" }
                        }
                        button {
                            class: "lx-btn-primary",
                            r#type: "submit",
                            disabled: busy,
                            if operation == AuthOperation::InspectingRepository { "connecting…" } else { "Connect" }
                        }
                    }
                }
            }
        }
        SetupStep::ExistingWorkspace => {
            let select = dispatcher.clone();
            let workspaces = auth.existing_workspaces.clone();
            let chosen = workspaces.get(picked()).cloned();
            rsx! {
                OnboardingFrame { title: greeting, greeting: true, legend: "Setup Existing Workspace", step: step_label(step), on_back: back,
                    p { "Available workspaces to reuse:" }
                    if workspaces.is_empty() {
                        div { class: "lx-ws-card", style: "border-style: dashed; color: var(--faint); cursor: default",
                            "No reusable repository subpaths found."
                            span { style: "margin-top: 4px", "└ only workspaces with a subpath can share a repo" }
                        }
                    }
                    for (index, workspace) in workspaces.iter().enumerate() {
                        button {
                            key: "{workspace.repository}:{workspace.path}",
                            r#type: "button",
                            class: if index == picked() { "lx-ws-card is-picked" } else { "lx-ws-card" },
                            aria_pressed: "{index == picked()}",
                            onclick: move |_| picked.set(index),
                            strong {
                                span { if index == picked() { "(•)" } else { "( )" } }
                                "{workspace.workspace_name.as_deref().unwrap_or(\"Workspace\")}"
                            }
                            span { "remote {workspace.repository}" }
                            span { "branch {workspace.branch}  ·  path {workspace.path}" }
                        }
                    }
                    button {
                        class: "lx-btn-primary",
                        r#type: "button",
                        disabled: chosen.is_none(),
                        onclick: move |_| {
                            if let Some(workspace) = chosen.clone() {
                                dispatch_auth(state, select.clone(), AuthCommand::SelectExistingWorkspace(workspace));
                            }
                        },
                        "Continue"
                    }
                }
            }
        }
        SetupStep::Finish => {
            let submit = dispatcher.clone();
            let remote = if setup.remote {
                setup.repository_path.clone()
            } else {
                setup.repo_url.clone()
            };
            let source = if setup.remote {
                "existing workspace"
            } else {
                "repository"
            };
            let target = if setup.path.trim().is_empty() {
                "{repo-root}/".to_string()
            } else {
                format!("{{repo-root}}/{}/", setup.path.trim().trim_matches('/'))
            };
            rsx! {
                OnboardingFrame { title: greeting, greeting: true, legend: "Setup Workspace ─ Finish", step: step_label(step), on_back: back,
                    form {
                        class: "flex flex-col gap-3",
                        onsubmit: move |event| {
                            event.prevent_default();
                            let fields = state.read().auth.setup.clone();
                            dispatch_auth(state, submit.clone(), AuthCommand::CreateWorkspace(fields));
                        },
                        div { class: "lx-hint", "prefilled from {source}" }
                        div { class: "flex flex-col gap-1 text-[11.5px]",
                            span { class: "lx-field-label", "Repository" }
                            span { class: "break-all", "remote {remote}" }
                            span { "branch {setup.branch}" }
                        }
                        div { class: "lx-rule" }
                        label { class: "lx-field",
                            span { class: "lx-field-label", "Workspace name" }
                            input {
                                class: "lx-input",
                                required: true,
                                autofocus: true,
                                autocomplete: "off",
                                value: "{setup.name}",
                                oninput: move |event: FormEvent| {
                                    let name = event.value();
                                    let mut state = state.write();
                                    state.auth.setup.slug = slug_from_name(&name);
                                    state.auth.setup.name = name;
                                },
                            }
                            span { class: "lx-hint", "slug: "
                                b { if setup.slug.is_empty() { "—" } else { "{setup.slug}" } }
                            }
                        }
                        label { class: "lx-field",
                            span { class: "lx-field-label", "Path (optional)" }
                            input {
                                class: "lx-input",
                                autocomplete: "off",
                                placeholder: "my-work",
                                value: "{setup.path}",
                                oninput: move |event: FormEvent| state.write().auth.setup.path = event.value(),
                            }
                            span { class: "lx-hint", "→ {target}" }
                        }
                        if let Some(error) = auth.failure.as_deref() {
                            div { class: "lx-error", role: "alert", "! {error}" }
                        }
                        button { class: "lx-btn-primary", r#type: "submit", disabled: busy, "Save" }
                    }
                }
            }
        }
    }
}

#[component]
pub fn AuthShell() -> Element {
    let context = use_context::<AppContext>();
    let mut state = context.state;
    let auth = state.read().auth.clone();
    let register = context.dispatcher.clone();
    let existing = context.dispatcher.clone();
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
            dispatch_auth(state, auto_login.clone(), AuthCommand::AutoLogin);
        }
    });
    let busy = auth.operation != AuthOperation::None;
    let content = match auth.screen {
        Screen::Loading => rsx! {
            OnboardingFrame { title: "Lirox Notes", legend: "Lirox",
                div { class: "lx-loading", aria_live: "polite", "checking secure access" }
            }
        },
        Screen::RegisterPasskey => {
            let passkey_exists = auth
                .bootstrap
                .as_ref()
                .is_some_and(|bootstrap| bootstrap.passkey_exists);
            rsx! {
                OnboardingFrame { title: "Lirox Notes", legend: "Onboarding", step: "1/3",
                    form {
                        class: "flex flex-col gap-[14px]",
                        onsubmit: move |event| {
                            event.prevent_default();
                            dispatch_auth(state, register.clone(), AuthCommand::RegisterPasskey);
                        },
                        label { class: "lx-field",
                            span { class: "lx-field-label", "Your name" }
                            input {
                                class: "lx-input",
                                style: "font-size: 14px",
                                required: true,
                                autofocus: true,
                                autocomplete: "name",
                                placeholder: "My name",
                                value: "{auth.setup.display_name}",
                                oninput: move |event: FormEvent| state.write().auth.setup.display_name = event.value(),
                            }
                        }
                        input { class: "sr-only", autocomplete: "username webauthn", aria_label: "Use an existing passkey", tabindex: "-1" }
                        button {
                            class: "lx-btn-primary",
                            r#type: "submit",
                            disabled: busy || auth.setup.display_name.trim().is_empty(),
                            if auth.operation == AuthOperation::Registering { "waiting for passkey…" } else { "Create Passkey" }
                        }
                        if passkey_exists {
                            button {
                                class: "lx-btn",
                                r#type: "button",
                                disabled: busy,
                                onclick: move |_| dispatch_auth(state, existing.clone(), AuthCommand::Login),
                                "Use existing passkey"
                            }
                        }
                        div { class: "lx-hint", "Your browser will ask you to confirm this passkey." }
                    }
                }
            }
        }
        Screen::WorkspaceSetup => rsx! { WorkspaceSetupForm { auth } },
        Screen::CreatingWorkspace => rsx! {
            OnboardingFrame { title: format!("Hi {},", auth.setup.display_name.trim()), greeting: true, legend: "Setup Workspace ─ Finish", step: "3/3",
                div { class: "lx-loading", aria_live: "polite", "cloning…" }
            }
        },
        Screen::Login => rsx! {
            OnboardingFrame { title: "Lirox Notes", legend: "Welcome back",
                p { "Use your passkey to return to your notes." }
                button {
                    class: "lx-btn-primary",
                    r#type: "button",
                    autofocus: true,
                    disabled: busy,
                    onclick: move |_| dispatch_auth(state, login.clone(), AuthCommand::Login),
                    if auth.operation == AuthOperation::LoggingIn { "waiting for passkey…" } else { "Sign in with passkey" }
                }
                div { class: "lx-hint", "Your browser will ask you to confirm this passkey." }
            }
        },
        Screen::Failure => rsx! {
            OnboardingFrame { title: "Lirox Notes", legend: "Something went wrong",
                div { class: "lx-error", role: "alert", "! {failure}" }
                button {
                    class: "lx-btn-primary",
                    r#type: "button",
                    onclick: move |_| dispatch_auth(state, retry.clone(), AuthCommand::Retry),
                    "Try again"
                }
            }
        },
        Screen::Workbench => rsx! {},
    };
    rsx! {
        main { id: "auth-shell", class: "lx-root",
            {content}
        }
    }
}
