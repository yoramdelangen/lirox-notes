# LiroxNotes

Architectural UI slice:

- `crates/app`: Dioxus UI component tree.
- `crates/gateway`: Actix server that renders the app.
- `crates/shared`: shared domain and workspace view types.
- `packages/editor`: Bun/Vite CodeMirror editor bundle.
- `crates/app/assets/`: Tailwind source and built stylesheet bundled by `dx`.

Run the Dioxus app with the Actix gateway:

```bash
bun install
bun install --cwd packages/editor
bun run build:css
(cd packages/editor && bun run build)
cargo run -p liroxnotes-gateway
```

The app starts with an empty workspace and renders empty File Tree and Editor states. The gateway routes remain available for later integration, but the frontend does not currently perform login, onboarding, note saves, Git commits, or synchronization. Frontend API wiring is deferred to a later phase.

In development, config and the default workspace live under `.lirox-runtime/`. In release builds, config uses `$XDG_CONFIG_HOME/liroxnotes/config` and the default workspace uses `$XDG_DATA_HOME/liroxnotes/workspace`.

Shortcut:

```bash
./scripts/dx-serve
```

Custom port:

```bash
./scripts/dx-serve --port 4100
```

The Dioxus dev server uses the requested port. The Actix gateway runs beside it on `LIROX_GATEWAY_PORT` or `3010`.

Gateway-only check:

```bash
cargo run -p liroxnotes-gateway
```
