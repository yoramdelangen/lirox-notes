# Deployment

## Targets

- Linux server binary for hosted mode.
- macOS desktop app for local mode.
- Linux hosted deployment format is AppImage.

## Deployment Model

- Hosted mode runs the gateway on a server and is used for remote access, including mobile.
- Local mode runs as a macOS desktop app.
- Hosted mode serves the Dioxus app, static assets, and gateway API.
- Local mode can use a local gateway service when needed.

## Storage Locations

- Deployment should follow XDG location patterns where applicable.
- Config, data, state, and cache should each live in their appropriate XDG location.
- Each of config, data, state, and cache should be separated per user account.
- Repository database data should live in `~/.local/share/liroxnotes/db`.
- Repository caches should live in `~/.local/share/liroxnotes/repo_cache/`.
- Logs should live in `~/.local/share/liroxnotes/logs`.
- XDG state should store runtime and recoverable app state.
- Secrets can be stored safely in SurrealDB using encryption.
- Encryption keys should be managed separately from the stored secret data.
- Future cache encryption per user/repository should remain possible.

## State And Sessions

- Session state should support a sliding expiry model with a hard maximum lifetime.
- Login state should survive across hosted and local modes for the same account.
- Passkey support should remain compatible with the account system later.

## State Data

- Recent workspace selection.
- Last opened workspace.
- Last opened note.
- Window size and layout preferences.
- Sync progress and resumable operation state.
- Temporary UI state that should survive restarts but is not source data.
- Non-secret runtime markers that help restore the app session.
