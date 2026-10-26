# Dioxus Fullstack Migration Design

## Intent

Move LiroxNotes' server-side responsibilities from the standalone Actix gateway
to a Dioxus fullstack server. The app should call typed Dioxus server functions
instead of maintaining browser-side HTTP requests, URL construction, and JSON
conversion. This gives web and desktop clients a shared server boundary and
leaves room for a future mobile client without duplicating backend request code.

## Current State

- `crates/app` is a Dioxus 0.7 web-only client. `app/effects.rs` uses
  `web_sys::fetch` against a configured gateway URL and manually parses JSON.
- `crates/gateway` is an Actix process. It owns passkey authentication and
  sessions, onboarding, workspace configuration, filesystem operations, Git,
  HTML/static serving, and the documented `/api/*` routes.
- `crates/shared` contains serializable workspace/domain values shared by app
  and gateway.
- The dev launcher starts Dioxus web, Actix gateway, and the editor watcher as
  separate processes.
- `cargo test --workspace` passes at the time of reconnaissance.

## Goals

- Make the Dioxus server the sole backend host; remove Actix gateway routing and
  client-authored API transport from the application.
- Move every currently implemented gateway operation used by the app to typed
  Dioxus server functions, retaining existing validation, authorization,
  filesystem/Git semantics, session protections, and error behavior.
- Keep the UI and platform targets distinct: web and desktop are separate client
  builds sharing the same app/domain logic; server-only code remains unavailable
  to client targets.
- Preserve the current app flows and existing passkey/workspace data on disk.
- Update tests, development tooling, README/architecture/auth docs, and the
  authoritative API reference to match the new server-function boundary.

## Non-Goals

- Cloud hosting, a hosted multi-user service, or a new account model.
- Native mobile packaging or mobile-specific UI changes.
- Embedding or supervising the server process from the desktop app in this
  migration. Desktop runs the same server binary locally alongside its client;
  automatic launch/bundling can be designed separately.
- Rewriting filesystem, Git, theme, or WebAuthn business logic merely to change
  the transport layer.
- Keeping compatibility with independent consumers of the old `/api/*` routes;
  the app is the intended client and its calls will move to server functions.

## Architecture

Use Dioxus fullstack with one server implementation and distinct platform
builds. Declare `#[server]` functions in the app crate so Dioxus compiles the
client stubs and server implementations from the same API declarations; keep
filesystem/Git/auth operations in a server-only backend crate that the client
build does not compile. Server functions form the app-facing typed boundary.
Keep OS filesystem,
Git, configuration, WebAuthn, and session operations on the server side, and
reuse the existing gateway logic where its boundaries allow. Shared request and
response values belong in the shared crate only when both client and server
need them; server secrets and filesystem paths must not enter client-visible
types or serialized results.

The application effect executor continues to translate effects into application
events. Replace its browser `fetch`/JSON layer with calls to server functions;
keep browser WebAuthn credential creation/retrieval in the web platform adapter,
then send the resulting credential data to server functions for verification.
Authentication remains server-authoritative and session material must remain
HttpOnly and inaccessible to client application state.

Desktop uses its WebView's browser WebAuthn APIs against the locally running
Dioxus server, matching the web passkey flow; do not add a native credential
store or a separate desktop authentication mechanism.

Build targets remain separate: Dioxus server for the backend, web for the
browser client, and desktop for the native shell. Desktop's server runs locally
on the machine holding the workspace. Development tooling runs the Dioxus
server, selected client target, and existing editor watcher without a separate
gateway process. Do not add target configurations that claim to ship before
they compile and exercise the server-function client transport.

## Migration Scope

Convert all active gateway API capabilities into Dioxus server functions,
including bootstrap/authentication, setup/onboarding, workspace discovery and
creation, workspace view/theme, note/file operations, repository operations,
sync/pull/push, conflicts, and trash. Retire Actix-only API/CORS/preflight and
legacy HTML handlers after equivalent app behavior is covered by Dioxus routes
or existing app UI. Preserve the current passkey challenge/session data formats
and workspace/config files so users do not lose access to existing installs.

Replace the API catalogue in `crates/gateway/API.md` with the authoritative
server-function contract and client-visible errors. Update manual `.http` files
that exercise removed routes, or remove them if no longer applicable. Preserve
meaningful auth and workspace integration coverage by testing the server
functions and their underlying server operations rather than merely testing
generated transport internals.

Before editing, inspect current diffs in the already-modified app/UI/assets and
preserve unrelated user changes. Do not reset or overwrite those files as part
of the migration.

## Behavior and Safety Requirements

- Every protected operation authenticates from the request's server-side
  session context; never trust a user ID or authorization flag supplied by the
  client.
- Preserve path traversal defenses and workspace/repository validation at the
  server boundary.
- Preserve challenge expiry/replay checks, session rotation/expiry, cookie
  attributes, and current persisted formats.
- Preserve existing sessions where compatible with the Dioxus request/cookie
  context; if not compatible, require sign-in again without changing persisted
  passkeys or workspace data.
- Preserve error handling that enables onboarding retries and session expiry
  behavior, without leaking filesystem paths, secrets, or credential material.
- Client-visible server-function outputs contain only data required by the UI.
- No Dioxus component or platform client performs filesystem or Git operations.
- Keep app reducers/effects/events testable independently from Dioxus rendering.

## Validation and Acceptance

- Web fullstack development starts without an Actix gateway process and retains
  passkey onboarding, authentication/logout, workspace setup, workspace loading,
  theme save, and note save/load behavior.
- The Dioxus server build and web client build compile independently; the
  desktop client build is attempted and its server-function calls and browser
  WebAuthn flow are verified against the local Dioxus server if the local
  toolchain supports the target.
- Existing installations, passkeys, sessions where compatible, workspace
  configuration, repositories, and note files are not deleted or migrated
  destructively.
- Tests cover protected/unprotected calls, invalid/expired session behavior,
  invalid note paths, setup retry, and representative filesystem/Git results.
- `cargo fmt --check`, `cargo check --workspace`, `cargo test --workspace`, and
  the applicable `dx` server/web/desktop checks pass; report unavailable target
  toolchains and pre-existing failures separately.
- README, `crates/app/ARCHITECTURE.md`, `crates/app/ONBOARDING_AUTH.md`, and
  `crates/gateway/API.md` no longer claim Actix is the backend authority.

## Builder Decisions

- Recommended deployment: one Dioxus server binary, run locally beside desktop
  for local workspace access or deployed beside the web client; desktop process
  supervision/bundling is deferred.
- Desktop WebAuthn uses the WebView's browser APIs and the same relying-party
  configuration as the server; no alternate native credential flow is added.
- Treat the old `/api/*` interface as internal to this app and not a compatibility
  promise. If a real external consumer is discovered, stop before removing its
  routes and bring that compatibility decision back for approval.
- Use the project's installed Dioxus 0.7.10 CLI and compatible crate APIs; do
  not upgrade Dioxus as part of this migration unless a verified platform
  limitation makes it necessary.
- Keep Dioxus server-function declarations in the app crate and backend logic
  in a server-only backend crate; this is required for Dioxus to compile the
  same server-function API into client stubs and server implementations without
  including filesystem/Git code in web or desktop clients.
