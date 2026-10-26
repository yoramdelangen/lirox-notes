use actix_web::HttpResponse;

const HTML_TEMPLATE: &str = include_str!("../../assets/app.html");

pub(crate) fn html_page(title: &str, body: &str) -> HttpResponse {
    let html = HTML_TEMPLATE
        .replace("{{title}}", title)
        .replace("{{body}}", body);

    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(html)
}

#[cfg(test)]
mod tests {
    use super::html_page;
    use actix_web::body::to_bytes;

    #[actix_web::test]
    async fn loads_app_stylesheets() {
        let response = html_page("Test", "body");
        let body = to_bytes(response.into_body()).await.expect("html body");
        let body = String::from_utf8(body.to_vec()).expect("utf-8 html");

        assert!(body.contains("<title>Test</title>"));
        assert!(body.contains("    body\n"));
        assert!(body.contains("href=\"/assets/main.compiled.css\""));
        assert!(body.contains("href=\"/assets/tailwind.css\""));
    }
}
