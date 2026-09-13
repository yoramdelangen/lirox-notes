use crate::*;

pub(crate) fn onboarding_page_body(paths: &RuntimePaths, error: Option<&str>) -> String {
    let error = error
        .map(|message| format!("<p style=\"color:#ff8f40\">{}</p>", html_escape(message)))
        .unwrap_or_default();
    format!(
        r#"<main style="min-height:100vh;background:#0f1419;color:#e6e1cf;font-family:system-ui;padding:3rem;display:grid;place-items:center;">
<form method="post" action="/onboarding" style="width:min(100%,42rem);display:grid;gap:1rem;border:1px solid #272d38;background:#151b22;padding:2rem;border-radius:1rem;box-shadow:0 24px 80px rgba(0,0,0,.35);">
<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:#7c8796;">LiroxNotes</div>
<h1 style="margin:0;font-size:1.7rem;">Set up your notes workspace</h1>
<p style="margin:0;color:#9aa4b2;">Choose whether to clone an existing remote or create a new local repository.</p>
{error}
<fieldset style="display:grid;gap:.75rem;border:1px solid #3a4655;border-radius:.75rem;padding:1rem;">
<legend style="padding:0 .5rem;color:#9aa4b2;">Repository source</legend>
<label><input type="radio" name="repo_mode" value="new" checked> Create new repository</label>
<label><input type="radio" name="repo_mode" value="remote"> Use existing remote</label>
</fieldset>
<label style="color:#9aa4b2;">Workspace slug<br><input name="workspace_slug" placeholder="notes" style="width:100%;box-sizing:border-box;margin-top:.5rem;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<label style="color:#9aa4b2;">Workspace name<br><input name="workspace_name" value="My Workspace" style="width:100%;box-sizing:border-box;margin-top:.5rem;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<label style="color:#9aa4b2;">Git remote URL<br><input name="repo_url" placeholder="git@github.com:you/notes.git" style="width:100%;box-sizing:border-box;margin-top:.5rem;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<label style="color:#9aa4b2;">Branch<br><input name="branch" value="main" style="width:100%;box-sizing:border-box;margin-top:.5rem;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<button type="submit" style="padding:.8rem 1rem;border:0;border-radius:.5rem;background:#95e6cb;color:#0f1419;font-weight:700;">Save configuration</button>
<p style="margin:0;color:#7c8796;font-size:.85rem;">Config file: {}</p>
</form>
</main>"#,
        html_escape(&paths.config_file.to_string_lossy())
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn onboarding_errors_are_html_escaped() {
        let paths = RuntimePaths {
            config_file: "config".into(),
            default_workspace: "workspace".into(),
        };
        let body = onboarding_page_body(&paths, Some("<script>alert(1)</script> &"));
        assert!(!body.contains("<script>alert(1)</script>"));
        assert!(body.contains("&lt;script&gt;alert(1)&lt;/script&gt; &amp;"));
    }

    #[test]
    fn install_flow_initializes_installation_and_supports_remote_workspace_fields() {
        let body = install_page_body(&RuntimePaths {
            config_file: "config".into(),
            default_workspace: "workspace".into(),
        });

        assert!(body.contains("/api/setup"));
        assert!(body.contains("repo_mode"));
        assert!(body.contains("workspace_slug"));
        assert!(body.contains("workspace_name"));
        assert!(body.contains("repo_url"));
        assert!(body.contains("branch"));
        assert!(body.contains("/api/workspaces"));
    }
}

pub(crate) fn install_page_body(_paths: &RuntimePaths) -> String {
    String::from(
        r#"<main id="auth-shell" style="min-height:100vh;display:grid;place-items:center;padding:1rem;background:#0d1117;color:#e6edf3;font-family:ui-sans-serif,system-ui,sans-serif;">
<section style="width:min(100%,32rem);display:grid;gap:1rem;border:1px solid #272d38;background:#151b22;padding:2rem;border-radius:1rem;box-shadow:0 24px 80px rgba(0,0,0,.35);">
<div style="font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:#8b949e;">LiroxNotes</div>
<h1 style="margin:0;font-size:1.7rem;">Secure access</h1>
<p style="margin:0;color:#9aa4b2;line-height:1.6;">Create a passkey to protect your notes, then choose a workspace.</p>
<button id="register-passkey" type="button" style="padding:.8rem 1rem;border:0;border-radius:.5rem;background:#95e6cb;color:#0f1419;font-weight:700;">Create passkey</button>
<p id="auth-status" role="status" style="margin:0;color:#9aa4b2;line-height:1.6;"></p>
</section>
</main>
<script>
(() => {
  const button = document.getElementById("register-passkey");
  const status = document.getElementById("auth-status");
  const section = document.querySelector("section");
  const bytes = value => Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/") + "==="), c => c.charCodeAt(0));
  const options = value => {
    if (!value || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(options);
    const result = {};
    for (const [key, child] of Object.entries(value)) result[key] = ["challenge", "id"].includes(key) && typeof child === "string" ? bytes(child) : options(child);
    return result;
  };
   const json = async response => {
     const body = await response.json().catch(() => ({}));
     if (!response.ok) throw new Error(body.error || "Request failed");
     return body;
   };
   const workspaceForm = () => {
     section.insertAdjacentHTML("beforeend", '<fieldset id="workspace-form"><legend>Workspace setup</legend><label><input type="radio" name="repo-mode" value="new" checked> Create local repository</label><label><input type="radio" name="repo-mode" value="remote"> Use existing remote</label><label>Workspace slug<br><input id="workspace-slug" value="notes"></label><label>Workspace name<br><input id="workspace-name" value="My Workspace"></label><label>Repository URL<br><input id="repo-url" placeholder="git@github.com:you/notes.git"></label><label>Branch<br><input id="branch" value="main"></label><button id="create-workspace" type="button">Create workspace</button></fieldset>');
     document.getElementById("create-workspace").addEventListener("click", async event => {
       const create = event.currentTarget;
       create.disabled = true;
       try {
         await json(await fetch("/api/setup", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({}) }));
         const mode = document.querySelector('input[name="repo-mode"]:checked').value;
         await json(await fetch("/api/workspaces", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ repo_mode: mode, workspace_slug: document.getElementById("workspace-slug").value, workspace_name: document.getElementById("workspace-name").value, repo_url: document.getElementById("repo-url").value, branch: document.getElementById("branch").value }) }));
         location.href = "/";
       } catch (error) {
         status.textContent = error.message + " Try again.";
         create.disabled = false;
       }
     });
   };
   button.addEventListener("click", async () => {
    button.disabled = true;
    status.textContent = "Waiting for your passkey...";
    try {
      if (!window.PublicKeyCredential || !navigator.credentials) throw new Error("WebAuthn is not supported by this browser");
      const response = await fetch("/api/auth/passkeys/register/options", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: "{}" });
       const envelope = await json(response);
      const publicKey = options(envelope); delete publicKey.challenge_id;
      const credential = await navigator.credentials.create({ publicKey });
      const verified = await fetch("/api/auth/passkeys/register/verify", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ challenge_id: envelope.challenge_id, credential: credential.toJSON() }) });
       await json(verified);
       status.textContent = "Passkey ready. Choose a workspace.";
       button.remove();
       workspaceForm();
    } catch (error) {
      status.textContent = error.name === "NotAllowedError" || error.name === "AbortError" ? "Passkey registration cancelled. Try again." : error.message;
      button.disabled = false;
    }
  });
})();
</script>"#,
    )
}
