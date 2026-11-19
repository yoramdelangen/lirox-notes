//! The embedded server and the native window around it.

use std::{
    env,
    net::{Ipv4Addr, SocketAddr, TcpListener},
    path::PathBuf,
};

use axum::{
    extract::Query,
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use liroxnotes_backend::DESKTOP_TOKEN_ENV;
use tao::{
    dpi::LogicalSize,
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
};
use wry::{NewWindowResponse, WebViewBuilder};

/// Exchanges the launch token for the cookie the server checks, so the token
/// itself never has to live in the page.
const ENTER_PATH: &str = "/__desktop/enter";

const PREFERRED_PORT: u16 = 47_631;

pub fn run() {
    // Debug builds accept a preset token so a test browser can sign in too.
    let token = env::var(DESKTOP_TOKEN_ENV)
        .ok()
        .filter(|token| cfg!(debug_assertions) && !token.is_empty())
        .unwrap_or_else(|| {
            format!(
                "{}{}",
                uuid::Uuid::new_v4().simple(),
                uuid::Uuid::new_v4().simple()
            )
        });
    // A stable port keeps the page's origin, and so its local storage (the
    // cached theme), the same across launches; any free port is the fallback.
    let listener = TcpListener::bind(SocketAddr::from((Ipv4Addr::LOCALHOST, PREFERRED_PORT)))
        .or_else(|_| TcpListener::bind(SocketAddr::from((Ipv4Addr::LOCALHOST, 0))))
        .expect("bind a loopback port for the embedded server");
    let port = listener.local_addr().expect("loopback address").port();

    // Everything the backend reads from the environment is set here, before
    // any other thread exists.
    configure_environment(&token);

    let runtime = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("start the async runtime");
    let server_token = token.clone();
    runtime.spawn(async move {
        listener
            .set_nonblocking(true)
            .expect("non-blocking listener");
        let listener =
            tokio::net::TcpListener::from_std(listener).expect("hand the listener to tokio");
        let router = Router::new()
            .route(
                ENTER_PATH,
                get(move |query: Query<EnterQuery>| enter(query, server_token.clone())),
            )
            .merge(dioxus::server::router(liroxnotes_app::App));
        if let Err(error) = axum::serve(listener, router).await {
            eprintln!("embedded server stopped: {error}");
        }
    });

    // `localhost`, not the IP: debug web builds redirect loopback IPs there
    // (passkeys need a hostname), which would strand the cookie on the IP.
    let origin = format!("http://localhost:{port}");
    run_window(&origin, &format!("{origin}{ENTER_PATH}?token={token}"));
}

#[derive(serde::Deserialize)]
struct EnterQuery {
    token: String,
}

async fn enter(Query(query): Query<EnterQuery>, token: String) -> Response {
    if query.token != token {
        return StatusCode::FORBIDDEN.into_response();
    }
    (
        StatusCode::SEE_OTHER,
        [
            (
                header::SET_COOKIE,
                format!("lirox_desktop={token}; Path=/; HttpOnly; SameSite=Strict"),
            ),
            (header::LOCATION, "/".to_string()),
        ],
    )
        .into_response()
}

fn configure_environment(token: &str) {
    env::set_var(DESKTOP_TOKEN_ENV, token);
    let data = data_dir();
    for (name, path) in [
        ("LIROX_CONFIG_FILE", data.join("config/config")),
        ("LIROX_APP_CONFIG", data.join("config/config.toml")),
        ("LIROX_WORKSPACE_DIR", data.join("workspace")),
    ] {
        if env::var_os(name).is_none() {
            env::set_var(name, path);
        }
    }
    if env::var_os("DIOXUS_PUBLIC_PATH").is_none() {
        if let Some(public) = bundled_public_dir() {
            env::set_var("DIOXUS_PUBLIC_PATH", public);
        }
    }
}

/// `~/Library/Application Support/LiroxNotes`; `LIROX_DESKTOP_DATA_DIR`
/// overrides it.
fn data_dir() -> PathBuf {
    if let Some(dir) = env::var_os("LIROX_DESKTOP_DATA_DIR") {
        return PathBuf::from(dir);
    }
    let home = env::var_os("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."));
    home.join("Library/Application Support/LiroxNotes")
}

/// The web client shipped with the app: `Contents/Resources/public` inside a
/// macOS bundle, or `public/` next to the binary.
fn bundled_public_dir() -> Option<PathBuf> {
    let exe = env::current_exe().ok()?;
    let dir = exe.parent()?;
    [dir.join("../Resources/public"), dir.join("public")]
        .into_iter()
        .find(|path| path.join("index.html").is_file())
}

fn run_window(origin: &str, start_url: &str) {
    let event_loop = EventLoop::new();
    let window = WindowBuilder::new()
        .with_title("LiroxNotes")
        .with_inner_size(LogicalSize::new(1280.0, 820.0))
        .with_min_inner_size(LogicalSize::new(640.0, 480.0))
        .build(&event_loop)
        .expect("open the main window");

    // macOS routes copy, paste and quit shortcuts through the menu bar; a
    // webview without these menus ignores them.
    let _menu = app_menu();

    let navigation_origin = origin.to_string();
    let popup_origin = origin.to_string();
    let _webview = WebViewBuilder::new()
        .with_url(start_url)
        .with_devtools(cfg!(debug_assertions))
        .with_navigation_handler(move |url| keep_or_open_externally(&navigation_origin, &url))
        .with_new_window_req_handler(move |url, _| {
            keep_or_open_externally(&popup_origin, &url);
            NewWindowResponse::Deny
        })
        .build(&window)
        .expect("create the webview");

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;
        if let Event::WindowEvent {
            event: WindowEvent::CloseRequested,
            ..
        } = event
        {
            *control_flow = ControlFlow::Exit;
        }
    });
}

/// Pages of the embedded server stay in the window; anything else opens in
/// the system browser.
fn keep_or_open_externally(origin: &str, url: &str) -> bool {
    if is_same_origin(origin, url) {
        return true;
    }
    if url.starts_with("http://") || url.starts_with("https://") || url.starts_with("mailto:") {
        let _ = std::process::Command::new("open").arg(url).spawn();
    }
    false
}

fn is_same_origin(origin: &str, url: &str) -> bool {
    url.strip_prefix(origin)
        .is_some_and(|rest| rest.is_empty() || rest.starts_with(['/', '?', '#']))
}

fn app_menu() -> muda::Menu {
    use muda::{Menu, PredefinedMenuItem as Item, Submenu};

    let menu = Menu::new();
    let app = Submenu::with_items(
        "LiroxNotes",
        true,
        &[
            &Item::about(None, None),
            &Item::separator(),
            &Item::services(None),
            &Item::separator(),
            &Item::hide(None),
            &Item::hide_others(None),
            &Item::show_all(None),
            &Item::separator(),
            &Item::quit(None),
        ],
    );
    let edit = Submenu::with_items(
        "Edit",
        true,
        &[
            &Item::undo(None),
            &Item::redo(None),
            &Item::separator(),
            &Item::cut(None),
            &Item::copy(None),
            &Item::paste(None),
            &Item::select_all(None),
        ],
    );
    let window = Submenu::with_items(
        "Window",
        true,
        &[
            &Item::minimize(None),
            &Item::fullscreen(None),
            &Item::close_window(None),
        ],
    );
    for submenu in [app, edit, window] {
        menu.append(&submenu.expect("build the menu"))
            .expect("build the menu");
    }
    menu.init_for_nsapp();
    menu
}

#[cfg(test)]
mod tests {
    use super::is_same_origin;

    #[test]
    fn only_the_embedded_server_stays_in_the_window() {
        let origin = "http://localhost:4100";
        assert!(is_same_origin(origin, "http://localhost:4100"));
        assert!(is_same_origin(origin, "http://localhost:4100/notes?x=1"));
        assert!(!is_same_origin(origin, "http://localhost:41000/"));
        assert!(!is_same_origin(origin, "http://localhost:4100.evil.test/"));
        assert!(!is_same_origin(origin, "https://example.com/"));
    }
}
