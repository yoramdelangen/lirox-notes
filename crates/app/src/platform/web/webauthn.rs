#[cfg(target_arch = "wasm32")]
use wasm_bindgen::{JsCast, JsValue};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen_futures::JsFuture;

#[cfg(target_arch = "wasm32")]
pub async fn credentials(method: &str, options: JsValue) -> Result<JsValue, String> {
    let window = web_sys::window().ok_or_else(|| "browser unavailable".to_string())?;
    let credential_api = js_sys::Reflect::get(&window, &JsValue::from_str("PublicKeyCredential"))
        .map_err(|_| "WebAuthn unsupported".to_string())?;
    if credential_api.is_undefined() || credential_api.is_null() {
        return Err("WebAuthn unsupported".into());
    }
    let navigator = js_sys::Reflect::get(&window, &JsValue::from_str("navigator"))
        .map_err(|_| "WebAuthn unsupported".to_string())?;
    let credentials = js_sys::Reflect::get(&navigator, &JsValue::from_str("credentials"))
        .map_err(|_| "WebAuthn unsupported".to_string())?;
    let function = js_sys::Reflect::get(&credentials, &JsValue::from_str(method))
        .map_err(|_| "WebAuthn unsupported".to_string())?
        .dyn_into::<js_sys::Function>()
        .map_err(|_| "WebAuthn unsupported".to_string())?;
    let promise = function
        .call1(&credentials, &options)
        .map_err(|_| "WebAuthn failed".to_string())?;
    JsFuture::from(js_sys::Promise::resolve(&promise))
        .await
        .map_err(|error| {
            if error.as_string().as_deref() == Some("AbortError") {
                "passkey operation cancelled".into()
            } else {
                "WebAuthn failed".into()
            }
        })
}

#[cfg(target_arch = "wasm32")]
pub fn base64url(bytes: &[u8]) -> String {
    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let mut output = String::new();
    let mut index = 0;
    while index < bytes.len() {
        let a = bytes[index] as usize;
        let b = bytes.get(index + 1).copied().unwrap_or(0) as usize;
        let c = bytes.get(index + 2).copied().unwrap_or(0) as usize;
        output.push(ALPHABET[a >> 2] as char);
        output.push(ALPHABET[((a & 3) << 4) | (b >> 4)] as char);
        if index + 1 < bytes.len() {
            output.push(ALPHABET[((b & 15) << 2) | (c >> 6)] as char);
        }
        if index + 2 < bytes.len() {
            output.push(ALPHABET[c & 63] as char);
        }
        index += 3;
    }
    output
}
