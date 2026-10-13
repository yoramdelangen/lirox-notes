# Onboarding Workspace Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved onboarding flow for passkey setup, new remote repository setup, and existing repository subpath selection.

**Architecture:** Keep onboarding in the existing Dioxus auth state machine. Add explicit UI steps and extend the gateway only where the existing-workspace flow needs repository discovery, subpath selection, and persisted display-name/configuration data. Preserve the existing workbench boundary and semantic design tokens.

**Tech Stack:** Rust, Dioxus, Actix Web, WebAuthn, serde, existing gateway filesystem/Git helpers, CSS custom properties and Tailwind.

**Spec:** User-approved onboarding sketch and clarification in conversation on 2026-10-13.

## Global Constraints

- Existing repository workspaces require a non-empty relative subpath; repository roots are not valid existing workspaces.
- New repository setup creates a local repository workspace and connects it to a new remote.
- Onboarding must not render workbench chrome.
- All core actions must work with keyboard and pointer input.
- All user-controlled paths must remain beneath the configured workspace root.
- Update `crates/gateway/API.md` for externally visible API changes.

---

### Task 1: Model onboarding steps and workspace selection

**Files:**
- Modify: `crates/app/src/auth.rs`
- Modify: `crates/app/src/app/event.rs`
- Modify: `crates/app/src/app/reducer.rs`
- Test: `crates/app/src/auth.rs`

**Interfaces:**
- Add an explicit onboarding step enum and fields for repository mode, repository metadata, and relative path.
- Add commands/events for step navigation, existing-workspace loading, and selecting a workspace.

- [x] Write reducer tests for step transitions, path validation, and preserving fields on retry.
- [x] Run the focused app tests and confirm the new tests fail for the missing transitions.
- [x] Implement the smallest state/event/reducer changes to make those tests pass.
- [x] Run the focused app tests again.

### Task 2: Build the Dioxus onboarding screens

**Files:**
- Modify: `crates/app/src/auth.rs`
- Modify: `crates/app/assets/main.css`
- Test: `crates/app/src/auth.rs`

**Interfaces:**
- Render the sketch’s sequential screens from the onboarding step enum.
- Reuse the existing `Button` component and dispatch semantic auth commands.

- [x] Add component-level state assertions where the existing test setup supports them; keep reducer tests as the behavioral source of truth.
- [x] Implement name/passkey, workspace choice, new repository, existing workspace, finish, loading, and failure views.
- [x] Add accessible labels, focusable controls, disabled/loading states, and responsive layout styles.
- [x] Run formatting and app tests.

### Task 3: Add existing-workspace discovery and safe subpath creation

**Files:**
- Modify: `crates/gateway/src/lib.rs`
- Modify: `crates/gateway/src/routes/mod.rs`
- Modify: `crates/gateway/API.md`
- Test: `crates/gateway/src/lib.rs`

**Interfaces:**
- Add an authenticated discovery response containing repository, branch, workspace path, and whether a subpath is selectable.
- Extend workspace creation input with an optional relative path.
- Reject repository-root selection for existing workspaces and reject paths escaping the configured root.

- [x] Write gateway tests for discovery, valid relative subpaths, repository-root rejection, and traversal rejection.
- [x] Run focused gateway tests and confirm they fail before implementation.
- [x] Implement discovery from the configured workspace root using existing filesystem/Git helpers.
- [x] Implement safe path resolution and workspace configuration persistence.
- [x] Run focused gateway tests and update API documentation.

### Task 4: Connect client effects to the gateway

**Files:**
- Modify: `crates/app/src/lib.rs`
- Modify: `crates/app/src/auth.rs`
- Modify: `crates/app/src/app/reducer.rs`
- Test: `crates/app/src/lib.rs`

**Interfaces:**
- Add effects for loading existing workspaces and creating the selected workspace configuration.
- Deserialize gateway workspace discovery into app-owned types.

- [x] Add tests for request serialization and response parsing.
- [x] Implement the effects and event handling.
- [x] Verify failures return to the correct onboarding step with fields preserved.
- [x] Run app tests and the gateway tests together.

### Task 5: Align the fallback and record the design structure

**Files:**
- Modify: `crates/gateway/src/components/pages.rs`
- Modify: `crates/app/DESIGN.md`
- Create: `.impeccable/surfaces/onboarding.md`
- Modify: `README.md` if its onboarding status is stale

- [ ] Replace the legacy gateway fallback’s duplicated form with the full step-by-step onboarding flow.
- [x] Record the onboarding surface states, hierarchy, and anti-goals without duplicating global design tokens.
- [x] Update stale documentation.
- [x] Run the full Rust test suite, formatting, and checks.

### Task 6: Review the finished flow

- [x] Run the Impeccable detector on changed UI files.
- [x] Run the app/gateway verification commands.
- [x] Inspect the diff for unrelated changes and confirm API documentation matches the implementation.
- [x] Report any remaining limitations, especially remote repository creation behavior if the gateway does not yet have provider credentials.
