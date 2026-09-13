# Architectural Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Dioxus starter with a testable keyboard-first notes workbench that demonstrates the approved v1 architecture and visual design.

**Architecture:** Keep command, input, workspace, and reducer logic as plain Rust modules independent of Dioxus. Dioxus provides the rendering shell and event adapter; components read application state and dispatch semantic commands. The existing gateway remains an integration consumer of the app crate, but backend effects are no-ops in this slice and the initial application state is empty.

**Tech Stack:** Rust 2021, Dioxus 0.7.1, Dioxus router, Tailwind CSS, existing Actix gateway, plain Rust unit tests.

**Spec:** `crates/app/DESIGN.md`, constrained by `crates/app/ARCHITECTURE.md`

## Global Constraints

- Tailwind CSS is the primary styling system.
- Use TUI-inspired, Neovim-aligned semantic colors through `--lirox-*` variables.
- Keep `InputMode` separate from `UiMode`.
- Keep logical focus separate from browser DOM focus.
- Keybindings are data and commands use stable string IDs.
- Dioxus components must not resolve keymaps or call the backend directly.
- Do not implement Neovim configuration parsing, plugin compatibility, or full Vim grammar.
- Preserve the existing gateway's backend/API ownership and compile the workspace.
- Core command, input, workspace, and reducer tests must not require Dioxus rendering.

---

## File Map

Create the following focused modules under `crates/app/src/`:

- `command/`: stable command IDs, invocation data, arguments, and registry.
- `input/`: normalized keystrokes, modes, scopes, keymap data, and resolver.
- `workspace/`: surfaces, layout, focus, overlays, and UI mode.
- `domain/`: note and active document state, initialized empty.
- `config/`: canonical app config and default keybindings.
- `app/`: root state, application events, reducer, and dispatcher.
- `platform/web/`: conversion of Dioxus/browser keyboard events into `InputEvent`.
- `ui/`: shell, bars, layout renderer, overlay renderer, and surfaces.

Modify:

- `crates/app/Cargo.toml`: rename the package to `liroxnotes-app` so the existing gateway dependency resolves.
- `crates/app/src/main.rs`: expose modules and launch the Dioxus shell.
- `crates/app/src/lib.rs`: expose the shell and the compatibility adapter consumed by gateway SSR.
- `crates/app/Dioxus.toml`: set the app title and include the stylesheet.
- `crates/app/assets/main.css`: replace starter CSS with the Lirox theme tokens and minimal integration styles.
- `crates/gateway/src/lib.rs`: verify the existing SSR call against the preserved shell adapter; do not move backend logic into the app or add API loading in this slice.

---

### Task 1: Make the App Crate a Valid Workspace Dependency

**Files:**
- Modify: `crates/app/Cargo.toml`
- Modify: `crates/app/src/main.rs`
- Create: `crates/app/src/lib.rs`
- Modify: `crates/app/Dioxus.toml`
- Modify: `crates/app/assets/main.css`
- Modify: `crates/app/Cargo.toml`: add the `liroxnotes-shared` path dependency for the SSR compatibility adapter.
- Test: workspace `cargo check`

**Interfaces:**
- Produces package `liroxnotes-app`, a public `App` component, and a public `WorkspaceShell` compatibility adapter for the gateway.

- [ ] **Step 1: Write the failing baseline check**

Run:

```bash
cargo check --workspace
```

Expected: FAIL because the gateway requests package `liroxnotes-app` while the app package is named `app`.

- [ ] **Step 2: Rename the package and replace starter routes**

Set `name = "liroxnotes-app"`. Remove the starter `Hero`, blog route, and navbar. Declare the new modules and launch `App`.

- [ ] **Step 3: Add the stylesheet entry**

Configure `Dioxus.toml` to load `assets/main.css` and `tailwind.css`, set the title to `LiroxNotes`, and remove starter-only asset references.

- [ ] **Step 4: Add the theme foundation**

Define the `--lirox-*` variables in `:root` and `body` styles. Keep the palette dark, low-contrast, and accent-driven. Use Tailwind classes for component layout in later tasks.

- [ ] **Step 5: Run the workspace check**

Run:

```bash
cargo check --workspace
```

Expected: the package-name error is gone. Any remaining compile failures identify the gateway API that Task 8 must adapt.

- [ ] **Step 6: Commit**

```bash
git add crates/app/Cargo.toml crates/app/src/main.rs crates/app/Dioxus.toml crates/app/assets/main.css
git commit -m "refactor: replace dioxus starter app"
```

### Task 2: Add the Stable Command Model

**Files:**
- Create: `crates/app/src/command/mod.rs`
- Create: `crates/app/src/command/id.rs`
- Create: `crates/app/src/command/args.rs`
- Create: `crates/app/src/command/invocation.rs`
- Create: `crates/app/src/command/registry.rs`

**Interfaces:**
- Produces `CommandId`, `CommandSource`, `CommandArgs`, `CommandInvocation`, `CommandDescriptor`, and `CommandRegistry`.
- `CommandId` is a cloneable, comparable, serializable string wrapper.
- `CommandRegistry::register` rejects duplicate IDs; `lookup` returns a descriptor by ID.

- [ ] **Step 1: Write failing unit tests**

```rust
#[test]
fn command_ids_compare_by_value() {
    assert_eq!(CommandId::new("editor.save"), CommandId::new("editor.save"));
}

#[test]
fn registry_rejects_duplicate_ids() {
    let mut registry = CommandRegistry::default();
    registry.register(descriptor("editor.save")).unwrap();
    assert!(registry.register(descriptor("editor.save")).is_err());
}
```

- [ ] **Step 2: Implement the data types and registry**

Use stable string IDs and an enum for source values: `Keyboard`, `Pointer`, `CommandPalette`, `Menu`, and `System`. Keep arguments minimal: `None`, `Count(u32)`, `Direction(Direction)`, and `Surface(SurfaceId)`.

- [ ] **Step 3: Run focused tests**

```bash
cargo test -p liroxnotes-app command
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add crates/app/src/command
git commit -m "feat: add semantic command model"
```

### Task 3: Implement Input Primitives and Prefix Resolution

**Files:**
- Create: `crates/app/src/input/mod.rs`
- Create: `crates/app/src/input/key.rs`
- Create: `crates/app/src/input/sequence.rs`
- Create: `crates/app/src/input/mode.rs`
- Create: `crates/app/src/input/scope.rs`
- Create: `crates/app/src/input/state.rs`
- Create: `crates/app/src/input/keymap.rs`
- Create: `crates/app/src/input/resolver.rs`

**Interfaces:**
- `KeyStroke { key: Key, modifiers: Modifiers }` and `KeySequence(Vec<KeyStroke>)`.
- `InputMode::{Normal, Insert}` and `InputScope::{Global, Workspace, Surface(SurfaceKind), SurfaceInstance(SurfaceId), Overlay}`.
- `InputState { mode, pending, count, operator }` with `operator` reserved but unused.
- `KeyBinding { scope, mode, sequence, command }`.
- `resolve(bindings, state, stroke, active_scopes) -> ResolveResult` returning `Matched(CommandInvocation)`, `Pending`, or `Unhandled`.

- [ ] **Step 1: Write resolver tests**

```rust
#[test]
fn resolver_distinguishes_match_pending_and_unhandled() {
    let bindings = defaults();
    assert!(matches!(feed(&bindings, "j"), ResolveResult::Matched(_)));
    assert!(matches!(feed(&bindings, "g"), ResolveResult::Pending));
    assert!(matches!(feed(&bindings, "x"), ResolveResult::Unhandled));
}

#[test]
fn more_specific_scope_wins() {
    let bindings = vec![global_j(), file_tree_j()];
    assert_eq!(feed_in_file_tree(&bindings, "j").id, "file_tree.move_down");
}
```

- [ ] **Step 2: Implement normalization and prefix lookup**

Represent bindings as data and compare the pending sequence against binding prefixes. Check scopes in the fixed order overlay instance, overlay, surface instance, surface kind, mode, workspace, global. Reset pending input after a match or unhandled key.

- [ ] **Step 3: Add numeric count handling**

Collect numeric prefixes in Normal mode, attach `Count(n)` to commands that support it, and default command counts to `1`. Do not implement operators or Vim grammar.

- [ ] **Step 4: Run focused tests**

```bash
cargo test -p liroxnotes-app input
```

Expected: PASS for single keys, prefixes, precedence, modes, counts, and reset behavior.

- [ ] **Step 5: Commit**

```bash
git add crates/app/src/input
git commit -m "feat: add modal input resolver"
```

### Task 4: Add Workspace and Empty Domain State

**Files:**
- Create: `crates/app/src/workspace/mod.rs`
- Create: `crates/app/src/workspace/surface.rs`
- Create: `crates/app/src/workspace/layout.rs`
- Create: `crates/app/src/workspace/focus.rs`
- Create: `crates/app/src/workspace/overlay.rs`
- Create: `crates/app/src/workspace/state.rs`
- Create: `crates/app/src/domain/mod.rs`
- Create: `crates/app/src/domain/note.rs`

**Interfaces:**
- `SurfaceId`, `SurfaceKind::{Editor, FileTree}`, and `SurfaceState`.
- `LayoutNode::{Surface, Split}` with `Axis::{Horizontal, Vertical}` and a ratio.
- `FocusState { active_surface: SurfaceId }`.
- `OverlayEntry`, `OverlayPlacement::{LeftPanel, Centered, Fullscreen}`, and `OverlayInputPolicy::{Modal, NonModal}`.
- `WorkspaceState { ui_mode: UiMode, layout, surfaces, focus, overlays }`.
- `DomainState { workspace_name, notes, selected_note, document }`, initialized without seeded notes or document content.

- [ ] **Step 1: Write workspace tests**

```rust
#[test]
fn standard_layout_contains_file_tree_and_editor() {
    let workspace = WorkspaceState::empty();
    assert!(workspace.layout.contains(SurfaceId::FILE_TREE));
    assert!(workspace.layout.contains(SurfaceId::EDITOR));
}

#[test]
fn overlay_stack_is_lifo() {
    let mut stack = OverlayStack::default();
    stack.push(file_tree_overlay());
    assert_eq!(stack.pop().unwrap().surface, SurfaceId::FILE_TREE);
}
```

- [ ] **Step 2: Implement identity-independent surfaces and layout**

Keep File Tree state in the surface registry. Focus mode changes effective placement but does not delete the File Tree surface or its selection.

- [ ] **Step 3: Add the empty initial domain**

Initialize the domain with no notes and no active document. The File Tree and Editor render useful empty states until the later gateway API integration.

- [ ] **Step 4: Run focused tests**

```bash
cargo test -p liroxnotes-app workspace domain
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/app/src/workspace crates/app/src/domain
git commit -m "feat: add portable workspace surfaces"
```

### Task 5: Add Config, Root State, and Pure Dispatcher

**Files:**
- Create: `crates/app/src/config/mod.rs`
- Create: `crates/app/src/config/app_config.rs`
- Create: `crates/app/src/config/defaults.rs`
- Create: `crates/app/src/config/keybindings.rs`
- Create: `crates/app/src/app/mod.rs`
- Create: `crates/app/src/app/state.rs`
- Create: `crates/app/src/app/event.rs`
- Create: `crates/app/src/app/reducer.rs`
- Create: `crates/app/src/app/dispatcher.rs`

**Interfaces:**
- `AppConfig { keymaps, ui, editor }` with built-in defaults and leader Space.
- `ApplicationState { input, workspace, domain, config, status }`.
- `Effect` contains only explicit no-op-ready effect variants for this slice.
- `dispatch(&mut ApplicationState, CommandInvocation) -> Vec<Effect>`.
- `apply_event(&mut ApplicationState, ApplicationEvent) -> Vec<Effect>`.

- [ ] **Step 1: Write reducer tests**

```rust
#[test]
fn focus_mode_round_trip_restores_standard_layout() {
    let mut state = ApplicationState::empty();
    dispatch(&mut state, command("workspace.toggle_focus_mode"));
    assert_eq!(state.workspace.ui_mode, UiMode::Focus);
    dispatch(&mut state, command("workspace.toggle_focus_mode"));
    assert_eq!(state.workspace.ui_mode, UiMode::Standard);
    assert!(state.workspace.layout.contains(SurfaceId::FILE_TREE));
}

#[test]
fn unknown_command_becomes_status_error() {
    let mut state = ApplicationState::empty();
    dispatch(&mut state, command("missing.command"));
    assert!(state.status.message.unwrap().contains("Unknown command"));
}
```

- [ ] **Step 2: Implement default configuration**

Store all initial bindings in `AppConfig`; do not encode shortcuts in UI components. Include leader mappings for File Tree and Focus mode, surface movement/opening, and mode changes.

- [ ] **Step 3: Implement command handlers**

Handle File Tree toggling, Focus mode round-trip, surface focus movement, overlay close, file-tree movement/opening, and Normal/Insert transitions. Return status/effect values instead of calling external services.

- [ ] **Step 4: Run pure tests**

```bash
cargo test -p liroxnotes-app app config
```

Expected: PASS without a Dioxus runtime.

- [ ] **Step 5: Commit**

```bash
git add crates/app/src/app crates/app/src/config
git commit -m "feat: add application reducer and defaults"
```

### Task 6: Connect Dioxus State and the Web Keyboard Adapter

**Files:**
- Create: `crates/app/src/platform/mod.rs`
- Create: `crates/app/src/platform/web/mod.rs`
- Create: `crates/app/src/platform/web/keyboard.rs`
- Modify: `crates/app/src/main.rs`

**Interfaces:**
- `AppContext { state: Signal<ApplicationState>, dispatcher: Dispatcher }`.
- `normalize_keyboard_event` converts Dioxus keyboard data to `InputEvent::Key`.
- A single shell-level keydown handler feeds the resolver and dispatcher.

- [ ] **Step 1: Write normalization tests**

Test that a plain `j`, `Ctrl+w`, `Escape`, and `Space` produce stable `KeyStroke` values. Keep browser event types confined to `platform/web`.

- [ ] **Step 2: Implement context and dispatcher bridge**

Provide the app context once at the root. The bridge reads current application state, resolves the normalized event, updates pending input, dispatches matches, and applies returned application events.

- [ ] **Step 3: Implement editable-control policy**

Centralize the check for text inputs, textareas, and contenteditable elements. Permit Insert-mode typing through; intercept Escape intentionally; do not blanket-prevent defaults.

- [ ] **Step 4: Run tests and check compilation**

```bash
cargo test -p liroxnotes-app
cargo check --workspace
```

Expected: PASS for pure tests and no new package/module errors.

- [ ] **Step 5: Commit**

```bash
git add crates/app/src/main.rs crates/app/src/platform
git commit -m "feat: connect centralized keyboard pipeline"
```

### Task 7: Render the Shell, Layout, Surfaces, and Overlay

**Files:**
- Create: `crates/app/src/ui/mod.rs`
- Create: `crates/app/src/ui/shell.rs`
- Create: `crates/app/src/ui/top_bar.rs`
- Create: `crates/app/src/ui/bottom_bar.rs`
- Create: `crates/app/src/ui/workspace_renderer.rs`
- Create: `crates/app/src/ui/layout_renderer.rs`
- Create: `crates/app/src/ui/overlay_renderer.rs`
- Create: `crates/app/src/ui/surfaces/mod.rs`
- Create: `crates/app/src/ui/surfaces/editor.rs`
- Create: `crates/app/src/ui/surfaces/file_tree.rs`
- Modify: `crates/app/assets/main.css` only for shared presentation/integration rules

**Interfaces:**
- Public `WorkspaceShell` preserves the gateway's existing `WorkspaceView`, `FocusTarget`, `SidebarMode`, `browser_dir`, and callback props while adapting them into the new render state; gateway-specific transport types stay outside core state.
- Renderers consume `LayoutNode`, `SurfaceId`, and `WorkspaceState`; they do not mutate state directly.

- [ ] **Step 1: Build the stable shell markup**

Render semantic `header`, `main`, and `footer` regions with Tailwind classes. Keep Top Bar and Bottom Status Bar outside the layout tree.

- [ ] **Step 2: Render the recursive layout**

Render `Surface` nodes by ID and `Split` nodes by axis and ratio. Resolve the ID through the surface registry so placement never changes surface implementation.

- [ ] **Step 3: Render the Editor**

Show title/path when available, an empty-state message when no document is loaded, active/inactive treatment, and Normal/Insert status. Use a semantic editable control in Insert mode without adding a second application state model.

- [ ] **Step 4: Render the File Tree**

Show nested rows, selected/open state, folder/file distinction, and keyboard hints. Clicks dispatch the same semantic commands as keybindings.

- [ ] **Step 5: Render Focus mode and overlays**

Hide the docked File Tree in Focus mode. When toggled there, render the same File Tree surface in a left modal overlay above the Editor. Escape closes the top overlay first.

- [ ] **Step 6: Render status information**

Display mode, workspace, focused surface, current path, pending keys, and transient status. Never rely on color alone.

- [ ] **Step 7: Run formatting and checks**

```bash
cargo fmt --all
cargo check --workspace
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add crates/app/src/ui crates/app/assets/main.css
git commit -m "feat: render keyboard-first workbench"
```

### Task 8: Remove Seed Data, Preserve SSR Compatibility, and Validate

**Files:**
- Inspect: `crates/gateway/src/lib.rs` existing SSR construction and imports.
- Modify: `crates/app/src/lib.rs` compatibility exports and adapter.
- Test: `crates/app` and `crates/gateway`

**Interfaces:**
- `crates/app/src/lib.rs` exports `WorkspaceShell`, `FocusTarget`, `SidebarMode`, and `workspace_note_path_from_location` so the existing gateway imports remain valid. Do not expose gateway transport structs to core app modules.

- [ ] **Step 1: Remove all seeded demo/MVP state**

Delete hardcoded demo note bodies, demo note lists, demo workspace constants, and `demo()` constructors from the app domain/state path. Replace them with `empty()` constructors and explicit empty File Tree/Editor rendering. Keep generic data models and the gateway compatibility adapter; do not add API calls in this task.

- [ ] **Step 2: Compile the full workspace**

```bash
cargo check --workspace
```

Record any gateway call-site mismatch instead of weakening the new state model.

- [ ] **Step 3: Verify the SSR compatibility adapter**

Keep the existing gateway `WorkspaceShell` construction valid by converting its `WorkspaceView` at the shell boundary into renderable application/domain state. Keep filesystem, Git, and API code in the gateway.

- [ ] **Step 4: Run all tests and formatting checks**

```bash
cargo fmt --all -- --check
cargo test --workspace
cargo check --workspace
```

Expected: all app and existing gateway/shared tests pass. Report unrelated baseline failures separately.

- [ ] **Step 5: Run the Dioxus validation command**

Use the repository's available command:

```bash
dx check
```

If `dx check` is unavailable, run `dx build --web` and record the exact tool failure rather than adding unrelated setup.

- [ ] **Step 6: Manually verify the acceptance flows**

Verify in the browser:

- Standard mode shows File Tree and Editor.
- `j` and `k` move File Tree selection.
- Empty File Tree and Editor states render without note data.
- `i` enters Insert and `Escape` returns to Normal.
- `<Space>z` toggles Focus mode.
- `<Space>e` opens the same File Tree as a left overlay in Focus mode.
- Pending leader input appears in the bottom bar.
- Overlay Escape closes the overlay before affecting the Editor.
- Narrow viewport moves File Tree to an overlay.

- [ ] **Step 7: Commit the integration fix**

```bash
git add crates/app crates/gateway
git commit -m "fix: integrate workbench with gateway"
```

## Self-Review Checklist

- [ ] Every approved design goal maps to a task: shell, surfaces, modes, focus, commands, pending keys, responsive behavior, accessibility, and backend boundary.
- [ ] No task adds Neovim parsing, plugin support, search, diagnostics, or remote effects.
- [ ] `--lirox-*` tokens remain the only documented theme-token prefix.
- [ ] Core types and reducer signatures are consistent across tasks.
- [ ] The existing gateway package dependency is repaired without moving backend behavior into the app.
- [ ] No unresolved placeholder or unspecified implementation step remains.
