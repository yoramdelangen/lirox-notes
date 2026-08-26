use dioxus::prelude::*;
use liroxnotes_shared::WorkspaceView;
use serde::Deserialize;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::{closure::Closure, JsCast, JsValue};
#[cfg(target_arch = "wasm32")]
use wasm_bindgen_futures::{spawn_local, JsFuture};

mod frontend;

use frontend::WorkflowShell;
pub use frontend::WorkspaceShell;

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
            },
        }
    }
}

#[cfg(target_arch = "wasm32")]
async fn fetch_auth_session() -> Option<AuthSession> {
    let response = fetch_text("/api/auth", "GET", None).await?;
    serde_json::from_str::<AuthSession>(&response).ok()
}

#[cfg_attr(not(target_arch = "wasm32"), allow(dead_code))]
#[cfg(target_arch = "wasm32")]
async fn fetch_workspace_view(selected_note_path: Option<&str>) -> Option<WorkspaceView> {
    let path = selected_note_path.unwrap_or("");
    let response = fetch_text(&format!("/api/workspace/{path}"), "GET", None).await?;
    serde_json::from_str::<WorkspaceView>(&response).ok()
}

#[allow(dead_code)]
#[cfg(not(target_arch = "wasm32"))]
async fn fetch_workspace_view(_: Option<&str>) -> Option<WorkspaceView> {
    None
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
