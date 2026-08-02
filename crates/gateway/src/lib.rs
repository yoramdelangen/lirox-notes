use actix_files::Files;
use actix_web::{get, post, put, web, App, HttpResponse, HttpServer, Responder, Result};
use dioxus::prelude::*;
use liroxnotes_app::WorkspaceShell;
use liroxnotes_shared::{workspace_view_from_notes, WorkspaceNote, DEMO_WORKSPACE};
use serde::Serialize;
use std::{
    collections::HashMap,
    env, fs,
    path::{Component, Path, PathBuf},
    process::Command,
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

pub fn runtime_paths() -> RuntimePaths {
    if cfg!(debug_assertions) {
        return RuntimePaths {
            config_file: PathBuf::from(".lirox-runtime/config"),
            default_workspace: PathBuf::from(".lirox-runtime/workspace"),
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
        config_file: config_home.join("liroxnotes/config"),
        default_workspace: data_home.join("liroxnotes/workspace"),
    }
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

    for record in DEMO_WORKSPACE.notes {
        let path = workspace.join(record.path);
        if path.exists() {
            continue;
        }
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(path, record.body)?;
    }

    if !workspace.join(".git").exists() {
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

    run_git(workspace, &["add", "--", path])?;
    run_git(workspace, &["commit", "-m", &format!("Update {path}")])?;
    Ok(true)
}

fn html_page(title: &str, body: &str) -> HttpResponse {
    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(format!("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>{title}</title><link rel=\"stylesheet\" href=\"/assets/app.css\"></head><body>{body}</body></html>"))
}

fn onboarding_page(paths: &RuntimePaths, error: Option<&str>) -> HttpResponse {
    let error = error
        .map(|message| format!("<p style=\"color:#ff8f40\">{message}</p>"))
        .unwrap_or_default();
    html_page(
        "Set Up LiroxNotes",
        &format!(
            r#"<main style="min-height:100vh;background:#0f1419;color:#e6e1cf;font-family:system-ui;padding:3rem;">
<form method="post" action="/onboarding" style="max-width:42rem;margin:auto;display:grid;gap:1rem;">
<h1>Set up your notes workspace</h1>
{error}
<label>Workspace path<br><input name="workspace_path" value="{}" style="width:100%;padding:.7rem;"></label>
<label>Git remote URL (optional for now)<br><input name="repo_url" placeholder="git@github.com:you/notes.git" style="width:100%;padding:.7rem;"></label>
<label>Branch<br><input name="branch" value="main" style="width:100%;padding:.7rem;"></label>
<button type="submit" style="padding:.8rem 1rem;">Save configuration</button>
<p>Config file: {}</p>
</form>
</main>"#,
            html_escape(&paths.default_workspace.to_string_lossy()),
            html_escape(&paths.config_file.to_string_lossy())
        ),
    )
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

fn configured(state: &AppState) -> std::io::Result<Option<GatewayConfig>> {
    load_config(&state.paths.config_file)
}

fn render_workspace(config: &GatewayConfig, selected_note_path: &str) -> HttpResponse {
    let mut notes = Vec::new();
    if let Err(error) = read_notes(&config.workspace_path, &config.workspace_path, &mut notes) {
        return HttpResponse::InternalServerError().body(error.to_string());
    }

    let default_note = notes
        .first()
        .map(|record| record.path.as_str())
        .unwrap_or(DEMO_WORKSPACE.default_note_path);
    let view = workspace_view_from_notes(
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
    );
    let browser_dir = selected_note_path
        .rsplit_once('/')
        .map(|(dir, _)| dir)
        .unwrap_or("");
    let body = dioxus_ssr::render_element(rsx!(WorkspaceShell {
        view,
        focus: liroxnotes_app::FocusTarget::Sidebar,
        sidebar_mode: liroxnotes_app::SidebarMode::Tree,
        browser_dir: browser_dir.to_string(),
        on_action: |_| {},
        on_select_note: |_| {}
    }));

    html_page("LiroxNotes", &body)
}

#[get("/")]
async fn index(state: web::Data<AppState>) -> impl Responder {
    match configured(&state) {
        Ok(Some(config)) => render_workspace(&config, DEMO_WORKSPACE.default_note_path),
        Ok(None) => onboarding_page(&state.paths, None),
        Err(error) => HttpResponse::InternalServerError().body(error.to_string()),
    }
}

#[get("/onboarding")]
async fn onboarding(state: web::Data<AppState>) -> impl Responder {
    onboarding_page(&state.paths, None)
}

#[post("/onboarding")]
async fn save_onboarding(state: web::Data<AppState>, body: String) -> Result<HttpResponse> {
    let config = parse_onboarding_form(&body, &state.paths.default_workspace);
    if let Err(error) = ensure_workspace(&config.workspace_path)
        .and_then(|_| save_config(&state.paths.config_file, &config))
    {
        return Ok(onboarding_page(&state.paths, Some(&error.to_string())));
    }

    Ok(HttpResponse::SeeOther()
        .append_header(("location", "/workspace/demo"))
        .finish())
}

#[get("/workspace/demo")]
async fn workspace_page(state: web::Data<AppState>) -> impl Responder {
    match configured(&state) {
        Ok(Some(config)) => render_workspace(&config, DEMO_WORKSPACE.default_note_path),
        Ok(None) => HttpResponse::SeeOther()
            .append_header(("location", "/onboarding"))
            .finish(),
        Err(error) => HttpResponse::InternalServerError().body(error.to_string()),
    }
}

#[get("/workspace/demo/note/{path:.*}")]
async fn note_page(state: web::Data<AppState>, path: web::Path<String>) -> impl Responder {
    match configured(&state) {
        Ok(Some(config)) => render_workspace(&config, &path.into_inner()),
        Ok(None) => HttpResponse::SeeOther()
            .append_header(("location", "/onboarding"))
            .finish(),
        Err(error) => HttpResponse::InternalServerError().body(error.to_string()),
    }
}

#[put("/api/notes/{path:.*}")]
async fn save_note(
    state: web::Data<AppState>,
    path: web::Path<String>,
    body: String,
) -> Result<HttpResponse> {
    let Some(config) = configured(&state)? else {
        return Ok(HttpResponse::BadRequest().body("workspace is not configured"));
    };
    let path = path.into_inner();
    let Some(relative) = safe_note_path(&path) else {
        return Ok(HttpResponse::BadRequest().body("invalid note path"));
    };

    let absolute = config.workspace_path.join(&relative);
    if let Some(parent) = absolute.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(&absolute, body)?;
    let committed = commit_note(&config.workspace_path, &relative.to_string_lossy())?;

    Ok(HttpResponse::Ok().json(SaveResponse {
        ok: true,
        committed,
    }))
}

pub async fn serve(paths: RuntimePaths) -> std::io::Result<()> {
    if let Some(config) = load_config(&paths.config_file)? {
        ensure_workspace(&config.workspace_path)?;
    }
    let state = web::Data::new(AppState { paths });

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .service(index)
            .service(onboarding)
            .service(save_onboarding)
            .service(workspace_page)
            .service(note_page)
            .service(save_note)
            .service(Files::new("/assets", "crates/app/assets"))
    })
    .bind(("127.0.0.1", 3000))?
    .run()
    .await
}
