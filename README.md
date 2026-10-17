# LiroxNotes

Architectural UI slice:

- `crates/app`: Dioxus UI component tree.
- `crates/gateway`: Actix server that renders the app.
- `crates/shared`: shared domain and workspace view types.
- `packages/editor`: Bun/Vite CodeMirror editor bundle.
- `crates/app/assets/`: Tailwind source and built stylesheet bundled by `dx`.

Run the Dioxus app with the Actix gateway and editor watcher (inside tmux):

```bash
bun install
bun install --cwd packages/editor
just dev
```

The app starts with passkey onboarding when no workspace is configured. The
onboarding flow supports creating a repository workspace with a new remote or
selecting a non-empty subpath inside an existing repository. After setup, the
app renders the empty or loaded File Tree and Editor states. Note saves, Git
commits, and synchronization remain separate gateway capabilities.

In development, config and the default workspace live under `.lirox-runtime/`. In release builds, config uses `$XDG_CONFIG_HOME/liroxnotes/config` and the default workspace uses `$XDG_DATA_HOME/liroxnotes/workspace`.

To use a custom Dioxus port:

```bash
just dev 4100
```

The Dioxus dev server uses the requested port. The Actix gateway runs beside it on `LIROX_GATEWAY_PORT` or `3010`.

Gateway-only check:

```bash
cargo run -p liroxnotes-gateway
```
