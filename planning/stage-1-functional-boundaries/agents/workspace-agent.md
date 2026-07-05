# Workspace Agent

## Workspace Definition

- A workspace is a directory inside a Git repository.
- A workspace contains notes, folders, directory config, labels, links, and related files.
- A workspace is the active context shown in the app.
- The app should have a workspace switcher.

## Repository Models

- LiroxNotes should support one repository with multiple workspace directories.
- LiroxNotes should support one repository dedicated to one workspace.
- Both models should be valid.
- Onboarding should support connecting an existing Git repository.
- Onboarding should support creating a new Git repository.

## Git Hosting Providers

- Provider choice should stay simple for MVP.
- Broad Git hosting provider support is a V2 goal.
- Future provider targets include GitHub, GitLab, Codeberg, Gitea, and similar Git providers.
- MVP should avoid locking the repository model to a single Git hosting provider.

## Workspace Sync Defaults

- The default quick-sync commit message should be configurable at workspace level.

## Initial Workspace Use Cases

- Work notes.
- Personal notes.

## Future Direction

- Static website generation from notes is a V2 goal.
- Website generation should be considered later when deciding metadata, visibility, and publishing fields.
