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
default workspace uses `$XDG_DATA_HOME/liroxnotes/workspace`. Keymaps and editor
options live in `$XDG_CONFIG_HOME/lirox-notes/config.toml` (or
`$LIROX_APP_CONFIG`).

Use a custom server port with `just dev 4100` (or `just dev 4100 desktop`). The
server's authoritative typed function contract is documented in
[`crates/gateway/API.md`](crates/gateway/API.md).

## Run with Docker or Podman

Releases publish a multi-arch (amd64/arm64) image built on
`gcr.io/distroless/static:nonroot`: one static server binary plus the web
assets, no shell and no `git` binary (Git runs in-process via libgit2).

```bash
podman run -d --name liroxnotes -p 8080:8080 \
  -v liroxnotes-config:/config -v liroxnotes-data:/data \
  ghcr.io/yoramdelangen/lirox-notes:latest
```

`docker` works the same way; see [`compose.yaml`](compose.yaml) for a Compose
setup with secrets. Build the image yourself with `just image` (and run it with
`just image-run`).

Passkeys only work over HTTPS, or over plain HTTP at `http://localhost`. Behind
a reverse proxy, set `LIROX_RP_ID` to the host name and `LIROX_RP_ORIGIN` to
the exact URL users open (for example `notes.example.com` and
`https://notes.example.com`).

| Variable | Default | Purpose |
|---|---|---|
| `LIROX_RP_ID` | `localhost` | WebAuthn relying-party ID (the host name users open). |
| `LIROX_RP_ORIGIN` | `http://localhost:8080` | Allowed origin(s), comma-separated; must match the URL exactly, port included. |
| `LIROX_SESSION_TTL_SECONDS` | 30 days | Session lifetime. |
| `IP` / `PORT` | `0.0.0.0` / `8080` | Listen address. |
| `LIROX_CONFIG_FILE` | `/config/config` | Application config (workspaces). |
| `LIROX_APP_CONFIG` | `/config/config.toml` | Keymaps and editor options. |
| `LIROX_WORKSPACE_DIR` | `/data/workspace` | Where repositories are cloned. |
| `LIROX_GIT_SSH_KEY` | — | Private key file for SSH remotes (no passphrase). |
| `LIROX_GIT_KNOWN_HOSTS` | `~/.ssh/known_hosts` | Pinned SSH host keys; unknown hosts are refused. |
| `LIROX_GIT_TOKEN` | — | Token for HTTPS remotes. |
| `LIROX_GIT_USERNAME` | `x-access-token` | Username sent with the token. |
| `LIROX_GIT_TOKEN_HOSTS` | `github.com` | Hosts (comma-separated) that may receive the token. |

The image defaults the two `LIROX_RP_*` variables to `http://localhost:8080`.
The bare release binary falls back to the development origins
(`http://localhost:8989`, `http://localhost:3010`) and logs a warning at
startup when `LIROX_RP_ORIGIN` is unset.

Volumes: `/config` holds the app config, sessions and passkeys; `/data` holds
the cloned repositories. Both are owned by uid/gid 65532.

### Git credentials

Give the server its own credentials, scoped to the notes repository only:

- **SSH deploy key** (recommended): `ssh-keygen -t ed25519 -f lirox_deploy -N ""`,
  add `lirox_deploy.pub` as a deploy key *with write access* on the notes
  repository, and mount the private key read-only, e.g.
  `-v ./lirox_deploy:/run/secrets/git_key:ro -e LIROX_GIT_SSH_KEY=/run/secrets/git_key`.
- **Pinned host keys**: write *all* of the host's key types to a file and mount
  it via `LIROX_GIT_KNOWN_HOSTS` (the server may negotiate any of them). For
  GitHub, take them from `https://api.github.com/meta` (`ssh_keys`) or run
  `ssh-keyscan github.com > known_hosts` and compare the fingerprints with
  GitHub's published ones before use.
- **HTTPS token** (alternative): a fine-grained token limited to the one
  repository with *Contents: read and write* and an expiry date, passed as
  `LIROX_GIT_TOKEN`. It is only sent to hosts in `LIROX_GIT_TOKEN_HOSTS`.

Outside a container the server also falls back to a running ssh-agent and
`~/.ssh/id_ed25519` / `~/.ssh/id_rsa`; Git credential helpers and
`~/.ssh/config` are not used.

### Verifying a release

Images and release tarballs carry build provenance and an SBOM attestation:

```bash
gh attestation verify oci://ghcr.io/yoramdelangen/lirox-notes:<version> -R yoramdelangen/lirox-notes
gh attestation verify liroxnotes-server-<version>-x86_64-linux-musl.tar.gz -R yoramdelangen/lirox-notes
```

Releases are cut with release-please; see
[`planning/stage-7-release-first-version/RELEASE_CHECKLIST.md`](planning/stage-7-release-first-version/RELEASE_CHECKLIST.md).
