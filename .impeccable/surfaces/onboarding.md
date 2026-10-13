# Onboarding Surface

## Scope

The first-run flow for passkey access and workspace setup. It is an Operate
surface and intentionally does not render workbench chrome.

## User Job

Create secure access, then choose whether to create a new repository workspace
or reuse a workspace subpath inside an existing repository.

## Flow

- Capture the user's name and create a passkey.
- Choose `New repository` or `Existing repository`.
- New repository: enter a new remote URL and branch, then confirm the workspace.
- Existing repository: choose a repository subpath; repository roots are not
  valid existing workspaces.
- Finish: confirm workspace name and optional path, then save.

## Visual Direction

Centered, quiet setup panels with one decision per step. Inherit the Lirox
technical dark theme, semantic tokens, crisp borders, compact forms, and
keyboard-first focus treatment from `crates/app/DESIGN.md`. The sketch defines
composition and sequence, not a hand-drawn production style.

## Required States

Loading, passkey registration, unsupported/cancelled passkey, workspace choice,
repository connection, existing workspace list, empty list, validation error,
creation progress, retryable failure, and success transition to the workbench.

## Boundaries

- Onboarding owns setup state and dispatches auth commands.
- The gateway owns repository discovery, safe path validation, Git operations,
  and configuration persistence.
- Existing workspace selection requires a non-empty relative subpath below a
  discovered repository.
- Do not expose filesystem paths outside the configured workspace root.
