# Onboarding and Passkey Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the gateway's legacy local password flow with passkey-only authentication, resumable onboarding, secure sessions, and an authenticated Dioxus workbench gate.

**Architecture:** The gateway owns WebAuthn verification, credential/challenge persistence, onboarding state, workspace authorization, and server-managed sessions. The frontend consumes one bootstrap state, invokes native browser WebAuthn through a platform adapter, dispatches semantic application commands, and renders onboarding/login/workbench screens without owning secrets or repository logic.

**Tech Stack:** Rust 2021, Actix Web, Dioxus 0.7, `serde`, `webauthn-rs` 0.5, browser WebAuthn JSON APIs, file-backed runtime state, and existing workspace Git helpers.

**Spec:** `docs/superpowers/specs/2026-09-12-onboarding-auth-design.md`

## Global Constraints

- Authentication method: passkeys only; do not implement passwords, password reset, password complexity rules, or fallback password login.
- The Gateway is authoritative for onboarding completion, authentication success, identity, passkey verification, credential validity, and workspace authorization.
- Registration must be verified and persisted before workspace setup is available.
- Challenges are short-lived and single-use; successful authentication rotates the session.
- Sessions use opaque server-managed `HttpOnly`, `SameSite=Lax`, `Path=/` cookies, with `Secure` when HTTPS is configured.
- Do not store bearer credentials in general-purpose browser storage.
- Existing documented workspace fields are `repo_mode`, `workspace_slug`, `workspace_name`, `repo_url`, and `branch`.
- Do not implement Git-provider OAuth, passkey management screens, or recovery in this slice.
- Update `crates/gateway/API.md` for every externally visible endpoint, request, response, auth, or error change.
- Preserve unrelated uncommitted work in the dirty worktree; stage only files belonging to this feature when committing.

---

### Task 1: Define Auth State and Persistent Records

**Files:**
- Create: `crates/gateway/src/auth.rs`
- Modify: `crates/gateway/src/lib.rs`
- Test: `crates/gateway/src/auth.rs` unit tests

**Interfaces:**
- Produces `OnboardingStatus`, `BootstrapResponse`, `CredentialRecord`, `ChallengeRecord`, `StoredSession`, and pure serialization/parsing helpers.
- Produces `AuthStore` operations for loading and saving account, credential, challenge, and session state under `RuntimePaths`.
- Consumes existing `RuntimePaths`, `is_installed`, `load_config`, and `GatewayConfig`.

- [ ] **Step 1: Write failing tests for explicit state and persistence**

```rust
#[test]
fn bootstrap_status_distinguishes_fresh_registered_and_complete() {
    assert_eq!(onboarding_status(false, false), OnboardingStatus::NotStarted);
    assert_eq!(onboarding_status(true, false), OnboardingStatus::WorkspaceRequired);
    assert_eq!(onboarding_status(true, true), OnboardingStatus::Complete);
}

#[test]
fn credentials_support_multiple_passkeys() {
    let account = AccountRecord::with_credential(credential("one"));
    let account = account.with_credential(credential("two"));
    assert_eq!(account.credentials.len(), 2);
}
```

- [ ] **Step 2: Run the focused tests and confirm the new types are missing**

Run: `cargo test -p liroxnotes-gateway auth::tests`

Expected: FAIL because the auth state and persistence types do not exist.

- [ ] **Step 3: Implement the smallest file-backed auth model**

Use versioned records with a format that can hold multiple credentials:

```rust
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub enum OnboardingStatus {
    NotStarted,
    WorkspaceRequired,
    Complete,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct CredentialRecord {
    pub credential_id: String,
    pub public_key: String,
    pub sign_count: u32,
    pub label: String,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct AccountRecord {
    pub version: u8,
    pub credentials: Vec<CredentialRecord>,
}
```

Store records below the configured runtime directory, create parent directories
before writes, reject malformed records, and never persist raw authenticator
responses or passwords. Use atomic temporary-file rename for writes.

- [ ] **Step 4: Run the focused tests and verify persistence behavior**

Run: `cargo test -p liroxnotes-gateway auth::tests`

Expected: PASS, including malformed-record rejection and multi-credential round trips.

- [ ] **Step 5: Commit the isolated model**

```bash
git add crates/gateway/src/auth.rs crates/gateway/src/lib.rs
git commit -m "feat: add passkey auth state model"
```

### Task 2: Implement WebAuthn Registration and Login

**Files:**
- Modify: workspace `Cargo.toml` and `crates/gateway/Cargo.toml` to add `webauthn-rs = "0.5"` with the gateway's required WebAuthn features.
- Modify: `crates/gateway/src/auth.rs`
- Modify: `crates/gateway/src/lib.rs`
- Test: `crates/gateway/src/auth.rs` unit tests and gateway integration tests

**Interfaces:**
- Produces `AuthService::registration_options`, `AuthService::verify_registration`, `AuthService::login_options`, and `AuthService::verify_login`.
- Produces routes `POST /api/auth/passkeys/register/options`, `POST /api/auth/passkeys/register/verify`, `POST /api/auth/passkeys/login/options`, and `POST /api/auth/passkeys/login/verify`.
- Consumes the WebAuthn library's registration/authentication option and verification types, `AuthStore`, and configured RP ID/origin.

- [ ] **Step 1: Add request/response contract tests before implementation**

Test the pure service boundary with fake WebAuthn responses or the dependency's test fixtures:

```rust
#[test]
fn expired_challenge_is_rejected() {
    let service = test_service_at(timestamp(100));
    service.store_registration_challenge(challenge("c", 90));
    assert!(matches!(service.consume_challenge("c", timestamp(100)), Err(AuthError::ChallengeExpired)));
}

#[test]
fn challenge_cannot_be_consumed_twice() {
    let service = test_service_at(timestamp(100));
    service.store_registration_challenge(challenge("c", 200));
    service.consume_challenge("c", timestamp(100)).unwrap();
    assert!(matches!(service.consume_challenge("c", timestamp(100)), Err(AuthError::ChallengeNotFound)));
}
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: `cargo test -p liroxnotes-gateway auth::tests::expired_challenge_is_rejected auth::tests::challenge_cannot_be_consumed_twice`

Expected: FAIL because the challenge service does not exist.

- [ ] **Step 3: Configure the WebAuthn service**

Read `LIROX_RP_ID`, `LIROX_RP_ORIGIN`, and an optional `LIROX_SESSION_TTL_SECONDS` from the environment. Default RP ID and origin to the local gateway host used by development. Validate origin/RP configuration once when the Actix app state is built; do not derive it from arbitrary request headers.

Create options with discoverable credentials for login where supported. Store only the challenge state needed by the library and consume it after successful verification. Registration creates the first account if none exists; later registration is not exposed by onboarding but the record format supports it.

- [ ] **Step 4: Replace the old auth handlers with JSON passkey handlers**

Return the library-produced public options as JSON. Accept only the corresponding credential response JSON at verify routes. On successful verification, persist the credential or updated sign counter, rotate the server-side session, and return the existing error envelope for failures:

```json
{"error":"passkey verification failed"}
```

Reject registration after onboarding is complete and reject login before onboarding is complete with status `400`. Reject missing, expired, reused, or invalid challenges with status `401` or `400` according to the existing API error convention, using stable non-sensitive messages.

- [ ] **Step 5: Run gateway tests**

Run: `cargo test -p liroxnotes-gateway`

Expected: PASS, including challenge expiry/replay and invalid verification tests.

- [ ] **Step 6: Commit the WebAuthn service**

```bash
git add Cargo.toml Cargo.lock crates/gateway/Cargo.toml crates/gateway/src/auth.rs crates/gateway/src/lib.rs crates/gateway/tests
git commit -m "feat: add passkey registration and login"
```

### Task 3: Add Bootstrap, Secure Sessions, and Route Guards

**Files:**
- Modify: `crates/gateway/src/auth.rs`
- Modify: `crates/gateway/src/lib.rs`
- Modify: `crates/gateway/src/routes/mod.rs`
- Test: `crates/gateway/tests/auth_api.rs`

**Interfaces:**
- Produces `GET /api/bootstrap` and `GET /api/auth/session` returning one consistent `BootstrapResponse`.
- Produces session expiry, rotation, logout invalidation, and cookie helpers.
- Updates HTML and JSON route guards to route fresh installs, incomplete onboarding, unauthenticated users, and authenticated users correctly.

- [ ] **Step 1: Write failing HTTP tests for startup routing and sessions**

```rust
#[actix_web::test]
async fn fresh_install_reports_passkey_registration_required() {
    let response = test_app(Fixture::fresh()).get("/api/bootstrap").send().await;
    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(response.json::<BootstrapResponse>().await.unwrap().onboarding, OnboardingStatus::NotStarted);
}

#[actix_web::test]
async fn expired_session_is_unauthenticated() {
    let response = test_app(Fixture::expired_session()).get("/api/auth/session").send().await;
    assert!(!response.json::<BootstrapResponse>().await.unwrap().authenticated);
}
```

- [ ] **Step 2: Run the new tests and confirm they fail**

Run: `cargo test -p liroxnotes-gateway --test auth_api`

Expected: FAIL because `/api/bootstrap` and the explicit onboarding/session response do not exist.

- [ ] **Step 3: Implement the authoritative bootstrap response**

Return installation state, onboarding status, authentication state, current user, and workspace setup defaults. Compute `Complete` only from explicit persisted onboarding state, with a one-time migration of an existing valid workspace configuration to `Complete` if required for existing installations.

- [ ] **Step 4: Harden session handling**

Persist a random opaque session token with creation and expiry timestamps. Compare tokens in constant time where the available standard/library API supports it, reject expired sessions, rotate after passkey verification, and invalidate on logout. Set cookies with `HttpOnly; SameSite=Lax; Path=/` and add `Secure` when configured for HTTPS.

- [ ] **Step 5: Update route guards**

Use bootstrap state for `/`, `/onboarding`, and workspace HTML routes. Protect workspace JSON routes with the same session validator. Preserve the existing workspace creation endpoint's special allowance for authenticated onboarding after passkey registration.

- [ ] **Step 6: Run HTTP and workspace regression tests**

Run: `cargo test -p liroxnotes-gateway`

Expected: PASS, with existing Git/workspace tests unchanged and new bootstrap/session tests green.

- [ ] **Step 7: Commit bootstrap and sessions**

```bash
git add crates/gateway/src/auth.rs crates/gateway/src/lib.rs crates/gateway/src/routes/mod.rs crates/gateway/tests/auth_api.rs
git commit -m "feat: add authoritative onboarding bootstrap"
```

### Task 4: Replace Install/Login UI and Gate the Dioxus App

**Files:**
- Modify: `crates/gateway/src/components/pages.rs`
- Modify: `crates/gateway/src/lib.rs`
- Modify: `crates/app/src/lib.rs`
- Modify: `crates/app/src/app/event.rs`
- Modify: `crates/app/src/app/reducer.rs`
- Create: `crates/app/src/auth.rs`
- Create: `crates/app/src/platform/web/webauthn.rs`
- Test: app auth state tests and gateway SSR tests

**Interfaces:**
- Produces frontend `AuthState`, `OnboardingView`, auth commands/events, and a browser-only WebAuthn bridge.
- Consumes `GET /api/bootstrap` and the four passkey endpoints through the existing effect boundary.
- Leaves `WorkspaceShell` rendering unchanged for authenticated/completed state.

- [ ] **Step 1: Write failing pure state tests**

```rust
#[test]
fn bootstrap_state_selects_the_correct_screen() {
    assert_eq!(screen_for(BootstrapState::not_started()), Screen::RegisterPasskey);
    assert_eq!(screen_for(BootstrapState::workspace_required()), Screen::WorkspaceSetup);
    assert_eq!(screen_for(BootstrapState::unauthenticated_complete()), Screen::Login);
    assert_eq!(screen_for(BootstrapState::authenticated_complete()), Screen::Workbench);
}
```

- [ ] **Step 2: Run the app tests and confirm the gate is absent**

Run: `cargo test -p liroxnotes-app auth::tests`

Expected: FAIL because the auth state and screen selection do not exist.

- [ ] **Step 3: Implement pure auth/onboarding state and events**

Add explicit states for bootstrap loading, passkey operation in progress, retryable failure, workspace setup, and complete authentication. Reducers must only update state and produce effects; components must not call fetch or WebAuthn directly.

- [ ] **Step 4: Implement the browser WebAuthn adapter**

Use `window.PublicKeyCredential`, `navigator.credentials.create`, and `navigator.credentials.get` behind the web platform module. Convert ArrayBuffer fields to base64url JSON expected by the gateway and convert gateway options back to browser `PublicKeyCredentialCreationOptions`/`RequestOptions`. Return structured cancellation/unsupported/failure events and never persist credential material in storage.

- [ ] **Step 5: Implement the simple auth shell**

Render Welcome, Secure access, Passkey ready, Workspace setup, Creating workspace, Welcome back, retryable failure, and session-expired states. Use existing app tokens and focus treatment. Do not render the workbench, file tree, command palette, or Vim bars before the gateway reports complete and authenticated.

- [ ] **Step 6: Wire bootstrap and commands through effects**

Add semantic commands for registration, login, logout, workspace creation, and retry. Route successful registration to workspace setup, successful workspace creation to the workbench, and logout/session expiry to login. Preserve setup fields across retryable network or gateway errors.

- [ ] **Step 7: Run app and SSR checks**

Run: `cargo test -p liroxnotes-app -p liroxnotes-gateway`

Expected: PASS, including SSR output without requiring browser-only APIs.

- [ ] **Step 8: Commit the frontend gate**

```bash
git add crates/app/src crates/gateway/src/components/pages.rs crates/gateway/src/lib.rs
git commit -m "feat: gate workbench behind passkey onboarding"
```

### Task 5: Complete Workspace Bootstrap and API Documentation

**Files:**
- Modify: `crates/gateway/src/lib.rs`
- Modify: `crates/gateway/API.md`
- Modify: `crates/app/ONBOARDING_AUTH.md`
- Test: `crates/gateway/tests/auth_api.rs` and existing workspace tests

**Interfaces:**
- Produces explicit `workspace_required` to `complete` transition after successful `POST /api/workspaces`.
- Documents exact request/response schemas, defaults, errors, cookie rules, RP configuration, and startup routing.

- [ ] **Step 1: Write failing completion tests**

```rust
#[actix_web::test]
async fn workspace_creation_marks_onboarding_complete() {
    let app = test_app(Fixture::authenticated_without_workspace());
    let response = app.post_json("/api/workspaces", json!({
        "repo_mode": "new",
        "workspace_slug": "notes",
        "workspace_name": "Notes",
        "branch": "main"
    })).send().await;
    assert_eq!(response.status(), StatusCode::CREATED);
    assert_eq!(app.bootstrap().await.onboarding, OnboardingStatus::Complete);
}
```

- [ ] **Step 2: Run the focused test and confirm the explicit completion flag is missing**

Run: `cargo test -p liroxnotes-gateway --test auth_api workspace_creation_marks_onboarding_complete`

Expected: FAIL because workspace creation currently infers state from config presence.

- [ ] **Step 3: Persist explicit onboarding completion without changing workspace fields**

Keep the documented fields and existing repository behavior. Mark completion only after workspace setup and configuration persistence both succeed. On failure, leave `workspace_required` and return the existing JSON error shape.

- [ ] **Step 4: Update API documentation and onboarding context**

Move all endpoint references to `crates/gateway/API.md`, document the exact current schemas and new passkey routes, and replace the open API-grounding table in `ONBOARDING_AUTH.md` with the verified fields and defaults. Document that old password routes are removed rather than retaining a fallback.

- [ ] **Step 5: Run documentation and regression checks**

Run: `cargo test --workspace`

Expected: PASS, including all existing workspace/Git behavior and new onboarding completion tests.

- [ ] **Step 6: Commit the API-grounded bootstrap**

```bash
git add crates/gateway/src/lib.rs crates/gateway/API.md crates/app/ONBOARDING_AUTH.md crates/gateway/tests/auth_api.rs
git commit -m "docs: document passkey onboarding API"
```

### Task 6: Final Verification and Review

**Files:**
- Modify: only files required by failing verification or review findings.

- [ ] **Step 1: Inspect the complete diff and verify no password flow remains**

Run: `git diff origin/main...HEAD --stat`, `git diff origin/main...HEAD -- crates/gateway/src crates/app/src crates/gateway/API.md`, and `rg -n "password|passwordless|current-password|new-password" crates/gateway/src crates/app/src crates/gateway/API.md`.

Expected: no password implementation or password UI remains in the active auth flow; historical migration text must be clearly non-functional if present.

- [ ] **Step 2: Run the complete verification suite**

Run: `cargo test --workspace`

Expected: exit 0 with zero failed tests.

Run: `cargo check --workspace --locked`

Expected: exit 0.

Run: `cargo fmt --all -- --check`

Expected: no output and exit 0.

Run: `dx check --package liroxnotes-app`

Expected: `No issues found.`

- [ ] **Step 3: Perform a security-focused review**

Check that challenges cannot be replayed, sessions expire and invalidate, cookies have the required attributes, origin/RP settings are not request-derived, credential data is not logged, workspace routes require authentication, and browser storage contains no credential or bearer token.

- [ ] **Step 4: Inspect final worktree state**

Run: `git status --short --branch`

Expected: only intentional feature changes are present; unrelated pre-existing uncommitted files remain untouched and unstaged.

- [ ] **Step 5: Commit only verified fixes**

Stage only the files changed to address review findings, then commit with:

```bash
git commit -m "fix: close onboarding auth verification gaps"
```
