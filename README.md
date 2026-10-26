# LiroxNotes

LiroxNotes is a keyboard-first notes workbench built with Dioxus.

- `crates/app`: shared UI, state/effects, and typed Dioxus server functions.
- `crates/backend`: server-only authentication, workspace, filesystem, and Git operations.
- `crates/shared`: serializable domain and workspace view types.
- `packages/editor`: Bun/Vite CodeMirror editor bundle.

Install dependencies and start the Dioxus server plus editor watcher from an
existing tmux window:

```bash
bun install
bun install --cwd packages/editor
just dev
```

The default target is web. For desktop, run `just dev 8989 desktop`; this starts
the local Dioxus server beside the desktop WebView client. Desktop server
auto-launch and bundling are not included.

The app uses passkey onboarding when no workspace is configured. Setup can
create a local/remote repository workspace or select a non-empty subpath within
an existing repository. Note saves are committed locally; Git synchronization
is explicit.

In development, config and the default workspace live under `.lirox-runtime/`.
In release builds, config uses `$XDG_CONFIG_HOME/liroxnotes/config` and the
default workspace uses `$XDG_DATA_HOME/liroxnotes/workspace`.

Use a custom server port with `just dev 4100` (or `just dev 4100 desktop`). The
server's authoritative typed function contract is documented in
[`crates/gateway/API.md`](crates/gateway/API.md).
