# Sidebar and File Tree Navigation Design

## Intent

The sidebar is how a person finds, creates and organizes notes. Today the File
Tree can only browse: rows open notes and fold folders, and the only way to
create a note is the editor's empty state, which always writes
`new-note.md` at the root. The planning docs (MVP_PLAN, TASKS, UKNOWNS) promise
create, rename, move and delete, but nothing specifies how they look or behave.

This spec is the reference for that behavior, so the implementation can be
tracked and verified against it. It covers the file operations, how they are
reached (context menu, keyboard, touch), the tree's display options, and a
future Oil-style view.

## Goals

- Create, rename, move and delete notes and folders from the File Tree.
- Every operation is reachable by mouse (context menu), keyboard (shortcuts
  and a keyboard-opened menu) and touch (long-press action sheet).
- Filenames are always slugified; people type titles, the app picks names.
- A note can grow child notes without manual restructuring.
- Display options let the tree show filenames or note titles.
- Every operation is a command, so the keymap, menus and command palette share
  one implementation (DESIGN.md: "UI actions dispatch commands rather than
  duplicate behavior").

## Non-goals

- Rewriting links after rename or move (V2, per UKNOWNS.md).
- A trash with restore. Deletes are real; Git history is the recovery path.
- The Oil view. It is designed here at a high level only (see Future).
- The labels/tags sidebar view and the all-notes overview.
- Multi-select or bulk operations.
- Showing attachments or config files in the tree (they stay hidden, per
  UKNOWNS.md).

## Anti-goals

- A destructive action that happens by accident: deleting a folder without
  confirmation, a swipe that deletes, a name collision that silently
  overwrites or silently renames.
- Behavior that only works on one input device.
- Menu items implemented in components instead of commands.

## Current state (for the builder)

- `crates/app/src/ui/surfaces/file_tree.rs`: `FileTreeList` renders rows as
  buttons; folder click toggles (`file_tree.toggle_folder`), file click opens
  (`file_tree.open_path`). No context menu, no row actions.
- `crates/app/src/config/default_keymap.toml` `[keymap.file_tree]`: `j/k`,
  arrows, `<cr>`, `h/l`, `q`.
- `crates/app/src/app/state.rs`: `Popover` (one sidebar popover at a time),
  `ActionMenu` + `action_menu_index` (keyboard-navigable menu with
  `ui.action_menu_move/accept` and the `[keymap.menu]` scope),
  `UiState::close_top()` for Escape layering.
- `crates/app/src/app/reducer.rs` `create_note`: hardcoded `new-note.md`.
- `crates/shared/src/lib.rs` `build_tree`: the tree is derived from note paths
  only, so a folder exists in the tree only while it contains a `.md` file.
  `NoteSummary.title` is frontmatter `title:`, else the first heading, else
  the filename.
- `crates/backend/src/workspace.rs` `save_note_body`: when saving
  `ideas/x.md` and `ideas.md` exists, it already moves `ideas.md` to
  `ideas/README.md` in the same commit (errors if the README exists).
- `delete_workspace_file_server_function`: deletes one `.md` file and commits.
  There is no rename, move or folder delete on the server.
- `crate::auth::slug_from_name`: lowercase ASCII alphanumerics joined by `-`.

## Naming rules

- A name typed by the user is a title. The file or folder name is
  `slug_from_name(title)`; files get `.md` appended.
- If the slug is empty (e.g. the title was only punctuation), the input shows
  an inline error and stays open.
- If the target path already exists, the input shows an inline error
  ("`ideas/plan.md` already exists") and stays open with the typed text. Never
  overwrite, never auto-suffix.
- A file `x.md` and a folder `x/` may not exist side by side: creating,
  renaming or moving into that state is refused with the same inline error.
  `save_note_body` silently converts `x.md` to `x/README.md` on the next save
  inside `x/`, so allowing it would cause surprise restructures. "New child
  note" is the one operation that performs this conversion on purpose. *(Our
  call.)*
- The live input shows the resulting filename under the field
  (`→ meeting-notes-q4.md`) so the slug is never a surprise. *(Builder's call
  on exact styling.)*
- All paths are validated on the server (SECURITY.md:164); the client check
  is a convenience, not the guard.

## Operations

Each operation is one command and one Git commit. Paths below are relative to
the workspace root.

### New note

- **On a folder** `projects/`: prompts for a title; creates
  `projects/<slug>.md` whose body is `# <Title>\n`. The folder expands, the new
  note becomes selected and opens in the editor in Insert position after the
  heading.
- **On a file** `ideas.md`: prompts for a title; `ideas.md` becomes
  `ideas/README.md` and the new note is created as `ideas/<slug>.md`, in one
  commit. If `ideas/` already exists with a `README.md`, show the backend's
  error inline and change nothing. If `ideas/` exists without a README, move
  `ideas.md` to `ideas/README.md` and continue.
- **On the tree root / empty space / header "+" button**: creates at the
  workspace root.
- `editor.create_note` (editor empty state) uses the same flow at the root
  instead of the hardcoded `new-note.md`.
- The title input is always a temporary inline row in the tree, at the
  position the new item will take. When a create starts outside the tree
  (editor, palette, header) and the tree is hidden (Focus mode, narrow
  layout), the command opens the tree first. *(Our call.)*

### New folder

- Prompts for a title; creates `<parent>/<slug>/README.md` with body
  `# <Title>\n` and opens it. A folder always has a README because Git does
  not track empty directories and the tree only shows folders that contain
  notes. *(Our call; this also gives the folder a title for the Titles
  display option.)*
- The parent is the folder row it was invoked on, the parent folder of a file
  row, or the root.

### Rename

- Inline: the row's label becomes an input prefilled with the current name
  without `.md` (for a file) or the folder name. `Enter` confirms, `Esc`
  cancels, blur cancels.
- The new name is slugified; files keep `.md`. Folders are slugified the same
  way and all paths below them change.
- Renaming does not change the note's heading, and links to the old path are
  not rewritten.
- If the open note is renamed or lives under a renamed folder, the editor
  keeps it open at the new path with no reload and no lost edits. Unsaved edits
  go to the new path in the same commit (see Unsaved edits).

### Move

- **Drag and drop** (mouse/trackpad only): drag a file or folder row onto a
  folder row to move it into that folder, or onto the root line
  (`~/<slug>`) to move it to the top level.
  - The hovered drop target is highlighted; hovering a collapsed folder for
    ~600 ms expands it. *(Our call.)*
  - Dropping onto a file row, onto the item's current parent, or a folder into
    itself or a descendant is refused (no highlight, cursor shows not-allowed).
- **"Move to…"** (menu or `m`): the tree enters a destination-picking state.
  Only folders and the root are selectable; `j/k` or click moves, `Enter` or
  click confirms, `Esc` cancels. A status-bar hint reads
  "Move `ideas/plan.md` to… ⏎ confirm · esc cancel".
- Both paths dispatch the same move command. A collision at the destination
  shows the inline/status error and nothing moves.
- The open note stays open at its new path. Folders that become empty
  disappear from the tree (they had no notes).

### Delete

- **File:** deletes immediately, no confirmation. If it was open, the editor
  shows the empty state and selection moves to the next row.
- **Folder:** a confirmation dialog: "Delete `projects/` and its 12 files?"
  with **Delete** (destructive style) and **Cancel** (default focus).
  Confirming removes the directory recursively, including attachments and
  non-note files, in one commit.
- The count includes every file in the directory, not just notes. *(Builder:
  the client only knows notes; get the count from the server or label it
  "notes" and accept the gap.)*
- Deleting a `README.md` in filename mode is a plain file delete.

## Folder click and README

- Clicking a folder that contains a `README.md` expands it **and** opens the
  README in the editor, in every display mode.
- A folder without a README only toggles expand/collapse.
- `h` / `l` only collapse / expand and never open anything. `Enter` on a
  folder behaves like a click.

## How operations are reached

### Context menu (desktop)

- Right-click on a row opens a menu at the pointer for that row; right-click
  on empty tree space or the root line opens the root menu.
- `Shift+F10` or the `ContextMenu` key opens it anchored to the selected row.
- Right-click also selects the row (tree cursor moves to it).
- Items:

| Target | Items |
|---|---|
| File | New note · New folder · Rename · Move to… · Delete |
| Folder | New note · New folder · Rename · Move to… · Delete… |
| Root / empty | New note · New folder |

  "New note" on a file is labelled "New child note" so the README conversion
  is not a surprise. *(Our call.)* Each item shows its shortcut on the right.
- The menu is keyboard-navigable using the existing `[keymap.menu]` scope
  (`j/k`, arrows, `Enter`, number keys, `Esc`/`q`), and closes via
  `UiState::close_top()`. It is a new menu kind alongside `ActionMenu`, not a
  fourth `Popover`.

### Keyboard shortcuts

New `[keymap.file_tree]` bindings in `default_keymap.toml`, remappable in the
user's `config.toml`:

| Key | Command | Action |
|---|---|---|
| `a` | `file_tree.new_note` | New note on the selected row |
| `A` | `file_tree.new_folder` | New folder |
| `r` | `file_tree.rename` | Rename |
| `m` | `file_tree.move` | Move to… |
| `d` | `file_tree.delete` | Delete (folders confirm) |
| `<S-F10>` | `file_tree.context_menu` | Open the menu on the selected row |

The commands also appear in the command palette, acting on the File Tree
cursor (or the open note when the tree has no cursor). They are listed in the
cheat sheet.

### Touch

- Long-press a row for ~500 ms opens a bottom action sheet for that row, with
  the same items as the context menu and a Cancel button. A short haptic
  (`navigator.vibrate`) fires where supported.
- In touch mode (`ui.touch`), the current row shows a visible `⋮` button that
  opens the same sheet, for discoverability.
- No swipe actions and no drag and drop on touch; moving uses "Move to…".
- The folder delete confirmation is shown as a sheet on narrow screens.

### Header

- The sidebar header gets a `+` button (New note at root; title "New note
  (a)"). *(Our call.)*

## Display options

One tree view with options, stored in the user's `config.toml` and editable
under Settings → Sidebar. They change how the tree is labeled, not the file
operations.

```toml
[sidebar]
labels = "filenames"     # "filenames" | "titles"
show_extensions = true   # only applies when labels = "filenames"
```

- **filenames** (default): today's tree. `README.md` rows are visible.
  `show_extensions = false` shows `plan` instead of `plan.md`.
- **titles**: each note row shows `NoteSummary.title`. `README.md` rows are
  hidden; a folder with a README shows the README's title as its label, a
  folder without one shows its folder name. Sorting stays by path so the tree
  does not reorder when a heading changes. *(Our call.)*
- Rename in titles mode still edits the filename, prefilled with the slug,
  because titles live in the note. *(Our call.)*
- Settings writes these keys the same way `save_editor_options` writes
  `[editor]`, preserving the rest of the file.

## Server changes

New or changed server functions, each validating every path with the same
rules as `safe_note_path` (relative, no `..`, inside the notes root) and
committing once. Document each in `crates/gateway/API.md`.

- `create_note` (or extend `save_document_server_function` with a
  must-not-exist flag): fails with a user-safe 409-style error when the target
  exists. Reuses the existing `ideas.md` → `ideas/README.md` conversion.
- `rename_path(from, to)` and `move_path(from, to_folder)` (may be one
  function): works for files and folders, refuses existing targets, a folder
  into itself, file/folder name clashes, and paths outside the workspace.
  Takes optional `open_note: { path, content }` so unsaved edits land in the
  same commit.
- `delete_workspace_file_server_function`: extend to folders (recursive) or
  add `delete_folder`; returns the number of files removed. Hidden paths and
  `.git` are never touched.
- All return the refreshed `WorkspaceView` (or the client refetches) so the
  tree updates in one step.

## Path safety

Every tree operation can change or delete files, so the server must make it
impossible to touch anything outside the active workspace folder, whatever
the client sends. The client's checks are for UX only.

Current state (2026-11-04): all note server functions require an
authenticated session (`authenticated_workspace()`). `safe_note_path` rejects
empty, absolute, `..`, `.`, hidden and empty segments, backslashes and
control characters, and requires `.md`. `resolve_note_path`
(`crates/backend/src/workspace.rs`) refuses any symlink below the notes root,
and listing skips hidden entries and symlinks. The new operations must reuse
both and add the folder, root and slug rules below.

Rules for every create, rename, move and delete, applied on the server before
any filesystem change, by one shared validation function (files and folders):

1. **Authenticated** and scoped to the active workspace's notes root
   (`notes_root(config)`), never the repository root or app root when the
   workspace is a subfolder.
2. **Relative and clean:** non-empty, no absolute paths, no `..`, `.`, root or
   prefix components, no backslashes, no NUL or control characters.
3. **No hidden segments:** any segment starting with `.` is rejected, which
   protects `.git/`, `.lirox.toml` and other config files.
4. **Never the root:** a folder operation on `""`, `.` or `/` is rejected, so
   "delete folder" can never delete the workspace.
5. **Contained after resolving:** canonicalize the existing source (and the
   destination's parent) and require it to start with the canonicalized notes
   root. This catches symlinks that point outside.
6. **No symlinks:** reject the operation if the source or any path component
   is a symlink; recursive delete must not follow symlinks inside the folder
   (delete the link, not its target). `std::fs::remove_dir_all` does not
   follow links, but the top-level check is still required.
7. **New names are slugs:** the destination's final segment must match the
   slug pattern (`[a-z0-9]+(-[a-z0-9]+)*`, plus `.md` for files), so the server
   enforces slugification too. Existing source paths only need rules 2–6.
8. **Kinds match:** file operations require a regular `.md` file; folder
   operations require a directory.
9. **Commits only the affected paths**, never `git add -A`.
10. **Errors are user-safe:** refused requests return a 400 with a short
    message and never include server paths.

`save_document`, `read_workspace_file` and `delete_workspace_file` move to the
same validation, which closes the hidden-segment and symlink gaps they have
today.

Tests (backend, against a temp repo): `../x.md`, `a/../../x.md`, `/etc/x.md`,
`.git/config.md`, `a/.hidden/x.md`, `a\\..\\x.md`, a NUL byte, empty path,
deleting `""`/`.`, a symlinked file and a symlinked folder pointing outside
the notes root, a folder into itself, and a workspace configured as a
subfolder where a path tries to reach a sibling folder of the same repo. Each
must be refused with nothing changed on disk and no commit.

## Accessibility

- Tree keeps `role="tree"`/`treeitem`; menus use `role="menu"`/`menuitem`;
  the confirmation is `role="alertdialog"` with focus trapped and returned to
  the tree on close.
- Inline inputs have an accessible label ("New note title", "Rename
  `plan.md`") and announce errors via `aria-describedby`.
- Drag and drop always has the "Move to…" equivalent.

## Future: Oil view

A separate sidebar view inspired by oil.nvim, not part of this build. The
current folder is shown as an editable text buffer, one entry per line
(folders end with `/`). Navigation uses Vim motions; `Enter` on a folder
enters it, `-` goes to the parent. Creating, renaming, moving (cut/paste a
line into another folder) and deleting are done by editing lines; on `:w` the
diff is shown as a confirmation list and applied as one batch commit. The
commands above (rename, move, delete, create) should be written so this view
can batch them later; nothing else here depends on it. Display options do not
apply: the buffer always shows real filenames.

## Storage and optimistic updates

- Notes stay physical: plain Markdown files in the Git repository are the
  source of truth, and every operation is a real filesystem change plus one
  commit. No database, virtual path mapping or soft delete; Git history is the
  undo.
- The UI is optimistic: create, rename, move and delete update the tree (and
  the open note's path) immediately, then reconcile with the server's
  response. If the server refuses or fails, the change is rolled back and the
  error is shown inline (for collisions) or in the status bar (for other
  failures).
- While an operation is in flight, the affected row is marked pending (dimmed)
  and further operations on it are refused until it settles. *(Our call.)*
- New notes and folders are written to disk when created, not on first save,
  so a refresh never loses them. *(Our call.)*

## Unsaved edits

Saving is manual. Files and folders are handled the same way:

- **Rename / move** of the open note, or of a folder containing it, writes the
  open buffer to the note's new path in the same commit (the server function
  takes optional `{ path, content }` for the open note).
- **Delete** of the open note, or of a folder containing it, while it has
  unsaved edits asks for confirmation, naming the note with unsaved changes.
  Without unsaved edits, files delete immediately and folders confirm as
  described under Delete.
- Folder delete is a required, working feature: recursive on the server, one
  commit.

## Implementation status

The tracker for this spec. Update a row's status (and the date column) in the
same change that implements or verifies it. Statuses: **Not started**,
**Partial** (some pieces exist; the note says which), **Done** (implemented
and its check passes), **Verified** (checked manually in the running app on
desktop and touch).

| # | Acceptance criterion | Status | Notes | Updated |
|---|---|---|---|---|
| 1 | Right-click on a file, folder and empty space opens the matching menu; `Shift+F10` opens it for the selected row; `Esc` closes it. | Not started | `ActionMenu` + `[keymap.menu]` exist for the editor only. | 2026-11-03 |
| 2 | `a` on folder `projects/` with title "Meeting notes Q4" creates `projects/meeting-notes-q4.md` containing `# Meeting notes Q4`, opens it, and commits once. | Not started | `editor.create_note` only writes a hardcoded `new-note.md`; `slug_from_name` exists. | 2026-11-03 |
| 3 | `a` on `ideas.md` with title "Plan" results in `ideas/README.md` (old content) and `ideas/plan.md`, one commit, `ideas/` expanded. | Partial | Backend conversion exists in `save_note_body`; no UI or must-not-exist check. | 2026-11-03 |
| 4 | Creating or renaming to an existing path, or into a file/folder name clash, shows an inline error, keeps the input open, and changes nothing on disk. | Not started | | 2026-11-03 |
| 5 | `r` on `My file.md` → "My Ideas" yields `my-ideas.md`; an open note stays open with its edits. | Not started | No rename on the server. | 2026-11-03 |
| 6 | Renaming a folder moves everything below it; the open note follows. | Not started | | 2026-11-03 |
| 7 | Dragging a note onto a folder moves it; dropping a folder into its own child is refused; `m` + `Enter` on a destination does the same move. | Not started | No move on the server. | 2026-11-03 |
| 8 | `d` on a file deletes it immediately; `d` on a folder shows a confirmation with the file count, and Cancel changes nothing. | Partial | `delete_workspace_file_server_function` deletes one `.md` file; no folder delete, no UI. | 2026-11-03 |
| 9 | Clicking a folder with a README opens the README and expands it; `l`/`h` never open anything. | Partial | Folder click toggles and `h`/`l` collapse/expand; README is not opened. | 2026-11-03 |
| 10 | Long-press (~500 ms) and the `⋮` button open the action sheet on touch; no swipe or touch drag performs any action. | Not started | `ui.touch` detection exists. | 2026-11-03 |
| 11 | `[sidebar] labels = "titles"` hides README rows and labels folders by their README title; `show_extensions = false` hides `.md` in filenames mode; both persist via Settings. | Not started | `NoteSummary.title` exists; `save_editor_options` is the pattern for writing config. | 2026-11-03 |
| 12 | Every operation is a command in the registry, listed in the palette and cheat sheet, and covered by reducer tests that run without Dioxus. | Not started | | 2026-11-03 |
| 13 | `crates/gateway/API.md` documents every new or changed server function. | Not started | | 2026-11-03 |
| 14 | Header `+` button and the editor empty state create a note through the inline-row flow, opening the tree when hidden. | Not started | | 2026-11-03 |
| 15 | Tree operations update the UI before the server responds, mark the row pending, and roll back with an error when the server refuses. | Not started | | 2026-11-03 |
| 16 | Renaming/moving the open note or its folder carries unsaved edits to the new path in the same commit; deleting it with unsaved edits asks first. | Not started | | 2026-11-03 |
| 17 | Deleting a folder removes it and everything in it (notes, attachments, subfolders) in one commit. | Not started | | 2026-11-03 |
| 18 | All note server functions use the shared path validation; every case in Path safety → Tests is refused with nothing changed and no commit. | Partial | Done for existing save/read/delete and listing (branch `fix/note-path-safety`: hidden segments, backslashes, control chars, empty segments, symlinked files/folders, subfolder escape; tests in `crates/backend/tests/note_paths.rs` and `note_safety.rs`). Still to do with the new operations: folder targets, never-the-root, slug-only destinations, folder into itself. | 2026-11-04 |

Out of scope here and not tracked: the Oil view, trash, link rewriting.
