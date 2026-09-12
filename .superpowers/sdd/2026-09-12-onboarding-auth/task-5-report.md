# Task 5 Report

## Files

- `crates/gateway/src/lib.rs`: writes `onboarding_complete=true` only after
  workspace setup, Git configuration, and config persistence succeed; setup
  failures use the existing JSON error envelope.
- `crates/gateway/tests/auth_api.rs`: added
  `workspace_creation_marks_onboarding_complete` and the named fixture.
- `crates/gateway/API.md`: corrected workspace authentication, completion,
  defaults, response fields, errors, and removed password example.
- `crates/app/ONBOARDING_AUTH.md`: added verified onboarding routing, passkey,
  cookie, RP, startup, workspace, defaults, and error contracts.

## Commits

- `8b3a348 docs: document passkey onboarding API`
- Report commit: appended separately after this report was written.

## Commands And Results

- `cargo test -p liroxnotes-gateway --test auth_api workspace_creation_marks_onboarding_complete`
  - First run passed before the explicit marker assertion was moved before
    bootstrap, then failed as expected because the marker was missing.
  - Passed after implementation: 1 passed, 0 failed.
- `cargo test -p liroxnotes-gateway --tests`
  - Passed serially: 18 unit, 7 auth API, and 22 Git workspace tests.
- `cargo test --workspace`
  - Passed: all workspace tests, including 44 app tests, 18 gateway unit tests,
    7 auth API tests, 22 Git workspace tests, and 7 shared workspace tests.
- `cargo check --workspace --locked`
  - Passed.
- `cargo fmt --all -- --check`
  - Passed.
- `dx check --package liroxnotes-app`
  - Passed: no issues found.
- `git diff --check`
  - Passed before the implementation commit.

## Concerns

- Running the gateway test suite and workspace suite concurrently once caused
  `onboarding_git_remote_configures_origin` to hit a deleted temporary working
  directory. The gateway suite passed on a serial rerun; this appears to be a
  test-environment race, not a Task 5 regression.
- Existing request files under `crates/gateway/http/` still contain historical
  `/api/auth/login` examples; they were outside Task 5's requested file set and
  are not active gateway routes.

## Task 5 Review Fix

### Findings Fixed

- Removed config-presence inference from `auth::persisted_onboarding_status`.
  Markerless legacy or partial configs remain `workspace_required`; no
  automatic migration can falsely claim completion.
- Moved `mark_installed` in `POST /api/workspaces` after workspace setup, Git
  configuration, and config persistence. Completion is appended only after the
  install marker write succeeds.
- Workspace bootstrap failures return status `500` with the common
  `{ "error": "<message>" }` JSON envelope and do not write markers.
- Clarified JSON versus legacy plain-text error behavior in `API.md`.
- Removed duplicated endpoint contracts from `ONBOARDING_AUTH.md`; exact API
  contracts remain owned by `API.md`.

### Tests

- Added `preexisting_workspace_config_without_completion_marker_requires_onboarding`.
- Added `workspace_creation_failure_keeps_onboarding_required_and_returns_json_error`.
- Both focused tests failed against the old behavior and passed after the fix.

### Verification

- `cargo test -p liroxnotes-gateway --tests`: passed, 18 unit, 9 auth API, and
  22 Git workspace tests.
- `cargo test -p liroxnotes-shared --test workspace`: passed, 7 tests.
- `cargo check --workspace --locked`: passed.
- `cargo fmt --all -- --check`: passed.
- `dx check --package liroxnotes-app`: passed, no issues found.
- `git diff --check`: passed.

### Fix Commit

- `02cc5e7 fix: make onboarding completion marker authoritative`
- Report update is committed separately.

### Remaining Concern

- Historical `/api/auth/login` examples remain in `crates/gateway/http/`,
  outside this review-fix scope and not active gateway routes.
