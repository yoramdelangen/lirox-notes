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

On first launch, the gateway opens onboarding and asks for workspace path, optional Git remote URL, and branch.

The app starts with an empty workspace and renders empty File Tree and Editor states. The gateway exposes the existing login, workspace, note, Git, and sync endpoints, but frontend API wiring is deferred to a later phase.

If you set a Git remote URL during onboarding or through `POST /api/repositories/{workspace}/connect`, manual sync runs `git pull --ff-only` and `git push` against that remote.

In development, config and the default workspace live under `.lirox-runtime/`. In release builds, config uses `$XDG_CONFIG_HOME/liroxnotes/config` and the default workspace uses `$XDG_DATA_HOME/liroxnotes/workspace`.

Each Save writes the changed note and commits it to the configured local Git repo.

Check commits with:

```bash
git -C .lirox-runtime/workspace log --oneline -5
```

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
