use actix_files::Files;
use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use dioxus::prelude::*;
use liroxnotes_app::WorkspaceShell;
use liroxnotes_shared::mock_workspace_view;

fn render_workspace(selected_note_path: &str) -> HttpResponse {
    let view = mock_workspace_view(selected_note_path);
    let body = dioxus_ssr::render_element(rsx!(WorkspaceShell { view }));

    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(format!("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>LiroxNotes</title><link rel=\"stylesheet\" href=\"/assets/app.css\"></head><body>{body}</body></html>"))
}

#[get("/")]
async fn index() -> impl Responder {
    render_workspace("notes/welcome.md")
}

#[get("/workspace/demo")]
async fn workspace() -> impl Responder {
    render_workspace("notes/welcome.md")
}

#[get("/workspace/demo/note/{path:.*}")]
async fn note(path: web::Path<String>) -> impl Responder {
    let path = path.into_inner();
    render_workspace(&path)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(index)
            .service(workspace)
            .service(note)
            .service(Files::new("/assets", "crates/app/assets"))
    })
    .bind(("127.0.0.1", 3000))?
    .run()
    .await
}
