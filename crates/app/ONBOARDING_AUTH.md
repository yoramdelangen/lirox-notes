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
