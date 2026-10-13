#[cfg(target_arch = "wasm32")]
use wasm_bindgen::{JsCast, JsValue};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen_futures::JsFuture;

pub fn is_cancellation_name(name: &str) -> bool {
    matches!(name, "AbortError" | "NotAllowedError")
}

#[cfg(target_arch = "wasm32")]
pub async fn credentials(
    method: &str,
    options: JsValue,
    mediation: Option<&str>,
) -> Result<JsValue, String> {
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
    let request = js_sys::Object::new();
    js_sys::Reflect::set(&request, &JsValue::from_str("publicKey"), &options)
        .map_err(|error| format!("WebAuthn failed: {}", js_error_details(&error)))?;
    if let Some(mediation) = mediation {
        js_sys::Reflect::set(
            &request,
            &JsValue::from_str("mediation"),
            &JsValue::from_str(mediation),
        )
        .map_err(|error| format!("WebAuthn failed: {}", js_error_details(&error)))?;
    }
    let promise = function
        .call1(&credentials, &request)
        .map_err(|error| format!("WebAuthn failed: {}", js_error_details(&error)))?;
    JsFuture::from(js_sys::Promise::resolve(&promise))
        .await
        .map_err(|error| {
            let name = js_sys::Reflect::get(&error, &JsValue::from_str("name"))
                .ok()
                .and_then(|value| value.as_string());
            if name.as_deref().is_some_and(is_cancellation_name) {
                "passkey operation cancelled".into()
            } else {
                format!("WebAuthn failed: {}", js_error_details(&error))
            }
        })
}

#[cfg(target_arch = "wasm32")]
fn js_error_details(error: &JsValue) -> String {
    let name = js_sys::Reflect::get(error, &JsValue::from_str("name"))
        .ok()
        .and_then(|value| value.as_string());
    let message = js_sys::Reflect::get(error, &JsValue::from_str("message"))
        .ok()
        .and_then(|value| value.as_string());
    match (name, message) {
        (Some(name), Some(message)) if !message.is_empty() => format!("{name}: {message}"),
        (Some(name), _) => name,
        (_, Some(message)) if !message.is_empty() => message,
        _ => "unknown browser error".into(),
    }
}

#[cfg(target_arch = "wasm32")]
pub fn prepare_options(options: serde_json::Value) -> Result<JsValue, String> {
    let json = serde_json::to_string(&options).map_err(|error| error.to_string())?;
    let value = js_sys::JSON::parse(&json).map_err(|_| "invalid options".to_string())?;
    convert_binary_fields(&value, false)?;
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
fn convert_binary_fields(value: &JsValue, binary_id: bool) -> Result<(), String> {
    if value.is_object() {
        let object = js_sys::Object::from(value.clone());
        for key in js_sys::Object::keys(&object).iter() {
            let key = key.as_string().unwrap_or_default();
            let child = js_sys::Reflect::get(&object, &JsValue::from_str(&key))
                .map_err(|_| "invalid options")?;
            if key == "challenge" || (key == "id" && binary_id) {
                let bytes = if let Some(encoded) = child.as_string() {
                    decode_base64url(&encoded).ok_or("invalid base64url")?
                } else if child.is_array() {
                    js_sys::Array::from(&child)
                        .iter()
                        .map(|value| {
                            value
                                .as_f64()
                                .filter(|value| value.is_finite() && value.fract() == 0.0)
                                .and_then(|value| u8::try_from(value as u64).ok())
                                .ok_or("invalid binary field")
                        })
                        .collect::<Result<Vec<_>, _>>()?
                } else {
                    return Err("invalid binary field".into());
                };
                {
                    js_sys::Reflect::set(
                        &object,
                        &JsValue::from_str(&key),
                        &js_sys::Uint8Array::from(bytes.as_slice()),
                    )
                    .map_err(|_| "invalid options")?;
                    continue;
                }
            }
            convert_binary_fields(
                &child,
                matches!(
                    key.as_str(),
                    "user" | "excludeCredentials" | "allowCredentials"
                ),
            )?;
        }
    } else if value.is_array() {
        let array = js_sys::Array::from(value);
        for child in array.iter() {
            convert_binary_fields(&child, binary_id)?;
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

#[cfg(test)]
mod tests {
    use super::is_cancellation_name;

    #[test]
    fn browser_cancellation_names_are_retryable() {
        assert!(is_cancellation_name("AbortError"));
        assert!(is_cancellation_name("NotAllowedError"));
        assert!(!is_cancellation_name("SecurityError"));
    }
}
