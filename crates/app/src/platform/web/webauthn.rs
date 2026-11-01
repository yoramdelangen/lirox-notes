pub fn is_cancellation_name(name: &str) -> bool {
    matches!(name, "AbortError" | "NotAllowedError")
}

/// WebAuthn rejects IP addresses as RP IDs, so a dev server opened on a
/// loopback IP can never register a passkey for RP ID `localhost`.
pub fn loopback_to_localhost(
    protocol: &str,
    hostname: &str,
    port: &str,
    rest: &str,
) -> Option<String> {
    if !matches!(hostname, "127.0.0.1" | "[::1]") {
        return None;
    }
    let port = if port.is_empty() {
        String::new()
    } else {
        format!(":{port}")
    };
    Some(format!("{protocol}//localhost{port}{rest}"))
}

/// Development builds only: move loopback-IP visits to `localhost` so
/// passkeys work over plain HTTP.
#[cfg(all(target_arch = "wasm32", debug_assertions))]
pub fn redirect_loopback_to_localhost() {
    let Some(location) = web_sys::window().map(|window| window.location()) else {
        return;
    };
    let read = |value: Result<String, _>| value.unwrap_or_default();
    let rest = format!(
        "{}{}{}",
        read(location.pathname()),
        read(location.search()),
        read(location.hash())
    );
    if let Some(url) = loopback_to_localhost(
        &read(location.protocol()),
        &read(location.hostname()),
        &read(location.port()),
        &rest,
    ) {
        let _ = location.replace(&url);
    }
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
        if (!window.isSecureContext || !navigator.credentials) {
            dioxus.send({
                ok: false,
                name: "InsecureContext",
                message: `passkeys need HTTPS or http://localhost (current origin: ${location.origin})`
            });
            return;
        }
        if (/^(\d+\.){3}\d+$|^\[.*\]$/.test(location.hostname)) {
            dioxus.send({
                ok: false,
                name: "InvalidHost",
                message: `passkeys cannot use an IP address; open the app via a hostname such as localhost (current origin: ${location.origin})`
            });
            return;
        }
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
    use super::{is_cancellation_name, loopback_to_localhost};

    #[test]
    fn loopback_ips_redirect_to_localhost_keeping_the_rest_of_the_url() {
        assert_eq!(
            loopback_to_localhost("http:", "127.0.0.1", "8989", "/login?x=1#a"),
            Some("http://localhost:8989/login?x=1#a".into())
        );
        assert_eq!(
            loopback_to_localhost("http:", "[::1]", "", "/"),
            Some("http://localhost/".into())
        );
        assert_eq!(loopback_to_localhost("http:", "localhost", "8989", "/"), None);
        assert_eq!(loopback_to_localhost("http:", "192.168.1.5", "8989", "/"), None);
    }

    #[test]
    fn browser_cancellation_names_are_retryable() {
        assert!(is_cancellation_name("AbortError"));
        assert!(is_cancellation_name("NotAllowedError"));
        assert!(!is_cancellation_name("SecurityError"));
    }
}
