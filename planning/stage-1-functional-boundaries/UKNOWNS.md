# UKNOWNS

This file contains loose ends and open decisions for LiroxNotes.

Fill in answers directly under each section when decisions are made.

## Product Scope

- Decision: The first version of LiroxNotes is web-first and should be built as a PWA so it can also be used remotely on a phone.
- Decision: A workspace is a directory inside a Git repository, and LiroxNotes should support switching between workspaces.
- Decision: LiroxNotes should support both a single repository with multiple workspace directories and a dedicated repository for one workspace.
- Decision: Initial workspace use cases are work notes and personal notes.
- Decision: Static website generation from notes is a V2 goal.
- Decision: Onboarding should support connecting an existing Git repository or creating a new Git repository.
- Decision: Supporting all Git hosting providers such as GitHub, GitLab, Codeberg, Gitea, and similar providers is a V2 goal.
- Decision: MVP onboarding should start from a Git-backed repository/workspace flow, while the exact technical implementation is decided later based on the chosen stack.

## Notes And Titles

- Decision: For MVP/V1, filenames stay stable after creation or initial commit.
- Decision: For MVP/V1, changing the first `h1` does not rename the file automatically after creation or initial commit.
- Decision: Do not prompt the user when the `h1` and filename differ.
- Decision: When no filename exists during note creation, generate the filename from the first `h1`.
- Decision: When creating a note without an `h1`, ask the user for a title and store that title in frontmatter.
- Decision: When a note has multiple `h1` headings, use the first `h1` as the title fallback.
- Decision: Multiple `h1` headings are allowed.
- Decision: Duplicate titles are allowed as long as file paths do not conflict.

## Slugs And Filenames

- Decision: MVP slugs are ASCII-only.
- Decision: Non-English characters should be converted/transliterated into ASCII alphabetical characters for MVP slugs.
- Decision: Preserving non-English characters in slugs is a V3 goal.
- Decision: Slugs are always lowercase.
- Decision: Spaces become hyphens.
- Decision: Unsafe characters are removed.
- Decision: Repeated hyphens are collapsed.
- Decision: Leading and trailing hyphens are trimmed.
- Decision: Non-English characters are simplified when possible, such as `ë` to `e` and `á` to `a`.
- Decision: Duplicate slugs use incrementing numeric suffixes such as `-2`, `-3`, and so on.
- Decision: Users should be able to rename files.
- Decision: When a linked file does not exist, the editor should show a warning, highlight, or broken-link indicator.
- Decision: Updating links after manual rename is a later feature.

## Frontmatter

- Decision: V1 uses YAML frontmatter.
- Decision: Frontmatter is created only when metadata exists.
- Decision: Raw frontmatter is editable in the Markdown editor.
- Decision: Unknown frontmatter fields are preserved.
- Decision: Frontmatter field order is preserved when possible.
- Decision: Invalid frontmatter shows a clear warning and does not destroy note content.
- Decision: Invalid frontmatter disables structured metadata editing for that note until fixed.
- Decision: V2 should show frontmatter in a sidebar with editable fields.

## Directory Config

- Decision: Directory config uses TOML.
- Decision: Directory config filename is `.liroxnotes.toml`.
- Decision: Root `.liroxnotes.toml` defines workspace defaults.
- Decision: Child `.liroxnotes.toml` files extend parent config.
- Decision: If a nested directory does not have its own config, it inherits the nearest parent config.
- Decision: Inherited configuration should be announced in the config with an `inherit` field, such as `inherit = "../config.toml"`.
- Decision: Child configs can override fields with the same key.
- Decision: When inheriting config, fields with the same key overwrite inherited fields.
- Decision: Removing inherited fields is not supported in MVP.
- Decision: When inherited configs define the same field differently, the nearest config wins.
- Decision: Invalid config blocks only config-driven metadata features, not note editing.
- Decision: Config files are hidden from the normal note file tree.
- Decision: Config files are committed to Git.

## Labels And Tags

- Decision: Labels are case-insensitive.
- Decision: Labels display as lowercase.
- Decision: Labels allow letters, numbers, hyphens, underscores, and `/`.
- Decision: Labels do not allow spaces.
- Decision: When entering a space in a label, it automatically changes to `-`.
- Decision: Labels inside headings count.
- Decision: Labels inside normal text count.
- Decision: Labels inside inline code are ignored.
- Decision: Labels inside fenced code blocks are ignored.
- Decision: Labels inside links are ignored.
- Decision: Frontmatter labels are parsed separately and merged with inline labels.

## Nested Labels

- Decision: `/` is the nesting separator for labels.
- Decision: Cross-workspace label references are a V2 concept.
- Decision: Cross-workspace label references can use `#label@workspace` unless a better syntax is chosen later.
- Decision: Labels without `@workspace` belong to the current local workspace.
- Decision: Parent labels are virtual.
- Decision: Filtering by a parent label includes child labels.
- Decision: Parent label counts include child label notes.
- Decision: A note with `#work/project` is treated as part of `#work` for navigation, filtering, and counts.

## Tag Links

- Decision: `[[#tag]]` tag-link behavior is V2 for now.
- Decision: MVP should have a sidebar toggle between file tree view and labels/tags view.
- Decision: File tree view shows files and directories.
- Decision: Labels/tags view shows labels/tags in a tree format based on nesting.

## Markdown Links

- Decision: MVP supports normal relative Markdown links.
- Decision: MVP supports absolute workspace-root Markdown links.
- Decision: In MVP, absolute links point to the current workspace root.
- Decision: Cross-workspace absolute links are V2.
- Decision: Links written into Markdown should stay human-readable paths, not numeric IDs.
- Decision: File links should include `.md`.
- Decision: Broken links should be detected.
- Decision: Broken links should be highlighted in the editor.
- Decision: Automatically updating links after file rename is V2.
- Decision: Links should support existing filenames with spaces.
- Decision: LiroxNotes should not allow spaces when creating or renaming files.
- Decision: Existing filenames with spaces are tolerated but not encouraged.

## Note Identity

- Decision: Notes are identified by their workspace-relative path in MVP.
- Decision: Notes do not need unique generated frontmatter IDs for MVP.
- Decision: Relative paths are enough for links and search in MVP.
- Decision: Numeric or indexed representations of relative paths can be considered later as a technical performance optimization for local lookup.
- Decision: Moving a note changes its path-based identity in MVP.

## Git Sync

- Decision: User access should stay as simple as possible while remaining secure.
- Decision: Server-side user and device information should be kept minimal.
- Decision: MVP supports the main branch only.
- Decision: Branching support is a V2 goal.
- Decision: Provider choice should stay simple for MVP.
- Decision: Named Git provider integrations are a V2 goal.
- Decision: Users should be able to provide a commit message when syncing.
- Decision: Quick sync should use a default commit message configured at workspace level.
- Decision: MVP sync only runs when the user clicks a sync button.
- Decision: A commit message is prepared before syncing.
- Decision: Sync should pull first, merge if needed, commit, and push.
- Decision: One sync should create one grouped commit per workspace.
- Decision: Pending uncommitted changes can be undone after the user clicks undo and confirms the changes to be undone.
- Decision: Auto-sync is a later feature and should be test-driven carefully before enabling.

## Git Conflicts

- Decision: Conflicted files should be shown as a simple list of relative file paths.
- Decision: A merge editor is required for conflict resolution.
- Decision: Conflict resolution should allow choosing local or remote changes per conflict block.
- Decision: Conflict resolution should provide a single action to keep all local changes.
- Decision: Conflict resolution should provide a single action to keep all remote changes.
- Decision: The app should try safe automatic merges before showing the merge editor.
- Decision: Conflicted notes should be directly editable during conflict resolution.
- Decision: Conflict areas should be clearly visible.
- Decision: The app can show Git-style conflict markers or replace them with clearer visual conflict lines.
- Decision: Conflict display must make it clear what the conflict entails.
- Decision: The visible conflict editor is enough; no separate warning modal is required before editing a conflicted note.
- Decision: Conflicted notes should show a `conflict` pill, tag, or label in the UI.

## Local Files And External Changes

- Decision: MVP should allow offline create, edit, delete, rename, and move operations.
- Decision: Offline changes are pending until the user syncs.
- Decision: In MVP, LiroxNotes detects outside changes during sync or manual refresh rather than continuous file watching.
- Decision: Outside changes mainly mean changes pushed to the Git repository outside the current app session.
- Decision: The app should warn when open or cached files changed remotely.
- Decision: Deleted remote files should be marked clearly when detected.
- Decision: A Git pull that changes the currently open note should not silently reload over local work.
- Decision: Reloading over unsaved local changes requires user confirmation.
- Decision: This behavior can be revisited after MVP testing if needed.

## Search

- Decision: MVP search includes note content.
- Decision: MVP search includes filenames.
- Decision: MVP search includes display titles.
- Decision: Labels are searched using `#label` syntax.
- Decision: MVP search includes frontmatter as plain searchable text.
- Decision: Advanced frontmatter field search waits until V2.
- Decision: Basic fuzzy search should be supported in MVP if it does not hurt speed.

## Attachments

- Decision: MVP supports image attachments.
- Decision: Attachments are real files in the workspace.
- Decision: Attachments are committed to Git.
- Decision: Attachments are stored in the same folder as the note for MVP.
- Decision: Attachment filenames should be path, slug, and URL-compatible.
- Decision: Attachment files should be hidden from the normal note file tree.

## Editor

- Decision: MVP uses a Markdown text editor, not WYSIWYG.
- Decision: MVP should include built-in Markdown highlighting.
- Decision: A preview pane is not necessary for MVP.
- Decision: Vim support is a V2 goal if the chosen editor does not already support it easily.
- Technical editor implementation details are tracked in `TECHNICAL_CHALLENGES.md`.

## Highlighter Customization

- Moved to `TECHNICAL_CHALLENGES.md` because highlighter customization depends on the chosen editor and implementation approach.

## Data Safety

- Moved atomic save implementation details to `TECHNICAL_CHALLENGES.md`.
- Decision: Deleted files should move to a workspace trash location such as `.trash/`.
- Decision: When one or more files are deleted, they are moved into the workspace trash folder.
- Decision: Delete/trash actions should be committed directly as a dedicated `trashed` commit.
- Decision: Trashed files should be removed from the normal pending-change commit flow after the dedicated trash commit.
- Decision: Trashed files remain recoverable from workspace trash after the dedicated trash commit.
- Decision: Git history after push is treated as enough backup.
- Decision: Extra local backup files are not required for MVP.
- Decision: Deletion recovery is handled through workspace `.trash/`.

## MVP Boundary

- Decision: MVP includes the required merge editor.
- Decision: Advanced merge tooling beyond per-block conflict resolution is post-MVP.
- Decision: Sidebar frontmatter editing is post-MVP.
- Decision: Global label rename is post-MVP.
- Decision: Automatic link rewriting is post-MVP.
- Decision: Graph view is post-MVP.
- Decision: AI is post-MVP.
