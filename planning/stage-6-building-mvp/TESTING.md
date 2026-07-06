# Testing

## Unit Tests

- Slug generation and duplicate suffixes.
- Frontmatter parsing, invalid frontmatter preservation, and field order preservation where practical.
- Directory config inheritance and nearest-config wins behavior.
- Label extraction from text/frontmatter while ignoring code blocks, inline code, and links.
- Markdown link resolution and broken-link detection.
- File operation path safety.
- Git interface command construction and status parsing.
- Sync state transitions.
- Conflict block parsing and resolution.

## Integration Tests

- Gateway auth/session lifecycle.
- Repository connect/create flow with test SSH or local fixture remotes.
- Workspace file listing from a real checkout.
- Note create/read/write/rename/move/trash through the gateway API.
- Manual sync against a local bare Git remote.
- Sync failure preserves pending changes.
- Conflict detection from two diverged working copies.
- SurrealDB migration setup and re-run safety.
- Editor package build output can be loaded by the Dioxus app.

## End-To-End Tests

- Create account, connect repository, create workspace, open workspace.
- Create note, edit note, see changed state, sync successfully.
- Search by title, content, filename, label, and frontmatter text.
- Browse file tree, label tree, and all-notes overview.
- Edit offline, reconnect, sync queued changes.
- Create a Git conflict, resolve per block, complete sync.
- Delete note to trash and recover through Git/trash behavior.

## Manual QA

- Desktop shell matches the Zed/Bear-inspired layout direction.
- Mobile layout keeps the editor usable and navigation reachable.
- Bottom toolbar appears only while editing or selecting text.
- Git branch/status appears in the bottom status bar.
- Changed notes are visible before opening them.
- Conflicts are clear without being noisy.
- Invalid frontmatter/config warnings do not block normal editing.
- PWA install and reload work on desktop and phone.
- Keyboard navigation works for core writing and navigation flows.
