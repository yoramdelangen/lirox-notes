# LiroxNotes

Stage 6 MVP skeleton:

- `crates/app`: Dioxus UI component tree.
- `crates/gateway`: Actix server that renders the app.
- `crates/shared`: shared types and mock data.
- `packages/editor`: placeholder for the editor package.
- `crates/app/assets/`: Tailwind source and built stylesheet bundled by `dx`.

Run the app with one command:

```bash
bun install
./scripts/dx-serve
```

Pass normal `dx serve` flags through the wrapper:

```bash
./scripts/dx-serve --port 4100 --open false
```

Hosted gateway check:

```bash
cargo run -p liroxnotes-gateway
```
