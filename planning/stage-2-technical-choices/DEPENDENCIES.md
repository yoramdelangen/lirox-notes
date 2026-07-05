# Dependencies

This file contains selected dependencies and why they were chosen.

## Frontend Dependencies

- Dioxus for the Rust frontend/PWA shell.
- Dioxus component library inspired by shadcn/radix patterns for UI primitives.
- Tailwind CSS for styling.
- CodeMirror 6 for the embedded Markdown/code editor.
- Bun for managing and building the editor package.
- Vite for building the editor JavaScript bundle.

## Gateway Dependencies

- Actix Web for the Git gateway backend.
- Embedded SurrealDB for persistent metadata and user accounts.

## Shared Dependencies

- Root `src/` shared dependencies should stay minimal.
- Root `src/` can contain shared models, structures, reusable logic, and Git-related logic that needs to be reused.
- Root `src/` should avoid pulling Dioxus or Actix dependencies unless absolutely necessary.

## Browser Storage Dependencies

- IndexedDB is used for PWA offline cache, drafts, and pending operations.

## Development Dependencies

- Testing dependencies should be chosen per package.
- Rust testing should cover core logic and gateway integration.
- Editor package testing should cover Vite/Bun-based JavaScript behavior.
