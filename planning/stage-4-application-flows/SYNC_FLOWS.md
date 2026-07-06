# Sync Flows

## Manual Sync

- User clicks sync.
- App collects pending workspace changes.
- App uses the workspace default commit message unless the user supplied one.
- Gateway performs a shallow-fetch-aware sync cycle.
- Gateway pulls remote changes first.
- Gateway applies local pending changes.
- Gateway commits once per workspace.
- Gateway pushes the commit.
- App updates the workspace state with the new latest commit hash and sync result.

## Offline Changes

- User edits, creates, moves, renames, or deletes notes while offline.
- App stores pending changes locally.
- App queues those changes until sync is available.
- App shows that the workspace has pending offline changes.

## Git Gateway

- Gateway is the single place that talks to Git remotely.
- Gateway uses the internal Git interface.
- Hosted mode talks to the gateway over HTTP.
- Local mode talks to the gateway over a local Unix socket.
- Gateway owns the repository checkout/cache.

## Initial Fetch

- Initial fetch uses a shallow clone.
- Full history can be fetched later when needed.
