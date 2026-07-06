# Models

## User

- A user represents one person.
- A user maps to a SurrealDB `users` table record for authentication and access control.
- A user owns repositories, sessions, and app metadata.
- A user stores login identity and user-level settings.
- Key fields: `id`, `email`, `password_hash`, `created_at`, `updated_at`, `last_login_at`.
- One user maps to one person.
- The user can be used in hosted and local modes.

## Session

- A session represents authenticated access for a user.
- A session has a start time, last refresh time, and hard expiration time.
- A session is tied to one user.
- Key fields: `id`, `user_id`, `issued_at`, `last_refreshed_at`, `expires_at`, `hard_expires_at`, `revoked_at`.
- Sessions support a sliding lifetime with a hard maximum lifetime.
- A refreshed session updates the same session record.

## Repository

- A repository is the Git-backed storage boundary for LiroxNotes.
- A repository belongs to one user.
- A repository can contain one or more workspaces.
- A repository stores remote access data, branch state, and cache pointers.
- Key fields: `id`, `user_id`, `name`, `remote_url`, `mode`, `branch`, `access_type`, `credential_ref`, `cache_path`, `default_branch`, `latest_commit_hash`, `last_synced_at`, `status`.
- The repository data is rebuildable from Git.

## Workspace

- A workspace is a directory inside a repository.
- A workspace is the main active scope in the app.
- A workspace has a relative path inside the repository.
- A workspace contains notes, attachments, config, and folder structure.
- Key fields: `id`, `repository_id`, `relative_path`, `display_name`, `config_path`, `last_opened_at`, `status`.
- Workspace paths are repository-relative.

## Note

- A note is a Markdown file.
- A note is identified by its workspace-relative path.
- A note is metadata only in the database.
- A note has display title and optional frontmatter metadata.
- A note may have labels found in content or frontmatter.
- A note may have attachments stored alongside it.
- Key fields: `path`, `workspace_id`, `title`, `raw_frontmatter`, `frontmatter_valid`, `content_hash`, `latest_commit_hash`, `updated_at`.
- The note identity is path-based in MVP.
- The note file remains human-readable Markdown.
- Note content is stored in Git, not as primary database data.

## Note Content Access

- The latest note content can be read from the repository cache or Git checkout.
- The database keeps metadata and hashes, not the full note body as the source of truth.

## File Tree

- The file tree is a derived structure from the workspace checkout.
- The file tree contains folders, notes, attachments, and config files.
- The file tree is used for navigation and file operations.
- The file tree is not the source of truth.
- The file tree is derived from the current workspace checkout and cached metadata.

## Label

- A label is a searchable tag discovered from note content or frontmatter.
- Labels are workspace-scoped by default.
- Labels are case-insensitive and stored/displayed in normalized lowercase form.
- Labels may be nested with `/`.
- Key fields: `workspace_id`, `name`, `normalized_name`, `display_name`, `source`, `note_count`.
- Labels are derived from note content and optional frontmatter.

## Frontmatter

- Frontmatter is optional YAML metadata inside a note.
- Frontmatter stores structured metadata such as title, labels, and future note fields.
- Raw frontmatter remains editable.
- Key fields: `raw`, `parsed_fields`, `is_valid`, `field_order`.
- Frontmatter is secondary metadata attached to a note.

## Directory Config

- Directory config is TOML metadata for a workspace directory.
- Directory config defines available metadata fields and inheritance rules.
- Child config can override parent values by key.
- Key fields: `path`, `inherit`, `raw_toml`, `parsed_fields`, `is_valid`.
- Directory config is inherited when a nested directory has no own config file.

## Sync

- Sync represents the state of a workspace pull/merge/commit/push cycle.
- Sync tracks revision state, pending changes, and the last known commit.
- Key fields: `workspace_id`, `status`, `base_commit_hash`, `latest_commit_hash`, `pending_change_count`, `last_synced_at`, `last_error`.
- Sync state is transient but can survive restarts when needed.

## Conflict

- Conflict represents a sync result where local and remote changes cannot be applied automatically.
- Conflict is tracked per file and may contain conflict blocks.
- Conflict state must be visible to the user.
- Key fields: `workspace_id`, `file_path`, `base_commit_hash`, `latest_commit_hash`, `blocks`, `status`.
- Conflict data must be enough to render the merge editor.
