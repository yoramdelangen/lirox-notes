# Technical Challenges

This file contains implementation-specific questions that should not be decided during functional planning.

These topics depend on the chosen stack, libraries, runtime limits, storage options, and deployment model.

## Repository Setup In A Web-First PWA

- MVP onboarding starts from a Git-backed repository/workspace flow.
- The exact technical implementation depends on the chosen stack.
- The implementation must account for PWA limitations, mobile browser limitations, Git gateway design, authentication, and provider access.

## PWA Strategy

- The frontend should be installable as a PWA.
- The app shell should be cached for fast reloads and offline access.
- Recent/open notes should be cached for offline viewing and editing.
- Pending offline changes should be queued until sync is available.
- The exact service worker and browser caching implementation is a technical decision.
- The app should be network-first and fall back to cached data when offline.

## Local Lookup And Path Indexing

- Notes are functionally identified by workspace-relative path.
- Numeric or indexed representations of relative paths may help local database lookup performance.
- This is a technical optimization, not a functional product requirement.

## Atomic Saves

- Saves should avoid producing partially written files if the app, gateway, or process fails mid-write.
- The exact strategy depends on the storage and Git gateway implementation.
- This is a technical reliability concern, not a functional planning decision.

## Highlighter Customization

- The app needs hackable/customizable Markdown highlighting.
- The exact highlighter configuration model depends on the editor technology.
- The implementation should decide whether rules are simple strings, token matchers, regexes, parser extensions, or another model.
- The implementation should decide how invalid rules are validated, reported, and safely ignored.
- The implementation should decide whether directory-level highlighter rules are technically practical.

## Editor Technology

- The product needs a Markdown text editor with built-in highlighting.
- CodeMirror 6 is selected for the Markdown/code editor.
- The final editor choice depends on implementation fit, bundle size, PWA behavior, mobile usability, highlighting customization, and merge-editor support.
- Preview implementation is not required for MVP.
- Vim support should be evaluated for V2 if it is not easy with the chosen editor.

## Dioxus And CodeMirror Integration

- CodeMirror 6 must be embedded inside the Dioxus web frontend.
- The integration should be isolated behind a small adapter component.
- Dioxus should control the application UI while CodeMirror owns the editor DOM area.
- Rust and JavaScript communication should be kept narrow and explicit.
- CodeMirror source lives in `packages/editor`.
- `packages/editor` uses Bun and Vite to build the compiled editor JavaScript bundle.
- When `packages/editor` runs standalone in development mode, it needs mock implementations of the functions normally exposed by Dioxus.
- The mock API should match the real Dioxus-exposed editor API closely so the editor can be developed and tested independently.

## Actix Gateway

- Actix Web is selected for the Git gateway backend.
- The gateway should expose a clear API for repository, workspace, file, sync, and conflict operations.
- Dioxus server functions are not used for core Git gateway behavior in MVP.

## Git Backend Interface

- Create an internal Git interaction interface.
- Gateway logic should depend on the interface, not directly on system Git CLI or gitoxide.
- The interface should cover clone, fetch, status, read file, list files, apply changes, merge, commit, push, and conflict inspection.
- The first backend implementation uses command-based Git operations.
- Candidate backend implementations include system Git CLI and gitoxide.

## Layered Architecture

- Git logic should live in its own testable layer separate from UI code.
- Dioxus UI interaction should be separated from application logic.
- Gateway request handling should be separated from Git fetch/commit/sync logic.
- Querying information, fetching data, and responding to UI events should live in distinct layers where practical.
- Core logic should be testable without the UI or HTTP server.

## Sync Implementation

- Initial sync should use a shallow clone.
- Full repository history can be fetched later when needed.
- Sync should pull remote changes before applying local pending changes.
- Sync should commit once per workspace.
- Sync should push after a successful commit.
- Sync should keep pending local changes safe when a conflict occurs.
- Commit message selection should happen before the sync operation runs.

## Conflict Implementation

- Conflicts should be detected from real Git state and/or merge results.
- The gateway should surface conflict files as relative paths.
- The gateway should provide enough data for the app conflict editor to render per-block choices.
- Safe automatic merges should be attempted only when they are clearly conflict-free.

## Local Gateway Mode

- Local mode means a Dioxus desktop app.
- Local mode can reuse gateway logic without requiring a remote hosted gateway.
- Local mode uses a Unix socket for the local gateway API.
- Hosted mode uses the normal HTTP web server.
- Local mode uses the local SSH agent by default.
- Options include running the gateway logic behind a Unix socket service or sharing the gateway logic in-process where practical.
- The preferred local-mode implementation should be decided later based on Dioxus desktop capabilities and code reuse.

## Repository Cache Layout

- Use one rebuildable working copy per connected repository.
- The cache should store the repo checkout used for Git operations.
- Workspace directories live inside that checkout as subdirectories.
- Reuse the cache between syncs to avoid repeated clone cost.
- Cache invalidation and cleanup can happen when the connection is removed or the user clears the cache.

## Editor Extension Safety

- Arbitrary JavaScript editor extensions may create security and stability risks.
- The implementation should decide when, if ever, user-provided executable editor extensions are allowed.
- MVP should prefer safe declarative configuration unless a stronger technical reason appears later.
