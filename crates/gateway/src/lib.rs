use actix_files::Files;
use actix_web::{
    delete, get,
    http::header::{
        HeaderValue, ACCESS_CONTROL_ALLOW_CREDENTIALS, ACCESS_CONTROL_ALLOW_HEADERS,
        ACCESS_CONTROL_ALLOW_METHODS, ACCESS_CONTROL_ALLOW_ORIGIN,
    },
    options, post, put, web, App, HttpRequest, HttpResponse, HttpServer, Responder, Result,
};
use dioxus::prelude::*;
use liroxnotes_app::WorkspaceShell;
use liroxnotes_shared::{workspace_view_from_notes, WorkspaceNote, DEMO_WORKSPACE};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    env, fs,
    path::{Component, Path, PathBuf},
    process::Command,
    time::{SystemTime, UNIX_EPOCH},
};

#[derive(Clone)]
struct AppState {
    paths: RuntimePaths,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct RuntimePaths {
    pub config_file: PathBuf,
    pub default_workspace: PathBuf,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct GatewayConfig {
    pub workspace_path: PathBuf,
    pub repo_url: String,
    pub branch: String,
}

#[derive(Serialize)]
struct SaveResponse {
    ok: bool,
    committed: bool,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

#[derive(Serialize)]
struct SessionResponse {
    authenticated: bool,
    user: String,
}

#[derive(Clone, Debug, PartialEq, Eq)]
struct Session {
    token: String,
    user: String,
}

#[derive(Serialize)]
struct WorkspaceResponse {
    slug: String,
    name: String,
    path: String,
    branch: String,
    source: String,
    note_count: usize,
    changed_notes: usize,
}

#[derive(Deserialize)]
struct WorkspaceRequest {
    workspace_path: Option<String>,
    repo_url: Option<String>,
    branch: Option<String>,
}

#[derive(Deserialize)]
struct LoginRequest {
    user: Option<String>,
}

#[derive(Serialize)]
struct FileResponse {
    path: String,
    body: String,
}

#[derive(Serialize)]
struct EmptyListResponse<T> {
    items: Vec<T>,
}

#[derive(Serialize)]
struct RepositoryResponse {
    id: String,
    repo_url: String,
    branch: String,
    connected: bool,
}

#[derive(Deserialize)]
struct RepositoryRequest {
    repo_url: String,
    branch: Option<String>,
}

#[derive(Serialize)]
struct SyncResponse {
    ok: bool,
    pulled: bool,
    pushed: bool,
    message: String,
}

pub fn runtime_paths() -> RuntimePaths {
    let config_file = env::var_os("LIROX_CONFIG_FILE").map(PathBuf::from);
    let default_workspace = env::var_os("LIROX_WORKSPACE_DIR").map(PathBuf::from);

    if cfg!(debug_assertions) {
        return RuntimePaths {
            config_file: config_file.unwrap_or_else(|| PathBuf::from(".lirox-runtime/config")),
            default_workspace: default_workspace
                .unwrap_or_else(|| PathBuf::from(".lirox-runtime/workspace")),
        };
    }

    let home = env::var_os("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."));
    let config_home = env::var_os("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| home.join(".config"));
    let data_home = env::var_os("XDG_DATA_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| home.join(".local/share"));

    RuntimePaths {
        config_file: config_file.unwrap_or_else(|| config_home.join("liroxnotes/config")),
        default_workspace: default_workspace
            .unwrap_or_else(|| data_home.join("liroxnotes/workspace")),
    }
}

pub fn port_from_args(args: impl IntoIterator<Item = String>) -> u16 {
    let mut args = args.into_iter().skip(1);
    while let Some(arg) = args.next() {
        if arg == "--port" || arg == "-p" {
            return args
                .next()
                .and_then(|value| value.parse().ok())
                .unwrap_or(3000);
        }

        if let Some(port) = arg
            .strip_prefix("--port=")
            .and_then(|value| value.parse().ok())
        {
            return port;
        }
    }

    env::var("LIROX_PORT")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(3000)
}

pub fn parse_config(input: &str) -> Option<GatewayConfig> {
    let mut values = HashMap::new();
    for line in input.lines() {
        let Some((key, value)) = line.split_once('=') else {
            continue;
        };
        values.insert(key.trim(), value.trim());
    }

    let workspace_path = values.get("workspace_path")?;
    if workspace_path.is_empty() {
        return None;
    }

    Some(GatewayConfig {
        workspace_path: PathBuf::from(workspace_path),
        repo_url: values
            .get("repo_url")
            .copied()
            .unwrap_or_default()
            .to_string(),
        branch: values
            .get("branch")
            .copied()
            .filter(|value| !value.is_empty())
            .unwrap_or("main")
            .to_string(),
    })
}

pub fn format_config(config: &GatewayConfig) -> String {
    format!(
        "workspace_path={}\nrepo_url={}\nbranch={}\n",
        config.workspace_path.display(),
        config.repo_url,
        config.branch
    )
}

pub fn load_config(path: &Path) -> std::io::Result<Option<GatewayConfig>> {
    match fs::read_to_string(path) {
        Ok(contents) => Ok(parse_config(&contents)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error),
    }
}

pub fn save_config(path: &Path, config: &GatewayConfig) -> std::io::Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(path, format_config(config))
}

fn session_file(paths: &RuntimePaths) -> PathBuf {
    paths.config_file.with_file_name("session")
}

fn parse_session(input: &str) -> Option<Session> {
    let mut token = None;
    let mut user = None;
    for line in input.lines() {
        let Some((key, value)) = line.split_once('=') else {
            continue;
        };
        match key.trim() {
            "token" => token = Some(value.trim().to_string()),
            "user" => user = Some(value.trim().to_string()),
            _ => {}
        }
    }
    Some(Session {
        token: token.filter(|value| !value.is_empty())?,
        user: user.filter(|value| !value.is_empty())?,
    })
}

fn load_session(paths: &RuntimePaths) -> std::io::Result<Option<Session>> {
    match fs::read_to_string(session_file(paths)) {
        Ok(contents) => Ok(parse_session(&contents)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error),
    }
}

fn save_session(paths: &RuntimePaths, user: &str) -> std::io::Result<Session> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let session = Session {
        token: format!("{now:x}"),
        user: user.trim().to_string(),
    };
    let path = session_file(paths);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(
        path,
        format!("token={}\nuser={}\n", session.token, session.user),
    )?;
    Ok(session)
}

fn clear_session(paths: &RuntimePaths) -> std::io::Result<()> {
    match fs::remove_file(session_file(paths)) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error),
    }
}

fn request_session(req: &HttpRequest, paths: &RuntimePaths) -> std::io::Result<Option<Session>> {
    let Some(session) = load_session(paths)? else {
        return Ok(None);
    };
    let ok = req
        .cookie("lirox_session")
        .map(|cookie| cookie.value() == session.token)
        .unwrap_or(false);
    Ok(ok.then_some(session))
}

fn is_authenticated(req: &HttpRequest, paths: &RuntimePaths) -> std::io::Result<bool> {
    Ok(request_session(req, paths)?.is_some())
}

pub fn safe_note_path(path: &str) -> Option<PathBuf> {
    if path.is_empty() || !path.ends_with(".md") {
        return None;
    }

    let path = Path::new(path);
    if path.is_absolute() {
        return None;
    }

    let mut clean = PathBuf::new();
    for component in path.components() {
        match component {
            Component::Normal(part) => clean.push(part),
            _ => return None,
        }
    }

    Some(clean)
}

fn run_git(workspace: &Path, args: &[&str]) -> std::io::Result<String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(workspace)
        .output()?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            String::from_utf8_lossy(&output.stderr).trim().to_string(),
        ))
    }
}

pub fn ensure_workspace(workspace: &Path) -> std::io::Result<()> {
    fs::create_dir_all(workspace)?;

    if run_git(workspace, &["rev-parse", "--is-inside-work-tree"]).is_err() {
        run_git(workspace, &["init"])?;
        run_git(workspace, &["config", "user.name", "LiroxNotes"])?;
        run_git(
            workspace,
            &["config", "user.email", "liroxnotes@example.local"],
        )?;
        run_git(workspace, &["add", "."])?;
        let _ = run_git(workspace, &["commit", "-m", "Initial notes"]);
    }

    Ok(())
}

fn read_notes(root: &Path, dir: &Path, notes: &mut Vec<WorkspaceNote>) -> std::io::Result<()> {
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.file_name().and_then(|name| name.to_str()) == Some(".git") {
            continue;
        }
        if path.is_dir() {
            read_notes(root, &path, notes)?;
            continue;
        }
        if path.extension().and_then(|ext| ext.to_str()) != Some("md") {
            continue;
        }

        let relative = path
            .strip_prefix(root)
            .unwrap_or(&path)
            .to_string_lossy()
            .replace('\\', "/");
        notes.push(WorkspaceNote {
            path: relative,
            body: fs::read_to_string(path)?,
        });
    }

    notes.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(())
}

pub fn changed_count(workspace: &Path) -> usize {
    run_git(workspace, &["status", "--porcelain"])
        .map(|status| status.lines().count())
        .unwrap_or(0)
}

fn current_branch(workspace: &Path, config: &GatewayConfig) -> String {
    run_git(workspace, &["rev-parse", "--abbrev-ref", "HEAD"])
        .unwrap_or_else(|_| config.branch.clone())
}

pub fn commit_note(workspace: &Path, path: &str) -> std::io::Result<bool> {
    let status = run_git(workspace, &["status", "--porcelain", "--", path])?;
    if status.is_empty() {
        return Ok(false);
    }

    if run_git(workspace, &["config", "--local", "user.name"])
        .unwrap_or_default()
        .is_empty()
    {
        run_git(workspace, &["config", "user.name", "LiroxNotes"])?;
    }
    if run_git(workspace, &["config", "--local", "user.email"])
        .unwrap_or_default()
        .is_empty()
    {
        run_git(
            workspace,
            &["config", "user.email", "liroxnotes@example.local"],
        )?;
    }

    run_git(workspace, &["add", "--", path])?;
    run_git(workspace, &["commit", "-m", &format!("Update {path}")])?;
    Ok(true)
}

fn save_note_body(config: &GatewayConfig, path: &str, body: String) -> std::io::Result<bool> {
    let Some(relative) = safe_note_path(path) else {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "invalid note path",
        ));
    };

    let absolute = config.workspace_path.join(&relative);
    if let Some(parent) = absolute.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(&absolute, body)?;
    commit_note(&config.workspace_path, &relative.to_string_lossy())
}

pub fn configure_git_remote(config: &GatewayConfig) -> std::io::Result<()> {
    if config.repo_url.trim().is_empty() {
        return Ok(());
    }

    if run_git(&config.workspace_path, &["remote", "get-url", "origin"]).is_ok() {
        run_git(
            &config.workspace_path,
            &["remote", "set-url", "origin", &config.repo_url],
        )?;
    } else {
        run_git(
            &config.workspace_path,
            &["remote", "add", "origin", &config.repo_url],
        )?;
    }

    Ok(())
}

fn html_page(title: &str, body: &str) -> HttpResponse {
    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(format!("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>{title}</title><link rel=\"stylesheet\" href=\"/assets/app.css\"></head><body>{body}</body></html>"))
}

fn cors(response: &mut HttpResponse) {
    if !cfg!(debug_assertions) && env::var("LIROX_DEV_CORS").is_err() {
        return;
    }

    response.headers_mut().insert(
        ACCESS_CONTROL_ALLOW_ORIGIN,
        HeaderValue::from_static("http://localhost:8989"),
    );
    response.headers_mut().insert(
        ACCESS_CONTROL_ALLOW_CREDENTIALS,
        HeaderValue::from_static("true"),
    );
    response.headers_mut().insert(
        ACCESS_CONTROL_ALLOW_METHODS,
        HeaderValue::from_static("GET, POST, PUT, DELETE, OPTIONS"),
    );
    response.headers_mut().insert(
        ACCESS_CONTROL_ALLOW_HEADERS,
        HeaderValue::from_static("content-type"),
    );
}

fn api_error(status: actix_web::http::StatusCode, message: &str) -> HttpResponse {
    let mut response = HttpResponse::build(status).json(ErrorResponse {
        error: message.to_string(),
    });
    cors(&mut response);
    response
}

fn workspace_summary(config: &GatewayConfig) -> std::io::Result<WorkspaceResponse> {
    let view = workspace_view_for_config(config, DEMO_WORKSPACE.default_note_path)?;
    Ok(WorkspaceResponse {
        slug: "demo".to_string(),
        name: view.name,
        path: config.workspace_path.to_string_lossy().to_string(),
        branch: view.branch,
        source: view.source,
        note_count: view.note_count,
        changed_notes: view.changed_notes,
    })
}

fn repository_summary(config: &GatewayConfig) -> RepositoryResponse {
    RepositoryResponse {
        id: "demo".to_string(),
        repo_url: config.repo_url.clone(),
        branch: config.branch.clone(),
        connected: !config.repo_url.trim().is_empty(),
    }
}

fn require_demo_workspace(workspace: &str) -> Option<HttpResponse> {
    (workspace != "demo").then(|| {
        api_error(
            actix_web::http::StatusCode::NOT_FOUND,
            "workspace not found",
        )
    })
}

fn require_demo_repository(repo_id: &str) -> Option<HttpResponse> {
    (repo_id != "demo").then(|| {
        api_error(
            actix_web::http::StatusCode::NOT_FOUND,
            "repository not found",
        )
    })
}

fn onboarding_page(paths: &RuntimePaths, error: Option<&str>) -> HttpResponse {
    let error = error
        .map(|message| format!("<p style=\"color:#ff8f40\">{message}</p>"))
        .unwrap_or_default();
    html_page(
        "Set Up LiroxNotes",
        &format!(
            r#"<main style="min-height:100vh;background:#0f1419;color:#e6e1cf;font-family:system-ui;padding:3rem;display:grid;place-items:center;">
<form method="post" action="/onboarding" style="width:min(100%,42rem);display:grid;gap:1rem;border:1px solid #272d38;background:#151b22;padding:2rem;border-radius:1rem;box-shadow:0 24px 80px rgba(0,0,0,.35);">
<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:#7c8796;">LiroxNotes MVP</div>
<h1 style="margin:0;font-size:1.7rem;">Set up your notes workspace</h1>
<p style="margin:0;color:#9aa4b2;">Choose the local folder that LiroxNotes should read and commit Markdown files into.</p>
{error}
<label style="color:#9aa4b2;">Workspace path<br><input name="workspace_path" value="{}" style="width:100%;box-sizing:border-box;margin-top:.5rem;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<label style="color:#9aa4b2;">Git remote URL<br><input name="repo_url" placeholder="git@github.com:you/notes.git" style="width:100%;box-sizing:border-box;margin-top:.5rem;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<label style="color:#9aa4b2;">Branch<br><input name="branch" value="main" style="width:100%;box-sizing:border-box;margin-top:.5rem;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<button type="submit" style="padding:.8rem 1rem;border:0;border-radius:.5rem;background:#95e6cb;color:#0f1419;font-weight:700;">Save configuration</button>
<p style="margin:0;color:#7c8796;font-size:.85rem;">Config file: {}</p>
</form>
</main>"#,
            html_escape(&paths.default_workspace.to_string_lossy()),
            html_escape(&paths.config_file.to_string_lossy())
        ),
    )
}

fn login_page(error: Option<&str>) -> HttpResponse {
    let error = error
        .map(|message| format!("<p style=\"color:#ff8f40\">{message}</p>"))
        .unwrap_or_default();
    html_page(
        "Log In To LiroxNotes",
        &format!(
            r#"<main style="min-height:100vh;background:#0f1419;color:#e6e1cf;font-family:system-ui;padding:3rem;display:grid;place-items:center;">
<form method="post" action="/login" style="width:min(100%,28rem);display:grid;gap:1rem;border:1px solid #272d38;background:#151b22;padding:2rem;border-radius:1rem;">
<h1 style="margin:0;font-size:1.7rem;">Log in</h1>
<p style="margin:0;color:#9aa4b2;">Local MVP login. Pick a display name to unlock this gateway on this machine.</p>
{error}
<label>Name<br><input name="user" value="local" autocomplete="username" style="width:100%;box-sizing:border-box;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<button type="submit" style="padding:.8rem 1rem;border:0;border-radius:.5rem;background:#95e6cb;color:#0f1419;font-weight:700;">Continue</button>
</form>
</main>"#,
        ),
    )
}

fn login_redirect() -> HttpResponse {
    HttpResponse::SeeOther()
        .append_header(("location", "/login"))
        .finish()
}

fn unauthorized() -> HttpResponse {
    api_error(actix_web::http::StatusCode::UNAUTHORIZED, "login required")
}

fn require_auth_api(
    req: &HttpRequest,
    paths: &RuntimePaths,
) -> std::io::Result<Option<HttpResponse>> {
    Ok((!is_authenticated(req, paths)?).then(unauthorized))
}

fn html_escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn form_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut output = Vec::new();
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'+' => output.push(b' '),
            b'%' if i + 2 < bytes.len() => {
                if let Ok(hex) = u8::from_str_radix(&input[i + 1..i + 3], 16) {
                    output.push(hex);
                    i += 2;
                }
            }
            byte => output.push(byte),
        }
        i += 1;
    }
    String::from_utf8_lossy(&output).to_string()
}

pub fn parse_onboarding_form(body: &str, default_workspace: &Path) -> GatewayConfig {
    let mut fields = HashMap::new();
    for pair in body.split('&') {
        let Some((key, value)) = pair.split_once('=') else {
            continue;
        };
        fields.insert(form_decode(key), form_decode(value));
    }

    let workspace_path = fields
        .get("workspace_path")
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .unwrap_or_else(|| default_workspace.to_path_buf());

    GatewayConfig {
        workspace_path,
        repo_url: fields.get("repo_url").cloned().unwrap_or_default(),
        branch: fields
            .get("branch")
            .filter(|value| !value.trim().is_empty())
            .cloned()
            .unwrap_or_else(|| "main".to_string()),
    }
}

fn parse_login_form(body: &str) -> String {
    for pair in body.split('&') {
        let Some((key, value)) = pair.split_once('=') else {
            continue;
        };
        if form_decode(key) == "user" {
            let user = form_decode(value).trim().to_string();
            if !user.is_empty() {
                return user;
            }
        }
    }
    "local".to_string()
}

pub fn configured_profile(paths: &RuntimePaths) -> std::io::Result<Option<GatewayConfig>> {
    let Some(config) = load_config(&paths.config_file)? else {
        return Ok(None);
    };

    ensure_workspace(&config.workspace_path)?;
    configure_git_remote(&config)?;
    Ok(Some(config))
}

fn configured(state: &AppState) -> std::io::Result<Option<GatewayConfig>> {
    configured_profile(&state.paths)
}

fn log_error(context: &str, error: &dyn std::fmt::Display) {
    eprintln!("liroxnotes: {context}: {error}");
}

pub fn workspace_view_for_config(
    config: &GatewayConfig,
    selected_note_path: &str,
) -> std::io::Result<liroxnotes_shared::WorkspaceView> {
    let mut notes = Vec::new();
    read_notes(&config.workspace_path, &config.workspace_path, &mut notes)?;

    let default_note = notes
        .first()
        .map(|record| record.path.as_str())
        .unwrap_or(DEMO_WORKSPACE.default_note_path);

    Ok(workspace_view_from_notes(
        "demo",
        "MVP Git Workspace",
        &current_branch(&config.workspace_path, config),
        if config.repo_url.is_empty() {
            "local git"
        } else {
            &config.repo_url
        },
        default_note,
        selected_note_path,
        changed_count(&config.workspace_path),
        &notes,
    ))
}

fn render_workspace(config: &GatewayConfig, selected_note_path: &str) -> HttpResponse {
    let view = match workspace_view_for_config(config, selected_note_path) {
        Ok(view) => view,
        Err(error) => return HttpResponse::InternalServerError().body(error.to_string()),
    };
    let browser_dir = selected_note_path
        .rsplit_once('/')
        .map(|(dir, _)| dir)
        .unwrap_or("");
    let body = dioxus_ssr::render_element(rsx!(WorkspaceShell {
        view,
        focus: liroxnotes_app::FocusTarget::Sidebar,
        sidebar_mode: liroxnotes_app::SidebarMode::Tree,
        browser_dir: browser_dir.to_string(),
        on_action: None,
        on_select_note: None
    }));

    html_page("LiroxNotes", &body)
}

#[get("/")]
async fn index(state: web::Data<AppState>, req: HttpRequest) -> impl Responder {
    match is_authenticated(&req, &state.paths) {
        Ok(true) => {}
        Ok(false) => return login_redirect(),
        Err(error) => return HttpResponse::InternalServerError().body(error.to_string()),
    }
    match configured(&state) {
        Ok(Some(config)) => render_workspace(&config, DEMO_WORKSPACE.default_note_path),
        Ok(None) => onboarding_page(&state.paths, None),
        Err(error) => HttpResponse::InternalServerError().body(error.to_string()),
    }
}

#[get("/login")]
async fn login() -> impl Responder {
    login_page(None)
}

#[post("/login")]
async fn save_login(state: web::Data<AppState>, body: String) -> Result<HttpResponse> {
    let user = parse_login_form(&body);
    let session = save_session(&state.paths, &user)?;
    Ok(HttpResponse::SeeOther()
        .append_header(("location", "/"))
        .append_header((
            "set-cookie",
            format!(
                "lirox_session={}; Path=/; HttpOnly; SameSite=Lax",
                session.token
            ),
        ))
        .finish())
}

#[post("/logout")]
async fn logout(state: web::Data<AppState>) -> Result<HttpResponse> {
    clear_session(&state.paths)?;
    Ok(HttpResponse::SeeOther()
        .append_header(("location", "/login"))
        .append_header((
            "set-cookie",
            "lirox_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
        ))
        .finish())
}

#[get("/onboarding")]
async fn onboarding(state: web::Data<AppState>, req: HttpRequest) -> impl Responder {
    match is_authenticated(&req, &state.paths) {
        Ok(true) => {}
        Ok(false) => return login_redirect(),
        Err(error) => return HttpResponse::InternalServerError().body(error.to_string()),
    }
    onboarding_page(&state.paths, None)
}

#[post("/onboarding")]
async fn save_onboarding(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: String,
) -> Result<HttpResponse> {
    if !is_authenticated(&req, &state.paths)? {
        return Ok(login_redirect());
    }
    let config = parse_onboarding_form(&body, &state.paths.default_workspace);
    if let Err(error) = ensure_workspace(&config.workspace_path)
        .and_then(|_| configure_git_remote(&config))
        .and_then(|_| save_config(&state.paths.config_file, &config))
    {
        log_error("onboarding failed", &error);
        return Ok(onboarding_page(&state.paths, Some(&error.to_string())));
    }

    Ok(HttpResponse::SeeOther()
        .append_header(("location", "/workspace/demo"))
        .finish())
}

#[get("/workspace/demo")]
async fn workspace_page(state: web::Data<AppState>, req: HttpRequest) -> impl Responder {
    match is_authenticated(&req, &state.paths) {
        Ok(true) => {}
        Ok(false) => return login_redirect(),
        Err(error) => return HttpResponse::InternalServerError().body(error.to_string()),
    }
    match configured(&state) {
        Ok(Some(config)) => render_workspace(&config, DEMO_WORKSPACE.default_note_path),
        Ok(None) => HttpResponse::SeeOther()
            .append_header(("location", "/onboarding"))
            .finish(),
        Err(error) => HttpResponse::InternalServerError().body(error.to_string()),
    }
}

#[get("/workspace/demo/note/{path:.*}")]
async fn note_page(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<String>,
) -> impl Responder {
    match is_authenticated(&req, &state.paths) {
        Ok(true) => {}
        Ok(false) => return login_redirect(),
        Err(error) => return HttpResponse::InternalServerError().body(error.to_string()),
    }
    match configured(&state) {
        Ok(Some(config)) => render_workspace(&config, &path.into_inner()),
        Ok(None) => HttpResponse::SeeOther()
            .append_header(("location", "/onboarding"))
            .finish(),
        Err(error) => HttpResponse::InternalServerError().body(error.to_string()),
    }
}

fn auth_response(req: &HttpRequest, paths: &RuntimePaths) -> std::io::Result<HttpResponse> {
    let session = request_session(req, paths)?;
    let mut response = HttpResponse::Ok().json(SessionResponse {
        authenticated: session.is_some(),
        user: session.map(|session| session.user).unwrap_or_default(),
    });
    cors(&mut response);
    Ok(response)
}

#[get("/api/auth")]
async fn auth_root_api(state: web::Data<AppState>, req: HttpRequest) -> Result<HttpResponse> {
    Ok(auth_response(&req, &state.paths)?)
}

#[get("/api/auth/{path:.*}")]
async fn auth_api(state: web::Data<AppState>, req: HttpRequest) -> Result<HttpResponse> {
    Ok(auth_response(&req, &state.paths)?)
}

#[post("/api/auth/login")]
async fn auth_login_api(
    state: web::Data<AppState>,
    request: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    let user = request
        .user
        .as_deref()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("local");
    let session = save_session(&state.paths, user)?;
    let mut response = HttpResponse::Ok().json(SessionResponse {
        authenticated: true,
        user: session.user,
    });
    response.headers_mut().insert(
        actix_web::http::header::SET_COOKIE,
        HeaderValue::from_str(&format!(
            "lirox_session={}; Path=/; HttpOnly; SameSite=Lax",
            session.token
        ))
        .unwrap(),
    );
    cors(&mut response);
    Ok(response)
}

#[post("/api/auth/logout")]
async fn auth_logout_api(state: web::Data<AppState>) -> Result<HttpResponse> {
    clear_session(&state.paths)?;
    let mut response = HttpResponse::Ok().json(SessionResponse {
        authenticated: false,
        user: String::new(),
    });
    response.headers_mut().insert(
        actix_web::http::header::SET_COOKIE,
        HeaderValue::from_static("lirox_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"),
    );
    cors(&mut response);
    Ok(response)
}

#[get("/api/workspaces")]
async fn workspaces_api(state: web::Data<AppState>, req: HttpRequest) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    let Some(config) = configured(&state)? else {
        return Ok(api_error(
            actix_web::http::StatusCode::BAD_REQUEST,
            "workspace is not configured",
        ));
    };
    let mut response = HttpResponse::Ok().json(vec![workspace_summary(&config)?]);
    cors(&mut response);
    Ok(response)
}

#[post("/api/workspaces")]
async fn create_workspace_api(
    state: web::Data<AppState>,
    req: HttpRequest,
    request: web::Json<WorkspaceRequest>,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    let config = GatewayConfig {
        workspace_path: request
            .workspace_path
            .as_deref()
            .filter(|value| !value.trim().is_empty())
            .map(PathBuf::from)
            .unwrap_or_else(|| state.paths.default_workspace.clone()),
        repo_url: request.repo_url.clone().unwrap_or_default(),
        branch: request
            .branch
            .clone()
            .filter(|value| !value.trim().is_empty())
            .unwrap_or_else(|| "main".to_string()),
    };
    ensure_workspace(&config.workspace_path)?;
    configure_git_remote(&config)?;
    save_config(&state.paths.config_file, &config)?;

    let mut response = HttpResponse::Created().json(workspace_summary(&config)?);
    cors(&mut response);
    Ok(response)
}

#[get("/api/workspaces/{workspace}")]
async fn workspace_resource_api(
    state: web::Data<AppState>,
    req: HttpRequest,
    workspace: web::Path<String>,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    if let Some(response) = require_demo_workspace(&workspace) {
        return Ok(response);
    }
    let Some(config) = configured(&state)? else {
        return Ok(api_error(
            actix_web::http::StatusCode::BAD_REQUEST,
            "workspace is not configured",
        ));
    };
    let mut response = HttpResponse::Ok().json(workspace_summary(&config)?);
    cors(&mut response);
    Ok(response)
}

#[post("/api/workspaces/{workspace}/sync")]
async fn sync_workspace_api(
    state: web::Data<AppState>,
    req: HttpRequest,
    workspace: web::Path<String>,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    if let Some(response) = require_demo_workspace(&workspace) {
        return Ok(response);
    }
    let Some(config) = configured(&state)? else {
        return Ok(api_error(
            actix_web::http::StatusCode::BAD_REQUEST,
            "workspace is not configured",
        ));
    };

    let (pulled, pushed, message) = if config.repo_url.trim().is_empty() {
        (false, false, "local workspace has no remote".to_string())
    } else {
        run_git(
            &config.workspace_path,
            &["pull", "--ff-only", "origin", &config.branch],
        )?;
        run_git(
            &config.workspace_path,
            &["push", "origin", &format!("HEAD:{}", config.branch)],
        )?;
        (true, true, "synced".to_string())
    };

    let mut response = HttpResponse::Ok().json(SyncResponse {
        ok: true,
        pulled,
        pushed,
        message,
    });
    cors(&mut response);
    Ok(response)
}

#[get("/api/workspaces/{workspace}/files/{path:.*}")]
async fn get_workspace_file_api(
    state: web::Data<AppState>,
    req: HttpRequest,
    route: web::Path<(String, String)>,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    let (workspace, path) = route.into_inner();
    if let Some(response) = require_demo_workspace(&workspace) {
        return Ok(response);
    }
    let Some(config) = configured(&state)? else {
        return Ok(api_error(
            actix_web::http::StatusCode::BAD_REQUEST,
            "workspace is not configured",
        ));
    };
    let Some(relative) = safe_note_path(&path) else {
        return Ok(api_error(
            actix_web::http::StatusCode::BAD_REQUEST,
            "invalid note path",
        ));
    };
    let body = fs::read_to_string(config.workspace_path.join(&relative))?;
    let mut response = HttpResponse::Ok().json(FileResponse { path, body });
    cors(&mut response);
    Ok(response)
}

#[put("/api/workspaces/{workspace}/files/{path:.*}")]
async fn put_workspace_file_api(
    state: web::Data<AppState>,
    req: HttpRequest,
    route: web::Path<(String, String)>,
    body: String,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    let (workspace, path) = route.into_inner();
    if let Some(response) = require_demo_workspace(&workspace) {
        return Ok(response);
    }
    let Some(config) = configured(&state)? else {
        return Ok(api_error(
            actix_web::http::StatusCode::BAD_REQUEST,
            "workspace is not configured",
        ));
    };
    let committed = match save_note_body(&config, &path, body) {
        Ok(committed) => committed,
        Err(error) if error.kind() == std::io::ErrorKind::InvalidInput => {
            return Ok(api_error(
                actix_web::http::StatusCode::BAD_REQUEST,
                "invalid note path",
            ));
        }
        Err(error) => return Err(error.into()),
    };
    let mut response = HttpResponse::Ok().json(SaveResponse {
        ok: true,
        committed,
    });
    cors(&mut response);
    Ok(response)
}

#[delete("/api/workspaces/{workspace}/files/{path:.*}")]
async fn delete_workspace_file_api(
    state: web::Data<AppState>,
    req: HttpRequest,
    route: web::Path<(String, String)>,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    let (workspace, path) = route.into_inner();
    if let Some(response) = require_demo_workspace(&workspace) {
        return Ok(response);
    }
    let Some(config) = configured(&state)? else {
        return Ok(api_error(
            actix_web::http::StatusCode::BAD_REQUEST,
            "workspace is not configured",
        ));
    };
    let Some(relative) = safe_note_path(&path) else {
        return Ok(api_error(
            actix_web::http::StatusCode::BAD_REQUEST,
            "invalid note path",
        ));
    };
    let absolute = config.workspace_path.join(&relative);
    let committed = if absolute.exists() {
        fs::remove_file(&absolute)?;
        commit_note(&config.workspace_path, &relative.to_string_lossy())?
    } else {
        false
    };
    let mut response = HttpResponse::Ok().json(SaveResponse {
        ok: true,
        committed,
    });
    cors(&mut response);
    Ok(response)
}

#[get("/api/workspaces/{workspace}/conflicts")]
async fn conflicts_api(
    state: web::Data<AppState>,
    req: HttpRequest,
    workspace: web::Path<String>,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    if let Some(response) = require_demo_workspace(&workspace) {
        return Ok(response);
    }
    let mut response = HttpResponse::Ok().json(EmptyListResponse::<String> { items: vec![] });
    cors(&mut response);
    Ok(response)
}

#[get("/api/workspaces/{workspace}/trash")]
async fn trash_api(
    state: web::Data<AppState>,
    req: HttpRequest,
    workspace: web::Path<String>,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    if let Some(response) = require_demo_workspace(&workspace) {
        return Ok(response);
    }
    let mut response = HttpResponse::Ok().json(EmptyListResponse::<String> { items: vec![] });
    cors(&mut response);
    Ok(response)
}

#[get("/api/repositories")]
async fn repositories_api(state: web::Data<AppState>, req: HttpRequest) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    let Some(config) = configured(&state)? else {
        return Ok(api_error(
            actix_web::http::StatusCode::BAD_REQUEST,
            "workspace is not configured",
        ));
    };
    let mut response = HttpResponse::Ok().json(vec![repository_summary(&config)]);
    cors(&mut response);
    Ok(response)
}

#[get("/api/repositories/{repo_id}")]
async fn repository_api(
    state: web::Data<AppState>,
    req: HttpRequest,
    repo_id: web::Path<String>,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    if let Some(response) = require_demo_repository(&repo_id) {
        return Ok(response);
    }
    let Some(config) = configured(&state)? else {
        return Ok(api_error(
            actix_web::http::StatusCode::BAD_REQUEST,
            "workspace is not configured",
        ));
    };
    let mut response = HttpResponse::Ok().json(repository_summary(&config));
    cors(&mut response);
    Ok(response)
}

#[post("/api/repositories/{repo_id}/connect")]
async fn connect_repository_api(
    state: web::Data<AppState>,
    req: HttpRequest,
    repo_id: web::Path<String>,
    request: web::Json<RepositoryRequest>,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    if let Some(response) = require_demo_repository(&repo_id) {
        return Ok(response);
    }
    let Some(mut config) = configured(&state)? else {
        return Ok(api_error(
            actix_web::http::StatusCode::BAD_REQUEST,
            "workspace is not configured",
        ));
    };
    config.repo_url = request.repo_url.clone();
    if let Some(branch) = &request.branch {
        if !branch.trim().is_empty() {
            config.branch = branch.clone();
        }
    }
    configure_git_remote(&config)?;
    save_config(&state.paths.config_file, &config)?;
    let mut response = HttpResponse::Ok().json(repository_summary(&config));
    cors(&mut response);
    Ok(response)
}

#[post("/api/repositories/{repo_id}/disconnect")]
async fn disconnect_repository_api(
    state: web::Data<AppState>,
    req: HttpRequest,
    repo_id: web::Path<String>,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    if let Some(response) = require_demo_repository(&repo_id) {
        return Ok(response);
    }
    let Some(mut config) = configured(&state)? else {
        return Ok(api_error(
            actix_web::http::StatusCode::BAD_REQUEST,
            "workspace is not configured",
        ));
    };
    let _ = run_git(&config.workspace_path, &["remote", "remove", "origin"]);
    config.repo_url.clear();
    save_config(&state.paths.config_file, &config)?;
    let mut response = HttpResponse::Ok().json(repository_summary(&config));
    cors(&mut response);
    Ok(response)
}

#[put("/api/notes/{path:.*}")]
async fn save_note(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<String>,
    body: String,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    let Some(config) = configured(&state)? else {
        let mut response = HttpResponse::BadRequest().body("workspace is not configured");
        cors(&mut response);
        return Ok(response);
    };
    let path = path.into_inner();
    let committed = match save_note_body(&config, &path, body) {
        Ok(committed) => committed,
        Err(error) if error.kind() == std::io::ErrorKind::InvalidInput => {
            let mut response = HttpResponse::BadRequest().body("invalid note path");
            cors(&mut response);
            return Ok(response);
        }
        Err(error) => {
            log_error("save failed", &error);
            return Err(error.into());
        }
    };

    let mut response = HttpResponse::Ok().json(SaveResponse {
        ok: true,
        committed,
    });
    cors(&mut response);
    Ok(response)
}

#[options("/api/notes/{path:.*}")]
async fn notes_preflight() -> HttpResponse {
    let mut response = HttpResponse::NoContent().finish();
    cors(&mut response);
    response
}

#[get("/api/workspace/{path:.*}")]
async fn workspace_api(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<String>,
) -> Result<HttpResponse> {
    if let Some(response) = require_auth_api(&req, &state.paths)? {
        return Ok(response);
    }
    let Some(config) = configured(&state)? else {
        let mut response = HttpResponse::BadRequest().body("workspace is not configured");
        cors(&mut response);
        return Ok(response);
    };
    let selected = if path.is_empty() {
        DEMO_WORKSPACE.default_note_path
    } else {
        &path
    };
    let mut response = HttpResponse::Ok().json(workspace_view_for_config(&config, selected)?);
    cors(&mut response);
    Ok(response)
}

#[options("/api/workspace/{path:.*}")]
async fn workspace_preflight() -> HttpResponse {
    let mut response = HttpResponse::NoContent().finish();
    cors(&mut response);
    response
}

#[options("/api/{path:.*}")]
async fn api_preflight() -> HttpResponse {
    let mut response = HttpResponse::NoContent().finish();
    cors(&mut response);
    response
}

pub async fn serve(paths: RuntimePaths, port: u16) -> std::io::Result<()> {
    configured_profile(&paths)?;
    let state = web::Data::new(AppState { paths });

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .service(index)
            .service(login)
            .service(save_login)
            .service(logout)
            .service(onboarding)
            .service(save_onboarding)
            .service(workspace_page)
            .service(note_page)
            .service(auth_root_api)
            .service(auth_login_api)
            .service(auth_logout_api)
            .service(auth_api)
            .service(workspaces_api)
            .service(create_workspace_api)
            .service(workspace_resource_api)
            .service(sync_workspace_api)
            .service(get_workspace_file_api)
            .service(put_workspace_file_api)
            .service(delete_workspace_file_api)
            .service(conflicts_api)
            .service(trash_api)
            .service(repositories_api)
            .service(repository_api)
            .service(connect_repository_api)
            .service(disconnect_repository_api)
            .service(save_note)
            .service(notes_preflight)
            .service(workspace_api)
            .service(workspace_preflight)
            .service(api_preflight)
            .service(Files::new("/assets", "crates/app/assets"))
    })
    .bind(("127.0.0.1", port))?
    .run()
    .await
}
