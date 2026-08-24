use crate::*;

pub(crate) fn onboarding_page_body(paths: &RuntimePaths, error: Option<&str>) -> String {
    let error = error
        .map(|message| format!("<p style=\"color:#ff8f40\">{message}</p>"))
        .unwrap_or_default();
    format!(
        r#"<main style="min-height:100vh;background:#0f1419;color:#e6e1cf;font-family:system-ui;padding:3rem;display:grid;place-items:center;">
<form method="post" action="/onboarding" style="width:min(100%,42rem);display:grid;gap:1rem;border:1px solid #272d38;background:#151b22;padding:2rem;border-radius:1rem;box-shadow:0 24px 80px rgba(0,0,0,.35);">
<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:#7c8796;">LiroxNotes MVP</div>
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

pub(crate) fn login_page_body(error: Option<&str>) -> String {
    let error = error
        .map(|message| format!("<p style=\"color:#ff8f40\">{message}</p>"))
        .unwrap_or_default();
    format!(
        r#"<main style="min-height:100vh;background:#0f1419;color:#e6e1cf;font-family:system-ui;padding:3rem;display:grid;place-items:center;">
<form method="post" action="/login" style="width:min(100%,28rem);display:grid;gap:1rem;border:1px solid #272d38;background:#151b22;padding:2rem;border-radius:1rem;">
<h1 style="margin:0;font-size:1.7rem;">Log in</h1>
<p style="margin:0;color:#9aa4b2;">Log in with the local account created during setup.</p>
{error}
<label>Name<br><input name="user" value="local" autocomplete="username" style="width:100%;box-sizing:border-box;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<label>Password<br><input type="password" name="password" autocomplete="current-password" style="width:100%;box-sizing:border-box;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<button type="submit" style="padding:.8rem 1rem;border:0;border-radius:.5rem;background:#95e6cb;color:#0f1419;font-weight:700;">Continue</button>
</form>
</main>"#,
    )
}

pub(crate) fn install_page_body(paths: &RuntimePaths) -> String {
    format!(
        r#"<main style="min-height:100vh;display:grid;place-items:center;padding:1rem;background:#0d1117;color:#e6edf3;font-family:ui-sans-serif,system-ui,sans-serif;">
<form method="post" action="/install" style="width:min(100%,32rem);display:grid;gap:1rem;border:1px solid #272d38;background:#151b22;padding:2rem;border-radius:1rem;box-shadow:0 24px 80px rgba(0,0,0,.35);">
<div style="font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:#8b949e;">LiroxNotes</div>
<h1 style="margin:0;font-size:1.7rem;">Install application</h1>
<p style="margin:0;color:#9aa4b2;line-height:1.6;">Initialize the local application, create the first user, then continue to workspace setup.</p>
<label style="color:#9aa4b2;">Workspace root<br><input name="workspace_root" value="{}" style="width:100%;box-sizing:border-box;margin-top:.5rem;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<label style="color:#9aa4b2;">Username<br><input name="user" value="local" autocomplete="username" style="width:100%;box-sizing:border-box;margin-top:.5rem;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<fieldset style="display:grid;gap:.75rem;border:1px solid #3a4655;border-radius:.75rem;padding:1rem;">
<legend style="padding:0 .5rem;color:#9aa4b2;">Login method</legend>
<label><input type="radio" name="auth_mode" value="passwordless" checked> Passwordless for now</label>
<label><input type="radio" name="auth_mode" value="password"> Use a password</label>
</fieldset>
<label style="color:#9aa4b2;">Password<br><input type="password" name="password" autocomplete="new-password" style="width:100%;box-sizing:border-box;margin-top:.5rem;padding:.7rem;background:#0f1419;color:#e6e1cf;border:1px solid #3a4655;border-radius:.5rem;"></label>
<button type="submit" style="padding:.8rem 1rem;border:0;border-radius:.6rem;background:#38bdf8;color:#081018;font-weight:700;cursor:pointer;">Install</button>
</form>
</main>"#,
        html_escape(
            &app_workspace_root(paths)
                .unwrap_or_else(|_| default_workspace_root(paths))
                .to_string_lossy()
        )
    )
}
