# Sidebar Create Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create notes from the File Tree through an inline title row: in a folder, as a child of a file (`ideas.md` → `ideas/README.md` + `ideas/<slug>.md`), at the root, from the header `+` and from the editor's empty state, with collisions shown inline.

**Architecture:** A new backend `create_note` refuses existing targets, file/folder clashes and non-slug names, then reuses `save_note_body` (which already does the README conversion and path safety). A typed server function exposes it. On the client, a pure `new_note` module turns a tree anchor plus typed title into a target path; reducer commands drive a `NoteDraft` in `UiState`; the File Tree renders the draft as an inline row.

**Tech Stack:** Rust, Dioxus 0.7 fullstack (server functions), `liroxnotes-backend`, Git via the existing `commit_note_paths`.

**Spec:** `docs/superpowers/specs/2026-11-02-sidebar-navigation-design.md` (tracker rows #2, #3, #4, #14; the create part of #15 and #18).

## Global Constraints

- Filenames are `crate::auth::slug_from_name(title)` + `.md`; the server enforces the slug pattern `[a-z0-9]+(-[a-z0-9]+)*` on the final segment.
- New note body is exactly `# <Title>\n`, where `<Title>` is the trimmed typed title.
- Never overwrite, never auto-suffix: an existing target is an inline error and the input stays open with the typed text.
- A file `x.md` and a folder `x/` may not exist side by side; only "new child note" converts `x.md` to `x/README.md`.
- Every operation is one commit (already true of `save_note_body`).
- Every path goes through the existing `safe_note_path` + `resolve_note_path`; error messages never contain server paths.
- UI actions dispatch commands (`crates/app/DESIGN.md`); no behavior in components beyond calling `run(...)`.
- Update `crates/gateway/API.md` for the new server function and the spec's Implementation status table for every row this plan touches.
- Do not commit or push until the full CI command set (Task 5, Step 4) passes.

## Review Focus

- **Title that slugifies to nothing** (`"!!!"`, `"日本語"`): inline error "Use letters or numbers in the title", nothing sent to the server. Test in Task 2.
- **Double Enter / Enter while pending**: only one `CreateNote` effect; the second confirm is ignored. Test in Task 3.
- **Server refuses after the client check passed** (another device created the file, or the README already exists): the draft returns with the server's message and the typed title. Test in Task 3.
- **Escape while typing**: cancels the draft and does not also close the sidebar or another layer. Test in Task 3.
- **Child note on a nested file** (`work/a.md` → `work/a/README.md` + `work/a/<slug>.md`) and on a file whose folder already exists without README: works, one commit. Tests in Task 1.

---

## File Structure

- Modify `crates/backend/src/workspace.rs`: add `create_note`.
- Modify `crates/backend/src/lib.rs`: export `create_note`.
- Create `crates/backend/tests/note_create.rs`: backend behavior.
- Modify `crates/app/src/server.rs`: `create_note_server_function` + `create_note_error`.
- Create `crates/app/src/app/new_note.rs`: pure draft model (`NoteDraft`, `draft_for`, `draft_path`).
- Modify `crates/app/src/app/state.rs`: `UiState::new_note`, `close_top`.
- Modify `crates/app/src/app/reducer.rs`, `event.rs`, `effects.rs`, `mod.rs`: commands, `Effect::CreateNote`, `ApplicationEvent::NoteCreated/NoteCreateFailed`, tests.
- Modify `crates/app/src/config/default_keymap.toml`: `a`.
- Modify `crates/app/src/ui/model.rs`: palette entry.
- Modify `crates/app/src/ui/surfaces/file_tree.rs`, `editor.rs`, `crates/app/assets/main.css`: inline row, header `+`.

---

### Task 1: Backend `create_note`

**Files:**
- Modify: `crates/backend/src/workspace.rs` (next to `save_note_body`)
- Modify: `crates/backend/src/lib.rs` (re-export list at lines 16-19)
- Test: `crates/backend/tests/note_create.rs` (reuse the `Fixture` shape from `tests/note_safety.rs`; copy it, tests are separate crates)

**Interfaces:**
- Produces: `pub fn create_note(config: &GatewayConfig, path: &str, body: String) -> std::io::Result<bool>`. Errors: `InvalidInput` (unsafe path, or final segment not `<slug>.md`), `AlreadyExists` with message ``"`<path>` already exists"`` for an existing file or a folder named `<path without .md>`, and the existing `save_note_body` `AlreadyExists` when the README conversion target exists.

- [ ] **Step 1: Write the failing tests** in `note_create.rs`:
  - `creates_a_note_in_a_folder`: `create_note(cfg, "projects/meeting-notes-q4.md", "# Meeting notes Q4\n")` → file has that body; `git rev-list --count HEAD` == 1.
  - `creates_a_child_note_from_a_file`: with `ideas.md` = `"# Ideas\n"` committed, create `ideas/plan.md` → `ideas/README.md` == `"# Ideas\n"`, `ideas.md` gone, `ideas/plan.md` exists, exactly one new commit.
  - `creates_a_child_note_from_a_nested_file`: same with `work/a.md` → `work/a/README.md` + `work/a/b.md`.
  - `child_note_when_folder_exists_without_readme`: `ideas.md` and `ideas/other.md` exist → create `ideas/plan.md` succeeds, `ideas/README.md` holds the old `ideas.md`.
  - `refuses_an_existing_note`: `plan.md` exists → `AlreadyExists`, message contains `` `plan.md` already exists ``, body unchanged, no new commit.
  - `refuses_a_note_next_to_a_same_named_folder`: `ideas/x.md` exists → create `ideas.md` is `AlreadyExists`, nothing written.
  - `refuses_when_readme_already_exists`: `ideas.md` and `ideas/README.md` exist → create `ideas/plan.md` is `AlreadyExists`, `ideas.md` still in place.
  - `refuses_non_slug_names`: `"Plan.md"`, `"my plan.md"`, `"plan-.md"`, `"projects/x_y.md"` → `InvalidInput`. Folder segments are not slug-checked (`"My Folder/plan.md"` is accepted) because existing folders may have any name.
  - `refuses_unsafe_paths`: `"../x.md"`, `".git/x.md"` → `InvalidInput`.

- [ ] **Step 2: Run to verify they fail**
  Run: `cargo test -p liroxnotes-backend --test note_create`
  Expected: compile error `cannot find function create_note`.

- [ ] **Step 3: Implement `create_note`** in `workspace.rs`: resolve with the existing `note_location`; check the final segment against the slug pattern (hand-written check, no regex dependency); refuse when `fs::symlink_metadata(absolute)` succeeds or the sibling folder `absolute.with_extension("")` exists; then call `save_note_body(config, path, body)`. Export from `lib.rs`.

- [ ] **Step 4: Run to verify they pass**
  Run: `cargo test -p liroxnotes-backend`
  Expected: all pass, including `note_safety` and `note_paths`.

- [ ] **Step 5: Commit**
  `git commit -m "feat(backend): create notes without overwriting"` (add the three files).

### Task 2: Draft model and server function

**Files:**
- Create: `crates/app/src/app/new_note.rs` (declare `mod new_note;` in `app/mod.rs`, re-export `NoteDraft`)
- Modify: `crates/app/src/server.rs`, `crates/gateway/API.md`
- Test: unit tests inside `new_note.rs`; `create_note_error` test inside `server.rs`'s existing `#[cfg(test)]` area

**Interfaces:**
- Consumes: `liroxnotes_shared::{TreeEntry, TreeKind}`, `crate::auth::slug_from_name`, `liroxnotes_backend::create_note` (Task 1).
- Produces:
  - `#[derive(Clone, Debug, PartialEq, Eq)] pub struct NoteDraft { pub folder: String, pub child_of: Option<String>, pub title: String, pub error: Option<String>, pub pending: bool }` — `folder` is the folder the note lands in (`""` = root); `child_of` is the file being converted (`Some("ideas.md")` → `folder == "ideas"`).
  - `pub fn draft_for(tree: &[TreeEntry], anchor: Option<&str>) -> NoteDraft` — `None` or `Some("")` → root; a folder path → that folder; a file path → `child_of = Some(path)`, `folder = path` without `.md`.
  - `pub fn sibling_draft(anchor: Option<&str>) -> NoteDraft` — the folder containing `anchor` (palette "new note").
  - `pub fn draft_path(draft: &NoteDraft, tree: &[TreeEntry]) -> Result<String, String>` — `folder/slug.md`, or an error string.
  - `pub fn note_body(title: &str) -> String` → `format!("# {}\n", title.trim())`.
  - Server: `create_note_server_function(path: String, content: String) -> Result<WorkspaceView, ServerFnError>`; `fn create_note_error(error: std::io::Error) -> ServerFnError` mapping `AlreadyExists` → 409 with the error's own message, `InvalidInput` → 400 "Use lowercase letters, numbers and dashes", other → `internal_error("could not create note")`.

- [ ] **Step 1: Write the failing tests** (`new_note.rs`), using a tree with folder `work`, files `work/a.md`, `b.md`:
  - `folder_anchor_creates_inside_it`: `draft_for(tree, Some("work"))` → `folder == "work"`, `child_of == None`.
  - `file_anchor_creates_a_child`: `Some("b.md")` → `folder == "b"`, `child_of == Some("b.md")`.
  - `no_anchor_creates_at_root`: `None` and `Some("")` → `folder == ""`.
  - `sibling_draft_uses_the_containing_folder`: `Some("work/a.md")` → `folder == "work"`, `child_of == None`.
  - `path_is_slugified`: folder `"work"`, title `"Meeting notes Q4"` → `Ok("work/meeting-notes-q4.md")`; root → `"meeting-notes-q4.md"`.
  - `empty_slug_is_an_error`: titles `""`, `"   "`, `"!!!"` → `Err("Use letters or numbers in the title")`.
  - `existing_file_is_an_error`: root, title `"B"` → ``Err("`b.md` already exists")``.
  - `same_named_folder_is_an_error`: root, title `"Work"` → ``Err("a folder `work/` already exists")``.
  - `note_body_is_a_heading`: `note_body("  Plan ")` == `"# Plan\n"`.
  - server test `create_errors_keep_the_reason`: `AlreadyExists("`b.md` already exists")` → `ServerError { code: 409, message: "`b.md` already exists", .. }`; `InvalidInput` → code 400.

- [ ] **Step 2: Run to verify they fail**
  Run: `cargo test -p liroxnotes-app --features server new_note create_errors`
  Expected: compile errors for the missing items.

- [ ] **Step 3: Implement** the module and the server function (copy the `save_document_server_function` shape: `authenticated_workspace()`, call `create_note`, map with `create_note_error`, return `workspace_view_for_config(&config, &path)`). Add the function's row to `crates/gateway/API.md` after `save_document_server_function`.

- [ ] **Step 4: Run to verify they pass**
  Run: `cargo test -p liroxnotes-app --features server` and `cargo check -p liroxnotes-app --target wasm32-unknown-unknown`
  Expected: pass; wasm builds (server-only code stays behind `#[cfg(feature = "server")]` like its neighbours).

- [ ] **Step 5: Commit** `feat(app): note draft model and create server function`.

### Task 3: Reducer commands, effect and events

**Files:**
- Modify: `crates/app/src/app/state.rs` (`UiState::new_note: Option<NoteDraft>`, default `None`; `close_top` takes it first, before `palette`)
- Modify: `crates/app/src/app/reducer.rs` (commands, `Effect::CreateNote`, replace `create_note`)
- Modify: `crates/app/src/app/event.rs` (`ApplicationEvent::NoteCreated(Box<WorkspaceView>)`, `ApplicationEvent::NoteCreateFailed(String)`)
- Modify: `crates/app/src/app/effects.rs` (execute `CreateNote`; error → `NoteCreateFailed` in `auth_error_event`; for `ServerFnError::ServerError { message, code: 400 | 409, .. }` pass `message` through unchanged)
- Modify: `crates/app/src/config/default_keymap.toml` (`[keymap.file_tree] a = "file_tree.new_note"`)
- Modify: `crates/app/src/ui/model.rs` (`palette_items`: `("new note", "file_tree.new_sibling_note", CommandArgs::None)`)
- Test: `crates/app/src/app/mod.rs` tests (use `workspace_with_tree()`)

**Interfaces:**
- Consumes: Task 2 `NoteDraft`, `draft_for`, `sibling_draft`, `draft_path`, `note_body`; existing `show_sidebar`, `tree_cursor`, `toggle_folder`.
- Produces commands:
  - `file_tree.new_note` — args `None` → anchor = tree cursor; `Text(path)` → that anchor (`""` = root). Calls `show_sidebar`, sets `active_surface = FILE_TREE`, `input.mode = Normal`, `ui.new_note = Some(draft_for(..))`, and removes the draft's folder from `ui.collapsed`.
  - `file_tree.new_sibling_note` — same, with `sibling_draft(tree cursor or domain.selected_note)`.
  - `file_tree.new_note_input` — `Text(title)` → sets `title`, clears `error`.
  - `file_tree.confirm_new_note` — ignored when no draft or `pending`; `draft_path` error → `draft.error`; else `pending = true` and returns `vec![Effect::CreateNote { path, content: note_body(&title) }]`.
  - `file_tree.cancel_new_note` — `ui.new_note = None`.
  - `editor.create_note` — now dispatches the `file_tree.new_note` behaviour with root anchor (delete the old hardcoded `create_note` fn).
- Events: `NoteCreated(view)` → same handling as `AuthEvent::WorkspaceLoaded`, then `ui.new_note = None`, `active_surface = EDITOR`, returns `Effect::EditorFocus` plus whatever `WorkspaceLoaded` returned. `NoteCreateFailed(message)` → `draft.error = Some(message)`, `pending = false`.

- [ ] **Step 1: Write the failing tests** in `app/mod.rs`:
  - `new_note_on_a_folder_opens_a_draft_there`: cursor on `work` → `dispatch(file_tree.new_note)` → `ui.new_note.folder == "work"`, sidebar visible, `work` not in `ui.collapsed`.
  - `confirming_a_draft_creates_the_slugified_note`: draft in `work`, input `"Meeting notes Q4"`, confirm → effects == `[CreateNote { path: "work/meeting-notes-q4.md", content: "# Meeting notes Q4\n" }]`, `pending == true`.
  - `child_note_on_a_file_targets_its_folder`: `Text("b.md")`, input `"Plan"` → `CreateNote { path: "b/plan.md", .. }`.
  - `collision_keeps_the_draft_open`: root draft, input `"B"`, confirm → no effects, ``error == Some("`b.md` already exists")``, title still `"B"`.
  - `second_confirm_while_pending_is_ignored`: confirm twice → second returns no effects.
  - `server_refusal_returns_the_draft`: after confirm, `apply_event(NoteCreateFailed("`b/plan.md` already exists"))` → `pending == false`, error set, title kept.
  - `created_note_opens_in_the_editor`: `apply_event(NoteCreated(view with selected note "work/x.md"))` → `ui.new_note == None`, `domain.selected_note == Some("work/x.md")`, effects contain `EditorFocus`.
  - `escape_cancels_only_the_draft`: draft open + palette closed + sidebar open → `overlay.close_top` → `ui.new_note == None`, sidebar still visible.
  - `editor_create_note_opens_a_root_draft`: `editor.create_note` → draft with `folder == ""`, no effects.
  - `a_is_bound_in_the_file_tree`: resolving `a` in `InputScope::Surface(SurfaceKind::FileTree)` matches `file_tree.new_note`.
  - In `ui/model.rs` tests: `palette_lists_new_note`: `palette_items(">new", ..)` contains `file_tree.new_sibling_note`.

- [ ] **Step 2: Run to verify they fail**
  Run: `cargo test -p liroxnotes-app`
  Expected: compile errors for `ui.new_note`, `Effect::CreateNote`, the new events.

- [ ] **Step 3: Implement** the state field, commands, effect, events and keymap/palette entries per the Interfaces block. In `effects.rs`, `Effect::CreateNote` calls `server::create_note_server_function(path, content)` and yields `ApplicationEvent::NoteCreated`.

- [ ] **Step 4: Run to verify they pass**
  Run: `cargo test --workspace && cargo test -p liroxnotes-app --features server`
  Expected: all pass.

- [ ] **Step 5: Commit** `feat(app): create notes from the file tree`.

### Task 4: Inline row and header button

**Files:**
- Modify: `crates/app/src/ui/surfaces/file_tree.rs` (`FileTreeList`, `SidebarHeader`)
- Modify: `crates/app/src/ui/surfaces/editor.rs:364` (no change needed if it already runs `editor.create_note`; verify)
- Modify: `crates/app/assets/main.css` (+ regenerate `main.compiled.css` the way the repo does; see `just` recipes)

**Interfaces:**
- Consumes: `UiState::new_note`, commands from Task 3.

- [ ] **Step 1: Render the draft row** in `FileTreeList`: when `ui.new_note` is `Some`, insert one row directly after the row whose path equals `draft.folder` (or `draft.child_of` for a child note), or first under the root line when `folder == ""`. Its guide is one level deeper than the anchor. It contains an `input` (`aria_label: "New note title"`, autofocused via `onmounted` + `set_focus`, `oninput` → `run("file_tree.new_note_input", text(value))`, `onkeydown` Enter → `file_tree.confirm_new_note`, Escape → `file_tree.cancel_new_note`, `onblur` → cancel unless `pending`), a hint line `→ <draft_path result>` when `Ok`, and the error (`aria-describedby`, `role="alert"`) when `draft.error` is set. While `pending`, the input is `readonly` and the row has class `is-pending` (dimmed).

- [ ] **Step 2: Header `+` button** in `SidebarHeader` before the Git chip: `class: "lx-icon-btn"`, `aria_label: "New note"`, `title: "New note (a)"`, `onclick` → `run("file_tree.new_note", text(""))`.

- [ ] **Step 3: Styles**: `.lx-tree-row.is-draft input` uses the tree's font and colors with no border except a 1px `var(--accent)` underline; `.lx-tree-hint` dim text 12px; `.lx-tree-error` uses the existing error color token; `.is-pending { opacity: .55 }`. Match the existing `.lx-tree-row` metrics (30px row, 16px padding).

- [ ] **Step 4: Manual verification** with `just dev` in a scratch workspace, on desktop width and a narrow (≤ 640px) window:
  1. `a` on a folder → inline row appears inside it; type "Meeting notes Q4" → hint `→ meeting-notes-q4.md`; Enter → note opens with `# Meeting notes Q4`, tree shows it.
  2. `a` on `ideas.md` → Enter "Plan" → tree shows `ideas/README.md` and `ideas/plan.md`, folder expanded, `git log -1 --stat` shows one commit with all three paths.
  3. Type a name that exists → inline error, input keeps text; Escape → row gone, sidebar still open.
  4. Header `+` and the editor empty state → root draft; on narrow layout the tree sheet opens first.
  5. Typing `j`, `k`, `a`, `q` in the input inserts letters and does not move the tree cursor.

- [ ] **Step 5: Commit** `feat(app): inline new note row and header button`.

### Task 5: Tracker, docs and full verification

**Files:**
- Modify: `docs/superpowers/specs/2026-11-02-sidebar-navigation-design.md` (Implementation status rows #2, #3, #4, #14 → Done; #15 and #18 notes: create covered; date 2026-11-04)

- [ ] **Step 1:** Update the tracker rows and notes as above; rows become **Verified** only for the manual checks from Task 4 Step 4 that were actually performed.
- [ ] **Step 2:** `cargo fmt --all`.
- [ ] **Step 3:** Confirm `crates/gateway/API.md` lists `create_note_server_function` with its 400/409 behaviour.
- [ ] **Step 4: Run the CI set** — all must pass:
  ```bash
  cargo fmt --all --check
  cargo clippy --workspace --all-targets --locked -- -D warnings
  cargo clippy -p liroxnotes-app --features server --all-targets --locked -- -D warnings
  cargo test --workspace --locked
  cargo test -p liroxnotes-app --features server --locked
  cargo check -p liroxnotes-app --target wasm32-unknown-unknown --locked
  ```
- [ ] **Step 5: Commit and push** `docs: mark the create flow in the sidebar tracker`, then `git push -u origin feat/sidebar-create-flow`.
