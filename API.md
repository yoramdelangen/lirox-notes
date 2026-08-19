# LiroxNotes Gateway API

```http
@host = http://127.0.0.1:3000
@workspace = /tmp/liroxnotes-workspace
@note = notes/manual.md
```

Most API calls require the `lirox_session` cookie returned by login.

## Implemented And Manually Tested

```http
### Open login form
GET {{host}}/login

### Log in through HTML form
# Response: 303 See Other -> /
# Stores lirox_session cookie.
POST {{host}}/login
Content-Type: application/x-www-form-urlencoded

user=local

### Log out through HTML form
# Response: 303 See Other -> /login
POST {{host}}/logout

### Open onboarding form
GET {{host}}/onboarding

### Save onboarding configuration
# Content-Type: application/x-www-form-urlencoded
# Response: 303 See Other -> /workspace/demo
POST {{host}}/onboarding
Content-Type: application/x-www-form-urlencoded

workspace_path={{workspace}}&repo_url=&branch=main

### Render configured workspace page
GET {{host}}/workspace/demo

### Render a selected note page
GET {{host}}/workspace/demo/note/{{note}}

### Load workspace JSON
# Response: WorkspaceView JSON
GET {{host}}/api/workspace/{{note}}

### Load default workspace JSON
# Empty path selects notes/welcome.md
GET {{host}}/api/workspace/

### Workspace API CORS preflight
# Response: 204 No Content
OPTIONS {{host}}/api/workspace/{{note}}

### Save or create a Markdown note
# Path must be relative and end in .md. Body is stored as the note contents.
# Response: { "ok": true, "committed": true|false }
PUT {{host}}/api/notes/{{note}}
Content-Type: text/markdown

# Manual API Note

#api

### Notes API CORS preflight
# Response: 204 No Content
OPTIONS {{host}}/api/notes/{{note}}

### Auth session
# Response: { "authenticated": true|false, "user": "local"|"" }
GET {{host}}/api/auth

### Auth wildcard route
# Response: { "authenticated": true|false, "user": "local"|"" }
GET {{host}}/api/auth/session

### API login
# Response: { "authenticated": true, "user": "local" }
# Stores lirox_session cookie.
POST {{host}}/api/auth/login
Content-Type: application/json

{
  "user": "local"
}

### API logout
# Response: { "authenticated": false, "user": "" }
POST {{host}}/api/auth/logout

### API CORS preflight
# Response: 204 No Content
OPTIONS {{host}}/api/workspaces

### List workspaces
# Response: [WorkspaceSummary]
GET {{host}}/api/workspaces

### Create or configure the demo workspace
# Response: 201 WorkspaceSummary
POST {{host}}/api/workspaces
Content-Type: application/json

{
  "workspace_path": "/tmp/liroxnotes-workspace",
  "repo_url": "",
  "branch": "main"
}

### Get workspace
# Response: WorkspaceSummary
GET {{host}}/api/workspaces/demo

### Sync workspace
# Local workspace without repo_url returns ok without pull/push.
POST {{host}}/api/workspaces/demo/sync

### Read workspace file
# Response: { "path": "notes/manual.md", "body": "..." }
GET {{host}}/api/workspaces/demo/files/{{note}}

### Save workspace file
# Response: { "ok": true, "committed": true|false }
PUT {{host}}/api/workspaces/demo/files/{{note}}
Content-Type: text/markdown

# Manual API Note

#api

### Delete workspace file
# Response: { "ok": true, "committed": true }
DELETE {{host}}/api/workspaces/demo/files/{{note}}

### Workspace conflicts
# Response: { "items": [] }
GET {{host}}/api/workspaces/demo/conflicts

### Workspace trash
# Response: { "items": [] }
GET {{host}}/api/workspaces/demo/trash

### List repositories
# Response: [RepositorySummary]
GET {{host}}/api/repositories

### Get repository
# Response: RepositorySummary
GET {{host}}/api/repositories/demo

### Connect repository
# Configures git remote origin and saves repo_url/branch.
POST {{host}}/api/repositories/demo/connect
Content-Type: application/json

{
  "repo_url": "git@example.com:me/notes.git",
  "branch": "main"
}

### Disconnect repository
# Removes git remote origin if present and clears repo_url.
POST {{host}}/api/repositories/demo/disconnect
```

## Current Error Cases

```http
### Workspace API before login
# Response: 401 { "error": "login required" }
GET {{host}}/api/workspaces

### Workspace API before onboarding
# Response: 400 workspace is not configured
GET {{host}}/api/workspace/{{note}}

### Save note before onboarding
# Response: 400 workspace is not configured
PUT {{host}}/api/notes/{{note}}
Content-Type: text/markdown

# Unsaved

### Reject invalid note extension
# Response: 400 invalid note path
PUT {{host}}/api/notes/notes/not-markdown.txt
Content-Type: text/plain

not markdown

### Reject unknown workspace
# Response: 404 { "error": "workspace not found" }
GET {{host}}/api/workspaces/missing

### Reject unknown repository
# Response: 404 { "error": "repository not found" }
GET {{host}}/api/repositories/missing
```

## Manual Run Notes

```http
# Verified on 2026-08-16 with:
# cargo test -p liroxnotes-gateway
# LIROX_CONFIG_FILE=<temp>/config LIROX_WORKSPACE_DIR=<temp>/workspace cargo run -p liroxnotes-gateway -- --port 3130
#
# Results:
# GET / before login -> 303 /login
# GET /api/workspaces before login -> 401
# POST /login -> 303 /
# GET / after login -> 200
# POST /onboarding -> 303 /workspace/demo
# GET /workspace/demo -> 200
# PUT /api/notes/notes/mvp.md -> 200
# GET /api/workspace/notes/mvp.md -> 200
# git log includes "Update notes/mvp.md"
# POST /logout -> 303 /login
# GET /api/workspaces after logout -> 401
#
# Route sweep:
# GET /api/auth -> 200
# GET /api/auth/session -> 200
# OPTIONS /api/workspaces -> 204
# POST /api/workspaces -> 201
# GET /api/workspaces -> 200
# GET /api/workspaces/demo -> 200
# POST /api/workspaces/demo/sync -> 200
# PUT /api/workspaces/demo/files/notes/manual.md -> 200
# GET /api/workspaces/demo/files/notes/manual.md -> 200
# GET /api/workspaces/demo/conflicts -> 200
# GET /api/workspaces/demo/trash -> 200
# GET /api/repositories -> 200
# GET /api/repositories/demo -> 200
# POST /api/repositories/demo/connect -> 200
# POST /api/repositories/demo/disconnect -> 200
# DELETE /api/workspaces/demo/files/notes/manual.md -> 200
# GET /api/workspaces/missing -> 404
```
