# Dioxus Fullstack Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Actix gateway and browser-authored API calls with one Dioxus server exposing typed server functions to separate web and desktop clients.

**Architecture:** Put filesystem/Git/auth operations in a server-only backend crate; define `#[server]` functions in the app crate so Dioxus compiles client stubs for web/desktop and server implementations for the server target from the same declarations. Remove Actix route/static serving, launch the fullstack server through Dioxus, and keep desktop running the same server locally beside its client. Reuse existing server behavior and persisted formats rather than rewriting business logic.

**Tech Stack:** Rust 2021, Dioxus 0.7.10, Dioxus CLI, serde, existing WebAuthn/Git/filesystem code, Cargo workspace.

**Spec:** `docs/superpowers/specs/2026-10-21-dioxus-fullstack-migration-design.md`

## Global Constraints

- Dioxus 0.7.10 is the current floor; do not upgrade Dioxus unless a verified platform limitation makes it necessary.
- Existing passkeys, workspaces, repository data, and note files must not be destructively migrated.
- Server functions are the app-facing backend boundary; filesystem and Git stay server-only.
- All protected operations authenticate from server-side session context and retain existing path/repository validation.
- Desktop uses WebView WebAuthn against a Dioxus server running locally; desktop auto-launch/bundling is deferred.
- Preserve unrelated changes already present in app/UI/assets files; inspect their diffs before touching them.
- Update `crates/gateway/API.md` whenever the client-visible server-function contract, auth behavior, or error behavior changes.

## Review Focus

- A client supplies another user's identity or a forged auth flag: protected server functions must reject it using the request session.
- A malformed, expired, replayed, or mismatched passkey challenge: verification must fail without authenticating or leaking credential material.
- A note path contains absolute, dot, parent, or platform-prefix components: file operations must reject it before filesystem access.
- Existing cookie/session state reaches a new function call: compatible sessions remain valid; incompatible sessions require sign-in without data loss.
- A desktop/WebView call targets the local server with missing, refused, or wrong-origin configuration: report a recoverable auth/connection error rather than silently treating it as logged out.

---

### Task 1: Establish Dioxus Fullstack Targets And A Server-Function Proof

**Files:**
- Modify: workspace `Cargo.toml`
- Modify: `crates/app/Cargo.toml`, `crates/app/Dioxus.toml`, `crates/app/src/main.rs`
- Create/modify: `crates/app/src/server.rs` (minimal proof function only)
- Test: app server-function unit/integration test module

**Interfaces:**
- Produces a compiling Dioxus server target and web client target, plus evidence whether the installed Dioxus 0.7.10 stack supports the desktop client calling the same server function.
- Do not add application behavior in this proof beyond one serialized request/result used to verify transport and server/client compilation.

- [x] **Step 1: Add a failing server-function test** that calls a minimal typed function and asserts its result; add a desktop-target compile check to the verification recipe.
- [x] **Step 2: Run the focused test/check** and confirm it fails because fullstack configuration/function registration is not present.
- [x] **Step 3: Enable the Dioxus fullstack feature and platform feature selection** in Cargo/Dioxus configuration, and implement the smallest proof server function and launch path compatible with Dioxus 0.7.10.
- [x] **Step 4: Verify** `cargo test -p liroxnotes-app --features server --test server_function`, `dx check --platform server --package liroxnotes-app --features server`, `dx check --platform web --package liroxnotes-app`, and `dx check --platform desktop --package liroxnotes-app --features desktop`. Record any unsupported desktop server-function transport as a blocker before porting endpoints.

### Task 2: Separate Existing Backend Logic From Actix And Make It A Dioxus Server Crate

**Files:**
- Move/modify: backend operations from `crates/gateway/` to `crates/backend/` and rename package to `liroxnotes-backend`
- Modify: root `Cargo.toml`, `Cargo.lock`, app/backend manifests
- Modify: `crates/shared/src/lib.rs` and `crates/app/src/theme.rs` only as needed to remove backend-to-app dependencies
- Test: moved server unit tests and workspace integration tests

**Interfaces:**
- `liroxnotes-backend` owns shared runtime paths, configuration and path validation; it must not depend on Actix or `liroxnotes-app`. Remaining auth/session and workspace/filesystem/Git operations move into this crate with their server-function port in Task 3, since their current implementations are interleaved with Actix request handlers.
- `liroxnotes-app/src/server.rs` owns `#[server]` declarations and calls backend operations only in the server implementation; app client builds compile generated server-function clients without compiling backend code.
- Remove Actix routing, CORS, HTML compatibility pages, and static file serving after their app behavior has a Dioxus equivalent.

- [x] **Step 1: Add a regression test** proving server business operations can be built and tested without importing the Dioxus app or Actix request/response types.
- [x] **Step 2: Run the focused test** and verify the current gateway-to-app/Actix coupling prevents the intended server boundary.
- [x] **Step 3: Extract/rename the crate and remove transport coupling** for runtime paths, workspace configuration parsing/formatting, and note-path validation while preserving existing formats; remaining filesystem/Git/auth operations move with their server-function port in Task 3.
- [x] **Step 4: Run** `cargo test -p liroxnotes-backend` and verify its package dependency graph contains neither Actix nor `liroxnotes-app`.

### Task 3: Port Every Active Gateway Capability To Typed Server Functions

**Files:**
- Modify: `crates/app/src/server.rs` and backend operation modules
- Modify: `crates/shared/src/lib.rs` only for types required by both targets
- Test: server crate tests for auth, setup, workspaces, files, themes, repositories, and sync

**Interfaces:**
- App-defined server functions cover bootstrap/auth/logout, passkey challenge and verification, setup/onboarding, workspace discovery/create/view/theme, note/file read/write/delete, repository read/connect/disconnect, sync/pull/push, conflicts, and trash.
- Request arguments are serializable client-safe values; server outputs do not include server paths, secrets, tokens, or credential material.
- Existing backend validation/errors remain authoritative and map to stable, user-safe server-function errors.

- [x] **Step 1: Add failing tests** for unauthenticated protected access, invalid/expired/replayed challenge rejection, invalid note paths, retryable setup, and representative workspace/file/Git success results through the new server operation boundary.
- [x] **Step 2: Run those tests** and confirm missing backend operations/request-context auth were exposed.
- [x] **Step 3: Add server functions in `crates/app/src/server.rs`** and adapt backend operations to Dioxus request/session context; preserve HttpOnly cookie flags, session rotation/expiry, and existing persisted formats. Gate the backend dependency behind the app's server feature so client builds contain only generated stubs.
- [x] **Step 4: Run** focused server tests and the server/backend regression suites; existing installation/session data is not rewritten by startup.

### Task 4: Replace Client Fetch/JSON Effects With Server-Function Calls

**Files:**
- Modify: `crates/app/src/app/effects.rs`, `crates/app/src/lib.rs`, `crates/app/src/auth.rs`, platform auth adapters
- Modify: app Cargo features/dependencies to remove direct request/JSON transport dependencies no longer needed
- Test: `crates/app/src/lib.rs` and `crates/app/src/app/` tests

**Interfaces:**
- `execute_effect` continues dispatching application events and translating failures; no endpoint URLs or manual response JSON conversion remain in the app.
- WebAuthn credential creation/retrieval stays in the platform adapter; both web and desktop serialize browser credential output and send it to server functions.
- Bootstrap, login/register/logout, setup, repository inspection, workspace selection, theme save, and note load/save retain current reducer-visible behavior.

- [x] **Step 1: Add effect/auth regression tests** for retained reducer-visible behavior and auth failure handling.
- [x] **Step 2: Run the focused tests** and use the existing event-level test seam to verify mappings.
- [x] **Step 3: Replace `web_json`, `response_json`, gateway URL construction, and browser-only API cfg gating** with server-function calls; remove only dependencies/features made unused by this change. Web and desktop use the same server calls; desktop WebAuthn uses the WebView evaluator.
- [x] **Step 4: Run** app tests and Dioxus web/server/desktop checks.

### Task 5: Wire Server/Web/Desktop Launch And Development Workflow

**Files:**
- Modify: `crates/app/src/main.rs`, root `Dioxus.toml`, `crates/app/Dioxus.toml`, `justfile`
- Modify: workspace feature declarations and platform adapters as required by Task 1 findings
- Test: target checks and launcher/config tests where the repository has suitable coverage

**Interfaces:**
- `dx serve --platform server` runs the Dioxus backend; web and desktop remain independently selectable client targets.
- Development starts the Dioxus server, chosen app client, and current editor watcher; it no longer starts Actix or exposes `LIROX_GATEWAY_URL`/`LIROX_GATEWAY_PORT`.
- Desktop calls the locally running Dioxus server and uses WebView WebAuthn with local-server RP configuration.

- [ ] **Step 1: Add failing configuration/launcher assertions** for removal of the gateway process and retention of server, web, desktop, and editor targets.
- [ ] **Step 2: Run the focused checks** and capture current launcher/target mismatch.
- [ ] **Step 3: Update Dioxus platform selection and the dev launcher** to start server plus selected client and editor watcher; keep process lifecycle simple and do not implement desktop auto-launch.
- [ ] **Step 4: Verify** server and web builds/checks, desktop build/check where toolchain allows, and a local server-function call from both web and desktop clients where supported.

### Task 6: Replace Gateway API Documentation And Retire Old Transport Artifacts

**Files:**
- Modify: `crates/gateway/API.md` (retain this authoritative path per repository guidance)
- Modify: `README.md`, `crates/app/ARCHITECTURE.md`, `crates/app/ONBOARDING_AUTH.md`
- Modify/delete: `crates/gateway/http/` request examples and old gateway-specific test harnesses
- Test: full workspace suite and documentation/reference searches

**Interfaces:**
- API.md documents server-function names, serialized arguments/results, auth requirements, validation, and client-visible errors; it no longer describes Actix routes as authoritative.
- Existing behavior tests move to the server operation/function boundary; do not keep dead compatibility clients or test-only Actix infrastructure.

- [ ] **Step 1: Add documentation checks/search assertions** that identify stale Actix/gateway deployment references in active README, app docs, and API reference.
- [ ] **Step 2: Run the checks** and confirm the current documents still advertise Actix routes and the gateway process.
- [ ] **Step 3: Update the API and project docs**, remove obsolete `.http` examples and Actix-only route tests only after equivalent coverage exists, and document the server/web/desktop commands.
- [ ] **Step 4: Run final validation:** `cargo fmt --check`, `cargo check --workspace`, `cargo test --workspace`, `dx check --platform server --package liroxnotes-app`, `dx check --platform web --package liroxnotes-app`, desktop check/build where supported, and a search for `LIROX_GATEWAY_URL`, `LIROX_GATEWAY_PORT`, `liroxnotes-gateway`, and Actix route ownership in active docs/config.

---

## Plan Self-Review

- **Spec coverage:** Tasks 1 and 5 cover separate fullstack targets and tooling; Tasks 2 and 3 cover all backend operations and removal of Actix; Task 4 covers typed app calls, WebAuthn, and event/error behavior; Task 6 covers docs/API references and old transport artifacts. Data preservation, security, and user-change preservation are global constraints and focused tests.
- **Step scan:** Each task has a failing-test/check first, an explicit red verification, minimal implementation, and green verification. Task 1 gates endpoint migration on actual Dioxus 0.7.10 desktop transport support.
- **Type consistency:** Server function request/results are serializable; business operations remain server-owned; client effect code consumes function results and still emits existing app events.
- **Review focus tests:** Auth forgery and invalid challenge belong to Task 3; path traversal belongs to Task 3; compatible session cookie behavior belongs to Task 3; desktop connection/origin behavior belongs to Tasks 1 and 5.
- **Proportion:** Six boundaries follow the dependency chain from runtime proof to backend/function migration to client/platform integration and retirement; no mobile/cloud/packaging tasks were added.
