# Connections

## Functional To Technical

- Web-first PWA maps to Dioxus, Tailwind CSS, service worker strategy, and IndexedDB offline cache.
- Git-backed workspaces map to the Actix Git gateway, repository cache layout, and internal Git interface.
- Manual sync maps to gateway sync endpoints and one grouped commit per workspace.
- Hosted repository access maps to SSH deploy keys, encrypted credential storage, and SurrealDB metadata.
- Markdown editing maps to CodeMirror 6 embedded through a small Dioxus adapter.
- Conflict resolution maps to Git conflict detection plus a visible merge editor.

## Technical To Models

- SurrealDB stores users, sessions, repositories, workspaces, note metadata, labels, sync state, conflict state, and settings.
- Git remains the source of truth for note files, attachments, trash, directory config, and history.
- IndexedDB stores PWA cache, drafts, and pending offline operations.
- Repository cache paths connect repository records to working copies on disk.
- The internal Git interface operates on repository and workspace identifiers, not UI state.

## Models To Flows

- User and session models support login, onboarding, session refresh, and re-authentication.
- Repository and workspace models support workspace switching, repository connection, and sync status.
- Note metadata supports file tree navigation, note overview, search, changed indicators, and display titles.
- Label models support nested label tree navigation and label filtering.
- Sync models support manual sync, pending changes, offline state, and status bar summaries.
- Conflict models support conflict lists, conflict pills, and merge editor rendering.

## Flows To MVP

- MVP shell should start with workspace selector, sidebar mode switcher, file tree, notes overview, central editor, and bottom status bar.
- MVP onboarding should connect or create a Git-backed repository/workspace.
- MVP editor should support Markdown editing, highlighting, changed-state tracking, and a small contextual toolbar.
- MVP sync should support manual pull/merge/commit/push with commit message handling.
- MVP conflict flow should support listing conflicted files and resolving blocks in the editor.
- MVP error flow should cover invalid frontmatter, invalid config, broken links, sync failures, and remote changes over local work.
