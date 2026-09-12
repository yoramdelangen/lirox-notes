# Onboarding And Passkey Authentication

The gateway is authoritative for installation, onboarding, authentication,
and workspace creation. The app selects its screen from `GET /api/bootstrap`;
it does not infer state from local storage or workspace files.

## Startup Routing

| Gateway state | App screen |
|---|---|
| not installed | installation/setup |
| `not_started` | passkey registration |
| `workspace_required` | workspace setup |
| `complete` and unauthenticated | passkey login |
| `complete` and authenticated | workbench |

Registration creates the authenticated session. A refresh before workspace
creation returns `workspace_required`. The workbench is not rendered until
bootstrap reports `complete` and the session is authenticated.

## Bootstrap Contract

`GET /api/bootstrap` returns `200`:

```json
{
  "installed": true,
  "onboarding": "workspace_required",
  "authenticated": true,
  "user": "local",
  "workspace_root": ".lirox-runtime/workspace",
  "workspace": null
}
```

`onboarding` is `not_started`, `workspace_required`, or `complete`.
`workspace_root` uses `LIROX_WORKSPACE_DIR` when set. Otherwise it defaults to
`.lirox-runtime/workspace` in debug builds, and to
`$XDG_DATA_HOME/liroxnotes/workspace`, or `$HOME/.local/share/liroxnotes/workspace`
when `XDG_DATA_HOME` is unset, in release builds. `LIROX_CONFIG_FILE` controls
the config path; its debug default is `.lirox-runtime/config`.
`workspace` is `null` until configured, then contains `{ "slug", "name" }`.

## Passkey Contract

- `POST /api/auth/passkeys/register/options` returns `200` with
  `{ "challenge_id", ...creation_options }`.
- `POST /api/auth/passkeys/register/verify` accepts
  `{ "challenge_id", "credential" }` and returns `201` plus a session cookie.
- `POST /api/auth/passkeys/login/options` returns `200` with
  `{ "challenge_id", ...request_options }`.
- `POST /api/auth/passkeys/login/verify` accepts
  `{ "challenge_id", "credential" }` and returns `200` plus a session cookie.
- `POST /api/auth/logout` returns `200` and clears the session cookie.

The session cookie is `lirox_session`, `HttpOnly`, `SameSite=Lax`, `Path=/`,
and `Secure` when `LIROX_RP_ORIGIN` uses HTTPS. Missing or invalid cookies on
protected routes return `401` as `{ "error": "login required" }`.

The relying-party ID defaults to `localhost` and the origin defaults to
`http://localhost:3010`. Set `LIROX_RP_ID` and `LIROX_RP_ORIGIN` to override
them. Invalid origin or WebAuthn configuration fails gateway startup. The
gateway port defaults to `3010` and can be set with `LIROX_PORT` or `--port`.

Password and passwordless login routes are removed. There is no password
fallback or password field in the active authentication flow.

## Workspace Contract

`POST /api/workspaces` requires an authenticated passkey session and accepts:

| Field | Type | Default/behavior |
|---|---|---|
| `repo_mode` | string | Only `remote` selects a remote repository; other values are local Git |
| `workspace_slug` | string | Slugified; repo name, then `workspace` |
| `workspace_name` | string | `My Workspace` |
| `repo_url` | string | Used only for `remote`; cleared otherwise |
| `branch` | string | `main` |

It returns `201` with the workspace response fields `slug`, `name`, `path`,
`branch`, `source`, `note_count`, and `changed_notes`. Local setup initializes
Git; remote setup clones and configures `origin`. After workspace setup,
configuration persistence, and Git configuration succeed, the gateway writes
`onboarding_complete=true` and the next bootstrap response is `complete`.

Failures retain `workspace_required` and use `{ "error": "<message>" }` with
`401` for missing authentication or `500` for filesystem, Git, or persistence
failures.

The complete endpoint catalogue and response schemas are maintained in
[`crates/gateway/API.md`](../gateway/API.md).
