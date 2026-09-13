# Final Review Fix Wave Report

## Status

Implemented the Critical and Important onboarding/auth review fixes on the
`feature/onboarding-auth` branch. Existing worktree changes outside this fix
wave were left untouched.

## Fixes

- App API requests now use `LIROX_GATEWAY_URL`, defaulting to
  `http://localhost:3010`, and set `Request.credentials` to `include`. A
  compile-safe URL test and WASM check cover the browser boundary.
- Onboarding error text is passed through `html_escape` before HTML
  interpolation.
- Login options and verification reject every state before explicit
  `OnboardingStatus::Complete`.
- Workspace creation now fetches authoritative bootstrap after the POST. The
  reducer clears stale workspace state and only enters the workbench after a
  complete, authenticated bootstrap followed by an authoritative workspace
  view.
- `API.md` now documents `/api/bootstrap`, the actual bootstrap schema, the
  legacy session schema, `/api/auth/session`, credential rules, remote fields,
  and marker-write retry behavior.
- Workspace setup has accessible repository-mode radio controls, associated
  labels, conditional remote URL validation, initial focus, and
  operation-specific disabled labels.
- `/api/setup` maps filesystem and configuration failures through the JSON
  `api_error` envelope instead of Actix defaults.
- Installed legacy workspaces now report `WorkspaceRequired` even without a
  passkey account. Legacy password records are not authenticated; incomplete
  installs can register a fresh passkey, while complete onboarding closes
  registration.

## Regression Coverage

- Login is rejected before explicit completion.
- Installed legacy state requires fresh passkey registration.
- Complete bootstrap confirmation is required before workbench state.
- Onboarding HTML errors are escaped.
- Setup failures return the JSON error shape.
- Gateway URL construction is covered by an app unit test.
- Partial install-marker writes are documented as retryable; completion remains
  determined by the explicit marker line.

## Validation

- `cargo fmt --all -- --check`: passed.
- `cargo test --workspace -- --test-threads=1`: passed, 45 app, 21 gateway
  unit, 9 auth API, 22 Git workspace, and 7 shared tests.
- `cargo check --workspace --locked`: passed.
- `cargo check -p liroxnotes-app --target wasm32-unknown-unknown --locked`:
  passed.
- `dx check` from `crates/app`: passed with `No issues found`.
- `git diff --check`: passed.

## Concerns

- The configured gateway URL is a compile-time `LIROX_GATEWAY_URL` value; a
  production build must provide the deployment gateway origin explicitly.
- Browser WebAuthn remains covered by compile and unit checks rather than a
  live browser E2E test.

## Authorized Follow-Up Fix

### Root Causes

- The fresh-install fallback registered a passkey and posted directly to
  `/api/workspaces`, leaving the installation marker uninitialized for the
  documented setup contract.
- The dynamically-created fallback workspace form only exposed slug and name,
  so remote URL and branch values could not reach the workspace endpoint.
- `web::Json<T>` extraction failures occurred before handlers ran, so Actix's
  default extractor response bypassed the gateway's `{"error":"..."}` envelope.

### Changes

- Added an app-level `JsonConfig` error handler in both the production server
  and test/application configuration. Malformed JSON now returns `400` with
  `{"error":"invalid JSON request"}` while HTML handlers are unchanged.
- Changed the fallback flow to submit retryable `POST /api/setup` before
  `POST /api/workspaces`. The form now includes local/remote selection, slug,
  name, repository URL, and branch, and retains the controls after any failed
  request.
- Kept workspace creation authenticated. Passkey registration creates the
  session first; there is no unauthenticated workspace-creation exception.
- Updated `API.md` for setup ordering/retry behavior, malformed JSON, and the
  explicit workspace authorization rule. Updated `ONBOARDING_AUTH.md` with the
  conceptual setup sequence.

### Added Tests

- Fallback HTML contains `/api/setup`, `/api/workspaces`, repository mode,
  workspace slug/name, remote URL, and branch controls.
- Malformed JSON sent to `/api/setup` and `/api/workspaces` returns a JSON
  error envelope.
- Unauthenticated `POST /api/workspaces` returns `401` and the JSON envelope.

### Follow-Up Validation

- `cargo test --workspace`: passed, 46 app, 22 gateway unit, 11 auth API, 22
  Git workspace, and 7 shared tests.
- `cargo check --workspace --locked`: passed.
- `cargo fmt --all -- --check`: passed.
- `dx check --package liroxnotes-app`: passed with `No issues found`.
- `cargo check --target wasm32-unknown-unknown -p liroxnotes-app --locked`:
  passed.
- `git diff --check`: passed.
