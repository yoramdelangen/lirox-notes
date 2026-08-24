# Gateway HTTP Requests

Manual `.http` files for the gateway API routes only.

Run the gateway first:

```bash
cargo run -p liroxnotes-gateway
```

Suggested order:

1. Run `api/workspaces/create.http` to configure a workspace.
2. Run any other file manually.

Protected route files include an inline login request and reuse its `Set-Cookie` header with request variables.

Many files also include intentional negative scenarios like `401`, `404`, and `400`. Those are useful for manual runs, but `httprunner` will still mark them as failed when you execute the whole file.

If you run these from a CLI that supports banner/telemetry flags, use them on every run:

```bash
httprunner --no-banner --no-telemetry --env local crates/gateway/http/api/auth/login.http
```

`--no-telemetry` is the expected spelling.

Shared variables live in `http-client.env.json`. Select the `local` environment in your HTTP client.

```json
{
  "local": {
    "host": "http://127.0.0.1:3000",
    "workspace": "demo",
    "repo": "demo",
    "note": "notes/manual-test.md",
    "workspacePath": ".lirox-runtime/http-workspace"
  }
}
```
