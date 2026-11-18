# Onboarding And Passkey Authentication

The Dioxus server is authoritative for installation, onboarding,
authentication, and workspace creation. The app starts with
`bootstrap_server_function`; it does not infer auth or workspace state from
local storage or files.

## Startup routing

| Server state | App screen |
|---|---|
| not installed | installation/setup |
| `NotStarted` | passkey registration |
| `WorkspaceRequired` | workspace setup |
| `Complete` and unauthenticated | passkey login |
| `Complete` and authenticated | workbench |

Registration creates the authenticated session. Refreshing before workspace
creation returns `WorkspaceRequired`. The workbench is not rendered until
bootstrap reports `Complete` and the session is authenticated.

## Session and bootstrap

`bootstrap_server_function` returns the client `BootstrapState`: installed and
passkey flags, onboarding state, authentication/user state, optional display
name, and an optional workspace `{ slug, name }`. It does not expose the
server's workspace filesystem path.

The session is stored server-side and represented to the client only by the
`lirox_session` cookie. It is `HttpOnly`, `SameSite=Lax`, scoped to `/`, and
`Secure` when the configured relying-party origin uses HTTPS. Passkey
registration/login challenge records remain short-lived and single-use; a
successful login rotates the persisted session. Logout removes the stored
session and clears the cookie.

Passkeys over plain HTTP only work on `http://localhost`: browsers expose
WebAuthn only in secure contexts, and IP addresses are never valid RP IDs.
Debug builds (`dx serve`) therefore redirect `127.0.0.1`/`[::1]` visits to
`localhost`; release builds do not. LAN access needs HTTPS and a hostname
configured through `LIROX_RP_ID`/`LIROX_RP_ORIGIN`.

Runtime paths use `LIROX_WORKSPACE_DIR` and `LIROX_CONFIG_FILE` when set. In
debug builds their defaults are `.lirox-runtime/workspace` and
`.lirox-runtime/config`. In release builds the config uses
`$XDG_CONFIG_HOME/liroxnotes/config` and workspace data uses
`$XDG_DATA_HOME/liroxnotes/workspace` (falling back to the corresponding
`$HOME` locations).

## Workspace setup and retry

After passkey registration, `setup_installation_server_function` persists
installation and an optional display name. Then
`create_workspace_server_function` creates or selects the repository workspace.
The setup UI keeps its form state after an error and advances only after the
server succeeds and bootstrap confirms completion. A config without
`onboarding_complete=true` is not migrated automatically; setup remains
retryable until workspace persistence completes.

The complete typed function contract, validation, and user-safe errors are
documented in [`../gateway/API.md`](../gateway/API.md).

Git runs in-process (libgit2); the server never spawns `git`. Remote
credentials come from the environment only: `LIROX_GIT_SSH_KEY` (or a running
ssh-agent / `~/.ssh/id_ed25519` / `~/.ssh/id_rsa` outside containers) for SSH,
and `LIROX_GIT_TOKEN` for HTTPS, offered only to hosts in
`LIROX_GIT_TOKEN_HOSTS` (default `github.com`). SSH host keys must be pinned in
`LIROX_GIT_KNOWN_HOSTS` (default `~/.ssh/known_hosts`); unknown or changed host
keys are refused. Clone and fetch are aborted after 60 seconds of transfer,
and every network connect/read times out (15 s / 60 s); push is bounded only
by those connect/read timeouts. Errors
reaching the client stay generic (see `crates/gateway/API.md`).

Before the first passkey, onboarding asks for the public URL used to open the
app, prefilled with the browser's own origin. For a Cloudflare Tunnel or reverse
proxy, use its public URL. It is stored in `<config dir>/domains` as the
canonical app URL and its host becomes the passkey RP ID. It may differ from
the page's address: the server accepts it from a same-origin request
(`Sec-Fetch-Site`) or from the URL itself, and the passkey/login screens on
any other address send the owner to it (with "Change URL" until the first
passkey exists). `LIROX_RP_ORIGIN` / `LIROX_RP_ID` remain optional overrides
and skip this step.
After onboarding, Settings → Account → Public URL changes it in place
(`change_public_url_server_function`). Passkeys are bound to the RP ID, so the
new URL must be that host or a subdomain; the old URLs stay allowed. A
different host needs a passkey per domain (planned).
Unrelated domains and changing domains after onboarding are scheduled in
`docs/superpowers/specs/2026-11-18-public-url-and-domains-design.md`.
