# Technical Choices

This file contains confirmed Stage 2 technical choices.

## Programming Language

- Rust is the main application language.
- JavaScript is used where needed for the embedded editor integration.

## Frontend

- Dioxus is used for the web-first PWA frontend.
- Use a Dioxus component library inspired by shadcn/radix patterns.
- Use Tailwind CSS for styling.

## Rust Workspace Packages

- Use a Rust workspace with two main packages and shared Rust code in root `src/`.
- The app package is the Dioxus application.
- The gateway package is the Actix server.
- The gateway package hosts the Dioxus application and exposes the Git gateway API.
- Root `src/` contains shared Rust models, structures, and reusable logic.
- Git-related shared logic can live in root `src/` when it needs to be reused.
- Package separation should allow compiling with `--package` so Dioxus and Actix dependencies do not unnecessarily mix.

## Editor Package

- Add a separate `packages/editor` package for the CodeMirror editor integration.
- The editor package uses Bun.
- The editor package is a Vite project for now.
- The editor package builds the compiled JavaScript editor bundle used by the Dioxus app.
- CodeMirror source and editor-specific JavaScript should live in `packages/editor`.
- When running the editor package in development mode, it should provide mock implementations of the functions normally exposed by the Dioxus app.

## Git Gateway

- Actix Web is used for the Git gateway backend.
- The Actix gateway also hosts the Dioxus application.
- Core gateway behavior should live in an explicit backend API.
- Dioxus server functions are not used for core Git gateway behavior in MVP.
- Create an internal Git interaction interface instead of coupling application logic directly to one Git implementation.
- The Git interface should allow switching between system Git CLI, gitoxide, or another backend later without rewriting gateway logic.
- The initial Git backend implementation uses command-based Git operations behind the internal Git interface.

## Hosted And Local Modes

- Hosted mode runs as a server binary with the Actix gateway.
- Hosted mode serves the Dioxus app and Git gateway API.
- Hosted mode exposes the gateway over the normal HTTP web server.
- Local mode means a Dioxus desktop app.
- Local mode can use local Git configuration and local SSH keys.
- Local mode uses the local SSH agent by default.
- Local mode uses a Unix socket for the local gateway API.
- Gateway logic should remain reusable between hosted and local modes.

## Repository Access

- Hosted MVP supports SSH Git remotes only.
- Hosted MVP uses per-repository Ed25519 deploy keys.
- The gateway generates the deploy key pair for hosted repository connections.
- The user adds the generated public key to the Git provider with write access.
- The gateway stores the private key encrypted at rest.
- Local mode can use SSH or HTTPS through the user's local Git setup.
- Hosted HTTPS support is deferred to V2 because it requires provider-specific credential handling.

## Commit Author And Signing

- Local mode uses the local Git author configuration by default.
- If local Git author configuration is missing, onboarding asks for commit author name and email.
- Hosted mode asks for commit author name and email during onboarding.
- Hosted mode stores commit author information in user or repository settings.
- Commit signing is not required for MVP.
- Commit signing can be revisited later.

## PWA

- Undecided.

## Editor

- CodeMirror 6 is used for the Markdown/code editor.
- CodeMirror is embedded through an isolated Dioxus adapter component.
- CodeMirror is built from the Bun/Vite `packages/editor` package.

## Storage And Cache

- Git remains the source of truth for notes, attachments, workspace config, trash, and history.
- Use embedded SurrealDB for persistent metadata and user accounts.
- SurrealDB stores users, sessions, repository connections, encrypted credential references, workspace metadata, and app settings.
- SurrealDB should not store note content as the primary source of truth.
- Gateway disk caches use one rebuildable working copy per connected repository.
- The working copy contains the repo checkout used for Git operations and workspace subdirectories.
- The working copy is reused between syncs to avoid repeated clone cost.
- Repository caches are kept until the connection is removed or the user clears the cache.
- Browser IndexedDB stores PWA offline cache, drafts, and pending operations.

## Testing

- Undecided.

## Deployment

- Undecided.
