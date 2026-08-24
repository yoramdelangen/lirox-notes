use dioxus::prelude::*;
use liroxnotes_shared::{LabelSummary, NoteSummary, TreeEntry, TreeKind, WorkspaceView, APP_NAME};
use serde::Deserialize;
use std::collections::BTreeSet;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::{closure::Closure, JsCast, JsValue};
#[cfg(target_arch = "wasm32")]
use wasm_bindgen_futures::{spawn_local, JsFuture};

const APP_CSS: Asset = asset!("/assets/app.css");
const EDITOR_JS: Asset = asset!("/assets/editor.js");
const EDITOR_BRIDGE_JS: Asset = asset!("/assets/editor-bridge.js");

#[derive(Clone, PartialEq, Eq, Debug)]
#[cfg_attr(not(target_arch = "wasm32"), allow(dead_code))]
pub enum FrontendState {
    Loading,
    Install,
    Login,
    Setup,
    Ready,
}

#[cfg_attr(not(target_arch = "wasm32"), allow(dead_code))]
#[derive(Deserialize)]
struct AuthSession {
    installed: bool,
    authenticated: bool,
    user: String,
    auth_mode: String,
    workspace_required: bool,
    workspace_root: String,
}

#[cfg_attr(not(target_arch = "wasm32"), allow(dead_code))]
fn frontend_state_from_auth(session: &AuthSession) -> FrontendState {
    frontend_state_from_auth_flags(
        session.installed,
        session.authenticated,
        session.workspace_required,
    )
}

pub fn frontend_state_from_auth_flags(
    installed: bool,
    authenticated: bool,
    workspace_required: bool,
) -> FrontendState {
    if !installed {
        FrontendState::Install
    } else if !authenticated {
        FrontendState::Login
    } else if workspace_required {
        FrontendState::Setup
    } else {
        FrontendState::Ready
    }
}

#[allow(dead_code)]
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum FocusTarget {
    Sidebar,
    Editor,
}

#[allow(dead_code)]
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum SidebarMode {
    Tree,
    LabelsNotes,
    Files,
}

#[allow(dead_code)]
impl SidebarMode {
    fn next(self) -> Self {
        match self {
            Self::Tree => Self::LabelsNotes,
            Self::LabelsNotes => Self::Files,
            Self::Files => Self::Tree,
        }
    }
}

#[allow(dead_code)]
#[derive(Clone, PartialEq, Eq)]
pub enum AppAction {
    FocusSidebar,
    FocusEditor,
    CycleSidebarMode,
    SetSidebarMode(SidebarMode),
    SetBrowserDir(String),
    GoUpDirectory,
}

#[allow(dead_code)]
#[cfg(target_arch = "wasm32")]
impl AppAction {
    fn from_str(action: &str) -> Option<Self> {
        match action {
            "focus-sidebar" => Some(Self::FocusSidebar),
            "focus-editor" => Some(Self::FocusEditor),
            "cycle-sidebar-mode" => Some(Self::CycleSidebarMode),
            _ => None,
        }
    }
}

#[component]
pub fn App() -> Element {
    let frontend_state = use_signal(|| {
        if cfg!(target_arch = "wasm32") {
            FrontendState::Loading
        } else {
            FrontendState::Ready
        }
    });
    let mut login_user = use_signal(|| "local".to_string());
    let mut login_password = use_signal(String::new);
    let mut auth_mode = use_signal(|| "passwordless".to_string());
    let mut repo_mode = use_signal(|| "new".to_string());
    let mut workspace_slug = use_signal(String::new);
    let mut workspace_slug_manual = use_signal(|| false);
    let mut workspace_name = use_signal(|| "My Workspace".to_string());
    let mut workspace_path = use_signal(default_workspace_path);
    let mut repo_url = use_signal(String::new);
    let mut branch = use_signal(|| "main".to_string());
    let status_message = use_signal(String::new);

    use_effect(move || {
        #[cfg(target_arch = "wasm32")]
        {
            let mut frontend_state = frontend_state;
            let mut login_user = login_user;
            let mut auth_mode = auth_mode;
            let mut workspace_path = workspace_path;
            let mut status_message = status_message;
            spawn_local(async move {
                if let Some(session) = fetch_auth_session().await {
                    login_user.set(session.user.clone());
                    auth_mode.set(session.auth_mode.clone());
                    workspace_path.set(session.workspace_root.clone());
                    frontend_state.set(frontend_state_from_auth(&session));
                } else {
                    frontend_state.set(FrontendState::Login);
                }
                status_message.set(String::new());
            });
        }
    });

    let state = frontend_state.read().clone();
    let clone_target = workspace_clone_target(&workspace_path.read(), &workspace_slug.read());

    rsx! {
        WorkflowShell {
            state,
            message: status_message.read().clone(),
            user: login_user.read().clone(),
            password: login_password.read().clone(),
            auth_mode: auth_mode.read().clone(),
            repo_mode: repo_mode.read().clone(),
            workspace_slug: workspace_slug.read().clone(),
            workspace_name: workspace_name.read().clone(),
            workspace_path: workspace_path.read().clone(),
            clone_target,
            repo_url: repo_url.read().clone(),
            branch: branch.read().clone(),
            on_install: move |_| {
                #[cfg(target_arch = "wasm32")]
                {
                    let user = login_user.read().clone();
                    let password = login_password.read().clone();
                    let mode = auth_mode.read().clone();
                    let root = workspace_path.read().clone();
                    let mut frontend_state = frontend_state;
                    let mut login_user = login_user;
                    let mut auth_mode = auth_mode;
                    let mut workspace_path = workspace_path;
                    let mut status_message = status_message;
                    spawn_local(async move {
                        status_message.set("Installing...".to_string());
                        if let Some(session) = api_install(&root, &user, &mode, &password).await {
                            login_user.set(session.user.clone());
                            auth_mode.set(session.auth_mode.clone());
                            workspace_path.set(session.workspace_root.clone());
                            frontend_state.set(frontend_state_from_auth(&session));
                            status_message.set(String::new());
                        } else {
                            status_message.set("Installation failed. Is the gateway running on port 3000?".to_string());
                        }
                    });
                }
            },
            on_user: move |value: String| login_user.set(value),
            on_password: move |value: String| login_password.set(value),
            on_auth_mode: move |value: String| auth_mode.set(value),
            on_login: move |_| {
                #[cfg(target_arch = "wasm32")]
                {
                    let user = login_user.read().clone();
                    let password = login_password.read().clone();
                    let mut frontend_state = frontend_state;
                    let mut login_user = login_user;
                    let mut auth_mode = auth_mode;
                    let mut workspace_path = workspace_path;
                    let mut status_message = status_message;
                    spawn_local(async move {
                        status_message.set("Logging in...".to_string());
                        if let Some(session) = api_login(&user, &password).await {
                            login_user.set(session.user.clone());
                            auth_mode.set(session.auth_mode.clone());
                            workspace_path.set(session.workspace_root.clone());
                            frontend_state.set(frontend_state_from_auth(&session));
                            status_message.set(String::new());
                        } else {
                            status_message.set("Login failed. Is the gateway running on port 3000?".to_string());
                        }
                    });
                }
            },
            on_repo_mode: move |value: String| repo_mode.set(value),
            on_workspace_slug: move |value: String| {
                workspace_slug_manual.set(true);
                workspace_slug.set(value);
            },
            on_workspace_name: move |value: String| workspace_name.set(value),
            on_workspace_path: move |value: String| workspace_path.set(value),
            on_repo_url: move |value: String| {
                if repo_mode.read().as_str() == "remote" && !*workspace_slug_manual.read() {
                    workspace_slug.set(workspace_slug_from_repo_url(&value).unwrap_or_default());
                }
                repo_url.set(value);
            },
            on_branch: move |value: String| branch.set(value),
            on_setup: move |_| {
                #[cfg(target_arch = "wasm32")]
                {
                    let repo_mode_value = repo_mode.read().clone();
                    let slug = workspace_slug.read().clone();
                    let name = workspace_name.read().clone();
                    let repo = repo_url.read().clone();
                    let branch_value = branch.read().clone();
                    let mut frontend_state = frontend_state;
                    let mut workspace_path = workspace_path;
                    let mut status_message = status_message;
                    spawn_local(async move {
                        status_message.set("Creating workspace...".to_string());
                        if api_setup_workspace(&repo_mode_value, &slug, &name, &repo, &branch_value).await {
                            if let Some(session) = fetch_auth_session().await {
                                workspace_path.set(session.workspace_root.clone());
                                frontend_state.set(frontend_state_from_auth(&session));
                            }
                            status_message.set(String::new());
                        } else {
                            status_message.set("Workspace setup failed. Check the path and Git remote.".to_string());
                        }
                    });
                }
            }
        }
    }
}

#[component]
fn WorkflowShell(
    state: FrontendState,
    message: String,
    user: String,
    password: String,
    auth_mode: String,
    repo_mode: String,
    workspace_slug: String,
    workspace_name: String,
    workspace_path: String,
    clone_target: String,
    repo_url: String,
    branch: String,
    on_install: EventHandler<()>,
    on_user: EventHandler<String>,
    on_password: EventHandler<String>,
    on_auth_mode: EventHandler<String>,
    on_repo_mode: EventHandler<String>,
    on_workspace_slug: EventHandler<String>,
    on_workspace_name: EventHandler<String>,
    on_login: EventHandler<()>,
    on_workspace_path: EventHandler<String>,
    on_repo_url: EventHandler<String>,
    on_branch: EventHandler<String>,
    on_setup: EventHandler<()>,
) -> Element {
    rsx! {
        document::Link { rel: "icon", href: "data:," }
        document::Stylesheet { href: APP_CSS }
        div { class: "grid min-h-screen place-items-center bg-shell-bg px-4 text-theme-text",
            main { class: "w-full max-w-2xl rounded-3xl border border-shell-border bg-shell-panel p-6 shadow-2xl lg:p-8",
                div {
                    p { class: "text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "{APP_NAME}" }
                    match state {
                        FrontendState::Loading => rsx! {
                            section { class: "mt-3 space-y-4",
                                h1 { class: "text-3xl font-semibold", "Checking session" }
                                p { class: "text-sm text-theme-muted", if message.is_empty() { "Checking the gateway session..." } else { "{message}" } }
                            }
                        },
                        FrontendState::Install => rsx! {
                            section { class: "mt-3 max-w-xl",
                                h1 { class: "text-3xl font-semibold", "Install LiroxNotes" }
                                p { class: "mt-2 text-sm text-theme-muted", "Configure the application root, create the first user, then continue to workspace setup." }
                                div { class: "mt-6 space-y-4",
                                    label { class: "block text-sm text-theme-muted",
                                        "Workspace root"
                                        input { class: "mt-2 w-full rounded-2xl border border-shell-border bg-shell-bg px-4 py-3 text-theme-text outline-none focus:border-theme-accent", value: "{workspace_path}", oninput: move |event| on_workspace_path.call(event.value()) }
                                    }
                                    label { class: "block text-sm text-theme-muted",
                                        "Username"
                                        input { class: "mt-2 w-full rounded-2xl border border-shell-border bg-shell-bg px-4 py-3 text-theme-text outline-none focus:border-theme-accent", value: "{user}", autocomplete: "username", oninput: move |event| on_user.call(event.value()) }
                                    }
                                    fieldset { class: "grid gap-3 rounded-2xl border border-shell-border bg-shell-bg p-4",
                                        legend { class: "px-2 text-sm text-theme-muted", "Login method" }
                                        label { class: "flex items-center gap-3 text-sm text-theme-text",
                                            input { r#type: "radio", name: "auth_mode", checked: auth_mode == "passwordless", onchange: move |_| on_auth_mode.call("passwordless".to_string()) }
                                            span { "Passwordless for now" }
                                        }
                                        label { class: "flex items-center gap-3 text-sm text-theme-text",
                                            input { r#type: "radio", name: "auth_mode", checked: auth_mode == "password", onchange: move |_| on_auth_mode.call("password".to_string()) }
                                            span { "Use a password" }
                                        }
                                    }
                                    if auth_mode == "password" {
                                        label { class: "block text-sm text-theme-muted",
                                            "Password"
                                            input { r#type: "password", class: "mt-2 w-full rounded-2xl border border-shell-border bg-shell-bg px-4 py-3 text-theme-text outline-none focus:border-theme-accent", value: "{password}", autocomplete: "new-password", oninput: move |event| on_password.call(event.value()) }
                                        }
                                    }
                                }
                                if !message.is_empty() {
                                    p { class: "mt-4 rounded-2xl border border-theme-warn/30 bg-theme-warn/10 px-4 py-3 text-sm text-theme-warn", "{message}" }
                                }
                                button { class: "mt-6 rounded-2xl bg-theme-accent px-4 py-3 font-semibold text-shell-bg", type: "button", onclick: move |_| on_install.call(()), "Install" }
                            }
                        },
                        FrontendState::Login => rsx! {
                            section { class: "mt-3 max-w-xl",
                                h1 { class: "text-3xl font-semibold", "Log in" }
                                p { class: "mt-2 text-sm text-theme-muted", "Use a local session to continue." }
                                form { class: "mt-6 space-y-4", onsubmit: move |event| { event.prevent_default(); on_login.call(()); },
                                    label { class: "block text-sm text-theme-muted",
                                        "Name"
                                        input { class: "mt-2 w-full rounded-2xl border border-shell-border bg-shell-bg px-4 py-3 text-theme-text outline-none focus:border-theme-accent", value: "{user}", autocomplete: "username", oninput: move |event| on_user.call(event.value()) }
                                    }
                                    if auth_mode == "password" {
                                        label { class: "block text-sm text-theme-muted",
                                            "Password"
                                            input { r#type: "password", class: "mt-2 w-full rounded-2xl border border-shell-border bg-shell-bg px-4 py-3 text-theme-text outline-none focus:border-theme-accent", value: "{password}", autocomplete: "current-password", oninput: move |event| on_password.call(event.value()) }
                                        }
                                    }
                                    if !message.is_empty() {
                                        p { class: "rounded-2xl border border-theme-warn/30 bg-theme-warn/10 px-4 py-3 text-sm text-theme-warn", "{message}" }
                                    }
                                    button { class: "rounded-2xl bg-theme-accent px-4 py-3 font-semibold text-shell-bg", type: "submit", "Continue" }
                                }
                            }
                        },
                        FrontendState::Setup => rsx! {
                            section { class: "mt-3 max-w-2xl",
                                h1 { class: "text-3xl font-semibold", "Set up workspace" }
                                p { class: "mt-2 text-sm text-theme-muted", "Choose whether to clone an existing remote or create a new local repository." }
                                form { class: "mt-6 grid gap-4", onsubmit: move |event| { event.prevent_default(); on_setup.call(()); },
                                    fieldset { class: "grid gap-3 rounded-2xl border border-shell-border bg-shell-bg p-4",
                                        legend { class: "px-2 text-sm text-theme-muted", "Repository source" }
                                        label { class: "flex items-center gap-3 text-sm text-theme-text",
                                            input { r#type: "radio", name: "repo_mode", checked: repo_mode == "new", onchange: move |_| on_repo_mode.call("new".to_string()) }
                                            span { "Create new repository" }
                                        }
                                        label { class: "flex items-center gap-3 text-sm text-theme-text",
                                            input { r#type: "radio", name: "repo_mode", checked: repo_mode == "remote", onchange: move |_| on_repo_mode.call("remote".to_string()) }
                                            span { "Use existing remote" }
                                        }
                                    }
                                    label { class: "block text-sm text-theme-muted",
                                        "Workspace slug"
                                        input { class: "mt-2 w-full rounded-2xl border border-shell-border bg-shell-bg px-4 py-3 text-theme-text outline-none focus:border-theme-accent", value: "{workspace_slug}", placeholder: "notes", oninput: move |event| on_workspace_slug.call(event.value()) }
                                    }
                                    label { class: "block text-sm text-theme-muted",
                                        "Workspace name"
                                        input { class: "mt-2 w-full rounded-2xl border border-shell-border bg-shell-bg px-4 py-3 text-theme-text outline-none focus:border-theme-accent", value: "{workspace_name}", oninput: move |event| on_workspace_name.call(event.value()) }
                                    }
                                    p { class: "text-sm text-theme-subtle", if repo_mode == "remote" { "Clone target: {clone_target}" } else { "Repository path: {clone_target}" } }
                                    if repo_mode == "remote" {
                                        label { class: "block text-sm text-theme-muted",
                                            "Git remote URL"
                                            input { class: "mt-2 w-full rounded-2xl border border-shell-border bg-shell-bg px-4 py-3 text-theme-text outline-none focus:border-theme-accent", value: "{repo_url}", placeholder: "git@github.com:you/notes.git", oninput: move |event| on_repo_url.call(event.value()) }
                                        }
                                    }
                                    label { class: "block text-sm text-theme-muted",
                                        "Branch"
                                        input { class: "mt-2 w-full rounded-2xl border border-shell-border bg-shell-bg px-4 py-3 text-theme-text outline-none focus:border-theme-accent", value: "{branch}", oninput: move |event| on_branch.call(event.value()) }
                                    }
                                    if !message.is_empty() {
                                        p { class: "rounded-2xl border border-theme-warn/30 bg-theme-warn/10 px-4 py-3 text-sm text-theme-warn", "{message}" }
                                    }
                                    button { class: "w-fit rounded-2xl bg-theme-accent px-4 py-3 font-semibold text-shell-bg", type: "submit", "Create workspace" }
                                }
                            }
                        },
                        FrontendState::Ready => rsx! {
                            section { class: "mt-3 space-y-4",
                                h1 { class: "text-3xl font-semibold", "Workspace ready" }
                                p { class: "text-sm text-theme-muted", "Authentication and onboarding are complete." }
                            }
                        },
                    }
                }
            }
        }
    }
}

#[cfg(target_arch = "wasm32")]
async fn detect_frontend_state() -> FrontendState {
    fetch_auth_session()
        .await
        .map(|session| frontend_state_from_auth(&session))
        .unwrap_or(FrontendState::Login)
}

#[cfg(target_arch = "wasm32")]
async fn fetch_auth_session() -> Option<AuthSession> {
    let response = fetch_text("/api/auth", "GET", None).await?;
    serde_json::from_str::<AuthSession>(&response).ok()
}

#[cfg(target_arch = "wasm32")]
async fn api_install(
    workspace_root: &str,
    user: &str,
    auth_mode: &str,
    password: &str,
) -> Option<AuthSession> {
    let body = format!(
        r#"{{"workspace_root":"{}","user":"{}","auth_mode":"{}","password":"{}"}}"#,
        json_escape(workspace_root),
        json_escape(user),
        json_escape(auth_mode),
        json_escape(password)
    );
    let response = fetch_text("/api/setup", "POST", Some(body)).await?;
    serde_json::from_str::<AuthSession>(&response).ok()
}

#[cfg(target_arch = "wasm32")]
async fn api_login(user: &str, password: &str) -> Option<AuthSession> {
    let body = format!(
        r#"{{"user":"{}","password":"{}"}}"#,
        json_escape(user),
        json_escape(password)
    );
    let response = fetch_text("/api/auth/login", "POST", Some(body)).await?;
    serde_json::from_str::<AuthSession>(&response).ok()
}

#[cfg(target_arch = "wasm32")]
async fn api_setup_workspace(
    repo_mode: &str,
    workspace_slug: &str,
    workspace_name: &str,
    repo_url: &str,
    branch: &str,
) -> bool {
    let body = format!(
        r#"{{"repo_mode":"{}","workspace_slug":"{}","workspace_name":"{}","repo_url":"{}","branch":"{}"}}"#,
        json_escape(repo_mode),
        json_escape(workspace_slug),
        json_escape(workspace_name),
        json_escape(repo_url),
        json_escape(branch)
    );
    fetch_status("/api/workspaces", "POST", Some(body)).await == Some(201)
}

#[cfg(target_arch = "wasm32")]
async fn fetch_status(path: &str, method: &str, body: Option<String>) -> Option<u16> {
    let window = web_sys::window()?;
    let init = request_init(method, body.as_deref());
    let response =
        JsFuture::from(window.fetch_with_str_and_init(&format!("{}{}", api_origin(), path), &init))
            .await
            .ok()?;
    let response: web_sys::Response = response.dyn_into().ok()?;
    Some(response.status())
}

#[cfg(target_arch = "wasm32")]
async fn fetch_text(path: &str, method: &str, body: Option<String>) -> Option<String> {
    let window = web_sys::window()?;
    let init = request_init(method, body.as_deref());
    let response =
        JsFuture::from(window.fetch_with_str_and_init(&format!("{}{}", api_origin(), path), &init))
            .await
            .ok()?;
    let response: web_sys::Response = response.dyn_into().ok()?;
    JsFuture::from(response.text().ok()?)
        .await
        .ok()?
        .as_string()
}

#[cfg(target_arch = "wasm32")]
fn request_init(method: &str, body: Option<&str>) -> web_sys::RequestInit {
    let init = web_sys::RequestInit::new();
    init.set_method(method);
    init.set_credentials(web_sys::RequestCredentials::Include);
    if let Some(body) = body {
        let headers = web_sys::Headers::new().expect("headers");
        headers
            .set("content-type", "application/json")
            .expect("content-type");
        init.set_headers(&headers);
        init.set_body(&JsValue::from_str(body));
    }
    init
}

#[cfg(target_arch = "wasm32")]
fn json_escape(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}

fn default_workspace_path() -> String {
    ".lirox-runtime/workspace".to_string()
}

fn workspace_slug_from_repo_url(repo_url: &str) -> Option<String> {
    let tail = repo_url
        .trim()
        .trim_end_matches('/')
        .rsplit(['/', ':'])
        .next()?;
    let repo = tail.strip_suffix(".git").unwrap_or(tail);
    slugify(repo)
}

fn slugify(value: &str) -> Option<String> {
    let mut slug = String::new();
    let mut last_dash = false;
    for ch in value.chars() {
        let normalized = ch.to_ascii_lowercase();
        if normalized.is_ascii_alphanumeric() {
            slug.push(normalized);
            last_dash = false;
        } else if !slug.is_empty() && !last_dash {
            slug.push('-');
            last_dash = true;
        }
    }
    while slug.ends_with('-') {
        slug.pop();
    }
    (!slug.is_empty()).then_some(slug)
}

fn workspace_clone_target(workspace_root: &str, workspace_slug: &str) -> String {
    if workspace_root.is_empty() {
        return workspace_slug.to_string();
    }
    if workspace_slug.is_empty() {
        return workspace_root.to_string();
    }
    format!("{workspace_root}/{workspace_slug}")
}

#[cfg(target_arch = "wasm32")]
fn api_origin() -> String {
    let Some(window) = web_sys::window() else {
        return String::new();
    };
    let location = window.location();
    let port = location.port().unwrap_or_default();
    let host = location.hostname().unwrap_or_default();
    if (host == "127.0.0.1" || host == "localhost") && port != "3000" {
        format!("http://{host}:3000")
    } else {
        String::new()
    }
}

pub fn workspace_note_path_from_location(path: &str) -> Option<&str> {
    let prefix = "/workspace/";
    let rest = path.strip_prefix(prefix)?;
    let (_, note_path) = rest.split_once("/note/")?;
    Some(note_path)
}

#[allow(dead_code)]
#[component]
fn MvpFrame(title: &'static str, message: &'static str) -> Element {
    rsx! {
        div { class: "grid min-h-screen place-items-center bg-shell-bg px-4 text-theme-text",
            section { class: "w-full max-w-md rounded-2xl border border-shell-border bg-shell-panel p-6 shadow-2xl",
                div { class: "mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "LiroxNotes" }
                h1 { class: "text-2xl font-semibold", "{title}" }
                p { class: "mt-2 text-sm text-theme-muted", "{message}" }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn LoginScreen(
    user: String,
    message: String,
    on_user: EventHandler<String>,
    on_login: EventHandler<()>,
) -> Element {
    rsx! {
        div { class: "grid min-h-screen place-items-center bg-shell-bg px-4 text-theme-text",
            form { class: "w-full max-w-md rounded-2xl border border-shell-border bg-shell-panel p-6 shadow-2xl", onsubmit: move |event| { event.prevent_default(); on_login.call(()); },
                div { class: "mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "LiroxNotes MVP" }
                h1 { class: "text-2xl font-semibold", "Log in" }
                p { class: "mt-2 text-sm text-theme-muted", "Local session login for the gateway running on port 3000." }
                label { class: "mt-5 block text-sm text-theme-muted",
                    "Name"
                    input { class: "mt-2 w-full rounded-lg border border-shell-border bg-shell-bg px-3 py-2 text-theme-text outline-none focus:border-theme-accent", value: "{user}", autocomplete: "username", oninput: move |event| on_user.call(event.value()) }
                }
                if !message.is_empty() {
                    p { class: "mt-3 text-sm text-theme-warn", "{message}" }
                }
                button { class: "mt-5 w-full rounded-lg bg-theme-accent px-4 py-2 font-semibold text-shell-bg", type: "submit", "Continue" }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn SetupScreen(
    workspace_path: String,
    repo_url: String,
    branch: String,
    message: String,
    on_workspace_path: EventHandler<String>,
    on_repo_url: EventHandler<String>,
    on_branch: EventHandler<String>,
    on_setup: EventHandler<()>,
) -> Element {
    rsx! {
        div { class: "grid min-h-screen place-items-center bg-shell-bg px-4 text-theme-text",
            form { class: "w-full max-w-xl rounded-2xl border border-shell-border bg-shell-panel p-6 shadow-2xl", onsubmit: move |event| { event.prevent_default(); on_setup.call(()); },
                div { class: "mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "LiroxNotes MVP" }
                h1 { class: "text-2xl font-semibold", "Set up workspace" }
                p { class: "mt-2 text-sm text-theme-muted", "Choose a local notes directory. Saves write Markdown files and create real Git commits." }
                label { class: "mt-5 block text-sm text-theme-muted",
                    "Workspace path"
                    input { class: "mt-2 w-full rounded-lg border border-shell-border bg-shell-bg px-3 py-2 text-theme-text outline-none focus:border-theme-accent", value: "{workspace_path}", oninput: move |event| on_workspace_path.call(event.value()) }
                }
                label { class: "mt-4 block text-sm text-theme-muted",
                    "Git remote URL"
                    input { class: "mt-2 w-full rounded-lg border border-shell-border bg-shell-bg px-3 py-2 text-theme-text outline-none focus:border-theme-accent", value: "{repo_url}", placeholder: "git@github.com:you/notes.git", oninput: move |event| on_repo_url.call(event.value()) }
                }
                label { class: "mt-4 block text-sm text-theme-muted",
                    "Branch"
                    input { class: "mt-2 w-full rounded-lg border border-shell-border bg-shell-bg px-3 py-2 text-theme-text outline-none focus:border-theme-accent", value: "{branch}", oninput: move |event| on_branch.call(event.value()) }
                }
                if !message.is_empty() {
                    p { class: "mt-3 text-sm text-theme-warn", "{message}" }
                }
                button { class: "mt-5 w-full rounded-lg bg-theme-accent px-4 py-2 font-semibold text-shell-bg", type: "submit", "Create workspace" }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
pub fn WorkspaceShell(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let labels_notes = matches!(sidebar_mode, SidebarMode::LabelsNotes);

    rsx! {
        document::Link { rel: "icon", href: "data:," }
        document::Stylesheet { href: APP_CSS }
        document::Script { src: EDITOR_JS, r#type: "module" }
        document::Script { src: EDITOR_BRIDGE_JS }
        div { class: "grid h-screen overflow-hidden grid-rows-[2.75rem_minmax(0,1fr)_2.25rem] bg-shell-bg text-theme-text antialiased",
            TopBar { workspace_name: view.name.clone(), note_title: view.selected_note.title.clone(), source: view.source.clone() }
            div { class: "grid min-h-0 h-full grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]", style: if labels_notes { "grid-template-columns: 33.333% 66.667%;" } else { "" },
        Sidebar { view: view.clone(), focus, sidebar_mode, browser_dir, on_action: on_action.clone(), on_select_note: on_select_note.clone() }
        EditorPane { view: view.clone(), on_action: on_action.clone() }
            }
            StatusBar {
                note_path: view.selected_note.path.clone(),
                branch: view.branch.clone(),
                changed_notes: view.changed_notes,
                note_count: view.note_count,
                source: view.source.clone(),
                focus,
                sidebar_mode,
                on_action,
            }
        }
    }
}

#[allow(dead_code)]
fn note_href(slug: &str, path: &str) -> String {
    format!("/workspace/{slug}/note/{path}")
}

#[allow(dead_code)]
#[component]
fn Sidebar(
    view: WorkspaceView,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let focused = matches!(focus, FocusTarget::Sidebar);
    let shell_classes = if focused {
        "h-full min-h-0 overflow-auto border-r border-theme-accent/50 bg-shell-panel px-3 pt-1 pb-3 outline outline-1 outline-theme-accent/40"
    } else {
        "h-full min-h-0 overflow-auto border-r border-shell-border bg-shell-panel px-3 pt-1 pb-3"
    };

    rsx! {
        aside { class: shell_classes, tabindex: "0", "data-lirox-sidebar-root": "true",
            section { class: "space-y-3",
                div {
                    div { class: "mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "{APP_NAME}" }
                    match sidebar_mode {
                        SidebarMode::Tree => rsx! {
                            ul { class: "list-none p-0 text-ui leading-6",
                                for row in view.tree {
                                    TreeRow { slug: view.slug.clone(), row, on_select_note: on_select_note.clone() }
                                }
                            }
                        },
                        SidebarMode::LabelsNotes => rsx! {
                            LabelsNotesSidebar { view: view.clone(), on_select_note: on_select_note.clone() }
                        },
                        SidebarMode::Files => rsx! {
                            FilesSidebar { view: view.clone(), browser_dir: browser_dir.clone(), on_action: on_action.clone(), on_select_note: on_select_note.clone() }
                        },
                    }
                }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn LabelsNotesSidebar(
    view: WorkspaceView,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    rsx! {
        div { class: "flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden lg:grid lg:gap-2", style: "grid-template-columns: max-content fit-content(24rem);",
            section { class: "min-w-0 w-fit",
                div { class: "mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "Labels" }
                ul { class: "list-none p-0 text-ui leading-6",
                    for label in view.labels {
                        LabelRow { label }
                    }
                }
            }
            section { class: "min-w-0 w-full max-w-[24rem] lg:border-l lg:border-shell-border/60 lg:pl-2",
                div { class: "mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "Notes" }
                ul { class: "list-none p-0 text-ui leading-6",
                    for note in view.notes {
                        NoteRow { slug: view.slug.clone(), note, on_select_note: on_select_note.clone() }
                    }
                }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn FilesSidebar(
    view: WorkspaceView,
    browser_dir: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let entries = directory_entries(&view.notes, &browser_dir);
    let has_parent = !browser_dir.is_empty();
    let directory_label = if browser_dir.is_empty() {
        "/"
    } else {
        browser_dir.as_str()
    };

    rsx! {
        div { class: "space-y-3",
            div { class: "text-[10px] font-medium uppercase tracking-[0.18em] text-theme-subtle", "{directory_label}" }
            ul { class: "list-none p-0 text-ui leading-6",
                if has_parent {
                    li {
                        button { class: "block w-full rounded px-2 py-1 text-left text-theme-muted hover:bg-theme-surface/60 hover:text-theme-text", onclick: move |_| if let Some(on_action) = &on_action { on_action.call(AppAction::GoUpDirectory) }, ".." }
                    }
                }
                for entry in entries {
                    BrowserEntryRow { slug: view.slug.clone(), notes: view.notes.clone(), kind: entry.kind, path: entry.path, label: entry.label, on_action: on_action.clone(), on_select_note: on_select_note.clone() }
                }
            }
        }
    }
}

#[allow(dead_code)]
fn parent_directory(path: &str) -> Option<&str> {
    if path.is_empty() {
        None
    } else {
        Some(path.rsplit_once('/').map(|(dir, _)| dir).unwrap_or(""))
    }
}

#[allow(dead_code)]
#[derive(Clone, PartialEq)]
struct BrowserEntry {
    kind: TreeKind,
    label: String,
    path: String,
}

#[allow(dead_code)]
fn directory_entries(notes: &[NoteSummary], directory: &str) -> Vec<BrowserEntry> {
    let mut folders = BTreeSet::new();
    let mut files = Vec::new();
    let prefix = if directory.is_empty() {
        String::new()
    } else {
        format!("{directory}/")
    };

    for note in notes {
        if !directory.is_empty() && !note.path.starts_with(&prefix) {
            continue;
        }

        let rest = if directory.is_empty() {
            note.path.as_str()
        } else {
            &note.path[prefix.len()..]
        };
        let mut parts = rest.split('/');
        let Some(first) = parts.next() else {
            continue;
        };

        if parts.next().is_some() {
            folders.insert(first.to_string());
        } else {
            files.push(BrowserEntry {
                kind: TreeKind::File,
                label: first.to_string(),
                path: note.path.clone(),
            });
        }
    }

    let mut entries: Vec<BrowserEntry> = folders
        .into_iter()
        .map(|folder| BrowserEntry {
            kind: TreeKind::Folder,
            path: if directory.is_empty() {
                folder.clone()
            } else {
                format!("{directory}/{folder}")
            },
            label: folder,
        })
        .collect();
    entries.extend(files);
    entries.sort_by(|a, b| a.label.cmp(&b.label));
    entries
}

#[allow(dead_code)]
#[component]
fn TreeRow(slug: String, row: TreeEntry, on_select_note: Option<EventHandler<String>>) -> Element {
    let indent = if row.depth == 0 { "pl-1" } else { "pl-4" };
    let classes = if row.active {
        "flex items-center rounded-md bg-theme-surface/90 text-theme-text"
    } else {
        "flex items-center rounded-md text-theme-muted hover:bg-theme-surface/60 hover:text-theme-text"
    };
    let icon = match row.kind {
        TreeKind::Folder => "▸",
        TreeKind::File => "",
    };

    rsx! {
        li {
            div { class: "flex items-center gap-2 py-px text-ui",
                if row.kind == TreeKind::File {
                    a { class: format!("{classes} w-full {indent} pr-2"), href: note_href(&slug, &row.path), onclick: move |event| {
                        event.prevent_default();
                        if let Some(on_select_note) = &on_select_note { on_select_note.call(row.path.clone()); }
                    },
                        span { class: "w-3 shrink-0 text-theme-subtle", "{icon}" }
                        span { class: "truncate", "{row.label}" }
                    }
                } else {
                    div { class: format!("{classes} w-full {indent} pr-2"),
                        span { class: "w-3 shrink-0 text-theme-subtle", "{icon}" }
                        span { class: "truncate", "{row.label}" }
                    }
                }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn BrowserEntryRow(
    slug: String,
    notes: Vec<NoteSummary>,
    kind: TreeKind,
    path: String,
    label: String,
    on_action: Option<EventHandler<AppAction>>,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let path_for_action = path.clone();
    let path_for_lookup = path.clone();
    let path_for_fallback = path;
    let label_for_fallback = label.clone();
    match kind {
        TreeKind::Folder => rsx! {
            li {
                button { class: "flex w-full items-center gap-2 rounded px-2 py-1 text-left text-theme-muted hover:bg-theme-surface/60 hover:text-theme-text", onclick: move |_| if let Some(on_action) = &on_action { on_action.call(AppAction::SetBrowserDir(path_for_action.clone())) },
                    span { class: "w-4 shrink-0 text-theme-subtle", "󰉋" }
                    span { "{label}" }
                }
            }
        },
        TreeKind::File => {
            let note = notes
                .into_iter()
                .find(|note| note.path == path_for_lookup)
                .unwrap_or(NoteSummary {
                    path: path_for_fallback,
                    title: label_for_fallback,
                    labels: Vec::new(),
                    links: Vec::new(),
                    active: false,
                });

            let classes = if note.active {
                "rounded-md bg-theme-surface/90 text-theme-text"
            } else {
                "rounded-md text-theme-muted hover:bg-theme-surface/60 hover:text-theme-text"
            };

            rsx! {
                li {
                    a { class: format!("flex items-center gap-2 px-2 py-1 text-ui {classes}"), href: note_href(&slug, &note.path), onclick: move |event| {
                        event.prevent_default();
                        if let Some(on_select_note) = &on_select_note { on_select_note.call(note.path.clone()); }
                    },
                        span { class: "w-4 shrink-0 text-theme-subtle", "󰈔" }
                        span { class: "truncate font-medium", "{label}" }
                    }
                }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn FileRow(
    slug: String,
    note: NoteSummary,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let classes = if note.active {
        "rounded-md bg-theme-surface/90 text-theme-text"
    } else {
        "rounded-md text-theme-muted hover:bg-theme-surface/60 hover:text-theme-text"
    };

    rsx! {
        li {
            a { class: format!("block px-2 py-1 text-ui {classes}"), href: note_href(&slug, &note.path), onclick: move |event| {
                event.prevent_default();
                if let Some(on_select_note) = &on_select_note { on_select_note.call(note.path.clone()); }
            },
                div { class: "flex items-center justify-between gap-2",
                    span { class: "truncate font-medium", "{note.title}" }
                    span { class: "shrink-0 text-[10px] text-theme-subtle", "{note.path}" }
                }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn LabelRow(label: LabelSummary) -> Element {
    let depth = label.name.matches('/').count();
    let indent = if depth == 0 { "pl-1" } else { "pl-4" };

    rsx! {
        li {
            div { class: format!("flex items-center justify-between rounded-md {indent} pr-2 py-px text-ui text-theme-muted"),
                span { class: "truncate", "{label.name}" }
                span { class: "text-[10px] text-theme-subtle", "{label.count}" }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn NoteRow(
    slug: String,
    note: NoteSummary,
    on_select_note: Option<EventHandler<String>>,
) -> Element {
    let classes = if note.active {
        "rounded-md bg-theme-surface/90 text-theme-text"
    } else {
        "rounded-md text-theme-muted hover:bg-theme-surface/60 hover:text-theme-text"
    };

    rsx! {
        li {
            a { class: format!("block px-2 py-1 text-ui {classes}"), href: note_href(&slug, &note.path), onclick: move |event| {
                event.prevent_default();
                if let Some(on_select_note) = &on_select_note { on_select_note.call(note.path.clone()); }
            },
                div { class: "flex items-center justify-between gap-2",
                    span { class: "truncate font-medium", "{note.title}" }
                    span { class: "shrink-0 text-[10px] text-theme-subtle", "{note.path}" }
                }
                div { class: "mt-0.5 flex flex-wrap gap-1",
                    for label in note.labels.iter().take(3) {
                        span { class: "rounded bg-theme-surface px-1.5 py-px text-[10px] text-theme-subtle", "{label}" }
                    }
                }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn TopBar(workspace_name: String, note_title: String, source: String) -> Element {
    rsx! {
        header { class: "grid h-11 grid-cols-1 border-b border-shell-border bg-shell-bg lg:grid-cols-[18rem_1fr]",
            div { class: "flex items-center px-3",
                button { class: "flex h-7 min-w-0 items-center gap-2 rounded-md bg-theme-surface/70 px-2 text-[11px] text-theme-muted",
                    span { class: "font-icon w-3 shrink-0 text-center text-theme-subtle", "󰙅" }
                    span { class: "truncate", "{workspace_name}" }
                }
            }
            div { class: "flex min-w-0 items-center justify-between gap-3 px-3 lg:px-4",
                div { class: "flex min-w-0 items-center gap-2 text-ui",
                    span { class: "h-1.5 w-1.5 shrink-0 rounded-full bg-theme-warn" }
                    h1 { class: "truncate font-medium text-theme-text", "data-lirox-note-title": "true", "{note_title}" }
                }
                div { class: "flex shrink-0 items-center gap-2 text-[11px] text-theme-subtle",
                    button { class: "rounded bg-theme-surface/70 px-2 py-px text-theme-muted hover:text-theme-text", type: "button", "data-lirox-save-button": "true", "Saved" }
                    span { "data-lirox-save-state": "true", "Saved" }
                    a { class: "rounded bg-theme-surface/70 px-2 py-px text-theme-muted hover:text-theme-text", href: "/onboarding", "Setup" }
                    form { method: "post", action: "/logout",
                        button { class: "rounded bg-theme-surface/70 px-2 py-px text-theme-muted hover:text-theme-text", type: "submit", "Logout" }
                    }
                    span { "{source}" }
                }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn EditorPane(view: WorkspaceView, on_action: Option<EventHandler<AppAction>>) -> Element {
    rsx! {
        section { class: "flex h-full min-h-0 flex-col bg-shell-editor",
            div {
                class: "min-h-0 flex-1 w-full font-mono text-ui leading-6 text-theme-text",
                "data-lirox-editor-root": "true",
                "data-note-path": view.selected_note.path,
                "data-note-title": view.selected_note.title,
                "data-initial-doc": view.selected_note_body,
                "data-line-numbers": "false",
                "data-writing-width": "650px",
                aria_label: "Markdown editor"
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn StatusBar(
    note_path: String,
    branch: String,
    changed_notes: usize,
    note_count: usize,
    source: String,
    focus: FocusTarget,
    sidebar_mode: SidebarMode,
    on_action: Option<EventHandler<AppAction>>,
) -> Element {
    let focused = matches!(focus, FocusTarget::Sidebar);
    rsx! {
        footer { class: "grid h-9 grid-cols-1 border-t border-shell-border bg-shell-chrome text-[11px] lg:grid-cols-[18rem_1fr]",
            div { class: "flex items-center justify-between px-2",
                div { class: "flex items-center gap-1.5",
                    ModeButton { label: "󰙅", title: "Tree", active: matches!(sidebar_mode, SidebarMode::Tree), action: AppAction::SetSidebarMode(SidebarMode::Tree), on_action: on_action.clone() }
                    ModeButton { label: "󰓹", title: "Labels + Notes", active: matches!(sidebar_mode, SidebarMode::LabelsNotes), action: AppAction::SetSidebarMode(SidebarMode::LabelsNotes), on_action: on_action.clone() }
                    ModeButton { label: "󱞁", title: "Files", active: matches!(sidebar_mode, SidebarMode::Files), action: AppAction::SetSidebarMode(SidebarMode::Files), on_action: on_action.clone() }
                }
                span { class: "flex items-center gap-1 text-theme-subtle",
                    span { class: "font-icon text-[10px]", if focused { "󰟝" } else { "󰙅" } }
                    span { if focused { "Focused" } else { "Sidebar" } }
                }
            }
            div { class: "flex items-center justify-end gap-2 px-3",
                span { class: "truncate text-theme-subtle", "data-lirox-note-path": "true", "{note_path}" }
                StatusPill { icon: "", label: branch }
                StatusPill { icon: "+", label: changed_notes.to_string() }
                StatusPill { icon: "󰎄", label: note_count.to_string() }
                StatusPill { icon: "󱁕", label: source }
            }
        }
    }
}

#[allow(dead_code)]
#[component]
fn ModeButton(
    label: &'static str,
    title: &'static str,
    active: bool,
    action: AppAction,
    on_action: Option<EventHandler<AppAction>>,
) -> Element {
    let classes = if active {
        "flex h-6 w-6 items-center justify-center rounded bg-theme-surface-alt text-[10px] font-semibold text-theme-text"
    } else {
        "flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold text-theme-subtle transition hover:bg-theme-surface hover:text-theme-text"
    };

    rsx! {
        button { class: classes, title: title, aria_label: title, onclick: move |_| if let Some(on_action) = &on_action { on_action.call(action.clone()) }, "{label}" }
    }
}

#[allow(dead_code)]
#[component]
fn StatusPill(icon: &'static str, label: String) -> Element {
    rsx! {
        span { class: "flex items-center gap-1 rounded px-2 py-px text-theme-muted",
            span { class: "font-icon w-3 shrink-0 text-center text-[10px] text-theme-accent/70", "{icon}" }
            span { "data-lirox-changed-count": "true", "{label}" }
        }
    }
}
