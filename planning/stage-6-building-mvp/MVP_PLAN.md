# MVP Plan

## Milestones

- Project skeleton: Rust workspace, Dioxus app, Actix gateway, shared models, editor package.
- Data foundation: SurrealDB schema, migrations, repository/workspace metadata, sessions, settings.
- Workspace shell: login/onboarding, workspace selector, sidebar mode switcher, file tree, notes overview, bottom status bar.
- Editor loop: open note, edit Markdown, track changed state, save pending changes, show contextual toolbar.
- Local workspace operations: create, rename, move, delete to trash, labels, search, attachments.
- Sync loop: connect Git repository, shallow clone/cache, status, manual sync, commit message, push.
- Conflict loop: detect conflicts, list conflicted files, resolve blocks in merge editor, complete sync.
- PWA loop: app shell caching, recent note cache, pending offline operations, mobile layout pass.
- MVP hardening: security review, error states, packaging, release checklist.

## Build Order

- Start with one hosted-mode happy path before local desktop mode.
- Build one vertical slice early: login, open workspace, open note, edit, save locally.
- Add Git sync only after local note operations are reliable.
- Add conflict resolution after basic sync works against a real test repository.
- Add PWA offline queue after the edit/save/sync path is stable.
- Keep local macOS mode using the same gateway logic, but do not let it block hosted MVP progress.

## Cut Line

- Required: Git-backed workspace, Markdown editing, manual sync, visible changed state, labels tree, notes overview, search, trash, conflict editor, PWA install/offline basics.
- Deferred: static publishing, provider-specific OAuth/HTTPS integrations, auto-sync, graph view, AI, global label rename, automatic link rewriting, tabs, Vim mode, sidebar frontmatter editor.

## First Vertical Slice

- Create the workspace structure.
- Serve a Dioxus app from Actix.
- Show the Zed/Bear-inspired shell with mock workspace data.
- Open and edit one Markdown note through CodeMirror.
- Save the note through the gateway into a temporary workspace folder.
- Show changed state in the file tree, notes overview, and status bar.
