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
            let name = js_sys::Reflect::get(&error, &JsValue::from_str("name"))
                .ok()
                .and_then(|value| value.as_string());
            if name.as_deref() == Some("AbortError") {
                "passkey operation cancelled".into()
            } else {
                "WebAuthn failed".into()
            }
        })
}

#[cfg(target_arch = "wasm32")]
pub fn prepare_options(options: serde_json::Value) -> Result<JsValue, String> {
    let value = serde_wasm_bindgen::to_value(&options).map_err(|error| error.to_string())?;
    convert_binary_fields(&value)?;
    Ok(value)
}

#[cfg(target_arch = "wasm32")]
pub fn credential_json(value: JsValue) -> Result<serde_json::Value, String> {
    let json_value = js_sys::Reflect::get(&value, &JsValue::from_str("toJSON"))
        .ok()
        .and_then(|function| function.dyn_into::<js_sys::Function>().ok())
        .and_then(|function| function.call0(&value).ok())
        .unwrap_or(value);
    let json =
        js_sys::JSON::stringify(&json_value).map_err(|_| "credential serialization failed")?;
    serde_json::from_str(&json.as_string().ok_or("credential serialization failed")?)
        .map_err(|error| error.to_string())
}

#[cfg(target_arch = "wasm32")]
fn convert_binary_fields(value: &JsValue) -> Result<(), String> {
    if value.is_object() {
        let object = js_sys::Object::from(value.clone());
        for key in js_sys::Object::keys(&object).iter() {
            let key = key.as_string().unwrap_or_default();
            let child = js_sys::Reflect::get(&object, &JsValue::from_str(&key))
                .map_err(|_| "invalid options")?;
            if matches!(key.as_str(), "challenge" | "id") {
                if let Some(encoded) = child.as_string() {
                    let bytes = decode_base64url(&encoded).ok_or("invalid base64url")?;
                    js_sys::Reflect::set(
                        &object,
                        &JsValue::from_str(&key),
                        &js_sys::Uint8Array::from(bytes.as_slice()),
                    )
                    .map_err(|_| "invalid options")?;
                    continue;
                }
            }
            convert_binary_fields(&child)?;
        }
    } else if value.is_array() {
        let array = js_sys::Array::from(value);
        for child in array.iter() {
            convert_binary_fields(&child)?;
        }
    }
    Ok(())
}

#[cfg(target_arch = "wasm32")]
fn decode_base64url(value: &str) -> Option<Vec<u8>> {
    let mut bits = 0u32;
    let mut count = 0;
    let mut bytes = Vec::new();
    for byte in value.bytes() {
        let digit = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
            .iter()
            .position(|candidate| *candidate == byte)? as u32;
        bits = (bits << 6) | digit;
        count += 6;
        if count >= 8 {
            count -= 8;
            bytes.push((bits >> count) as u8);
        }
    }
    Some(bytes)
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
