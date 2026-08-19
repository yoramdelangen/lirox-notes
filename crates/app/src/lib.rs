use dioxus::prelude::*;
use liroxnotes_shared::{
    workspace_view_with_body, LabelSummary, NoteSummary, TreeEntry, TreeKind, WorkspaceView,
    APP_NAME, DEMO_WORKSPACE,
};
#[cfg(target_arch = "wasm32")]
use serde::Deserialize;
use std::collections::BTreeSet;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::{closure::Closure, JsCast, JsValue};
#[cfg(target_arch = "wasm32")]
use wasm_bindgen_futures::{spawn_local, JsFuture};

const APP_CSS: Asset = asset!("/assets/app.css");
const EDITOR_JS: Asset = asset!("/assets/editor.js");
const EDITOR_BRIDGE_JS: Asset = asset!("/assets/editor-bridge.js");

#[derive(Clone, PartialEq, Eq)]
#[cfg_attr(not(target_arch = "wasm32"), allow(dead_code))]
enum FrontendState {
    Loading,
    Login,
    Setup,
    Ready,
}

#[cfg(target_arch = "wasm32")]
#[derive(Deserialize)]
struct AuthSession {
    authenticated: bool,
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum FocusTarget {
    Sidebar,
    Editor,
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum SidebarMode {
    Tree,
    LabelsNotes,
    Files,
}

impl SidebarMode {
    fn next(self) -> Self {
        match self {
            Self::Tree => Self::LabelsNotes,
            Self::LabelsNotes => Self::Files,
            Self::Files => Self::Tree,
        }
    }
}

#[derive(Clone, PartialEq, Eq)]
pub enum AppAction {
    FocusSidebar,
    FocusEditor,
    CycleSidebarMode,
    SetSidebarMode(SidebarMode),
    SetBrowserDir(String),
    GoUpDirectory,
}

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
    let initial_note_path = selected_note_path().unwrap_or_else(|| "notes/welcome.md".to_string());
    let frontend_state = use_signal(|| {
        if cfg!(target_arch = "wasm32") {
            FrontendState::Loading
        } else {
            FrontendState::Ready
        }
    });
    let mut login_user = use_signal(|| "local".to_string());
    let mut workspace_path = use_signal(default_workspace_path);
    let mut repo_url = use_signal(String::new);
    let mut branch = use_signal(|| "main".to_string());
    let status_message = use_signal(String::new);
    let mut selected_note = use_signal(|| initial_note_path.clone());
    let selected_note_body = use_signal(|| {
        if cfg!(target_arch = "wasm32") {
            String::new()
        } else {
            workspace_view_with_body(&DEMO_WORKSPACE, &initial_note_path, "").selected_note_body
        }
    });
    let server_view = use_signal(|| None::<WorkspaceView>);
    let mut sidebar_mode = use_signal(|| SidebarMode::Tree);
    let mut focus_target = use_signal(|| FocusTarget::Sidebar);
    let mut browser_dir = use_signal(|| String::new());

    use_effect(move || {
        #[cfg(target_arch = "wasm32")]
        {
            let window = web_sys::window().expect("window");
            let mut frontend_state = frontend_state;
            let mut status_message = status_message;
            let mut selected_note = selected_note;
            let mut selected_note_body = selected_note_body;
            let mut server_view = server_view;
            let mut focus_target = focus_target;
            let mut browser_dir = browser_dir;

            let initial_note_path_for_fetch = initial_note_path.clone();
            spawn_local(async move {
                match detect_frontend_state().await {
                    FrontendState::Ready => {
                        if let Some(view) = fetch_workspace_view(&initial_note_path_for_fetch).await {
                            selected_note_body.set(view.selected_note_body.clone());
                            selected_note.set(view.selected_note.path.clone());
                            server_view.set(Some(view));
                            frontend_state.set(FrontendState::Ready);
                            status_message.set(String::new());
                        } else {
                            frontend_state.set(FrontendState::Setup);
                            status_message.set("Could not load the configured workspace from the gateway.".to_string());
                        }
                    }
                    FrontendState::Setup => frontend_state.set(FrontendState::Setup),
                    FrontendState::Login => frontend_state.set(FrontendState::Login),
                    FrontendState::Loading => frontend_state.set(FrontendState::Login),
                }
            });

            let popstate = Closure::wrap(Box::new(move |_event: web_sys::PopStateEvent| {
                if let Some(path) = selected_note_path() {
                    let mut selected_note = selected_note;
                    let mut selected_note_body = selected_note_body;
                    let mut server_view = server_view;
                    spawn_local(async move {
                        if let Some(view) = fetch_workspace_view(&path).await {
                            selected_note_body.set(view.selected_note_body.clone());
                            selected_note.set(view.selected_note.path.clone());
                            server_view.set(Some(view));
                        }
                    });
                }
            }) as Box<dyn FnMut(web_sys::PopStateEvent)>);

            let editor_change = Closure::wrap(Box::new(move |event: web_sys::Event| {
                let Ok(custom_event) = event.dyn_into::<web_sys::CustomEvent>() else {
                    return;
                };

                let detail = custom_event.detail();
                let doc = js_sys::Reflect::get(&detail, &JsValue::from_str("doc"))
                    .ok()
                    .and_then(|value| value.as_string());

                if let Some(doc) = doc {
                    selected_note_body.set(doc);
                }
            }) as Box<dyn FnMut(web_sys::Event)>);

            let app_action = Closure::wrap(Box::new(move |event: web_sys::Event| {
                let Ok(custom_event) = event.dyn_into::<web_sys::CustomEvent>() else {
                    return;
                };

                let detail = custom_event.detail();
                let action = js_sys::Reflect::get(&detail, &JsValue::from_str("action"))
                    .ok()
                    .and_then(|value| value.as_string());

                let Some(action) = action.and_then(|action| AppAction::from_str(&action)) else {
                    return;
                };

                match action {
                    AppAction::FocusSidebar => {
                        focus_target.set(FocusTarget::Sidebar);
                    }
                    AppAction::FocusEditor => {
                        focus_target.set(FocusTarget::Editor);
                    }
                    AppAction::CycleSidebarMode => {
                        let next_mode = sidebar_mode.read().next();
                        sidebar_mode.set(next_mode);
                        focus_target.set(FocusTarget::Sidebar);
                    }
                    AppAction::SetSidebarMode(_) => {}
                    AppAction::SetBrowserDir(dir) => {
                        browser_dir.set(dir);
                    }
                    AppAction::GoUpDirectory => {
                        let current = browser_dir.read().clone();
                        browser_dir.set(parent_directory(&current).unwrap_or("").to_string());
                    }
                }
            }) as Box<dyn FnMut(web_sys::Event)>);

            window.set_onpopstate(Some(popstate.as_ref().unchecked_ref()));
            window
                .add_event_listener_with_callback(
                    "lirox-notes-editor-change",
                    editor_change.as_ref().unchecked_ref(),
                )
                .expect("editor listener");
            window
                .add_event_listener_with_callback(
                    "liroxnotes-action",
                    app_action.as_ref().unchecked_ref(),
                )
                .expect("action listener");
            popstate.forget();
            editor_change.forget();
            app_action.forget();
        }
    });

    let selected_note_path = selected_note.read().clone();
    let selected_note_body_value = selected_note_body.read().clone();

    match frontend_state.read().clone() {
        FrontendState::Loading => return rsx! { MvpFrame { title: "Loading", message: "Checking the gateway session..." } },
        FrontendState::Login => {
            return rsx! {
                LoginScreen {
                    user: login_user.read().clone(),
                    message: status_message.read().clone(),
                    on_user: move |value: String| login_user.set(value),
                    on_login: move |_| {
                        #[cfg(target_arch = "wasm32")]
                        {
                        let user = login_user.read().clone();
                        let mut frontend_state = frontend_state;
                        let mut status_message = status_message;
                        spawn_local(async move {
                            status_message.set("Logging in...".to_string());
                            if api_login(&user).await {
                                frontend_state.set(detect_frontend_state().await);
                                status_message.set(String::new());
                            } else {
                                status_message.set("Login failed. Is the gateway running on port 3000?".to_string());
                            }
                        });
                        }
                    }
                }
            };
        }
        FrontendState::Setup => {
            return rsx! {
                SetupScreen {
                    workspace_path: workspace_path.read().clone(),
                    repo_url: repo_url.read().clone(),
                    branch: branch.read().clone(),
                    message: status_message.read().clone(),
                    on_workspace_path: move |value: String| workspace_path.set(value),
                    on_repo_url: move |value: String| repo_url.set(value),
                    on_branch: move |value: String| branch.set(value),
                    on_setup: move |_| {
                        #[cfg(target_arch = "wasm32")]
                        {
                        let path = workspace_path.read().clone();
                        let repo = repo_url.read().clone();
                        let branch_value = branch.read().clone();
                        let mut frontend_state = frontend_state;
                        let mut status_message = status_message;
                        let mut selected_note_body = selected_note_body;
                        let mut selected_note = selected_note;
                        let mut server_view = server_view;
                        spawn_local(async move {
                            status_message.set("Creating workspace...".to_string());
                            if api_setup_workspace(&path, &repo, &branch_value).await {
                                if let Some(view) = fetch_workspace_view("notes/welcome.md").await {
                                    selected_note_body.set(view.selected_note_body.clone());
                                    selected_note.set(view.selected_note.path.clone());
                                    server_view.set(Some(view));
                                    frontend_state.set(FrontendState::Ready);
                                    status_message.set(String::new());
                                } else {
                                    frontend_state.set(FrontendState::Setup);
                                    status_message.set("Workspace was saved, but the gateway did not return notes.".to_string());
                                }
                            } else {
                                status_message.set("Workspace setup failed. Check the path and Git remote.".to_string());
                            }
                        });
                        }
                    }
                }
            };
        }
        FrontendState::Ready => {}
    }

    let view = match server_view.read().clone() {
        Some(view) => view,
        None if cfg!(target_arch = "wasm32") => {
            return rsx! { MvpFrame { title: "Loading Workspace", message: "Waiting for the configured gateway workspace..." } };
        }
        None => workspace_view_with_body(
            &DEMO_WORKSPACE,
            &selected_note_path,
            &selected_note_body_value,
        ),
    };
    let workspace_slug = view.slug.clone();

    rsx! {
            WorkspaceShell {
                view,
                focus: *focus_target.read(),
                sidebar_mode: *sidebar_mode.read(),
                browser_dir: browser_dir.read().clone(),
            on_action: move |action: AppAction| {
                match action {
                    AppAction::FocusSidebar => {
                        focus_target.set(FocusTarget::Sidebar);
                    }
                    AppAction::FocusEditor => {
                        focus_target.set(FocusTarget::Editor);
                    }
                    AppAction::CycleSidebarMode => {
                        let next_mode = sidebar_mode.read().next();
                        sidebar_mode.set(next_mode);
                        focus_target.set(FocusTarget::Sidebar);
                    }
                    AppAction::SetSidebarMode(mode) => {
                        sidebar_mode.set(mode);
                        focus_target.set(FocusTarget::Sidebar);
                    }
                    AppAction::SetBrowserDir(dir) => {
                        browser_dir.set(dir);
                        focus_target.set(FocusTarget::Sidebar);
                    }
                    AppAction::GoUpDirectory => {
                        let current = browser_dir.read().clone();
                        browser_dir.set(parent_directory(&current).unwrap_or("").to_string());
                        focus_target.set(FocusTarget::Sidebar);
                    }
                }
            },
            on_select_note: move |path: String| {
                selected_note.set(path.clone());
                push_workspace_note(&workspace_slug, &path);
                focus_target.set(FocusTarget::Editor);
                #[cfg(target_arch = "wasm32")]
                {
                    let mut selected_note = selected_note;
                    let mut selected_note_body = selected_note_body;
                    let mut server_view = server_view;
                    spawn_local(async move {
                        if let Some(view) = fetch_workspace_view(&path).await {
                            selected_note_body.set(view.selected_note_body.clone());
                            selected_note.set(view.selected_note.path.clone());
                            server_view.set(Some(view));
                        }
                    });
                }
            }
        }
    }
}

#[cfg(target_arch = "wasm32")]
async fn fetch_workspace_view(path: &str) -> Option<WorkspaceView> {
    let window = web_sys::window()?;
    let init = web_sys::RequestInit::new();
    init.set_credentials(web_sys::RequestCredentials::Include);
    let response = JsFuture::from(
        window.fetch_with_str_and_init(&format!("{}/api/workspace/{path}", api_origin()), &init),
    )
    .await
    .ok()?;
    let response: web_sys::Response = response.dyn_into().ok()?;
    if !response.ok() {
        return None;
    }
    let text = JsFuture::from(response.text().ok()?)
        .await
        .ok()?
        .as_string()?;
    serde_json::from_str(&text).ok()
}

#[cfg(target_arch = "wasm32")]
async fn detect_frontend_state() -> FrontendState {
    let Some(response) = fetch_text("/api/auth", "GET", None).await else {
        return FrontendState::Login;
    };
    let Ok(session) = serde_json::from_str::<AuthSession>(&response) else {
        return FrontendState::Login;
    };
    if !session.authenticated {
        return FrontendState::Login;
    }

    match fetch_status("/api/workspaces", "GET", None).await {
        Some(200) => FrontendState::Ready,
        Some(400) => FrontendState::Setup,
        Some(401) => FrontendState::Login,
        _ => FrontendState::Setup,
    }
}

#[cfg(target_arch = "wasm32")]
async fn api_login(user: &str) -> bool {
    let body = format!(r#"{{"user":"{}"}}"#, json_escape(user));
    fetch_status("/api/auth/login", "POST", Some(body)).await == Some(200)
}

#[cfg(target_arch = "wasm32")]
async fn api_setup_workspace(workspace_path: &str, repo_url: &str, branch: &str) -> bool {
    let body = format!(
        r#"{{"workspace_path":"{}","repo_url":"{}","branch":"{}"}}"#,
        json_escape(workspace_path),
        json_escape(repo_url),
        json_escape(branch)
    );
    fetch_status("/api/workspaces", "POST", Some(body)).await == Some(201)
}

#[cfg(target_arch = "wasm32")]
async fn fetch_status(path: &str, method: &str, body: Option<String>) -> Option<u16> {
    let window = web_sys::window()?;
    let init = request_init(method, body.as_deref());
    let response = JsFuture::from(window.fetch_with_str_and_init(
        &format!("{}{}", api_origin(), path),
        &init,
    ))
    .await
    .ok()?;
    let response: web_sys::Response = response.dyn_into().ok()?;
    Some(response.status())
}

#[cfg(target_arch = "wasm32")]
async fn fetch_text(path: &str, method: &str, body: Option<String>) -> Option<String> {
    let window = web_sys::window()?;
    let init = request_init(method, body.as_deref());
    let response = JsFuture::from(window.fetch_with_str_and_init(
        &format!("{}{}", api_origin(), path),
        &init,
    ))
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
        headers.set("content-type", "application/json").expect("content-type");
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

#[cfg(target_arch = "wasm32")]
fn selected_note_path() -> Option<String> {
    let path = web_sys::window()?.location().pathname().ok()?;
    workspace_note_path_from_location(&path).map(str::to_string)
}

#[cfg(not(target_arch = "wasm32"))]
fn selected_note_path() -> Option<String> {
    None
}

#[cfg(target_arch = "wasm32")]
fn push_workspace_note(slug: &str, path: &str) {
    let Some(window) = web_sys::window() else {
        return;
    };

    let Ok(history) = window.history() else {
        return;
    };

    let _ = history.push_state_with_url(
        &JsValue::NULL,
        "",
        Some(&format!("/workspace/{slug}/note/{path}")),
    );
}

#[cfg(not(target_arch = "wasm32"))]
fn push_workspace_note(_slug: &str, _path: &str) {}

pub fn workspace_note_path_from_location(path: &str) -> Option<&str> {
    path.strip_prefix("/workspace/demo/note/")
}

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

fn note_href(slug: &str, path: &str) -> String {
    format!("/workspace/{slug}/note/{path}")
}

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

fn parent_directory(path: &str) -> Option<&str> {
    if path.is_empty() {
        None
    } else {
        Some(path.rsplit_once('/').map(|(dir, _)| dir).unwrap_or(""))
    }
}

#[derive(Clone, PartialEq)]
struct BrowserEntry {
    kind: TreeKind,
    label: String,
    path: String,
}

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

#[component]
fn StatusPill(icon: &'static str, label: String) -> Element {
    rsx! {
        span { class: "flex items-center gap-1 rounded px-2 py-px text-theme-muted",
            span { class: "font-icon w-3 shrink-0 text-center text-[10px] text-theme-accent/70", "{icon}" }
            span { "data-lirox-changed-count": "true", "{label}" }
        }
    }
}
