# Operations

## File Operations

- `note_create` creates a new Markdown note file in a workspace.
- `note_edit` updates the content or metadata of an existing note.
- `note_rename` changes a note's filename and path.
- `note_move` changes a note's folder or workspace-relative path.
- `note_delete` removes a note from the workspace.

## Sync Operations

- `workspace_sync` performs the full user-triggered pull/commit/push cycle for a workspace.
- `workspace_pull` fetches remote changes and updates the local working copy.
- `workspace_commit` creates a workspace commit from pending local changes.
- `workspace_push` pushes the current commit to the remote repository.
- `workspace_fetch_history` fetches more repository history after the initial shallow clone when needed.

## Conflict Operations

- `conflict_detect` identifies files or blocks that cannot be merged automatically.
- `conflict_open_editor` opens the visible conflict editor for a conflicted file.
- `conflict_resolve_block` resolves a single conflict block.
- `conflict_keep_local` keeps the local side for a conflict block.
- `conflict_keep_remote` keeps the remote side for a conflict block.
- `conflict_keep_all_local` keeps all local changes in the conflicted file.
- `conflict_keep_all_remote` keeps all remote changes in the conflicted file.
