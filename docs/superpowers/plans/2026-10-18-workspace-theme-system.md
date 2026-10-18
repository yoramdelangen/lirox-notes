# Workspace Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-workspace Catppuccin Mocha themes, editable Base16/Base24 palette imports, and a compact rem-based typography scale without changing the workbench layout.

**Architecture:** Put serializable semantic theme data in `liroxnotes-shared`; keep Base16/Base24 parsing in the app; persist workspace registry and resolved colors in repository `.lirox.toml` using `toml_edit`; expose authenticated theme writes through the gateway. The app applies theme and typography tokens through CSS variables and provides a focused editor from Settings.

**Tech Stack:** Rust, serde, `serde_yaml_ng`, `toml_edit`, Actix Web, Dioxus, CSS custom properties, Tailwind CSS 4, CodeMirror.

**Spec:** `docs/superpowers/specs/2026-10-18-workspace-theme-system-design.md`

## Global Constraints

- The approved Editor-led split remains the layout; theme changes do not rearrange the application.
- Theme colors are opaque `#RRGGBB` values; alpha treatments are derived in the app, not accepted as CSS.
- Theme persistence is per workspace at `[workspaces.<slug>.theme]` in repository `.lirox.toml`.
- The gateway runtime configuration at `.lirox-runtime/config` or the production user config path is separate and must not be overwritten.
- Base16/Base24 YAML parsing is local; do not fetch URLs or evaluate YAML tags or embedded code.
- Typography sizes are `rem` tokens against the unchanged 16px browser root; rem-based spacing stays unchanged.
- Initial type scale: `xs=0.5rem` (8px), `sm=0.625rem` (10px), `base=0.75rem` (12px), `lg=0.875rem` (14px), `xl=1rem` (16px), `2xl=1.25rem` (20px), `3xl=1.5rem` (24px).
- Save one workspace's theme without changing sibling themes, unrelated TOML values, or legacy metadata.
- Update `crates/gateway/API.md` for externally visible API changes and app design/architecture documentation for new theme concepts.

## Review Focus

- Legacy or malformed `.lirox.toml`: parse and update the intended workspace without losing legacy metadata or unrelated tables. Pin in Task 3's migration/preservation tests.
- Cross-workspace writes: reject an unregistered slug and preserve all other theme entries. Pin in Tasks 3–4.
- Unsupported YAML constructs, missing/duplicate palette keys, and invalid hex: reject import without mutating the draft. Pin in Task 2.
- Low-contrast colors: block saving combinations below WCAG AA for text and 3:1 for controls/focus, with an accessible explanation. Pin in Tasks 2 and 6.
- Gateway failure during save: retain the unsaved draft and present a retryable error. Pin in Tasks 4–6.

---

### Task 1: Shared Theme Data and Catppuccin Mocha Defaults

**Files:**
- Create: `crates/shared/src/theme.rs`
- Modify: `crates/shared/src/lib.rs`
- Modify: `crates/shared/src/lib.rs` (`WorkspaceView` theme field)
- Test: `crates/shared/tests/theme.rs`

**Interfaces:**
- Produces `ThemeColors`, `WorkspaceTheme`, and `ThemeSource` serializable types for app and gateway.
- `WorkspaceTheme::catppuccin_mocha() -> WorkspaceTheme` returns the exact initial palette and metadata.
- `WorkspaceView.theme: WorkspaceTheme` carries the active workspace theme.

- [ ] **Step 1: Write failing tests** for Catppuccin Mocha semantic values (`bg #1e1e2e`, `bg_alt #181825`, `surface #313244`, `surface_alt/selection/border #45475a`, `fg #cdd6f4`, `muted #a6adc8`, `subtle #6c7086`, `accent #89b4fa`, `success #a6e3a1`, `warning #f9e2af`, `error #f38ba8`, `info #89dceb`), serialization round-trip, and `WorkspaceView::empty()` default theme.
- [ ] **Step 2: Run** `cargo test -p liroxnotes-shared theme` and confirm the tests fail for missing types/defaults.
- [ ] **Step 3: Implement** the typed semantic roles (`bg`, `bg_alt`, `surface`, `surface_alt`, `fg`, `muted`, `subtle`, `border`, `accent`, `selection`, `success`, `warning`, `error`, `info`) plus preset/source metadata. Derive `accent_soft` and `overlay` rather than persisting arbitrary alpha values.
- [ ] **Step 4: Run** `cargo test -p liroxnotes-shared theme` and confirm it passes.
- [ ] **Step 5: Commit** the shared theme model and tests.

### Task 2: Base16/Base24 Import Mapping and Contrast Validation

**Files:**
- Create: `crates/app/src/theme.rs`
- Modify: `crates/app/src/lib.rs`
- Modify: `crates/app/Cargo.toml`
- Test: `crates/app/src/theme.rs`

**Interfaces:**
- Consumes Task 1's `WorkspaceTheme` and `ThemeColors`.
- Produces `parse_scheme(input: &str) -> Result<ImportedTheme, ThemeImportError>` and `validate_contrast(colors: &ThemeColors) -> Vec<ContrastIssue>`.
- `ImportedTheme` contains mapped Lirox colors, optional `scheme`/`author` metadata, and parsed Base24-only swatches.

- [ ] **Step 1: Write failing tests** for a Base16 flat YAML fixture and a Base24 fixture. Assert exact mappings: `base00 -> bg`, Base16 `base01 -> bg_alt/surface`, Base24 `base10 -> bg_alt`, `base01 -> surface`, `base02 -> surface_alt/selection`, `base05 -> fg`, `base04 -> muted`, `base03 -> subtle/border`, `base0D -> accent`, `base0B -> success`, `base0A -> warning`, `base08 -> error`, `base0C -> info`.
- [ ] **Step 2: Add** `serde_yaml_ng = "0.10"` to `crates/app/Cargo.toml`, then run the focused tests and confirm they fail for the unimplemented parser/mapping.
- [ ] **Step 3: Implement** safe YAML deserialization for required `base00..base0F`; if any `base10..base17` key is present, require all eight. Treat `scheme` and `author` as optional metadata, ignore unrelated metadata, reject YAML tags/code, duplicate keys, malformed colors, and incomplete palettes. Keep current draft untouched on errors.
- [ ] **Step 4: Implement** contrast checks for normal/large text (4.5:1 / 3:1), semantic status text (4.5:1), and controls/focus (3:1); add boundary pass/fail tests and deterministic Base24-only swatch retention tests.
- [ ] **Step 5: Run** `cargo test -p liroxnotes-app theme` and confirm importer and contrast tests pass.
- [ ] **Step 6: Commit** the importer and validation tests.

### Task 3: Versioned Multi-Workspace `.lirox.toml` Persistence

**Files:**
- Modify: `crates/gateway/Cargo.toml`
- Modify: `crates/gateway/src/lib.rs`
- Test: `crates/gateway/src/lib.rs`
- Test: `crates/gateway/tests/git_workspace.rs`

**Interfaces:**
- Consumes Task 1's `WorkspaceTheme` and `ThemeColors`.
- Produces repository helpers `load_repository_config(root: &Path) -> io::Result<RepositoryConfig>`, `register_workspace(root: &Path, slug: &str, name: &str, relative_path: &str, theme: &WorkspaceTheme) -> io::Result<()>`, and `save_workspace_theme(root: &Path, slug: &str, theme: &WorkspaceTheme) -> io::Result<()>`.
- New files declare `format_version = 1`. Workspace tables are keyed by stable slug at `[workspaces.<slug>]`; theme data is at `[workspaces.<slug>.theme]` with semantic colors nested under `.colors`.

- [ ] **Step 1: Write failing tests** for registering multiple workspaces, reading each theme by slug, writing/reading `format_version = 1`, rejecting unsupported versions, migrating legacy `[workspace]` name/slug metadata, preserving unknown tables/comments, and changing only one workspace theme.
- [ ] **Step 2: Add** `toml_edit = "0.25"` to gateway dependencies and run the focused tests to confirm the missing repository-config behavior.
- [ ] **Step 3: Implement** structured parsing/updating with `toml_edit::DocumentMut`, preserving unrelated TOML, migrating legacy `[workspace]` name/slug metadata into the slug-keyed workspace entry on first write, validating relative paths, setting `format_version = 1`, and atomically replacing the file.
- [ ] **Step 4: Test** malformed TOML, empty/unknown slug, path traversal, and failed-write behavior; no failed update may partially replace the file.
- [ ] **Step 5: Run** `cargo test -p liroxnotes-gateway repository_config` and the focused `git_workspace` integration tests.
- [ ] **Step 6: Commit** repository config support and tests.

### Task 4: Authenticated Theme API and Workspace Bootstrap

**Files:**
- Modify: `crates/gateway/src/lib.rs`
- Modify: `crates/gateway/src/routes/mod.rs`
- Modify: `crates/gateway/API.md`
- Test: `crates/gateway/tests/workspace_theme.rs`

**Interfaces:**
- Consumes Task 3's repository config helpers.
- Adds authenticated `PUT /api/workspaces/{workspace}/theme`, where `{workspace}` is the active workspace slug and the JSON body is `WorkspaceTheme`.
- Adds theme data to `WorkspaceView` responses using the configured workspace entry, defaulting to Catppuccin Mocha where no theme is saved.
- Repository registration uses the actual repository root for both new-repository and existing-subpath onboarding, not `.lirox-runtime/config`.

- [ ] **Step 1: Write failing integration tests** for `POST /api/workspaces` registering the workspace in repository `.lirox.toml`, default theme in workspace responses, successful theme save/reload, unregistered slug rejection, unauthenticated rejection, invalid hex/contrast rejection, and sibling workspace isolation.
- [ ] **Step 2: Run** `cargo test -p liroxnotes-gateway --test workspace_theme` and confirm the expected failures.
- [ ] **Step 3: Implement** workspace registration in `create_workspace_api` using the repository root (not the runtime config path), then add the authenticated theme route, validate requests, persist via Task 3, and return the saved theme. Ensure repository TOML is updated only after validation.
- [ ] **Step 4: Update** `crates/gateway/API.md` with method, authentication, request/response examples, validation errors, and workspace config behavior.
- [ ] **Step 5: Run** the integration tests and relevant gateway auth tests; confirm all pass.
- [ ] **Step 6: Commit** the API, docs, and tests.

### Task 5: App Theme State, Dynamic CSS Tokens, and Typography

**Files:**
- Modify: `crates/app/src/app/state.rs`
- Modify: `crates/app/src/app/event.rs`
- Modify: `crates/app/src/app/reducer.rs`
- Modify: `crates/app/src/app/effects.rs`
- Modify: `crates/app/src/ui/shell.rs`
- Modify: `crates/app/assets/main.css`
- Modify: `crates/app/tailwind.css`
- Regenerate: `crates/app/assets/tailwind.css`
- Modify: `packages/editor/src/main.ts`
- Regenerate: `crates/app/assets/editor.js` via `bun run build` in `packages/editor`
- Test: `crates/app/src/app/reducer.rs` and `crates/app/src/app/effects.rs`

**Interfaces:**
- Consumes Task 1's `WorkspaceView.theme`, Task 2's `WorkspaceTheme`, and Task 4's theme API.
- `ApplicationState.theme: WorkspaceTheme` is populated on `WorkspaceLoaded`; `theme_preview: Option<WorkspaceTheme>` holds the unsaved live preview.
- Adds `Effect::SaveWorkspaceTheme { slug: String, theme: WorkspaceTheme }` and `ThemeEvent::PreviewChanged(Option<WorkspaceTheme>)`, `ThemeEvent::SaveSucceeded(WorkspaceTheme)`, and `ThemeEvent::SaveFailed(String)`; errors retain the active editor draft.
- `theme_css_vars(theme: &WorkspaceTheme) -> String` maps resolved colors to existing `--lirox-*` variables; the shell uses the preview theme when present.

- [ ] **Step 1: Write failing tests** proving workspace-load applies the returned theme, preview events set/clear `theme_preview`, save effects serialize slug/theme, and failed save leaves the current theme/draft unchanged.
- [ ] **Step 2: Run** the focused app tests and confirm failures.
- [ ] **Step 3: Implement** app state/effects for loading from `WorkspaceView` and saving through the authenticated API; successful save replaces `theme` and clears `theme_preview`, failure keeps the preview.
- [ ] **Step 4: Implement** dynamic semantic CSS variables for all Dioxus app surfaces and CodeMirror. Set Catppuccin Mocha as the default when no theme is returned.
- [ ] **Step 5: Set every Tailwind font-size token** to rem values: `xs .5rem`, `sm .625rem`, `base .75rem`, `lg .875rem`, `xl 1rem`, `2xl 1.25rem`, `3xl 1.5rem`, `4xl 1.875rem`, `5xl 2.25rem`, `6xl 3rem`, `7xl 3.75rem`, `8xl 4.5rem`, and `9xl 6rem`. Leave browser root size and rem-based spacing unchanged. Restrict 8px text to nonessential metadata, not body copy or controls.
- [ ] **Step 6: Update** CodeMirror typography to use the same app tokens, rebuild `editor.js`, and run `npm run build:css` to regenerate Tailwind output without hand-editing generated CSS.
- [ ] **Step 7: Run** focused tests, `cargo check -p liroxnotes-app --target wasm32-unknown-unknown`, and verify app/editor token references use only the shared theme roles.
- [ ] **Step 8: Commit** app theme state, dynamic tokens, editor integration, and tests.

### Task 6: Settings Theme Editor

**Files:**
- Create: `crates/app/src/ui/theme_editor.rs`
- Modify: `crates/app/src/ui/top_bar.rs`
- Modify: `crates/app/src/ui/mod.rs`
- Modify: `crates/app/assets/main.css`
- Test: `crates/app/src/theme.rs` (draft import/edit validation)
- Test: `crates/app/src/app/reducer.rs` (theme preview/save transitions)

**Interfaces:**
- Consumes Task 2's `parse_scheme`/`validate_contrast`, Task 5's theme state/effect, and the existing Settings menu trigger.
- The editor keeps pasted text and unsaved edits local until Save; controls edit one semantic color at a time.

- [ ] **Step 1: Add tests** for invalid import leaving the theme draft unchanged, editing one field preserving other fields, preview dispatch/clear, and retryable save failure preserving the current preview.
- [ ] **Step 2: Run** the focused app tests and confirm the behavior is not yet implemented.
- [ ] **Step 3: Replace** the disabled Settings menu item with a theme editor entry, preserving the existing workbench layout and responsive behavior.
- [ ] **Step 4: Implement** the focused editor with Catppuccin Mocha reset/preset, a labeled YAML textarea, Base16/Base24 import action, individually editable color inputs and hex values, preview dispatches, contrast issues, and Save/Cancel actions. Cancel clears `theme_preview`; Save dispatches the typed save effect.
- [ ] **Step 5: Make** all invalid import/color/contrast states accessible and specific; disable Save while invalid or saving; retain the draft and display a retryable error on API failure.
- [ ] **Step 6: Run** app tests, formatting, WASM check, and the Impeccable detector on changed UI targets.
- [ ] **Step 7: Commit** the theme editor and tests.

### Task 7: Documentation and End-to-End Verification

**Files:**
- Modify: `crates/app/DESIGN.md`
- Modify: `crates/app/ARCHITECTURE.md`
- Verify: `crates/gateway/API.md`

**Interfaces:**
- Documents the approved editor-led layout, per-workspace theme model, semantic token boundary, Base16/Base24 import seam, and typography scale from the design spec.

- [ ] **Step 1: Update** app design and architecture docs; keep API docs aligned with Task 4.
- [ ] **Step 2: Run** `cargo fmt --all -- --check`, `cargo test --workspace`, `cargo check --workspace`, and `cargo check -p liroxnotes-app --target wasm32-unknown-unknown`.
- [ ] **Step 3: Run** `git diff --check` and inspect the diff for changes to workbench layout, generated files, TOML preservation, and API docs.
- [ ] **Step 4: Confirm** all scope and acceptance criteria in the design spec; report the remaining lack of real-device/browser visual verification if no browser is available.
- [ ] **Step 5: Commit** documentation and any final fixes.
