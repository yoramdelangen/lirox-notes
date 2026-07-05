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

## Codebase Separation

- Git logic should live in its own testable layer separate from UI code.
- Dioxus UI interaction should be separated from application logic.
- Gateway request handling should be separated from Git fetch/commit/sync logic.
- Querying information, fetching data, and responding to UI events should live in distinct layers where practical.
- The codebase should be structured so core logic can be tested without the UI or HTTP server.

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

## Sync Flow

- Sync is user-triggered in MVP.
- Initial sync uses a shallow clone.
- The rest of the repository history can be fetched later when needed.
- Sync pulls remote changes first.
- Sync applies local pending changes next.
- Sync commits changes once per workspace.
- Sync pushes after commit.
- Sync uses the workspace default commit message unless the user provides one.
- Sync should preserve pending local changes if remote changes create a conflict.

## Conflict Flow

- Conflicted files are shown as a simple list of relative file paths.
- Conflicted notes open in a visible conflict editor.
- Conflict editor supports per-block local or remote choices.
- Conflict editor supports keep all local and keep all remote actions.
- Conflict areas must be clearly visible.
- Conflicted notes remain directly editable during resolution.
- Safe automatic merges may run before opening the conflict editor.

## Hosted And Local Modes

- Hosted mode runs as a server binary with the Actix gateway.
- Hosted mode serves the Dioxus app and Git gateway API.
- Hosted mode exposes the gateway over the normal HTTP web server.
- Local mode means a Dioxus desktop app.
- Local mode can use local Git configuration and local SSH keys.
- Local mode uses the local SSH agent by default.
- Local mode uses a Unix socket for the local gateway API.
- Gateway logic should remain reusable between hosted and local modes.

## Authentication And Sessions

- MVP uses email and password authentication.
- A new account can be created during onboarding.
- One account represents one person.
- The same user account can be used for hosted mode and local mode.
- Sessions use secure HTTP-only cookies.
- Sessions last for 2 weeks by default.
- Sessions can be refreshed.
- Session refresh should not happen more than once per day.
- Sessions have a hard maximum lifetime of 3 weeks without re-login.
- After the hard maximum expires, sync and logout should require a new login.
- Passkeys are a future goal and should be supported by the account model later.

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

- The web frontend should be installable as a PWA.
- The PWA should cache the app shell for fast reloads.
- The PWA should cache recent/open notes for offline viewing and editing.
- The PWA should queue pending offline changes until sync is available.
- The PWA should use a service worker or equivalent browser caching strategy.
- The PWA should support mobile use on phones and tablets.
- The PWA should be network-first and fall back to cached data when offline.

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

- Core Git logic should have unit tests.
- Shared models and helpers should have unit tests.
- Gateway request handling should have integration tests.
- Git operations, sync flows, and conflict handling should have integration tests.
- Dioxus UI interaction should be tested at the component level where practical.
- The editor package should have its own tests.
- End-to-end tests should cover the main onboarding, edit, sync, and conflict flow.
- Tests should be able to run per package.

## Deployment

- MVP deployment targets are a Linux server binary for hosted mode and a macOS desktop app for local mode.
- The Linux hosted deployment format is AppImage.
- Hosted mode is used when the user wants the gateway on a server and connects mobile devices remotely.
- Local mode is used on macOS as a desktop application.
- The gateway should serve the Dioxus app and API in hosted mode.
- The deployment layout should follow XDG location patterns for config, data, cache, and state where applicable.
- Repository database data lives in `~/.local/share/liroxnotes/db`.
- Repository caches live in `~/.local/share/liroxnotes/repo_cache/`.
- Logs live in `~/.local/share/liroxnotes/logs`.
- Config, data, state, and cache should be separated per user account.
- Future cache encryption per user/repository should remain possible.
- Secrets can be stored safely in SurrealDB using encryption.

## Security Lifecycle

- Use least-privilege access for repository credentials and deploy keys.
- Separate credential material from note content and from general metadata.
- Support credential revocation.
- Support session revocation.
- Rotate encryption keys when needed.
- Rotate or reissue deploy keys when repository access is compromised.
- Keep access logs minimal and scrub sensitive values.
- Treat repository caches as disposable and rebuildable.
- Require re-login after the hard session lifetime expires.
- Re-authenticate before sensitive actions if the session is stale.
- Keep security-sensitive defaults conservative for MVP.
