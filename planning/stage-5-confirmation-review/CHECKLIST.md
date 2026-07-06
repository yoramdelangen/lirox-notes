# Checklist

## Functional Coverage

- MVP scope is defined: web-first PWA, hosted gateway, macOS local mode later in the same architecture.
- Repository/workspace model is defined: workspace is a directory inside a Git repository.
- Notes, titles, filenames, frontmatter, directory config, labels, links, attachments, trash, and search have MVP rules.
- Sync is manually triggered for MVP.
- Conflict handling requires a visible merge editor with per-block local/remote resolution.
- Post-MVP features are separated: static publishing, provider-specific integrations, auto-sync, graph view, AI, global label rename, automatic link rewriting.

## Technical Coverage

- Main stack is selected: Rust, Dioxus, Actix Web, CodeMirror 6, Tailwind CSS, SurrealDB, IndexedDB.
- Git gateway is the boundary for remote Git operations.
- Git implementation is hidden behind an internal interface.
- Hosted mode and local mode share gateway logic.
- Core logic is intended to be testable without UI or HTTP server.
- Deployment targets are defined for MVP: Linux hosted binary/AppImage and macOS local app.

## Model Coverage

- Core records are defined: user, session, repository, workspace, note metadata, label, frontmatter, directory config, sync, conflict.
- Note content remains Git-backed Markdown, not primary database content.
- Notes are identified by workspace-relative path in MVP.
- File tree and labels are derived views, not sources of truth.
- SurrealDB owns metadata, sessions, repository access records, workspace metadata, and settings.

## Flow Coverage

- Onboarding, workspace switching, note creation, editing, search, labels, sync, offline changes, conflicts, and error states are described.
- Design flow is connected to the concrete design inspiration document.
- The UI shell direction is defined: Zed-like workspace shell, Bear-like label tree and note overview, central clean editor, bottom status bar.
- Changed note state must appear in the file tree and notes overview.
- Mobile/PWA behavior is included at the planning level.

## Build Readiness

- Ready to move to Stage 6 MVP planning.
- Stage 6 should turn these decisions into package setup, routes, data schema, gateway APIs, editor integration, and first UI shell tasks.
