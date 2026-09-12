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
