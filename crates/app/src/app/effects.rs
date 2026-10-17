#[cfg(any(target_arch = "wasm32", test))]
use super::{ApplicationEvent, AuthEvent};
use super::{ApplicationState, Dispatcher, Effect};
#[cfg(target_arch = "wasm32")]
use crate::auth;
use dioxus::prelude::Signal;
#[cfg(target_arch = "wasm32")]
use dioxus::prelude::WritableExt;
#[cfg(target_arch = "wasm32")]
use liroxnotes_shared::WorkspaceView;

pub(crate) async fn execute_effect(
    state: Signal<ApplicationState>,
    dispatcher: Dispatcher,
    effect: Effect,
) {
    #[cfg(target_arch = "wasm32")]
    {
        let mut state = state;
        let result = platform_effect(effect.clone()).await;
        let event = match result {
            Ok(Some(event)) => event,
            Ok(None) => return,
            Err(message) => auth_error_event(&effect, message),
        };
        dispatcher.dispatch_event(&mut state.write(), event);
    }
    #[cfg(not(target_arch = "wasm32"))]
    let _ = (state, dispatcher, effect);
}

#[cfg(any(target_arch = "wasm32", test))]
pub(crate) fn auth_error_event(effect: &Effect, message: String) -> ApplicationEvent {
    if matches!(effect, Effect::AutoLogin) {
        ApplicationEvent::Auth(AuthEvent::AutoLoginFailed)
    } else if matches!(effect, Effect::Login) {
        ApplicationEvent::Auth(AuthEvent::OperationFailed(message))
    } else if message.starts_with("gateway returned 401") {
        ApplicationEvent::Auth(AuthEvent::SessionExpired)
    } else {
        ApplicationEvent::Auth(AuthEvent::OperationFailed(message))
    }
}

#[cfg(target_arch = "wasm32")]
async fn platform_effect(effect: Effect) -> Result<Option<ApplicationEvent>, String> {
    use crate::platform::web::webauthn;
    use serde_json::Value;
    match effect {
        Effect::Bootstrap => Ok(Some(ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(
            response_json(web_json("/api/bootstrap", "GET", None).await?).await?,
        )))),
        Effect::LoadWorkspace => {
            let view: WorkspaceView =
                response_json(web_json("/api/workspace/", "GET", None).await?).await?;
            Ok(Some(ApplicationEvent::Auth(AuthEvent::WorkspaceLoaded(
                view,
            ))))
        }
        Effect::LoadWorkspaceNote(path) => {
            let view: WorkspaceView =
                response_json(web_json(&format!("/api/workspace/{path}"), "GET", None).await?)
                    .await?;
            Ok(Some(ApplicationEvent::Auth(AuthEvent::WorkspaceLoaded(
                view,
            ))))
        }
        Effect::SaveDocument { path, content } => {
            web_json(&format!("/api/notes/{path}"), "PUT", Some(content)).await?;
            let view: WorkspaceView =
                response_json(web_json(&format!("/api/workspace/{path}"), "GET", None).await?)
                    .await?;
            Ok(Some(ApplicationEvent::Auth(AuthEvent::WorkspaceLoaded(
                view,
            ))))
        }
        Effect::RegisterPasskey => {
            let options: Value = response_json(
                web_json(
                    "/api/auth/passkeys/register/options",
                    "POST",
                    Some("{}".into()),
                )
                .await?,
            )
            .await?;
            let challenge = options["challenge_id"]
                .as_str()
                .ok_or("missing challenge")?
                .to_string();
            let credential = webauthn::credentials(
                "create",
                webauthn::prepare_options(public_key_options(&options)?)?,
                None,
            )
            .await?;
            let body = serde_json::json!({"challenge_id": challenge, "credential": webauthn::credential_json(credential)?}).to_string();
            web_json("/api/auth/passkeys/register/verify", "POST", Some(body)).await?;
            Ok(Some(ApplicationEvent::Auth(
                AuthEvent::RegistrationSucceeded,
            )))
        }
        Effect::SetupInstallation(user_name) => {
            web_json(
                "/api/setup",
                "POST",
                Some(serde_json::json!({"user_name": user_name}).to_string()),
            )
            .await?;
            Ok(None)
        }
        effect @ (Effect::Login | Effect::AutoLogin) => {
            let auto = matches!(&effect, Effect::AutoLogin);
            let options: Value = response_json(
                web_json(
                    "/api/auth/passkeys/login/options",
                    "POST",
                    Some("{}".into()),
                )
                .await?,
            )
            .await?;
            let challenge = options["challenge_id"]
                .as_str()
                .ok_or("missing challenge")?
                .to_string();
            let credential = webauthn::credentials(
                "get",
                webauthn::prepare_options(discoverable_public_key_options(&options)?)?,
                auto.then_some("conditional"),
            )
            .await?;
            let body = serde_json::json!({"challenge_id": challenge, "credential": webauthn::credential_json(credential)?}).to_string();
            web_json("/api/auth/passkeys/login/verify", "POST", Some(body)).await?;
            Ok(Some(ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(
                response_json(web_json("/api/bootstrap", "GET", None).await?).await?,
            ))))
        }
        Effect::Logout => {
            web_json("/api/auth/logout", "POST", Some("{}".into())).await?;
            Ok(Some(ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(
                response_json(web_json("/api/bootstrap", "GET", None).await?).await?,
            ))))
        }
        Effect::CreateWorkspace(fields) => {
            let body = serde_json::json!({
                "repo_mode": if fields.remote { "existing" } else { "new" },
                "workspace_slug": fields.slug,
                "workspace_name": fields.name,
                "repo_url": fields.repo_url,
                "repository_path": fields.repository_path,
                "branch": fields.branch,
                "workspace_path": fields.path,
            })
            .to_string();
            web_json("/api/workspaces", "POST", Some(body)).await?;
            Ok(Some(ApplicationEvent::Auth(AuthEvent::BootstrapLoaded(
                response_json(web_json("/api/bootstrap", "GET", None).await?).await?,
            ))))
        }
        Effect::InspectRepository { repo_url, branch } => {
            let body = serde_json::json!({"repo_url": repo_url, "branch": branch}).to_string();
            let metadata: auth::RepositoryMetadata =
                response_json(web_json("/api/workspaces/inspect", "POST", Some(body)).await?)
                    .await?;
            Ok(Some(ApplicationEvent::Auth(
                AuthEvent::RepositoryInspected {
                    name: metadata.name,
                    slug: metadata.slug,
                },
            )))
        }
        Effect::LoadExistingWorkspaces => {
            let workspaces: Vec<auth::ExistingWorkspace> =
                response_json(web_json("/api/workspaces", "GET", None).await?).await?;
            Ok(Some(ApplicationEvent::Auth(
                AuthEvent::ExistingWorkspacesLoaded(workspaces),
            )))
        }
        _ => Ok(None),
    }
}

#[cfg(any(target_arch = "wasm32", test))]
pub(crate) fn public_key_options(options: &serde_json::Value) -> Result<serde_json::Value, String> {
    options
        .get("publicKey")
        .cloned()
        .ok_or_else(|| "missing publicKey options".into())
}

#[cfg(any(target_arch = "wasm32", test))]
pub(crate) fn discoverable_public_key_options(
    options: &serde_json::Value,
) -> Result<serde_json::Value, String> {
    let mut options = public_key_options(options)?;
    options
        .as_object_mut()
        .ok_or_else(|| "invalid publicKey options".to_string())?
        .remove("allowCredentials");
    Ok(options)
}

#[cfg(target_arch = "wasm32")]
async fn response_json<T: serde::de::DeserializeOwned>(
    response: web_sys::Response,
) -> Result<T, String> {
    use wasm_bindgen_futures::JsFuture;
    let value = JsFuture::from(response.json().map_err(|_| "invalid JSON")?)
        .await
        .map_err(|_| "invalid JSON")?;
    serde_wasm_bindgen::from_value(value).map_err(|error| error.to_string())
}

#[cfg(target_arch = "wasm32")]
async fn web_json(
    url: &str,
    method: &str,
    body: Option<String>,
) -> Result<web_sys::Response, String> {
    use wasm_bindgen::JsCast;
    use wasm_bindgen_futures::JsFuture;
    let init = web_sys::RequestInit::new();
    init.set_method(method);
    init.set_credentials(web_sys::RequestCredentials::Include);
    if let Some(body) = body {
        init.set_body(&wasm_bindgen::JsValue::from_str(&body));
    }
    let request = web_sys::Request::new_with_str_and_init(&gateway_url(url), &init)
        .map_err(|_| "request failed")?;
    request
        .headers()
        .set("Content-Type", "application/json")
        .map_err(|_| "headers failed")?;
    let response = JsFuture::from(
        web_sys::window()
            .ok_or("browser unavailable")?
            .fetch_with_request(&request),
    )
    .await
    .map_err(|_| "network failure")?;
    let response: web_sys::Response = response.dyn_into().map_err(|_| "invalid response")?;
    if !response.ok() {
        return Err(format!("gateway returned {}", response.status()));
    }
    Ok(response)
}

#[cfg(any(target_arch = "wasm32", test))]
const GATEWAY_BASE_URL: &str = match option_env!("LIROX_GATEWAY_URL") {
    Some(url) => url,
    None => "http://localhost:3010",
};

#[cfg(any(target_arch = "wasm32", test))]
pub(crate) fn gateway_url(path: &str) -> String {
    format!("{}{}", GATEWAY_BASE_URL.trim_end_matches('/'), path)
}
