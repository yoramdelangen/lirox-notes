use actix_web::HttpResponse;

pub(crate) fn html_page(title: &str, body: &str) -> HttpResponse {
    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(format!("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><meta name=\"color-scheme\" content=\"dark\"><title>{title}</title><style>html{{background:#0d1117;color:#e2e8f0}}body{{margin:0;min-height:100vh;background:#0d1117;color:#e2e8f0}}[data-lirox-boot]{{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#0d1117;color:#94a3b8;font:500 12px/1.4 ui-sans-serif,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;transition:opacity .18s ease}}[data-lirox-boot].is-leaving{{opacity:0;pointer-events:none}}</style><script>const hideBoot=()=>{{const boot=document.querySelector('[data-lirox-boot]');if(!boot)return;boot.classList.add('is-leaving');setTimeout(()=>boot.remove(),180);}};window.addEventListener('load',hideBoot,{{once:true}});document.addEventListener('readystatechange',()=>{{if(document.readyState==='interactive')requestAnimationFrame(hideBoot);}},{{once:true}});</script><link rel=\"stylesheet\" href=\"/assets/main.css\"><link rel=\"stylesheet\" href=\"/assets/tailwind.css\"></head><body><div data-lirox-boot>Loading workspace</div>{body}</body></html>"))
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

        assert!(body.contains("href=\"/assets/main.css\""));
        assert!(body.contains("href=\"/assets/tailwind.css\""));
    }
}
