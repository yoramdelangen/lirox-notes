# Design Inspiration

## Target Feel

LiroxNotes should feel like a quiet local writing tool with Git-aware structure, closer to a focused code editor than a productivity dashboard.

The app should feel:

- Calm, sparse, and readable.
- Fast and direct.
- Serious enough for long-term notes.
- File-based instead of card-based.
- Functional before decorative.

## Reference Shape

Use this mental model:

- Zed-like shell: compact top bar, dark-friendly surfaces, thin separators, dense but calm navigation.
- Top left: workspace identity and workspace dropdown/selector. The Zed `wk` position maps to the current workspace.
- Left rail: small icon buttons switch the sidebar mode.
- Sidebar modes: file tree, label tree, all-notes overview.
- Center: note editor as the main surface.
- Bottom status bar: Git status, branch, sync state, offline state, and other technical state.
- Right or inline panels only when needed for metadata, conflicts, or sync details.
- Dialogs only for decisions that block the user.

The default screen should look like a writing workspace, not an admin panel.

## Moodboard

- Zed editor for shell, spacing, dark theme quality, status bar, and editor cleanliness.
- Bear writer for labels, note list, preview cards, and writing-friendly presentation.
- LiroxNotes combines Zed's workspace/file discipline with Bear's note browsing and tagging comfort.

## Sidebar Modes

- File tree shows the workspace folder and notes as files.
- Label tree should feel like Bear labels: nested, readable, icon-light, and easy to scan.
- All-notes overview should feel like Bear's message list: title, excerpt, date/state, optional thumbnail or metadata preview.
- Overview preview should be configurable: compact, comfortable, or rich.
- Changed notes must be clearly visible in both the file tree and notes overview.

## Editor Surface

- Keep the editor as clean as Zed's code editor surface.
- Omit tabs in the first version.
- Reconsider tabs later as an optional preference, not a default layout.
- Show a small bottom floating toolbar only while the editor has focus, the user is typing, or text is selected.
- Toolbar actions should cover common formatting and insertion only.
- Do not let the toolbar compete with the note content.

## Visual Language

- Low contrast chrome with high contrast text.
- Mostly neutral colors: off-white, warm gray, charcoal, muted blue/green accents.
- Color should feel clean and polished like Zed's default themes.
- Accent color is for active state, changed state, sync state, and conflicts only.
- Rounded corners should be small and quiet.
- Shadows should be minimal or absent.
- Dividers, spacing, and typography should carry structure.

## Themes

- Prefer reusing existing theme formats or packages instead of inventing a custom theme system.
- Investigate Zed-compatible theme sources and Tinted/Themed ecosystem options, including Rust-friendly packages such as `tinted` if they fit the app stack.
- Support dark and light themes.
- Theme support must cover editor, sidebar, status bar, labels, changed states, conflict states, and previews.

## Typography

- Editor text should be the most comfortable text in the app.
- Use a readable serif or humanist sans for note content.
- Use a compact sans for navigation, file names, metadata, and controls.
- Code blocks and technical metadata use monospace.
- Avoid oversized dashboard headings.
- Allow users to choose fonts installed on their machine.
- Ship a good default font stack so the app looks intentional without configuration.

## Interaction Style

- Prefer persistent navigation over hidden menus.
- Prefer inline states over modal dialogs.
- Prefer simple confirmations over multi-step wizards.
- Keep save/sync feedback visible but not noisy.
- Conflict resolution should be explicit and calm, not alarming unless data loss is possible.
- Workspace switching should be available from the top-left workspace selector.
- Git branch and repository status belong in the bottom status bar, not the top workspace area.

## Changed State

- Unsaved or uncommitted changes should be visible where the user navigates.
- File tree entries should show changed state with a subtle marker or color.
- Notes overview entries should show changed state near the title or metadata row.
- Status bar should summarize broader Git/sync state without replacing per-note indicators.

## Responsive Behavior

- Desktop default: left rail, active sidebar, central editor, bottom status bar.
- Narrow layout: collapse sidebar behind the rail or a single navigation control.
- Mobile should prioritize the editor, with file tree, labels, and overview as switchable views.

## Do Not Copy

- Not a kanban board.
- Not a Notion-style block editor.
- Not a colorful SaaS dashboard.
- Not a decorative markdown blog editor.
- Not a complex IDE with many toolbars.
- Not Zed copied directly; use its shell discipline, not its code-specific UI wholesale.
- Not Bear copied directly; use its note/label browsing patterns, not its full visual identity.

## Design Checks

- Can the user start writing within one click after opening a workspace?
- Is the current note always visually dominant?
- Can the user see where the note lives in the file tree?
- Are sync/conflict states visible without stealing focus?
- Does the screen still work on a narrow mobile layout?
- Are changed notes visible before the user opens them?
- Can the user switch between file tree, labels, and all-notes overview without losing context?
