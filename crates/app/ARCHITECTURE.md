# Keyboard-First Dioxus Web App — AI Agent Build Plan

## 0. Purpose

Build a keyboard-first Dioxus web application with:

- Vim-like modal input.
- Stable command-based interaction.
- A flexible workspace layout.
- Top and bottom status bars.
- Reusable surfaces such as editor, file tree, search, diagnostics, and help.
- Surfaces that can be docked, split, hidden, fullscreen, or rendered as overlays.
- Logical focus separate from browser DOM focus.
- Existing backend API integration through a dedicated effect/service boundary.
- An architecture that can later support partial Neovim configuration compatibility without rewriting the input or command systems.

This document is intended to be executable by an AI coding agent.

The initial version **does not implement Neovim configuration parsing**. It must, however, preserve the architectural seams required to add that later.

---

# 1. Core Architectural Principle

The application must follow this flow:

```text
Raw Browser Input
        │
        ▼
Platform Adapter
        │
        ▼
Normalized InputEvent
        │
        ▼
Input Machine
  ├─ Mode
  ├─ Input Context
  ├─ Pending Key Sequence
  ├─ Counts
  ├─ Operators
  └─ Keymap Resolver
        │
        ▼
CommandInvocation
        │
        ▼
Command Dispatcher
        │
        ▼
Application Logic
   ┌────┴─────┐
   ▼          ▼
State      Effects
Update        │
   │          ▼
   │      Backend API
   │          │
   │          ▼
   └──── ApplicationEvent
        │
        ▼
ApplicationState
        │
        ▼
Dioxus Rendering
   ├─ Top Bar
   ├─ Workspace
   │   ├─ Layout Tree
   │   └─ Surfaces
   ├─ Overlay Stack
   └─ Bottom Bar
```

The most important invariant is:

> Input resolves into stable commands. Commands operate on application state. Dioxus renders the resulting state.

Do not allow raw keyboard events, direct backend calls, or workspace-specific business logic to spread into arbitrary components.

---

# 2. Non-Negotiable Design Invariants

The implementation must preserve these rules.

## 2.1 Commands represent semantic intent

Bad:

```rust
if key == "j" {
    selected += 1;
}
```

Good:

```rust
CommandInvocation {
    id: CommandId::new("file_tree.move_selection"),
    args: CommandArgs::Direction(Direction::Down),
    source: CommandSource::Keyboard,
}
```

Keyboard bindings must map to commands.

Mouse actions, menus, command palette actions, and future Neovim mappings should dispatch the same commands.

---

## 2.2 Surfaces are independent from placement

A file tree is not inherently a sidebar.

Use:

```text
FileTreeSurface
```

not:

```text
Sidebar
```

The same surface must be able to appear:

- docked left,
- docked right,
- inside a split,
- fullscreen,
- inside an overlay,
- hidden.

Surface state must not depend on where it is rendered.

---

## 2.3 Input mode is separate from UI mode

Use two distinct concepts:

```text
Input Mode:
- Normal
- Insert
- Visual
- Command

UI Mode:
- Standard
- Focus
- Zen
```

Do not use one generic `Mode` enum for both.

---

## 2.4 Logical focus is separate from DOM focus

The application must track its own logical focus:

```rust
FocusState {
    active_surface: SurfaceId,
}
```

Browser focus is only required for actual text-entry controls or accessibility behavior.

The currently active editor or file tree must not be inferred from `document.activeElement`.

---

## 2.5 Effects own external interaction

Dioxus components must not call the backend API directly.

Commands may produce effects.

Effects may call:

- backend API,
- clipboard,
- persistence,
- browser navigation,
- timers,
- other platform services.

Results must re-enter the application through application events.

---

## 2.6 Configuration is an input to the system

Configuration must not directly implement behavior.

Configuration should produce canonical application configuration:

```text
Defaults
User config
Runtime config
Future Neovim config
      │
      ▼
 Config Loader / Merger
      │
      ▼
   AppConfig
```

The application consumes `AppConfig`.

Future Neovim support must be implemented as a configuration adapter, not as a second interaction architecture.

---

# 3. Terminology

Use these names consistently across the codebase.

## Command

A semantic action requested by the user or system.

Examples:

```text
workspace.toggle_file_tree
workspace.focus_surface
editor.move
editor.save
editor.enter_insert_mode
overlay.close_top
app.open_command_palette
```

---

## CommandId

Stable identifier for a command.

Prefer string-like IDs instead of relying only on enum variants.

Example:

```rust
CommandId("workspace.toggle_file_tree")
```

Requirements:

- must be stable across releases where possible,
- must be serializable,
- must be usable by configuration,
- must be usable by future Neovim compatibility code,
- must be usable in debugging and command palette UI.

---

## CommandInvocation

A command plus arguments and origin.

```rust
pub struct CommandInvocation {
    pub id: CommandId,
    pub args: CommandArgs,
    pub source: CommandSource,
}
```

---

## CommandSource

Where the invocation originated.

Initial variants:

```rust
pub enum CommandSource {
    Keyboard,
    Pointer,
    CommandPalette,
    Menu,
    System,
}
```

Reserve future compatibility with:

```rust
NeovimConfig,
Plugin,
Automation,
```

without implementing them yet.

---

## CommandRegistry

Registry of all available commands and metadata.

```rust
pub struct CommandDescriptor {
    pub id: CommandId,
    pub title: &'static str,
    pub description: &'static str,
    pub scope: CommandScope,
}
```

The registry must eventually support:

- command palette,
- shortcut help,
- menus,
- documentation,
- future Neovim command mapping.

---

## InputEvent

Normalized input independent of browser event types.

Initial shape:

```rust
pub enum InputEvent {
    Key(KeyStroke),
    Paste(String),
    Pointer(PointerInput),
}
```

Only the platform layer may depend on browser-native keyboard types.

---

## KeyStroke

One normalized key action.

```rust
pub struct KeyStroke {
    pub key: Key,
    pub modifiers: Modifiers,
}
```

---

## KeySequence

One or more `KeyStroke` values interpreted together.

Examples:

```text
j
gg
<Space>ff
Ctrl+P
```

---

## InputMode

Modal keyboard interpretation state.

Initial:

```rust
pub enum InputMode {
    Normal,
    Insert,
}
```

Future-compatible:

```rust
Visual,
Select,
Command,
OperatorPending,
```

Do not overbuild these initially.

---

## InputContext

Represents where input is currently interpreted.

Recommended abstraction:

```rust
pub enum InputScope {
    Global,
    Workspace,
    Surface(SurfaceKind),
    SurfaceInstance(SurfaceId),
    Overlay(OverlayKind),
}
```

Keymap resolution must support layered scopes.

---

## InputState

State of the keyboard/input state machine.

Initial structure:

```rust
pub struct InputState {
    pub mode: InputMode,
    pub pending: KeySequence,
    pub count: Option<u32>,
    pub operator: Option<Operator>,
}
```

Initial implementation may leave `operator` unused, but the type boundary should exist if it remains simple.

---

## ResolveResult

Result of feeding input into the resolver.

```rust
pub enum ResolveResult {
    Matched(CommandInvocation),
    Pending,
    Unhandled,
}
```

This is required for sequences such as:

```text
g
gg
<Space>f
<Space>ff
```

---

## ApplicationEvent

A fact that already occurred.

Commands represent intent.

Events represent facts.

Examples:

```text
Command:
    document.save

Event:
    DocumentSaved
    DocumentSaveFailed
```

---

## Workspace

The current arrangement of application surfaces.

```rust
pub struct WorkspaceState {
    pub layout: LayoutTree,
    pub focus: FocusState,
    pub overlays: OverlayStack,
}
```

---

## Surface

A reusable interactive application view.

Initial recommended surfaces:

```text
Editor
FileTree
Search
Diagnostics
Help
```

Do not create all of them immediately unless needed.

At minimum implement:

- Editor placeholder/surface.
- File tree surface.

---

## SurfaceId

Stable runtime identity for a surface instance.

This must allow multiple editor surfaces in the future.

---

## SurfaceKind

Category of a surface.

```rust
pub enum SurfaceKind {
    Editor,
    FileTree,
    Search,
    Diagnostics,
    Help,
}
```

---

## LayoutTree

Persistent workspace placement.

Recommended model:

```rust
pub enum LayoutNode {
    Surface(SurfaceId),

    Split {
        axis: Axis,
        ratio: f32,
        first: Box<LayoutNode>,
        second: Box<LayoutNode>,
    },

    Tabs {
        active: usize,
        children: Vec<LayoutNode>,
    },
}
```

`Tabs` may be omitted from the first milestone if not needed, but reserve the concept.

---

## Overlay

Presentation of a surface outside normal layout placement.

Example:

```rust
pub struct OverlayEntry {
    pub id: OverlayId,
    pub surface: SurfaceId,
    pub placement: OverlayPlacement,
    pub input_policy: OverlayInputPolicy,
}
```

---

## OverlayStack

Ordered stack of visible overlays.

Top-most overlay receives first input resolution priority.

---

## UiMode

Global presentation mode.

Initial:

```rust
pub enum UiMode {
    Standard,
    Focus,
}
```

Future:

```text
Zen
Presentation
```

---

## Effect

Any side effect or operation outside pure application state mutation.

Examples:

```text
BackendRequest
ClipboardWrite
PersistConfig
Navigate
```

---

# 4. Context Boundaries

## 4.1 Platform Context

Responsibilities:

- browser event conversion,
- keyboard normalization,
- DOM-specific behavior,
- browser focus when needed,
- clipboard implementation,
- persistence implementation,
- URL/navigation integration.

Must not contain:

- command semantics,
- editor behavior,
- workspace behavior,
- keymap rules.

---

## 4.2 Input Context

Responsibilities:

- modes,
- key sequences,
- keymap lookup,
- pending sequence state,
- counts,
- operators,
- layered input scopes,
- conversion from `InputEvent` to `ResolveResult`.

Must not:

- modify editor state,
- call backend,
- render Dioxus components.

---

## 4.3 Command Context

Responsibilities:

- command IDs,
- command descriptors,
- invocation structure,
- registry,
- dispatch routing.

Must remain independent from physical keyboard layout.

---

## 4.4 Application Context

Responsibilities:

- root state,
- command handling,
- event handling,
- state transitions,
- effect production.

This is the orchestration layer.

---

## 4.5 Workspace Context

Responsibilities:

- surfaces,
- layout tree,
- focus,
- overlays,
- UI mode,
- pane/split operations.

---

## 4.6 Domain Context

Responsibilities:

- file/document/project models,
- editor-related domain data,
- entities returned from backend,
- business logic unrelated to UI layout.

---

## 4.7 Effect Context

Responsibilities:

- execute backend/API operations,
- execute browser/platform operations,
- convert external results into `ApplicationEvent`.

---

## 4.8 Rendering Context

Responsibilities:

- Dioxus components,
- rendering state,
- dispatching commands,
- rendering layout tree,
- rendering overlays,
- rendering status bars.

Dioxus components should generally:

```text
read state
render state
dispatch commands
```

They should not own core application behavior.

---

# 5. Suggested Repository Structure

Use a single crate initially unless project scale already justifies a Cargo workspace.

Recommended initial structure:

```text
src/
├── app/
│   ├── mod.rs
│   ├── state.rs
│   ├── event.rs
│   ├── reducer.rs
│   └── dispatcher.rs
│
├── command/
│   ├── mod.rs
│   ├── id.rs
│   ├── invocation.rs
│   ├── registry.rs
│   └── args.rs
│
├── input/
│   ├── mod.rs
│   ├── key.rs
│   ├── sequence.rs
│   ├── mode.rs
│   ├── state.rs
│   ├── scope.rs
│   ├── keymap.rs
│   └── resolver.rs
│
├── workspace/
│   ├── mod.rs
│   ├── state.rs
│   ├── surface.rs
│   ├── layout.rs
│   ├── overlay.rs
│   └── focus.rs
│
├── domain/
│   ├── mod.rs
│   ├── file.rs
│   └── document.rs
│
├── effects/
│   ├── mod.rs
│   ├── effect.rs
│   └── executor.rs
│
├── backend/
│   ├── mod.rs
│   ├── client.rs
│   └── models.rs
│
├── config/
│   ├── mod.rs
│   ├── app_config.rs
│   ├── defaults.rs
│   └── keybindings.rs
│
├── platform/
│   ├── mod.rs
│   └── web/
│       ├── mod.rs
│       ├── keyboard.rs
│       ├── clipboard.rs
│       └── storage.rs
│
└── ui/
    ├── mod.rs
    ├── shell.rs
    ├── top_bar.rs
    ├── bottom_bar.rs
    ├── workspace_renderer.rs
    ├── layout_renderer.rs
    ├── overlay_renderer.rs
    └── surfaces/
        ├── mod.rs
        ├── editor.rs
        └── file_tree.rs
```

Future addition:

```text
src/config_neovim/
├── mod.rs
├── parser.rs
├── keymap_adapter.rs
├── option_adapter.rs
└── command_adapter.rs
```

Do not create `config_neovim` in the initial implementation unless using an empty feature-gated placeholder is genuinely useful.

---

# 6. Root State Model

Recommended initial root state:

```rust
pub struct ApplicationState {
    pub input: InputState,
    pub workspace: WorkspaceState,
    pub domain: DomainState,
    pub config: AppConfig,
    pub status: StatusState,
}
```

Optional:

```rust
pub struct DomainState {
    pub files: FileState,
    pub documents: DocumentState,
}
```

Do not place backend clients inside `ApplicationState`.

---

# 7. Status Bar Model

The top and bottom bars are observers of state.

They do not own application state.

## Top bar

Initial responsibilities:

- workspace/project title,
- current path or breadcrumbs,
- optional active surface label.

## Bottom bar

Initial responsibilities:

- current input mode,
- pending key sequence,
- active surface,
- transient status message,
- optional backend/loading/error state.

Example:

```text
 NORMAL  src/main.rs                 <Space>f_     Ln 24, Col 8
```

Recommended state:

```rust
pub struct StatusState {
    pub message: Option<StatusMessage>,
}
```

Input mode and pending keys should be read directly from `InputState`, not duplicated unnecessarily.

---

# 8. Workspace Model

Recommended:

```rust
pub struct WorkspaceState {
    pub ui_mode: UiMode,
    pub layout: LayoutTree,
    pub surfaces: SurfaceRegistry,
    pub focus: FocusState,
    pub overlays: OverlayStack,
}
```

---

# 9. Surface Registry

Recommended representation:

```rust
pub struct SurfaceRegistry {
    surfaces: HashMap<SurfaceId, SurfaceState>,
}
```

Possible surface state:

```rust
pub enum SurfaceState {
    Editor(EditorSurfaceState),
    FileTree(FileTreeSurfaceState),
}
```

Each surface must have an identity independent from layout placement.

---

# 10. Initial Layout

Default application layout:

```text
┌──────────────────────────────────────────────┐
│ Top Bar                                      │
├───────────────┬──────────────────────────────┤
│               │                              │
│ File Tree     │ Editor                       │
│               │                              │
│               │                              │
├───────────────┴──────────────────────────────┤
│ Bottom Bar                                   │
└──────────────────────────────────────────────┘
```

Workspace layout:

```text
Split(Horizontal)
├── FileTreeSurface
└── EditorSurface
```

Top and bottom bars are not part of the `LayoutTree`.

They belong to the shell.

---

# 11. Focus Mode

Focus mode must be implemented as `UiMode`, not `InputMode`.

Expected behavior:

```text
UiMode::Standard

Top bar: visible
Bottom bar: visible
File tree: docked
Editor: main area
```

```text
UiMode::Focus

Top bar: configurable, initially visible
Bottom bar: visible/minimal
Editor: occupies workspace
File tree: removed from persistent layout
File tree may still be opened as overlay
```

Avoid destructive layout mutation where possible.

Prefer a presentation policy or saved layout strategy that makes entering/leaving Focus mode reversible.

Initial acceptable implementation:

- store standard layout,
- switch to focus layout,
- restore standard layout on exit.

Later improvement:

- derive effective layout from base layout + UI mode.

---

# 12. Overlay System

Initial supported placement:

```rust
pub enum OverlayPlacement {
    Centered,
    LeftPanel,
    RightPanel,
    Fullscreen,
}
```

Initial input policy:

```rust
pub enum OverlayInputPolicy {
    Modal,
    NonModal,
}
```

Expected input rule:

```text
Top-most modal overlay
        ↓
Focused surface
        ↓
Workspace
        ↓
Global
```

---

# 13. Input Resolution Order

The resolver must support layered keymaps.

Recommended precedence:

```text
1. Top-most overlay instance
2. Overlay kind
3. Focused surface instance
4. Focused surface kind
5. Current input mode
6. Workspace
7. Global
```

Avoid hardcoding this in multiple places.

Implement one function returning active scopes:

```rust
fn active_input_scopes(state: &ApplicationState) -> Vec<InputScope>;
```

Resolver checks scopes in precedence order.

---

# 14. Keymap Representation

Recommended:

```rust
pub struct KeyBinding {
    pub scope: InputScopePattern,
    pub mode: Option<InputMode>,
    pub sequence: KeySequence,
    pub command: CommandTemplate,
}
```

Do not couple keymaps directly to Rust closures.

Future Neovim compatibility requires keybindings to be data.

---

# 15. Key Sequence Resolver

Implement prefix-aware resolution.

Required behavior:

Given bindings:

```text
g        -> no command because it is a prefix
gg       -> editor.goto_top
gd       -> editor.goto_definition
```

Then:

```text
Input: g
Result: Pending

Input: g
Result: Matched(editor.goto_top)
```

Use either:

- trie,
- prefix-indexed map,
- equivalent efficient structure.

A trie is recommended if implementation remains clear.

Do not optimize prematurely.

---

# 16. Counts

Reserve count handling from the start.

Expected future behavior:

```text
3j
10k
2gg
```

Initial implementation target:

- support numeric prefix in Normal mode,
- attach count to command arguments when a command supports it,
- default count to `1`,
- reset count after completed/unhandled sequence according to clear rules.

Do not implement full Vim grammar yet.

---

# 17. Operators

Do not implement full Vim operator/motion semantics in the first milestone.

However, avoid an architecture that makes this impossible.

Reserve:

```rust
pub enum Operator {
    Delete,
    Change,
    Yank,
}
```

and/or a pending operator field if low-cost.

Future target:

```text
d w
d 3 w
c i w
y y
```

The input machine must remain extensible enough to support this later.

---

# 18. Command Dispatch

Recommended dispatch API:

```rust
pub fn dispatch(
    state: &mut ApplicationState,
    invocation: CommandInvocation,
) -> Vec<Effect>;
```

Alternative reducer style is acceptable.

Requirements:

- deterministic state mutation,
- effects returned explicitly,
- no direct backend calls inside command handler,
- unknown command returns a controlled error/status event,
- command handlers are testable without Dioxus.

---

# 19. Application Events

Recommended:

```rust
pub enum ApplicationEvent {
    Backend(BackendEvent),
    Workspace(WorkspaceEvent),
    Status(StatusEvent),
}
```

Examples:

```rust
BackendEvent::FileTreeLoaded(...)
BackendEvent::DocumentLoaded(...)
BackendEvent::DocumentSaved(...)
BackendEvent::RequestFailed(...)
```

Process events via:

```rust
pub fn apply_event(
    state: &mut ApplicationState,
    event: ApplicationEvent,
) -> Vec<Effect>;
```

Event handling may generate follow-up effects.

---

# 20. Effects

Recommended initial effect enum:

```rust
pub enum Effect {
    Backend(BackendEffect),
    Clipboard(ClipboardEffect),
    Persist(PersistEffect),
}
```

The existing backend API must be wrapped in the backend effect executor.

Do not expose backend transport DTOs to unrelated UI code unless they are also appropriate domain types.

---

# 21. Backend Integration

The backend already exists.

Create a frontend boundary:

```rust
#[async_trait(?Send)]
pub trait BackendService {
    async fn load_file_tree(&self, request: LoadFileTreeRequest)
        -> Result<FileTreeData, BackendError>;

    async fn load_document(&self, request: LoadDocumentRequest)
        -> Result<DocumentData, BackendError>;

    async fn save_document(&self, request: SaveDocumentRequest)
        -> Result<(), BackendError>;
}
```

Exact methods must match the real backend API.

Rules:

- backend service implementation owns transport details,
- application logic owns intent and state transitions,
- UI must never know API endpoint URLs,
- failures become application events,
- loading state should live in domain/application state.

---

# 22. Dioxus Integration

Dioxus is the rendering/reactivity layer, not the application architecture.

Recommended root context:

```rust
pub struct AppContext {
    pub state: Signal<ApplicationState>,
    pub dispatcher: Dispatcher,
}
```

Components may:

- read state,
- derive presentation,
- dispatch commands.

Components should not:

- resolve raw keymaps,
- call backend directly,
- own global application rules.

---

# 23. Keyboard Event Capture

Implement a centralized keyboard capture path.

Recommended:

```text
Dioxus keydown
      │
      ▼
platform::web::keyboard::normalize
      │
      ▼
InputEvent::Key
      │
      ▼
input resolver
      │
      ▼
CommandInvocation
```

Prevent browser defaults only when resolution explicitly requires it.

Recommended resolution metadata:

```rust
pub struct ResolvedCommand {
    pub invocation: CommandInvocation,
    pub prevent_default: bool,
}
```

Do not blanket-call `prevent_default`.

---

# 24. Editable DOM Controls

Keyboard interception must respect editable elements.

When a browser text input/textarea/contenteditable owns input:

- Insert-mode characters should generally pass through.
- Global navigation bindings should not unexpectedly hijack normal typing.
- Escape may still be intentionally intercepted where appropriate.

Centralize the policy.

Do not scatter `is_input_element` checks across components.

---

# 25. Default Initial Commands

Implement at least:

```text
app.open_command_palette
workspace.toggle_file_tree
workspace.toggle_focus_mode
workspace.focus_next_surface
workspace.focus_previous_surface
overlay.close_top

file_tree.move_up
file_tree.move_down
file_tree.open_selected

editor.enter_normal_mode
editor.enter_insert_mode
editor.save
```

Optional if editor implementation is still placeholder:

```text
editor.move_up
editor.move_down
```

---

# 26. Default Initial Keybindings

Suggested defaults:

```text
Global / Normal
<Space>e   workspace.toggle_file_tree
<Space>f   app.open_command_palette
Esc        overlay.close_top

Workspace / Normal
Ctrl+w h   workspace.focus_previous_surface
Ctrl+w l   workspace.focus_next_surface

FileTree / Normal
j          file_tree.move_down
k          file_tree.move_up
Enter      file_tree.open_selected

Editor / Normal
i          editor.enter_insert_mode
:w mapping is optional; prefer Ctrl+s or leader mapping initially
<Space>s   editor.save

Editor / Insert
Esc        editor.enter_normal_mode
```

Exact defaults may change.

The important requirement is that defaults are represented as data in `AppConfig`.

---

# 27. Configuration Model

Recommended:

```rust
pub struct AppConfig {
    pub keymaps: Vec<KeyBindingConfig>,
    pub ui: UiConfig,
    pub editor: EditorConfig,
}
```

Load order:

```text
Built-in defaults
      ↓
User config
      ↓
Runtime overrides
      ↓
Canonical AppConfig
```

Future:

```text
Built-in defaults
      ↓
User config
      ↓
Neovim config adapter
      ↓
Runtime overrides
      ↓
Canonical AppConfig
```

Do not let future Neovim code bypass `AppConfig`.

---

# 28. Neovim Compatibility Constraints

Initial version does not implement Neovim compatibility.

All architecture decisions must satisfy these constraints.

## 28.1 Keybindings are data

Do not encode all mappings in `match key`.

---

## 28.2 Commands use stable IDs

Future adapter must be able to map:

```lua
vim.keymap.set("n", "<leader>e", ...)
```

to:

```text
workspace.toggle_file_tree
```

without knowing Rust implementation details.

---

## 28.3 Leader key exists conceptually

AppConfig should support:

```rust
pub struct KeymapConfig {
    pub leader: KeyStroke,
    pub bindings: Vec<KeyBindingConfig>,
}
```

Default leader may be Space.

---

## 28.4 Modes are explicit

Neovim-compatible adapter must later be able to target modes.

---

## 28.5 Input sequences support prefixes

Required for leader sequences and multi-key mappings.

---

## 28.6 Command aliases can be added later

Leave room for:

```text
:Explorer
:FindFiles
:write
```

mapping onto stable internal command IDs.

---

## 28.7 Config frontend is replaceable

Future architecture:

```text
init.lua
   │
   ▼
Neovim Config Adapter
   │
   ▼
AppConfigPatch
   │
   ▼
Config Merger
   │
   ▼
AppConfig
```

No application subsystem should require Neovim-specific types.

---

# 29. AI Agent Implementation Phases

The coding agent must implement in the following order unless the existing repository strongly requires a different sequence.

---

## Phase 0 — Repository Reconnaissance

Tasks:

1. Inspect current Cargo workspace and Dioxus app structure.
2. Identify existing backend client.
3. Identify current global state approach.
4. Identify current UI components.
5. Identify any existing keyboard event handling.
6. Run existing tests.
7. Run existing build/check command.
8. Record baseline failures before changing code.

Output:

- brief architecture note in implementation log,
- no redesign yet.

Acceptance:

- current build/test state is known,
- existing backend API entry points are identified.

---

## Phase 1 — Core Command Model

Create:

```text
command/id.rs
command/args.rs
command/invocation.rs
command/registry.rs
```

Implement:

- `CommandId`,
- `CommandSource`,
- `CommandArgs`,
- `CommandInvocation`,
- `CommandDescriptor`,
- `CommandRegistry`.

Tests:

- command ID equality,
- registry lookup,
- duplicate command ID rejection or deterministic handling.

Acceptance:

- commands are independent from Dioxus and browser code.

---

## Phase 2 — Input Primitives

Create:

```text
input/key.rs
input/sequence.rs
input/mode.rs
input/scope.rs
input/state.rs
```

Implement:

- normalized `Key`,
- modifiers,
- `KeyStroke`,
- `KeySequence`,
- `InputMode`,
- `InputScope`,
- `InputState`.

Tests:

- key sequence equality,
- modifier normalization,
- sequence parsing if a textual parser is included.

Acceptance:

- no browser-native key event types outside platform adapter.

---

## Phase 3 — Keymap and Resolver

Create:

```text
input/keymap.rs
input/resolver.rs
```

Implement:

- data-driven bindings,
- layered scopes,
- mode filtering,
- prefix detection,
- `Matched/Pending/Unhandled`.

Tests:

```text
j      -> Matched
g      -> Pending
gg     -> Matched
gd     -> Matched
x      -> Unhandled
```

Also test precedence:

```text
Overlay > Surface > Mode > Workspace > Global
```

Acceptance:

- keymaps are configuration data,
- resolver performs no application mutation.

---

## Phase 4 — Workspace Model

Create:

```text
workspace/surface.rs
workspace/layout.rs
workspace/focus.rs
workspace/overlay.rs
workspace/state.rs
```

Implement:

- `SurfaceId`,
- `SurfaceKind`,
- `SurfaceState`,
- `SurfaceRegistry`,
- `LayoutTree`,
- `FocusState`,
- `OverlayStack`,
- `UiMode`.

Tests:

- layout can contain file tree and editor,
- focus changes are valid,
- overlay push/pop order,
- missing surface IDs fail predictably.

Acceptance:

- surfaces have no placement assumptions.

---

## Phase 5 — Application State and Reducer

Create:

```text
app/state.rs
app/event.rs
app/reducer.rs
app/dispatcher.rs
```

Implement root state and command handling.

Initial handlers:

```text
workspace.toggle_file_tree
workspace.toggle_focus_mode
workspace.focus_next_surface
workspace.focus_previous_surface
overlay.close_top
editor.enter_normal_mode
editor.enter_insert_mode
```

Tests:

- state transitions are pure/deterministic,
- toggling focus mode is reversible,
- closing overlay restores prior interaction target,
- changing input mode updates `InputState`.

Acceptance:

- tests run without Dioxus rendering.

---

## Phase 6 — Effects and Backend Boundary

Create:

```text
effects/effect.rs
effects/executor.rs
backend/client.rs
```

Wrap existing backend client.

Initial flow:

```text
file_tree.open_selected
      ↓
Command handler
      ↓
Backend effect / document load
      ↓
Backend service
      ↓
ApplicationEvent
      ↓
Application state update
```

Tests:

- mocked backend success,
- mocked backend error,
- loading state transitions,
- result events update domain state.

Acceptance:

- no Dioxus component calls backend directly.

---

## Phase 7 — Configuration

Create:

```text
config/app_config.rs
config/defaults.rs
config/keybindings.rs
```

Move default keymaps into config.

Implement:

- leader key,
- default bindings,
- config merge abstraction.

Initial user config persistence may be deferred.

Tests:

- defaults produce expected bindings,
- overriding one binding works,
- leader expansion works if implemented.

Acceptance:

- resolver consumes config-produced keymaps.

---

## Phase 8 — Dioxus Shell

Implement:

```text
ui/shell.rs
ui/top_bar.rs
ui/bottom_bar.rs
```

Shell structure:

```text
AppShell
├── TopBar
├── WorkspaceRenderer
├── OverlayRenderer
└── BottomBar
```

Acceptance:

- top/bottom bars are always structurally separate from workspace layout,
- bars derive data from state.

---

## Phase 9 — Layout Renderer

Implement:

```text
ui/workspace_renderer.rs
ui/layout_renderer.rs
```

Requirements:

- recursively render `LayoutTree`,
- render splits,
- render surfaces by `SurfaceId`,
- do not embed file-tree/editor-specific behavior into layout renderer.

Acceptance:

- swapping layout nodes changes placement without changing surface implementation.

---

## Phase 10 — Initial Surfaces

Implement:

```text
ui/surfaces/editor.rs
ui/surfaces/file_tree.rs
```

Minimum editor:

- active/inactive visual state,
- insert/normal status,
- backend-loaded document display or placeholder.

Minimum file tree:

- selection,
- movement commands,
- open-selected command.

Acceptance:

- file tree can render docked or in overlay using same state.

---

## Phase 11 — Overlay Renderer

Implement:

```text
ui/overlay_renderer.rs
```

Required first overlay:

- file tree overlay OR command palette.

Recommended first demonstration:

```text
Standard mode:
File tree docked.

Focus mode:
Editor fullscreen in workspace.
<Space>e opens same file tree surface as left overlay.
```

This validates the surface/placement architecture.

Acceptance:

- no duplicate file-tree state,
- same `SurfaceId`/surface state may be rendered in alternate placement according to policy,
- overlay captures higher-precedence keyboard input.

---

## Phase 12 — Centralized Keyboard Pipeline

Implement centralized key handling:

```text
Dioxus event
   ↓
platform::web::keyboard
   ↓
InputEvent
   ↓
InputResolver
   ↓
CommandInvocation
   ↓
Dispatcher
```

Implement prevent-default policy.

Acceptance tests/manual verification:

- `j/k` navigate file tree,
- `i` enters insert mode in editor,
- `Esc` returns Normal mode,
- leader sequences show as pending,
- top overlay handles Escape before editor,
- normal typing is not incorrectly intercepted in editable controls.

---

## Phase 13 — Bottom Bar Pending Input

Bottom bar displays:

- `NORMAL` or `INSERT`,
- pending key sequence,
- active surface,
- transient status.

Example:

```text
NORMAL  FileTree  <Space>f_
```

Acceptance:

- pending sequence appears immediately,
- clears after match or cancellation,
- mode changes are visible.

---

## Phase 14 — Command Palette

Optional for first usable release but strongly recommended.

Implement command palette from `CommandRegistry`.

Requirements:

- list registered commands,
- fuzzy/simple search,
- execute command by ID,
- show known keybinding if available.

Acceptance:

- palette uses same command dispatcher,
- no command-specific behavior duplicated.

---

# 30. Required Tests

At minimum, unit test the following.

## Input

- single-key mapping,
- multi-key prefix,
- unresolved prefix,
- context precedence,
- mode-specific mapping,
- count parsing,
- pending state reset.

## Commands

- registry lookup,
- dispatch unknown command,
- arguments forwarded correctly.

## Workspace

- layout construction,
- focus switching,
- overlay stack,
- focus-mode transition,
- file tree state survives placement change.

## Effects

- backend request success,
- backend request failure,
- event re-entry.

## Config

- default keymap,
- user override,
- leader mapping.

---

# 31. Integration Tests / Behavioral Scenarios

## Scenario A — File tree navigation

Given:

```text
InputMode = Normal
Focused surface = FileTree
```

When:

```text
j
```

Then:

```text
file_tree.move_down
```

is dispatched and selected entry changes.

---

## Scenario B — Editor Insert mode

Given:

```text
Focused surface = Editor
InputMode = Normal
```

When:

```text
i
```

Then:

```text
InputMode = Insert
```

When:

```text
Esc
```

Then:

```text
InputMode = Normal
```

---

## Scenario C — Prefix binding

Given:

```text
<Space>e = workspace.toggle_file_tree
```

When:

```text
<Space>
```

Then:

```text
ResolveResult::Pending
```

and bottom bar shows pending input.

When:

```text
e
```

Then the command is dispatched.

---

## Scenario D — Focus mode

Given standard layout:

```text
FileTree | Editor
```

When:

```text
workspace.toggle_focus_mode
```

Then:

```text
UiMode = Focus
Editor occupies workspace
```

File tree state remains alive.

---

## Scenario E — File tree overlay in Focus mode

Given:

```text
UiMode = Focus
```

When:

```text
workspace.toggle_file_tree
```

Then:

```text
FileTree appears as overlay
```

The same file tree state and selection are retained.

---

## Scenario F — Overlay input precedence

Given:

```text
Editor focused
Command palette overlay open
```

When:

```text
Esc
```

Then:

```text
overlay.close_top
```

executes.

The editor's mapping does not run.

---

## Scenario G — Backend document load

Given:

```text
FileTree selection points to document
```

When:

```text
Enter
```

Then:

```text
file_tree.open_selected
```

produces backend effect.

On success:

```text
ApplicationEvent::DocumentLoaded
```

updates editor/domain state.

---

# 32. Error Handling Rules

Never silently ignore structural errors.

Use typed errors for:

```text
UnknownCommand
MissingSurface
InvalidLayout
BackendFailure
InvalidKeyBinding
DuplicateCommand
```

User-facing failures should update status state where appropriate.

Internal invariant violations should be logged clearly.

Avoid panics for recoverable input/config/backend failures.

---

# 33. Logging / Diagnostics

Add lightweight tracing around:

```text
InputEvent
ResolveResult
CommandInvocation
Effect
ApplicationEvent
```

Recommended log structure:

```text
input: key=j mode=Normal scope=FileTree
resolve: file_tree.move_down
command: file_tree.move_down source=Keyboard
```

This will be especially valuable when Neovim-compatible mappings are added.

Do not log sensitive backend payloads.

---

# 34. Performance Constraints

Do not optimize early, but maintain:

- input resolution should be synchronous and cheap,
- keymap lookup should avoid scanning the entire application state unnecessarily,
- Dioxus subscriptions should avoid rerendering the entire application for every cursor/input update where practical,
- backend activity must remain async,
- surface state must remain addressable independently.

Start simple and profile later.

---

# 35. Accessibility Requirements

Keyboard-first does not mean keyboard-only.

All significant commands should remain invokable through accessible UI where appropriate.

Requirements:

- semantic buttons for clickable controls,
- visible focus indication where DOM focus is relevant,
- logical selection visually distinct,
- overlays expose correct accessibility semantics,
- avoid hijacking standard text-editing shortcuts inside editable controls,
- pointer interaction dispatches same semantic commands.

---

# 36. CSS / Presentation Constraints

Architecture must not depend on CSS positioning assumptions.

Do not let:

```text
.file-tree { position: fixed; left: 0; }
```

become the workspace model.

Rendering decides layout based on state.

Recommended conceptual CSS areas:

```text
app-shell
top-bar
workspace
split
surface
overlay-layer
bottom-bar
```

---

# 37. Definition of First Architecture-Complete Milestone

The first milestone is complete when all of the following work:

1. Application starts in Standard UI mode.
2. Top bar renders.
3. Bottom bar renders.
4. Workspace contains FileTree + Editor.
5. File tree and editor are independent surfaces.
6. Logical focus can move between surfaces.
7. `j/k` navigate file tree in Normal mode.
8. `i` enters Insert mode in editor.
9. `Esc` returns to Normal mode.
10. Multi-key leader binding works.
11. Pending sequence appears in bottom bar.
12. Focus mode hides/detaches docked file tree.
13. File tree can be opened as overlay in Focus mode.
14. Same file-tree state survives docked/overlay transitions.
15. Backend API is called only through effect/service layer.
16. Backend result enters application as an event.
17. Core command/input/workspace tests do not require Dioxus.
18. Keybindings live in configuration data.
19. Commands have stable IDs.
20. No Neovim-specific code exists in the core architecture.

---

# 38. Definition of Done for Every Agent Task

For each implementation task, the coding agent must:

1. Inspect relevant existing code before editing.
2. Preserve existing working behavior unless task explicitly changes it.
3. Make the smallest coherent architectural change.
4. Add or update tests.
5. Run formatting.
6. Run static checks.
7. Run unit tests.
8. Run project build.
9. Report any pre-existing failures separately.
10. Avoid leaving dead compatibility shims without explanation.
11. Update architecture docs when introducing a new core concept.

Recommended Rust validation:

```bash
cargo fmt --check
cargo check
cargo test
```

Use the repository's actual Dioxus build command as well if present.

---

# 39. Agent Guardrails

The coding agent must not:

- move command semantics into components for convenience,
- directly call backend APIs from UI components,
- model sidebar/overlay as separate file-tree implementations,
- use DOM focus as application focus,
- create a giant boolean-driven workspace state,
- hardcode all keybindings in event handlers,
- couple keymaps to Rust closures,
- add Neovim-specific types to core modules,
- implement arbitrary Lua execution in the initial version,
- over-engineer full Vim grammar before basic modal input works,
- add a plugin system before command/config boundaries are stable.

---

# 40. Future Neovim Integration Plan

Not part of initial implementation.

Target architecture:

```text
init.lua
   │
   ▼
Neovim Config Adapter
   ├─ vim.g.mapleader
   ├─ vim.keymap.set
   ├─ selected vim.opt entries
   └─ selected :command mappings
   │
   ▼
AppConfigPatch
   │
   ▼
Config Merger
   │
   ▼
AppConfig
   │
   ├─ keymaps
   ├─ options
   └─ command aliases
```

Later compatibility levels:

## Level 1

Support selected configuration semantics:

```text
vim.g.mapleader
vim.keymap.set
selected vim.opt
basic mode mappings
```

## Level 2

Potentially support:

```text
user commands
simple autocmd-like hooks
mapping callbacks translated to supported internal operations
```

## Level 3

Only if justified:

```text
partial plugin compatibility
runtime APIs
embedded Lua
```

Do not make Level 3 a prerequisite for Levels 1 or 2.

---

# 41. Architecture Decision Summary

The implementation should optimize for these properties:

```text
Keyboard-first
but not keyboard-only

Vim-inspired
but not hardcoded to Vim

Neovim-compatible later
but not Neovim-dependent now

Dioxus-rendered
but not Dioxus-owned architecture

Flexible surfaces
without placement-specific state

Backend-integrated
without backend coupling in components

Configurable
without config implementing behavior
```

---

# 42. Final Target Mental Model

```text
                    ┌────────────────────┐
                    │      AppConfig     │
                    │ keymaps / options  │
                    └─────────┬──────────┘
                              │
                              ▼
┌──────────┐        ┌────────────────────┐
│ Keyboard │───────▶│    Input Machine   │
├──────────┤        │ mode / scopes /    │
│ Pointer  │───────▶│ sequence / count   │
└──────────┘        └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ CommandInvocation  │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │   App Dispatcher   │
                    └──────┬───────┬─────┘
                           │       │
                     state │       │ effect
                           ▼       ▼
                  ┌────────────┐  ┌────────────┐
                  │ App State  │  │ Backend/API│
                  └─────┬──────┘  └─────┬──────┘
                        │               │
                        │         ApplicationEvent
                        │               │
                        └───────┬───────┘
                                ▼
                     ┌────────────────────┐
                     │  Dioxus Rendering  │
                     ├────────────────────┤
                     │ Top Bar            │
                     │ Workspace          │
                     │  ├─ Layout Tree    │
                     │  └─ Surfaces       │
                     │ Overlay Stack      │
                     │ Bottom Bar         │
                     └────────────────────┘
```

The architecture is successful when future features can be added by extending stable concepts instead of bypassing them.

Examples:

```text
New shortcut
    -> keymap data

New action
    -> command registry + handler

New pane
    -> surface

New placement
    -> layout/overlay policy

New backend operation
    -> effect + event

New config source
    -> config adapter

Future Neovim support
    -> config adapter + command aliases
```

That is the intended long-term shape of the application.
