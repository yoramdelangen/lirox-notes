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

Authentication endpoint schemas, cookie rules, RP configuration, errors, and
the removal of password routes are maintained authoritatively in
[`crates/gateway/API.md`](../gateway/API.md). The app only needs the semantic
flow: registration establishes a session, login retries authentication, and
logout returns the user to the unauthenticated route.

## Workspace Contract

Workspace setup initializes installation with `POST /api/setup`, then submits
the documented workspace form to `POST /api/workspaces`. The app keeps the
form state for retry and advances to the workbench only after a successful
response followed by bootstrap confirmation. A pre-existing config
without `onboarding_complete=true` is not migrated automatically, so it stays
on `workspace_required` until explicit workspace setup succeeds.

The complete endpoint catalogue and response schemas are maintained in
[`crates/gateway/API.md`](../gateway/API.md).
