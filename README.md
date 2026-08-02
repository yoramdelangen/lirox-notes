# LiroxNotes

Stage 6 MVP skeleton:

- `crates/app`: Dioxus UI component tree.
- `crates/gateway`: Actix server that renders the app.
- `crates/shared`: shared types and mock data.
- `packages/editor`: Bun/Vite CodeMirror editor bundle.
- `crates/app/assets/`: Tailwind source and built stylesheet bundled by `dx`.

Run the Git-backed MVP gateway:

```bash
bun install
bun install --cwd packages/editor
bun run build:css
(cd packages/editor && bun run build)
cargo run -p liroxnotes-gateway
```

On first launch, the gateway opens onboarding and asks for workspace path, optional Git remote URL, and branch.

In development, config and the default workspace live under `.lirox-runtime/`. In release builds, config uses `$XDG_CONFIG_HOME/liroxnotes/config` and the default workspace uses `$XDG_DATA_HOME/liroxnotes/workspace`.

Each Save writes the changed note and commits it to the configured local Git repo.

Run the Dioxus web dev shell without server-side saving:

```bash
bun install
bun install --cwd packages/editor
./scripts/dx-serve
```

Pass normal `dx serve` flags through the wrapper:

```bash
./scripts/dx-serve --port 4100 --open false
```

Gateway-only check:

```bash
cargo run -p liroxnotes-gateway
```
