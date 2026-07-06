use actix_files::Files;
use actix_web::{get, App, HttpResponse, HttpServer, Responder};
use dioxus::prelude::*;
use liroxnotes_app::App as LiroxNotesApp;

#[get("/")]
async fn index() -> impl Responder {
    let body = dioxus_ssr::render_element(rsx!(LiroxNotesApp {}));

    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(format!("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>LiroxNotes</title><link rel=\"stylesheet\" href=\"/static/app.css\"></head><body>{body}</body></html>"))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(index)
            .service(Files::new("/assets", "crates/app/assets"))
    })
        .bind(("127.0.0.1", 3000))?
        .run()
        .await
}
