# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers and technical writers who create, edit, organize, and maintain
Markdown notes alongside code or documentation workflows.

## Product Purpose

LiroxNotes is a Git-backed Markdown notes workspace. It makes it possible to
edit notes, organize workspace content, and synchronize changes through an
explicit Git workflow. Success means users can reliably open, edit, save, and
sync notes without losing track of changed or conflicting content.

## Positioning

LiroxNotes combines a Git-first Markdown workspace with a keyboard-first,
Vim-inspired editor workbench. Its commands, input modes, and workspace
surfaces are designed for fast, explicit interaction rather than a document
website workflow.

## Operating Context

Users work in Markdown workspaces that may be associated with Git
repositories. The application is intended for hosted web use, with the same
gateway-oriented model also supporting local workspace operation. Core work
includes opening notes, editing Markdown, saving changes, manually syncing,
and resolving conflicts when synchronization cannot apply cleanly.

## Capabilities and Constraints

- Markdown is the document format.
- Git is the workspace and synchronization model.
- The current implementation supports passkey onboarding, local/remote Git
  workspaces, note persistence, themes, and explicit synchronization through
  typed Dioxus server functions.
- The application uses distinct Dioxus web and desktop clients with a Dioxus
  fullstack server; desktop runs its server locally beside the WebView client.
- The Markdown editor is provided by the existing CodeMirror bundle in
  `packages/editor`.
- The application uses keyboard-first, command-based interaction while also
  supporting pointer actions.
- Future Neovim configuration compatibility is a possible architectural
  extension, not a current capability.

## Brand Commitments

The product name is LiroxNotes. Existing product language describes it as a
keyboard-first notes workbench and uses Vim/Neovim and IDE workbench concepts
as reference points.

## Evidence on Hand

- Product and interaction direction: `crates/app/DESIGN.md`.
- Application architecture and boundaries: `crates/app/ARCHITECTURE.md`.
- Functional and MVP planning: `planning/`.
- Existing editor package: `packages/editor/`.
- No production customer, testimonial, benchmark, or case-study evidence is
  present in the repository; future work must not fabricate any.

## Product Principles

- Keep Markdown documents portable and user-owned.
- Make Git synchronization explicit and recoverable.
- Treat keyboard commands as stable product behavior, not incidental UI code.
- Keep workspace surfaces composable and replaceable.
- Preserve a clear path through editing, saving, syncing, and conflict recovery.

## Accessibility & Inclusion

Core actions must work with both keyboard and pointer input. Preserve visible
focus for text-entry controls, provide accessible labels for icon-only actions,
maintain sufficient contrast without relying on color alone, support responsive
layouts, and avoid intercepting normal typing in editable controls.
