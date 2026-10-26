pub fn is_cancellation_name(name: &str) -> bool {
    matches!(name, "AbortError" | "NotAllowedError")
}

#[cfg(any(target_arch = "wasm32", feature = "desktop"))]
pub async fn credentials(
    method: &str,
    options: serde_json::Value,
    mediation: Option<&str>,
) -> Result<serde_json::Value, String> {
    let mut eval = dioxus::document::eval(
        r#"
        const [method, publicKey, mediation] = await dioxus.recv();
        const decode = value => {
            if (Array.isArray(value)) return Uint8Array.from(value);
            const padded = value.replace(/-/g, "+").replace(/_/g, "/");
            const binary = atob(padded + "=".repeat((4 - padded.length % 4) % 4));
            return Uint8Array.from(binary, c => c.charCodeAt(0));
        };
        const convert = (value, binaryId = false) => {
            if (Array.isArray(value)) return value.map(child => convert(child, binaryId));
            if (!value || typeof value !== "object") return value;
            for (const [key, child] of Object.entries(value)) {
                if (key === "challenge" || (key === "id" && binaryId)) value[key] = decode(child);
                else value[key] = convert(child, ["user", "excludeCredentials", "allowCredentials"].includes(key));
            }
            return value;
        };
        try {
            const credential = await navigator.credentials[method]({
                publicKey: convert(publicKey),
                ...(mediation ? { mediation } : {})
            });
            dioxus.send({ ok: true, credential: credential.toJSON() });
        } catch (error) {
            dioxus.send({ ok: false, name: error?.name ?? "Error", message: error?.message ?? "" });
        }
        "#,
    );
    eval.send((method, options, mediation))
        .map_err(|error| error.to_string())?;
    let response: serde_json::Value = eval.recv().await.map_err(|error| error.to_string())?;
    if response["ok"] == true {
        Ok(response["credential"].clone())
    } else {
        let name = response["name"].as_str().unwrap_or("Error");
        let message = response["message"].as_str().unwrap_or_default();
        if is_cancellation_name(name) {
            Err("passkey operation cancelled".into())
        } else if message.is_empty() {
            Err(format!("WebAuthn failed: {name}"))
        } else {
            Err(format!("WebAuthn failed: {name}: {message}"))
        }
    }
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
