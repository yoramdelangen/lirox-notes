# Task 4 Report

## Files

- `crates/app/src/auth.rs`: frontend bootstrap/auth state, screen selection, auth shell, and pure tests.
- `crates/app/src/app/event.rs`: auth events.
- `crates/app/src/app/reducer.rs`: auth transitions and semantic effects.
- `crates/app/src/app/dispatcher.rs`: event dispatch at the application boundary.
- `crates/app/src/app/state.rs`: application auth state.
- `crates/app/src/lib.rs`: bootstrap request and workbench gate.
- `crates/app/src/platform/web/webauthn.rs`: browser-only WebAuthn bridge and base64url encoding.
- `crates/app/src/platform/web/mod.rs`: adapter module registration.
- `crates/app/Cargo.toml`, `Cargo.lock`: browser bridge dependencies.
- `crates/gateway/src/components/pages.rs`: simple SSR auth shell copy.

## Commits

- Implementation: `f1e2548 feat: gate workbench behind passkey onboarding`.
- Report: this report is committed separately after the implementation.

## Commands and Results

- `cargo test -p liroxnotes-app auth::tests`: pass.
- `cargo test -p liroxnotes-app -p liroxnotes-gateway`: pass, 38 app tests, 18 gateway unit tests, and 28 gateway integration tests.
- `cargo check --workspace --locked`: pass.
- `cargo fmt --all -- --check`: pass.

## Follow-up Review Fixes

- Made the gateway fresh-install page executable: it invokes native WebAuthn registration, verifies the credential through the gateway, and presents workspace setup using `POST /api/workspaces`.
- Made app effect draining reactive to auth state changes so bootstrap and subsequent command effects are executed.
- Treated both `AbortError` and `NotAllowedError` as retryable passkey cancellation.
- Mapped gateway HTTP 401 errors to `SessionExpired` and login UI state.
- Added an accessible logout control using the semantic auth command path without modifying `WorkspaceShell`.
- Removed the unreachable `Welcome` screen variant.
- Added operation, expiry, bootstrap scheduling, cancellation, and SSR assertions.

## Follow-up Verification

- `cargo test -p liroxnotes-app -p liroxnotes-gateway`: pass, 43 app tests, 18 gateway unit tests, and 28 gateway integration tests.
- `cargo check --workspace --locked`: pass.
- `cargo check -p liroxnotes-app --target wasm32-unknown-unknown --locked`: pass.
- `dx check --package liroxnotes-app`: pass.
- `cargo fmt --all -- --check`: pass.

## Follow-up Concerns

- Native passkey and fresh-install browser flow are covered by compile/SSR checks but still need browser automation with a WebAuthn virtual authenticator.

## Round 2 Fixes

- Added a monotonic `effect_version` at the dispatcher boundary and made the app effect hook observe it, so effects queued while auth remains idle are reactive.
- Kept the fresh-install registration surface interactive and added visible workspace setup through `POST /api/workspaces`.
- Added retryable handling for rejected inline workspace creation requests.
- Added reducer tests covering idle queue scheduling, auth expiry, operation transitions, and workspace gating.

## Round 2 Verification

- `cargo test -p liroxnotes-app -p liroxnotes-gateway`: pass, 44 app tests, 18 gateway unit tests, and 28 gateway integration tests.
- `cargo check --workspace --locked`: pass.
- `cargo fmt --all -- --check`: pass.
- `dx check --package liroxnotes-app`: pass.

## Concerns

- The WebAuthn adapter intentionally does not persist credential material. Browser hardware execution still needs an end-to-end browser test.

## Review Fixes

- Added a browser effect executor that drains `Dispatcher::take_effects()` and performs bootstrap, passkey registration/login, workspace creation, authoritative workspace loading, and logout.
- Replaced arbitrary WebAuthn passthrough with gateway option conversion to `Uint8Array`, credential `toJSON()` serialization, base64url handling, and `DOMException.name` cancellation detection.
- Added `WorkspaceView` to auth state; workbench rendering now requires that authoritative view and `WorkspaceLoaded` is the only successful transition into it.
- Added documented workspace fields and semantic auth commands; setup posts to `/api/workspaces`.
- Added logout/bootstrap ordering, unauthenticated setup, authoritative-workspace, and effect-dispatch tests.
- Updated gateway first-workspace setup to mark installation and documented the contract change in `crates/gateway/API.md`.

## Fix Verification

- `cargo test -p liroxnotes-app -p liroxnotes-gateway`: pass, 41 app tests, 18 gateway unit tests, and 28 gateway integration tests.
- `cargo check --workspace --locked`: pass.
- `cargo check -p liroxnotes-app --target wasm32-unknown-unknown --locked`: pass.
- `dx check --package liroxnotes-app`: pass.
- `cargo fmt --all -- --check`: pass.
