# Server Container & Release Design

## Intent

LiroxNotes has no way to ship today: no container, no CI, no releases. The
goal is a self-hostable **server version** that builds reproducibly on GitHub,
runs in Docker/Podman from a minimal distroless image, and is published as a
versioned release. A dedicated macOS desktop app comes later and is out of
scope here.

## Goals

- A fully static Linux server binary (musl) plus its `public/` web assets.
- A container image based on `gcr.io/distroless/static:nonroot`: no shell, no
  package manager, no `git` binary.
- Git operations performed in-process via a library, with SSH and HTTPS
  remotes both supported.
- GitHub Actions CI on pushes/PRs and a tag-driven release workflow.
- Run documentation covering volumes, environment, and credential setup.

## Non-goals

- macOS/Windows binaries or desktop bundles.
- Kubernetes manifests, Helm charts, reverse-proxy/TLS termination setup.
- Changing the auth model, the workspace model, or the UI.

## Anti-goals

- Shipping private keys or tokens inside images, layers, or build logs.
- Disabling SSH host-key verification to "make it work".
- Requiring a shell or extra OS packages in the runtime image.
- Behaviour regressions in local development (`just dev`) versus today, apart
  from the credential-source change noted below.

## Part 1 — Git as a library

Replace every `git` CLI invocation in `crates/backend/src/workspace.rs` (the
`run_git` helper, `clone_git`/`git_clone_command`, and the `run_git` call in
`crates/app/src/server.rs`) with the `git2` crate, built with vendored
libgit2, libssh2, and OpenSSL so the result links statically on musl.
(`gix` is rejected: it lacks push.)

Operations to cover, preserving current semantics:

| Today (CLI) | Behaviour to keep |
|---|---|
| `rev-parse --is-inside-work-tree` / `init` | init a repo when the workspace is not one |
| `rev-parse --show-toplevel` | discover repository root for subpath workspaces |
| `branch --show-current`, `rev-parse --abbrev-ref HEAD` | current branch, default `main` |
| `remote get-url/set-url/add origin` | configure `origin` |
| `status --porcelain` (optionally path-scoped) | changed count / dirty detection |
| `rev-list --count …` | unpushed commit count |
| `config user.name/user.email` | default identity `LiroxNotes` when unset locally |
| `add` + `commit` (path-scoped) | commit note saves |
| `clone --branch B --single-branch`, fallback plain clone | clone with branch fallback, 60 s timeout |
| `push origin HEAD:B` | push |
| `pull --ff-only origin B` | fetch + fast-forward only; error on divergence |

The public function signatures in `workspace.rs` stay the same (they return
`std::io::Result`), and errors stay human-readable strings because the UI
surfaces them. `run_git` is removed from the public API; its caller in
`server.rs` moves to a dedicated backend function.

### Credentials

Resolved per remote URL in a `git2::RemoteCallbacks::credentials` callback:

- **SSH** (`git@host:…`, `ssh://…`), tried in order:
  1. `LIROX_GIT_SSH_KEY` — path to a private key file (no passphrase support;
     unattended keys should be unencrypted and protected by file mounts).
  2. ssh-agent via `SSH_AUTH_SOCK` (local-development convenience).
  3. `~/.ssh/id_ed25519`, then `~/.ssh/id_rsa` (local-development convenience).
- **HTTPS**: `LIROX_GIT_TOKEN` as password, `LIROX_GIT_USERNAME` as user
  (default `x-access-token`). The token is only offered to hosts listed in
  `LIROX_GIT_TOKEN_HOSTS` (comma-separated, default `github.com`), so a
  mistyped or hostile repo URL never receives it. Without a matching token
  only public repos work. *(Design call: host scoping added after review.)*
- The callback must not loop forever when credentials are rejected: give up
  after the candidates are exhausted and return a clear error.

Host-key verification: SSH host keys are checked against
`LIROX_GIT_KNOWN_HOSTS`, else `~/.ssh/known_hosts`. Unknown or mismatching
hosts fail with an explicit error naming the host. Never auto-accept.

HTTPS uses the OpenSSL CA store; in the image this is distroless's
`/etc/ssl/certs`.

Accepted trade-off: locally, macOS keychain / git credential helpers and
`~/.ssh/config` aliases are no longer used.

Network timeouts: clone keeps a 60 s bound; push/pull/fetch get a similar
bound (the CLI previously relied on `ConnectTimeout=15`).

### Testing

Existing backend tests keep passing. New tests use local bare repositories
(`file://` or path remotes) to cover init, commit, status counts, clone with
branch fallback, push, ff-only pull, and divergence errors. Credential and
host-key logic is unit-tested on its decision functions (which credential to
offer for which URL/allowed types), not against live servers.

## Part 2 — Static binary and container

Build with `dx bundle --web --release`, targeting
`x86_64-unknown-linux-musl` / `aarch64-unknown-linux-musl` for the server
(`@server --target …`), producing `server` + `public/`. OpenSSL (also needed
by webauthn-rs) is vendored so the binary has no dynamic dependencies.

Committed assets (`crates/app/assets/editor.js`, compiled CSS) are used as-is;
the image build does not run Bun or Tailwind.

`Dockerfile` (multi-stage, at repo root):

1. **builder**: Rust toolchain + musl target + `dioxus-cli` pinned to 0.7.10
   (installed via `cargo binstall` if available, else `cargo install
   --locked`), with cargo registry/target caching.
2. **runtime**: `gcr.io/distroless/static:nonroot`, containing `/app/server`
   and `/app/public`, running as the nonroot user.

Runtime contract:

| Setting | Value |
|---|---|
| Listen | `IP=0.0.0.0`, `PORT=8080`, `EXPOSE 8080` |
| App config | `LIROX_CONFIG_FILE=/config/config` |
| User config | `LIROX_APP_CONFIG=/config/config.toml` |
| Default workspace | `LIROX_WORKSPACE_DIR=/data/workspace` |
| Volumes | `/config`, `/data` (writable by nonroot uid 65532) |
| Required | `LIROX_RP_ID`, `LIROX_RP_ORIGIN` = the URL users open |
| Git creds | `LIROX_GIT_SSH_KEY`, `LIROX_GIT_KNOWN_HOSTS`, `LIROX_GIT_TOKEN`, `LIROX_GIT_USERNAME`, `LIROX_GIT_TOKEN_HOSTS` |

"Required" is documentation-level: the existing `localhost` fallback in
`AuthService::from_env` stays (so `podman run -p 8080:8080` works on
localhost out of the box and `just dev` is untouched), but release builds log
a startup warning when `LIROX_RP_ORIGIN` is unset. *(Design call.)*

`HOME` is set to a writable path so `~` lookups don't fail. No HEALTHCHECK
(distroless has no shell/curl); orchestrators can probe the HTTP port.

A `compose.yaml` example shows volumes, env, and read-only secret mounts for
the deploy key and `known_hosts`. Passkeys require HTTPS in front of the
container unless accessed via `http://localhost`.

### Local verification

`podman build` then `podman run` with mounted volumes: the server starts, the
app loads at `http://localhost:8080`, passkey registration works, a local
workspace is created and a note commit succeeds — all inside distroless,
proving no `git` binary is needed. `ldd`/`file` confirms the binary is static.

## Part 3 — GitHub

- **CI** (`.github/workflows/ci.yml`, on push to `main` and PRs):
  `cargo fmt --check`, `cargo clippy`, `cargo test --workspace`, a wasm check
  of the app, and a container build without push.
- **Release** (`.github/workflows/release.yml`, on `v*` tags):
  - Build linux/amd64 and linux/arm64 images, push a multi-arch manifest to
    `ghcr.io/yoramdelangen/lirox-notes` tagged `X.Y.Z`, `X.Y`, and `latest`.
  - Attach `liroxnotes-server-X.Y.Z-{x86_64,aarch64}-linux-musl.tar.gz`
    (binary + `public/`) and SHA256 checksums to a GitHub Release with
    generated notes.
  - Uses `GITHUB_TOKEN` with `packages: write` / `contents: write`; no other
    secrets.
- The repository is public, so arm64 builds run natively on GitHub's free
  `ubuntu-24.04-arm` runners and amd64 on `ubuntu-24.04`; each builds its
  own single-arch image and tarball, and a final job merges the images into
  one multi-arch manifest. No cross C toolchain and no QEMU.
- The image carries `org.opencontainers.image.source` pointing at the repo so
  the GHCR package links to it. The release checklist includes verifying,
  once after the first release, that the package is public and anonymously
  pullable.

Versioning: the git tag is the source of truth; workspace `version` in
`Cargo.toml` is bumped to match before tagging.

## Documentation

- README: "Run with Docker/Podman" section, env table, deploy-key and
  fine-grained token setup, `known_hosts` pinning, HTTPS/RP origin note.
- `crates/app/ONBOARDING_AUTH.md` and `crates/gateway/API.md` updated only
  if externally visible behaviour or errors change.
- `planning/stage-7-release-first-version/RELEASE_CHECKLIST.md` gets the
  technical release steps.

## Left to the builder

- Exact git2 API usage, module layout (e.g. a `backend::git` module), and
  test helper structure.
- Builder base image and caching strategy, as long as the runtime image is
  distroless/static and the binary is static.
- Exact workflow action versions.
