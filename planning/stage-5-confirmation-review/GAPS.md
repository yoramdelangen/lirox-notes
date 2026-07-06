# Gaps

## Missing Decisions

- Exact SurrealQL schema and migration runner are not written yet.
- Exact gateway API request/response payloads are not written yet.
- Exact Git backend command behavior is not specified yet.
- Exact editor adapter API between Dioxus and CodeMirror is not specified yet.
- Exact conflict block data format is not specified yet.
- Exact service worker and IndexedDB strategy is not specified yet.
- Exact default theme and default font stack are not selected yet.
- Theme reuse package needs investigation, especially Zed-compatible themes and Tinted/Themed options.
- Icon set is not selected yet.
- All-notes overview preview settings need concrete options and defaults.

## Contradictions

- Stage 1 says MVP supports hosted and local product use, while Stage 2 deployment prioritizes hosted Linux and macOS local app. This is acceptable if Stage 6 treats hosted mode as the first implementation path and keeps local mode reusable.
- Stage 1 says MVP supports a sidebar toggle between file tree and labels/tags, while design now adds an all-notes overview mode. This should be accepted as part of the main shell because it supports note browsing.
- Stage 2 says MVP supports main branch only, while the design wants branch/status in the bottom bar. The status bar should show the current branch as read-only in MVP.
- Stage 3 models mention attachments in the file tree, while Stage 1 says attachments are hidden from the normal note file tree. Stage 6 should treat attachments as available to file operations but hidden by default in the normal navigation tree.

## Risks

- Dioxus plus CodeMirror integration may be the highest UI implementation risk.
- PWA offline editing with Git-backed sync can become complex; Stage 6 should implement the smallest reliable pending-operation queue first.
- Conflict resolution is required for MVP and may take more effort than normal note editing.
- Hosted SSH deploy key setup needs careful UX and security handling.
- SurrealDB permissions and encryption must be designed before storing credentials.
- Mobile editor usability may be limited by CodeMirror behavior on mobile browsers.
- Theme reuse can become a distraction; ship one good default if reuse takes too long.
