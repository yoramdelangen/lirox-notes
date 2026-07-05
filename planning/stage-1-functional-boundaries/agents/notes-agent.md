# Notes Agent

## Notes

- A note is a Markdown file.
- A note lives inside the workspace folder.
- A note appears in the file tree.
- A note can contain optional YAML frontmatter.
- A note can be edited directly as Markdown.
- A note should remain readable outside LiroxNotes.

## Titles

- The original filename is generated from the initial title.
- The initial title is based on the first `h1` heading.
- The filename is a slug of the initial `h1` title.
- For MVP/V1, filenames stay stable after creation or initial commit.
- For MVP/V1, changing the first `h1` does not rename the file automatically after creation or initial commit.
- The app does not prompt the user when the `h1` and filename differ.
- When no filename exists during note creation, the filename is generated from the first `h1`.
- When creating a note without an `h1`, the app asks the user for a title and stores that title in frontmatter.
- When a note has multiple `h1` headings, the first `h1` is used as the title fallback.
- Multiple `h1` headings are allowed.
- Duplicate titles are allowed as long as file paths do not conflict.
- The display title can be customized through frontmatter.
- Frontmatter title is optional.

## Recommended Title Fallback

- Use frontmatter `title` when present.
- Use the first `h1` heading when no frontmatter title exists.
- Use the filename when no frontmatter title or `h1` exists.

## Frontmatter

- Frontmatter is optional.
- V1 uses YAML frontmatter.
- Frontmatter is created only when metadata exists.
- Raw frontmatter is editable in the Markdown editor.
- Frontmatter can customize note metadata.
- Frontmatter can customize the display title.
- Frontmatter can optionally contain labels.
- Unknown frontmatter fields are preserved.
- Frontmatter field order is preserved when possible.
- Invalid frontmatter shows a clear warning and does not destroy note content.
- Invalid frontmatter disables structured metadata editing for that note until fixed.
- Frontmatter fields will later be editable from sidebar items.
- V2 should show frontmatter in a sidebar with editable fields.

## Directory Config

- Available frontmatter fields are configurable.
- Field configuration is stored at directory level.
- Directory config uses TOML.
- Directory config filename is `.liroxnotes.toml`.
- Root `.liroxnotes.toml` defines workspace defaults.
- Directory config inherits from parent directories.
- Child `.liroxnotes.toml` files extend parent config.
- If a nested directory does not have its own config, it inherits the nearest parent config.
- Inherited configuration should be announced in the config with an `inherit` field, such as `inherit = "../config.toml"`.
- Child configs can override fields with the same key.
- When inheriting config, fields with the same key overwrite inherited fields.
- Removing inherited fields is not supported in MVP.
- When inherited configs define the same field differently, the nearest config wins.
- Invalid config blocks only config-driven metadata features, not note editing.
- Config files are hidden from the normal note file tree.
- Config files are committed to Git.
- Directory config allows different folders to expose different metadata fields.
- Directory config is part of the workspace model.

## File Tree

- Notes are organized in a real file-tree structure.
- Folders are real filesystem folders.
- Markdown files are real filesystem files.
- The file tree is the physical organization layer.
- Deleted files should move to a workspace trash location such as `.trash/`.
- When one or more files are deleted, they are moved into the workspace trash folder.
- Delete/trash actions should be committed directly as a dedicated `trashed` commit.
- Trashed files should be removed from the normal pending-change commit flow after the dedicated trash commit.
- Trashed files remain recoverable from workspace trash after the dedicated trash commit.
- Git history after push is treated as enough backup.
- Extra local backup files are not required for MVP.
- Deletion recovery is handled through workspace `.trash/`.

## Attachments

- MVP supports image attachments.
- Attachments are real files in the workspace.
- Attachments are committed to Git.
- Attachments are stored in the same folder as the note for MVP.
- Attachment filenames should be path, slug, and URL-compatible.
- Attachment files should be hidden from the normal note file tree.

## Note Identity

- Notes are identified by their workspace-relative path in MVP.
- Notes do not need unique generated frontmatter IDs for MVP.
- Relative paths are enough for links and search in MVP.
- Moving a note changes its path-based identity in MVP.
- Numeric or indexed representations of relative paths can be considered later as a technical performance optimization for local lookup.

## Suggested Defaults To Confirm

- Filenames should stay stable after initial creation.
- Slugs should use lowercase text.
- MVP slugs are ASCII-only.
- Non-English characters should be converted/transliterated into ASCII alphabetical characters for MVP slugs.
- Preserving non-English characters in slugs is a V3 goal.
- Spaces should become hyphens.
- Unsafe characters are removed.
- Repeated hyphens are collapsed.
- Leading and trailing hyphens are trimmed.
- Non-English characters are simplified when possible, such as `ë` to `e` and `á` to `a`.
- Duplicate slugs use incrementing numeric suffixes such as `-2`, `-3`, and so on.
- Users should be able to rename files.
- LiroxNotes should not allow spaces when creating or renaming files.
- Existing filenames with spaces are tolerated but not encouraged.
- When a linked file does not exist, the editor should show a warning, highlight, or broken-link indicator.
- Updating links after manual rename is a later feature.
- Unknown frontmatter fields should be preserved.
- Invalid frontmatter should warn the user without destroying content.
