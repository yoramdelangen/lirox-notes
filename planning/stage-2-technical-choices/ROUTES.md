# Routes

## Frontend Routes

- `/`
- `/login`
- `/workspaces`
- `/workspace/:workspace`
- `/workspace/:workspace/note/*path`
- `/workspace/:workspace/search`
- `/workspace/:workspace/settings`
- `/workspace/:workspace/conflicts`
- `/workspace/:workspace/trash`

## Gateway API Routes

- `/api/auth/*`
- `/api/workspaces`
- `/api/workspaces/:workspace`
- `/api/workspaces/:workspace/sync`
- `/api/workspaces/:workspace/files/*`
- `/api/workspaces/:workspace/conflicts`
- `/api/workspaces/:workspace/trash`
- `/api/repositories`
- `/api/repositories/:repoId`
- `/api/repositories/:repoId/connect`
- `/api/repositories/:repoId/disconnect`

## Route Rules

- Frontend routes should stay human-readable.
- Gateway routes should stay resource-based and stable.
- Workspace is the main scoping unit in the UI.
- Repository is the main scoping unit in the gateway.
- Nested note paths should use catch-all path parameters.
