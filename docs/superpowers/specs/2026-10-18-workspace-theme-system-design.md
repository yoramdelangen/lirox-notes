# Workspace Theme System Design

## Intent

Let people apply a familiar developer color palette to LiroxNotes, adjust its
individual UI colors, and keep the result with the repository. The workbench's
approved Editor-led split remains the layout; this change is about color roles
and theme configuration, not rearranging the application.

The first palette is Catppuccin Mocha. The theme model should also support
copying a Base16 or Base24 scheme from a theme site into the app, mapping it to
LiroxNotes' color fields, making small manual adjustments, and saving it for
the active workspace. The theme boundary also establishes a compact,
rem-based typography scale, with future named scale variants kept possible.

## User Flow

1. Open the existing Settings entry and choose workspace colors.
2. Start with the Catppuccin Mocha preset, or paste a Base16/Base24 scheme.
3. The app parses the scheme and maps it to LiroxNotes semantic color roles.
4. Review the resulting swatches and edit any role independently.
5. Preview the colors on the existing workbench without changing its layout.
6. Save. The active workspace's theme is written to the repository's
   `.lirox.toml` and applied on subsequent loads.

The editor is a focused Settings surface/overlay; it does not add panes to or
otherwise change the workbench layout.

## Scope

### In scope

- Catppuccin Mocha as the initial built-in and default palette.
- Per-workspace theme selection and color values in `.lirox.toml`.
- Pasting Base16/Base24 YAML scheme text; no network fetch is required.
- Deterministic mapping from scheme slots to app semantic tokens.
- A separately editable color control for every exposed app color token.
- A rem-based type scale: `xs` 8px, `sm` 10px, `base` 12px, and progressively
  larger named steps.
- A typography-token seam that permits future named scales without changing
  layout spacing; only the initial scale ships now.
- Live preview and accessible validation, including contrast checks.
- Applying theme values through CSS custom properties across shell and editor.
- A versioned multi-workspace repository config that can retain legacy single
  `[workspace]` metadata and other unrelated TOML data during upgrades.
- An authenticated gateway operation for loading and saving the active
  workspace theme; update `crates/gateway/API.md` for its contract.

### Out of scope for this milestone

- Replacing the Editor-led split or changing responsive layout behavior.
- Changing spacing, geometry, animation, or component structure.
- A typography-scale selector or additional scale variants in this milestone.
- Direct parsing of Kitty, Ghostty, Alacritty, or Neovim-specific theme files.
- Fetching theme URLs or executing theme-provided code/CSS.
- A theme marketplace, synchronization service, or multi-theme library UI.

## Design Decisions

### Theme data and CSS boundary

Keep the existing Lirox semantic roles as the stable app-facing interface:

```text
bg, bg-alt, surface, surface-alt,
fg, muted, subtle, border,
accent, accent-soft, selection,
success, warning, error, info, overlay
```

Components and the CodeMirror editor consume these roles via CSS custom
properties. A theme is data mapped to those roles, not a component stylesheet
or a set of layout rules. Theme changes must not require component-specific
selectors or affect workbench placement. Typography uses a parallel set of
named app tokens consumed by Tailwind text utilities and the editor.

Use a typed theme value in app configuration. Store resolved app color values
in `.lirox.toml`, rather than depending on a source website or reparsing the
original text on every startup. Keep preset/source metadata only where it helps
identify or re-edit the theme. Validate colors as opaque `#RRGGBB` values;
derive alpha treatments such as overlays in the app rather than accepting CSS.

The persisted theme belongs at `[workspaces.<slug>.theme]`, with `<slug>` being
the same stable workspace identifier used by the app and gateway route. Persist
the preset/source label and mapped semantic colors; do not persist raw pasted
YAML as the theme's source of truth.

Define typography sizes in `rem` against the existing 16px browser root, not by
changing the root `font-size`. This keeps Tailwind spacing and other rem-based
layout dimensions unchanged while app text sizes change. The initial scale is
`xs=0.5rem` (8px), `sm=0.625rem` (10px), `base=0.75rem` (12px),
`lg=0.875rem` (14px), `xl=1rem` (16px), `2xl=1.25rem` (20px), and
`3xl=1.5rem` (24px). Keep the scale centralized in named tokens so later
variants can remap typography without rewriting component markup. No scale
selector is needed in the first milestone.

### Import mapping

Accept the standard flat Base16/Base24 scheme YAML shape. Require `base00`
through `base0F`; identify Base24 when its additional slots are present, and
then require all of `base10` through `base17`. `scheme` and `author` are
optional metadata. Ignore unknown metadata keys; never evaluate YAML tags or
embedded code.

Use this deterministic mapping for either format:

| Lirox role | Source |
|---|---|
| `bg` | `base00` |
| `bg-alt`, `surface` | Base24 `base10` for `bg-alt`, `base01` for `surface`; Base16 `base01` for both |
| `surface-alt`, `selection` | `base02` |
| `fg` | `base05` |
| `muted` | `base04` |
| `subtle` | `base03` |
| `border` | `base03` |
| `accent` | `base0D` |
| `success` | `base0B` |
| `warning` | `base0A` |
| `error` | `base08` |
| `info` | `base0C` |

Base24-only bright colors remain available in the imported palette preview but
do not silently replace semantic roles. `accent-soft` and `overlay` are derived
from their base role plus fixed opacity, avoiding arbitrary alpha/CSS input.
Show every editable Lirox role so import is a starting point rather than a
rigid theme.

Reject malformed or incomplete schemes with field-specific errors and leave
the current draft unchanged. Do not evaluate code or fetch remote URLs. Direct
terminal-emulator and Neovim adapters can be added later without changing the
semantic-token model.

### Workspace configuration

`.lirox.toml` is repository-owned configuration, distinct from the gateway's
runtime config at `.lirox-runtime/config` (development) or the user config path
in production. Extend the repository file to represent multiple workspaces;
identify each workspace by its existing stable slug and put its theme under
that workspace's table. The active workspace slug is the persistence key in
the client request and gateway lookup. Keep legacy single `[workspace]`
metadata readable and migrate it without discarding existing fields or other
workspace entries when saving. Preserve unrelated TOML values/comments and
write changes atomically.

The gateway remains the filesystem authority. The client requests a theme
update for its active workspace; it never reads or writes repository files
directly. Saving one workspace's theme must not modify sibling workspace
themes or unrelated `.lirox.toml` values.

### Initial palette and style boundary

Use Catppuccin Mocha's palette to populate the current semantic roles. Preserve
the existing app's structural styling and selected Editor-led split. Only color
values, color-dependent active/hover/selection states, and the specified
typography scale may change. Ensure
body text and large text meet WCAG AA contrast and controls/focus indicators
meet the applicable non-text contrast requirement; do not rely on color alone
to communicate mode or status.

## Requirements

- When a workspace has no saved theme, the app shall use Catppuccin Mocha.
- When a user pastes a supported Base16/Base24 YAML scheme, the app shall parse
  it locally and populate the Lirox semantic color fields.
- When a supported scheme is malformed, the app shall report the invalid or
  missing fields and preserve the current theme draft.
- When a user edits one semantic color field, the app shall update that field
  in the preview without changing other fields or the workbench layout.
- When a user saves, the gateway shall validate the colors and persist them
  under the active workspace in `.lirox.toml` without modifying other
  workspaces or unrelated configuration.
- When a saved theme is loaded, the app shall apply it to both the Dioxus shell
  (including onboarding and settings) and CodeMirror editor through shared
  semantic CSS and typography variables.
- The app shall express theme typography sizes in `rem` tokens while keeping
  the browser root font size and rem-based layout dimensions unchanged.
- The initial type tokens shall resolve to `xs=8px`, `sm=10px`, `base=12px`,
  `lg=14px`, `xl=16px`, `2xl=20px`, and `3xl=24px` at the default browser root.
- The theme boundary shall allow future named typography scales to remap font
  sizes independently of spacing; the first milestone shall include only this
  scale and no scale picker.
- When a save fails, the current in-memory draft shall remain available and the
  UI shall report a retryable error.

## Acceptance Criteria

1. A fresh workspace renders with Catppuccin Mocha colors and the approved
   Editor-led split unchanged.
2. A valid Base16 scheme and a valid Base24 scheme both import into the semantic
   fields; changing one mapped field changes only that field.
3. Invalid hex values and malformed/incomplete imports cannot be saved and
   produce accessible, specific errors.
4. Previewing and saving a theme changes shell/editor colors and applies the
   specified typography scale without changing layout, rem-based spacing,
   responsive behavior, or editor input behavior.
5. Saving a theme updates only that workspace's theme table in `.lirox.toml`;
   sibling workspaces, legacy metadata, comments, and unrelated values survive.
6. Reloading the workspace restores its saved theme.
7. Contrast checks cover normal text, large text, interactive controls, focus,
   selection, and semantic status colors; non-color cues remain present.
8. Gateway API documentation and app design/architecture documentation match
   the implementation.

## Implementation Notes

- Existing app tokens live in `crates/app/assets/main.css`; CodeMirror also
  consumes theme variables and typography in `packages/editor/src/main.ts`.
  Both must use the same resolved theme values and app type tokens.
- The Settings menu currently reports that Settings is unavailable. The
  smallest Settings surface for this milestone is a theme editor reachable
  from that existing entry, without a new workbench pane or layout mode.
- Existing repository TOML inspection in `crates/gateway/src/lib.rs` recognizes
  only a legacy `[workspace]` section. The implementation must replace that
  narrow line parser with safe structured parsing and preserve legacy data.
- Base16/Base24 definitions follow the Tinted Theming scheme convention. Base24
  adds the ANSI bright/darker color slots; the semantic app mapping remains
  anchored in the shared Base16 slots.
- Existing `.lirox-runtime/config` remains the active gateway profile; it must
  not be confused with or overwritten by repository `.lirox.toml`.
- Base16/Base24 references: [Tinted Theming scheme gallery](https://tinted-theming.github.io/tinted-gallery/), [Base16 styling](https://github.com/tinted-theming/home/blob/main/styling.md), and [Base24 schema](https://github.com/tinted-theming/base24/blob/main/base24schema.json).

## Open to the Implementer

- Exact theme Settings panel composition within the existing app conventions.
- The concise labels and ordering for semantic color controls.
- Parser/library choice, provided it supports the stated Base16/Base24 input
  contract and preserves `.lirox.toml` data safely.
