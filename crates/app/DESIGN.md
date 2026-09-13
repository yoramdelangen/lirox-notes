# LiroxNotes Initial Design

## Product

LiroxNotes is a keyboard-first notes workbench. It should feel closer to a
TUI, Vim/Neovim, or an IDE workbench than to a document website.

The first version is an architectural UI slice. It demonstrates the shell,
keyboard interaction model, portable surfaces, focus mode, and overlays with
an empty initial workspace. It does not implement Neovim configuration
parsing, backend data loading, or backend effects yet.

## v1 Goals

- Render a stable top bar, workbench, and bottom status bar.
- Render an Editor and File Tree as independent surfaces.
- Support Normal and Insert input modes.
- Resolve keyboard input into data-driven commands.
- Track logical focus separately from browser DOM focus.
- Toggle the File Tree, switch focus, enter Focus mode, and open the File Tree
  as an overlay.
- Show the active workspace, selected note when available, surface, mode, and
  pending key sequence.
- Keep the backend boundary ready without coupling the UI to transport details.

## v1 Non-Goals

- Neovim configuration parsing or plugin compatibility.
- Full Vim operators, motions, Visual mode, or Command mode.
- Search implementation, diagnostics, settings, or a complete command palette.
- Remote API calls, persistence, Git operations, or filesystem access.
- A general-purpose layout editor.

## Product Model

### Workspace

A workspace is the active logical context. The frontend treats it as opaque.
The initial slice starts with an empty workspace and renders its empty states;
workspace contents will arrive through the later gateway API integration.

### Workbench

The workbench controls placement. It does not define surface behavior.

Default layout:

```text
+------------------------------------------------+
| Top Bar                                        |
+-------------------+----------------------------+
| File Tree         | Editor                     |
|                   |                            |
+-------------------+----------------------------+
| Bottom Status Bar                              |
+------------------------------------------------+
```

### Surface

A surface is a reusable functional area. Initial surfaces:

- `Editor`: displays and edits the active note, with a visible mode and path.
- `FileTree`: displays hierarchical notes, selection, and the active note.

Surface state is independent of placement. The same `FileTree` state is used
when docked and when opened as an overlay.

### Overlay

An overlay is temporary UI above the workbench. The first overlay is the File
Tree in Focus mode, presented as a left panel while the Editor remains visible
underneath.

## Shell

The shell remains structurally stable while the workspace or UI mode changes:

```text
AppShell
|- TopBar
|- Workbench
|  |- LayoutRenderer
|  `- OverlayRenderer
`- BottomStatusBar
```

Top Bar contents:

- application/workspace name;
- current note path or breadcrumbs;
- compact actions for File Tree and Focus mode.

Bottom Status Bar contents:

- `NORMAL` or `INSERT`;
- active workspace and surface;
- current note path;
- pending key sequence;
- transient status message.

Bars observe application state. They do not own global behavior.

## Visual Language

The visual language is restrained, technical, calm, and TUI-inspired:

- dark neutral backgrounds;
- crisp, low-contrast structural borders;
- compact spacing and information-dense status areas;
- one controlled accent for active and actionable states;
- clear text hierarchy and no decorative dashboard chrome;
- no gradients, glossy effects, oversized cards, or excessive rounding;
- the Editor remains the visual center of gravity.

### Styling

Tailwind CSS is the primary styling system. Use Tailwind utility classes for
layout, spacing, typography, responsive behavior, and component states. Keep
custom CSS for shared theme variables, complex surface styling, and browser or
editor integration only.

### Theme Tokens

Theme colors are Lirox-owned semantic variables whose roles and palette
structure align with Neovim theming. They are not required to reproduce any
specific Neovim colorscheme. Components must use these tokens, directly or
through Tailwind utilities, instead of raw color literals.

```text
--lirox-bg             application background
--lirox-bg-alt         alternate background
--lirox-surface        panel/editor surface
--lirox-surface-alt    selected or hovered surface
--lirox-fg             primary text
--lirox-muted          secondary text
--lirox-subtle         inactive chrome and low-emphasis text
--lirox-border         structural border
--lirox-accent         primary action and active state
--lirox-accent-soft    cursor and subtle active treatment
--lirox-selection      text and item selection background
--lirox-success        successful state
--lirox-warning        warning state
--lirox-error          error state
--lirox-info           informational state
```

## Modes and Focus

Input mode and UI mode are separate state values.

Input modes:

- `Normal`: navigation and commands.
- `Insert`: text editing; `Escape` returns to Normal.

UI modes:

- `Standard`: File Tree docked beside the Editor.
- `Focus`: Editor fills the workbench; File Tree is hidden from the layout.

Logical focus identifies the surface that owns interaction. Initial focus
cues are a stronger surface header/edge, active selection, and an accent
indicator. Do not use a large glowing panel outline or infer focus from
`document.activeElement`.

## Commands and Input

Raw browser events are normalized before resolution:

```text
Browser keydown
  -> platform keyboard adapter
  -> InputEvent
  -> layered keymap resolver
  -> CommandInvocation
  -> dispatcher
  -> application state/effects
```

Keybindings are data, not `match key` logic embedded in components. Commands
use stable string identifiers so pointer actions, menus, a future command
palette, and future Neovim adapters can share the same behavior.

Initial commands:

```text
workspace.toggle_file_tree
workspace.toggle_focus_mode
workspace.focus_next_surface
workspace.focus_previous_surface
file_tree.move_up
file_tree.move_down
file_tree.open_selected
editor.enter_normal_mode
editor.enter_insert_mode
```

Initial bindings:

```text
Normal: <Space>e       toggle File Tree
Normal: <Space>z       toggle Focus mode
Normal: Ctrl+w h       focus previous surface
Normal: Ctrl+w l       focus next surface
Normal: j / k          move File Tree selection
Normal: Enter          open selected note
Editor: i              enter Insert mode
Insert: Escape         enter Normal mode
Global: Escape         close the top overlay
```

The resolver supports prefixes and reports `Matched`, `Pending`, or
`Unhandled`. A pending sequence is visible in the bottom bar, for example
`NORMAL  <Space> f _`. Browser defaults are prevented only for resolved
commands that require it. Editable controls keep normal typing behavior.

## State Boundaries

The core state is independent of Dioxus:

```text
ApplicationState
|- input: InputState
|- workspace: WorkspaceState
|- domain: notes and active document, initially empty
|- config: AppConfig and keybindings
`- status: transient message
```

`WorkspaceState` contains the UI mode, layout tree, surface registry, logical
focus, and overlay stack. Components read state, render it, and dispatch
commands. They do not resolve keymaps or contain application rules.

Dispatch mutates state deterministically and returns effects explicitly. The
initial slice may use a no-op effect executor, but no component may call the
backend directly. Backend results will later re-enter through application
events.

## Initial Flows

### Open Note

```text
File Tree -> j/k -> Enter -> active note changes -> Editor updates and focuses
```

### Edit Note

```text
Normal -> i -> Insert -> edit text -> Escape -> Normal
```

### Focused Writing

```text
Standard -> <Space>z -> Focus
Focus -> <Space>e -> File Tree left overlay
Enter -> note opens when available, overlay closes, Editor remains primary
```

### Pointer Actions

Buttons and clickable rows dispatch the same commands as keyboard bindings.
Icon-only controls have accessible labels and tooltips. Critical actions also
have visible text labels or status feedback.

## Responsive Behavior

- Wide screens: File Tree and Editor share the workbench.
- Medium screens: File Tree becomes narrower but remains docked.
- Narrow screens: Editor occupies the workbench; File Tree opens as an
  overlay.

Do not force the split layout onto narrow screens.

## Accessibility

- All core actions work with keyboard and pointer.
- Use semantic buttons, landmarks, headings, and list/tree semantics where
  appropriate.
- Preserve visible DOM focus for actual text-entry controls.
- Provide labels for icon-only controls and shortcut hints where useful.
- Maintain sufficient contrast and never communicate mode using color alone.
- Do not intercept normal typing in editable controls.

## Acceptance Checklist

- The app renders the stable shell with Tailwind styling.
- Standard mode shows File Tree and Editor in a split layout.
- Focus mode reversibly hides the docked File Tree.
- The same File Tree opens as a left overlay in Focus mode.
- Normal and Insert modes are distinct and visible in the status bar.
- Keyboard sequences resolve through data-driven keymaps.
- Pending sequences appear in the status bar.
- Logical focus is visible and independent of DOM focus.
- UI actions dispatch commands rather than duplicate behavior.
- Empty File Tree and Editor states remain stable when no note is available.
- Core state and command transitions can be tested without rendering Dioxus.
