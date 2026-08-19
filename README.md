# LiroxNotes

Stage 6 MVP skeleton:

- `crates/app`: Dioxus UI component tree.
- `crates/gateway`: Actix server that renders the app.
- `crates/shared`: shared types and mock data.
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

The MVP uses a local session login first. Open `http://127.0.0.1:3000`, enter any display name, configure a workspace, then edit a note and press Save or `Cmd/Ctrl+S`. Each save writes the Markdown file and creates a real Git commit in the configured workspace.

If you set a Git remote URL during onboarding or through `POST /api/repositories/demo/connect`, manual sync runs `git pull --ff-only` and `git push` against that remote.

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

The Dioxus dev server uses the requested port. The Actix gateway runs beside it on `LIROX_GATEWAY_PORT` or `3000`.

Gateway-only check:

```bash
cargo run -p liroxnotes-gateway
```
