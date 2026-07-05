# Sync Agent

## Local First

- LiroxNotes is local-first.
- Notes are saved locally first.
- The app should work without internet.
- Local editing should not depend on Git remote availability.
- The local workspace folder is the working source of truth.

## Git Sync

- Git sync is a default part of the product.
- Git is used for remote storage and sync.
- Notes should be stored in a Git repository.
- Workspace files should remain usable as normal files in the repository.
- Sync should be clear and recoverable.

## Suggested MVP Sync Model

- Manual sync first.
- MVP sync only runs when the user clicks a sync button.
- A commit message is prepared before syncing.
- Sync means pull, commit, and push.
- Sync should pull first, merge if needed, commit, and push.
- Commits should group pending note changes.
- One sync should create one grouped commit per workspace.
- The app should not commit every save.
- The app should generate a simple default commit message.
- The app should allow local use before remote setup.
- Pending uncommitted changes can be undone after the user clicks undo and confirms the changes to be undone.
- Auto-sync is a later feature and should be test-driven carefully before enabling.

## Offline Changes

- MVP should allow offline create operations.
- MVP should allow offline edit operations.
- MVP should allow offline delete operations.
- MVP should allow offline rename operations.
- MVP should allow offline move operations.
- Offline changes are pending until the user syncs.

## External Changes

- In MVP, LiroxNotes detects outside changes during sync or manual refresh rather than continuous file watching.
- Outside changes mainly mean changes pushed to the Git repository outside the current app session.
- The app should warn when open or cached files changed remotely.
- Deleted remote files should be marked clearly when detected.
- A Git pull that changes the currently open note should not silently reload over local work.
- Reloading over unsaved local changes requires user confirmation.
- This behavior can be revisited after MVP testing if needed.

## Data Safety

- The app should never silently overwrite local changes.
- The app should detect external file changes.
- The app should warn when an open note changes outside the app.
- Conflicts should be visible to the user.
- The app should try safe automatic merges before showing the merge editor.
- A merge editor is required for conflict resolution.
- Conflict resolution should allow choosing local or remote changes per conflict block.
- Conflict resolution should also provide a single action to keep all local changes.
- Conflict resolution should also provide a single action to keep all remote changes.
- Conflicted notes should be directly editable during conflict resolution.
- Conflict areas should be clearly visible.
- The app can show Git-style conflict markers or replace them with clearer visual conflict lines.
- Conflict display must make it clear what the conflict entails.
- The visible conflict editor is enough; no separate warning modal is required before editing a conflicted note.
- Conflicted notes should show a `conflict` pill, tag, or label in the UI.
- When multiple files conflict, conflicted files should be shown as a simple list of relative file paths.
- Automatic conflict resolution should not silently resolve risky conflicts in MVP.

## Git Gateway

- MVP uses a Git gateway instead of running full Git in the browser.
- The Git gateway acts as a proxy for repository operations.
- The Git repository remains the durable source of truth.
- The server should not become the permanent note database.
- Server-side user and device information should be kept minimal.
- User access should stay as simple as possible while remaining secure.
- The PWA should cache data and queue offline changes.
- The gateway should support safe sync with explicit conflict handling.
- CRDT-based sync is not part of MVP planning for now.

## Branching

- MVP supports the main branch only.
- Branching support is a V2 goal.

## Commit Messages

- Users should be able to provide a commit message when syncing.
- Quick sync should use a default commit message.
- The default commit message should be configurable at workspace level.

## Git Providers

- Provider choice should stay simple for MVP.
- Named Git provider integrations are a V2 goal.

## Suggested Defaults To Confirm

- Commit notes to Git.
- Commit directory config to Git.
- Commit attachments to Git if attachments are supported.
- Do not commit machine-local app settings.
- Do not store credentials in the notes workspace.
- Show conflicted files clearly.
- Allow users to resolve conflict markers in the editor.
