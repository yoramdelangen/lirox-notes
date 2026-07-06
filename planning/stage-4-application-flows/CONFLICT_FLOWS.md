# Conflict Flows

## Conflict Detection

- Gateway detects conflicts during sync when local and remote changes cannot be merged safely.
- Conflicted files are reported as relative paths.
- The app shows conflicted files in a simple list.

## Merge Editor

- Conflicted files open in a visible merge editor.
- The merge editor shows conflict areas clearly.
- The conflicted note remains directly editable during resolution.
- The conflict editor is enough; no separate warning modal is needed.

## Per-Block Resolution

- User can choose local or remote for each conflict block.
- User can keep all local changes for a file.
- User can keep all remote changes for a file.
- Safe automatic merges may be attempted before the conflict editor opens.
