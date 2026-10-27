# LiroxNotes Server-Function API

This is the authoritative app-facing contract. Functions are declared in
`crates/app/src/server.rs` with Dioxus `#[server]`; clients call those generated
functions rather than addressing hand-authored `/api/*` routes. Dioxus owns the
wire format and generated endpoint paths, which are not a compatibility API.

## Authentication and errors

Passkey registration/login verify a challenge on the server, rotate the stored
session, and set the `lirox_session` cookie as `HttpOnly`, `SameSite=Lax`, and
`Path=/`; `Secure` is set when the configured relying-party origin uses HTTPS.
Logout deletes the stored session and clears the cookie. Protected functions
authorize from that request cookie; they do not accept a user ID or auth flag.

Functions return `Result<T, ServerFnError>`. Error messages are stable,
user-safe summaries; filesystem paths, Git stderr, tokens, and credential
material are not returned. Callers should treat connection and server errors as
retryable, and a `401` protected-operation error as an expired session.

## Function contracts

Arguments and results below are Rust types serialized by Dioxus. All functions
are async and return `Result<result, ServerFnError>`.

| Function | Auth | Arguments | Result / behavior |
|---|---:|---|---|
| `bootstrap_server_function` | No | — | `BootstrapState`; installation, passkey, onboarding, session and workspace summary. Never returns the server workspace path. |
| `passkey_registration_options_server_function` | No | — | JSON object with `challenge_id` and WebAuthn `publicKey` creation options. Registration closes after onboarding completes. |
| `passkey_registration_verify_server_function` | No | `challenge_id: String`, `credential: JSON` | `bool`; consumes a valid registration challenge, persists the credential/session, and sets the session cookie. |
| `passkey_login_options_server_function` | No | — | JSON object with `challenge_id` and WebAuthn `publicKey` request options. |
| `passkey_login_verify_server_function` | No | `challenge_id: String`, `credential: JSON` | `bool`; consumes a valid login challenge, rotates the session, and sets the session cookie. |
| `logout_server_function` | No | — | `()`; deletes the session and clears the cookie. |
| `setup_installation_server_function` | Yes | `user_name: Option<String>` | `()`; idempotently persists installation/name after passkey registration; safe to retry. |
| `inspect_repository_server_function` | Yes | `repo_url: String`, `branch: Option<String>` | `RepositoryMetadata { name, slug }`; inspects a remote without exposing server paths. `name`/`slug` come from the repository's `.lirox.toml`; when it sets none, they fall back to the repository name from the URL (`git@github.com:owner/my-notes.git` → `my-notes`). |
| `existing_workspaces_server_function` | Yes | — | `Vec<ExistingWorkspace>`: the top-level, non-hidden folders of each cloned repository below the app workspace root that are not yet registered as a workspace (nested folders and repository roots are omitted). |
| `registered_workspaces_server_function` | Yes | — | `Vec<RegisteredWorkspace { slug, name, repository, path, active }>`: every workspace registered in the application. `repository` is the repository folder relative to the app workspace root and `path` the workspace folder relative to the git root (empty for the root); no server paths are exposed. |
| `switch_workspace_server_function` | Yes | `slug: String` | `WorkspaceView`; makes the registered workspace `slug` active without changing any other registration. Unknown slugs are not found (404). |
| `create_workspace_server_function` | Yes | `remote: bool`, `slug: String`, `name: String`, `repo_url: String`, `repository_path: String`, `workspace_path: String`, `branch: String` | `WorkspaceView`; registers a local/remote or existing-repository workspace, makes it active (other registered workspaces are kept) and completes onboarding only after persistence succeeds. `workspace_path` is a subpath relative to the git root (required for an existing repository, optional for a new one). Registration is application-level: the app config stores the git root and this relative path; nothing is written to the repository's `.lirox.toml`. A slug already registered for a different folder is rejected (409). |
| `workspace_server_function` | Yes | `selected_note_path: Option<String>` | `WorkspaceView` for the active workspace; notes are read from `<git root>/<relative path>`. |
| `save_document_server_function` | Yes | `path: String`, `content: String` | `WorkspaceView`; validates a relative Markdown note path, writes and commits it. |
| `read_workspace_file_server_function` | Yes | `path: String` | `WorkspaceFile { path, body }`; only safe Markdown note paths are accepted. |
| `delete_workspace_file_server_function` | Yes | `path: String` | `bool`; validates the note path, deletes if present, and commits the change. |
| `save_workspace_theme_server_function` | Yes | `slug: String`, `theme: WorkspaceTheme` | `WorkspaceTheme`; workspace ownership and contrast are validated before persistence: `fg`, `muted` and the status colors (`success`, `warning`, `error`, `info`) need 4.5:1 against `bg` (`fg` also against `surface` and `surface_alt`), `accent` 3:1; the decorative `subtle` and `border` roles are not checked. Stored in the repository's `.lirox.toml` as `[workspaces.<slug>.theme]`, which holds repository-level settings only (legacy `name`/`relative_path` keys are dropped on write). |
| `repository_server_function` | Yes | `repo_id: String` | `RepositorySummary` for the configured repository; mismatched IDs are not found. |
| `repositories_server_function` | Yes | — | `Vec<RepositorySummary>` for the configured repository (currently zero or one item). |
| `connect_repository_server_function` | Yes | `repo_url: String`, `branch: Option<String>` | `RepositorySummary`; configures origin and persists the remote/branch. |
| `disconnect_repository_server_function` | Yes | — | `RepositorySummary`; removes origin and clears the persisted URL. |
| `sync_workspace_server_function` | Yes | — | `WorkspaceSync { ok, pulled, pushed, message }`; pulls fast-forward-only, then pushes; local workspaces report no remote. |
| `pull_workspace_server_function` | Yes | — | `bool`; fast-forward-only pull, or `false` without a remote. |
| `push_workspace_server_function` | Yes | — | `bool`; push, or `false` without a remote. |
| `workspace_conflicts_server_function` | Yes | — | `Vec<String>`; currently empty, matching the former gateway behavior. |
| `workspace_trash_server_function` | Yes | — | `Vec<String>`; currently empty, matching the former gateway behavior. |

Protected workspace functions return an authentication error before reading or
mutating workspace data. Invalid note paths are rejected before filesystem
access. Invalid setup, repository, contrast, or challenge inputs return a
client-safe error; storage and configuration failures return a generic server
error. Challenge records remain short-lived, single-use, and persisted in the
existing format.
