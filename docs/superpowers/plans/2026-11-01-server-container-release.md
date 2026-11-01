# Server Container & Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship LiroxNotes as a static Linux server in a distroless image, built and released by GitHub Actions with release-please, attestations, and SBOMs.

**Architecture:** All `git` CLI calls in the backend move to an in-process `git2` module (`crates/backend/src/git.rs`) with explicit, host-scoped credentials and our own `known_hosts` verification. A multi-stage Alpine (musl) Dockerfile builds `server` + `public/` with `dx bundle`, with C dependencies vendored behind a `static` feature, and copies them onto `gcr.io/distroless/static:nonroot`. CI runs on PRs. A release-please workflow creates the release PR and, once it's merged, builds per-architecture images and tarballs on native runners, then merges, attests, and publishes them.

**Tech Stack:** Rust 2021, Dioxus 0.7.10 / `dx` 0.7.10, `git2` (vendored libgit2/libssh2/OpenSSL), Alpine + distroless, Docker Buildx, GitHub Actions, release-please, `actions/attest-build-provenance`, `anchore/sbom-action`, `cargo-deny`.

**Spec:** `docs/superpowers/specs/2026-11-01-server-container-release-design.md`

## Global Constraints

- Runtime image: `gcr.io/distroless/static:nonroot`; no shell, no `git` binary; the server binary must be statically linked.
- The backend must not spawn any process (`std::process::Command` is banned from `crates/backend/src`). Test fixtures may still use the `git` CLI.
- Public `workspace.rs` function signatures stay the same (`std::io::Result`, human-readable error strings). `run_git` stops being public.
- Default commit identity when the repo has no local identity: `LiroxNotes` / `liroxnotes@example.local`. Commit message: `Update {first path}`.
- Network timeout: 60 s overall per clone/fetch/push; clone falls back to a default-branch clone when the branch doesn't exist remotely.
- Credentials env: `LIROX_GIT_SSH_KEY`, `LIROX_GIT_KNOWN_HOSTS`, `LIROX_GIT_TOKEN`, `LIROX_GIT_USERNAME` (default `x-access-token`), `LIROX_GIT_TOKEN_HOSTS` (comma-separated, default `github.com`). There is no passphrase variable.
- SSH candidate order: `LIROX_GIT_SSH_KEY` → ssh-agent (only if `SSH_AUTH_SOCK` is set) → `~/.ssh/id_ed25519` → `~/.ssh/id_rsa` (only those that exist). Never auto-accept unknown host keys.
- Container: `IP=0.0.0.0`, `PORT=8080`, `LIROX_CONFIG_FILE=/config/config`, `LIROX_APP_CONFIG=/config/config.toml`, `LIROX_WORKSPACE_DIR=/data/workspace`, volumes `/config` and `/data` owned by uid/gid 65532.
- Releases: GHCR `ghcr.io/yoramdelangen/lirox-notes` tags `X.Y.Z`, `X.Y`, `latest` (pre-releases get only `X.Y.Z-pre`); assets `liroxnotes-server-X.Y.Z-{x86_64,aarch64}-linux-musl.tar.gz` plus `SHA256SUMS`.
- All third-party Actions are pinned to full commit SHAs with a `# vX.Y.Z` comment. Base images are pinned by digest. Default workflow permissions are `contents: read`.
- No long-lived secrets except the release GitHub App's credentials (`RELEASE_APP_ID`, `RELEASE_APP_PRIVATE_KEY`). *(Plan call: release-please PRs and tags made with `GITHUB_TOKEN` don't trigger CI, so a repo-scoped GitHub App token is the standard fix. It also lets the tag ruleset allow only that App to create `v*` tags.)*
- Gateway API doc `crates/gateway/API.md` changes only if externally visible errors change.

## Review Focus

1. **Non-fast-forward push.** A remote that moved must make `push_workspace` return an error. libgit2 reports rejections only through `push_update_reference`, so a naive port silently "succeeds". → Task 3 test `push_rejected_when_remote_has_diverged`.
2. **Unpushed count after push.** After a successful push, `unpushed_commit_count` must be 0, so the push must update `refs/remotes/origin/<branch>`. → Task 3 test `push_updates_tracking_ref_so_unpushed_count_is_zero`.
3. **Deleted note commit.** `delete_note_file` must commit the removal, not error on `add` of a missing path. → Task 2 test `commit_records_a_deleted_note`.
4. **Rejected credentials loop.** A wrong key or token must fail with an error and must not retry forever. → Task 1 test `candidates_are_finite_and_callback_gives_up`.
5. **Hashed and port-qualified `known_hosts` entries** (`|1|salt|hash`, `[host]:2222`) must verify. An entry that's present but has a different key must give a mismatch error naming the host, not "unknown". → Task 1 tests `hashed_entry_matches`, `bracketed_port_entry_matches`, `changed_key_is_mismatch`.

---

### Task 1: git module foundation: credential and host-key policy

**Files:**
- Create: `crates/backend/src/git.rs`
- Modify: `crates/backend/src/lib.rs` (add `pub mod git;`), `crates/backend/Cargo.toml`, `crates/app/Cargo.toml`, `Cargo.toml`
- Test: unit tests inside `crates/backend/src/git.rs`

**Interfaces:**
- Produces:
  - `pub struct GitEnv { pub ssh_key: Option<PathBuf>, pub ssh_agent: bool, pub home: Option<PathBuf>, pub token: Option<String>, pub username: String, pub token_hosts: Vec<String>, pub known_hosts: Option<PathBuf> }` with `pub fn from_env() -> Self`. `known_hosts` resolves `LIROX_GIT_KNOWN_HOSTS`, else `$HOME/.ssh/known_hosts`.
  - `pub enum Credential { SshKey { username: String, private_key: PathBuf }, SshAgent { username: String }, Token { username: String, token: String } }`
  - `pub fn credential_candidates(url: &str, url_username: Option<&str>, env: &GitEnv, exists: impl Fn(&Path) -> bool) -> Vec<Credential>`. The SSH username comes from the URL, defaulting to `git`. HTTPS gets the token only if the URL host is in `token_hosts` (case-insensitive, exact host match). `http://` (non-TLS) URLs never get the token.
  - `pub enum HostKeyCheck { Match, Mismatch, Unknown }`
  - `pub fn check_host_key(known_hosts: &str, host: &str, port: u16, key_type: &str, key: &[u8]) -> HostKeyCheck`. Supports plain entries, comma lists, `[host]:port` (port 22 matches the bare host), hashed `|1|base64salt|base64hmac` (HMAC-SHA1 of the `host` / `[host]:port` string), `#` comments, and blank lines. `@revoked` lines matching the key → `Mismatch`. `@cert-authority` lines are ignored.
- Cargo:
  - Workspace dep `git2 = { version = "0.20", default-features = false, features = ["ssh", "https"] }` (use the latest 0.x that builds).
  - Backend deps `git2.workspace = true`, `hmac`, `sha1`, `base64`, and `openssl = { version = "0.10", optional = true }`.
  - Backend feature `static = ["git2/vendored-libgit2", "git2/vendored-openssl", "dep:openssl", "openssl/vendored"]`.
  - App feature `static = ["server", "liroxnotes-backend/static"]`.
  - App `version`/`edition` switch to `.workspace = true`.

- [ ] **Step 1: Write the failing tests**
  - **`ssh_url_offers_configured_key_then_agent_then_home_keys`:** URL `git@github.com:o/r.git`, env with `ssh_key=/k`, `ssh_agent=true`, home `/h`, and `exists` returning true for `/h/.ssh/id_ed25519` only. Asserts the vector equals `[SshKey{git,/k}, SshAgent{git}, SshKey{git,/h/.ssh/id_ed25519}]`.
  - **`https_token_only_for_listed_hosts`:** `https://github.com/o/r.git` → `[Token{x-access-token, t}]`; `https://evil.example/o/r.git` → `[]`; `http://github.com/o/r.git` → `[]`; `https://GitHub.com/...` → token offered.
  - **`candidates_are_finite_and_callback_gives_up`:** the candidates length is at most 4, and `next_credential(&candidates, attempt)` (a private helper used by the callback) returns `None` once `attempt >= len`.
  - **`plain_entry_matches`, `bracketed_port_entry_matches`, `hashed_entry_matches`, `changed_key_is_mismatch`, `missing_host_is_unknown`, `revoked_key_is_mismatch`:** build the `known_hosts` text in the test. For the hashed case, compute the HMAC in the test with salt bytes `[1u8; 20]` over `"github.com"`.

- [ ] **Step 2: Run** `cargo test -p liroxnotes-backend --lib git::`. Expect FAIL (module missing).
- [ ] **Step 3: Implement** the types and functions above in `crates/backend/src/git.rs`, then add `pub mod git;` to `lib.rs` and the Cargo changes.
- [ ] **Step 4: Run** `cargo test -p liroxnotes-backend --lib git::`. Expect PASS. Also run `cargo check -p liroxnotes-app --features static`; it must compile (vendored builds).
- [ ] **Step 5: Commit** `feat: git credential and host-key policy`

---

### Task 2: Port local git operations to git2

**Files:**
- Modify: `crates/backend/src/git.rs`, `crates/backend/src/workspace.rs`, `crates/app/src/server.rs:360-370`
- Test: `crates/backend/tests/workspace.rs`

**Interfaces:**
- Consumes: Task 1 module.
- Produces (in `git.rs`, all `std::io::Result`, mapping `git2::Error` to `io::Error::other(e.message())`):
  - `pub fn is_inside_repository(path: &Path) -> bool` (discovery walks upward like `rev-parse --is-inside-work-tree`)
  - `pub fn init(path: &Path) -> io::Result<()>`
  - `pub fn repository_root(path: &Path) -> io::Result<PathBuf>` (the workdir)
  - `pub fn current_branch(path: &Path) -> io::Result<String>` (shorthand of HEAD; works on an unborn HEAD by reading its symbolic target)
  - `pub fn origin_url(path: &Path) -> io::Result<String>`
  - `pub fn set_origin(path: &Path, url: &str) -> io::Result<()>` (adds or updates `origin`)
  - `pub fn remove_origin(path: &Path) -> io::Result<()>`
  - `pub fn changed_count(path: &Path) -> io::Result<usize>`: includes untracked files, untracked directories collapse to one entry, ignored files excluded. Matches `status --porcelain` line count.
  - `pub fn commit_paths(path: &Path, paths: &[PathBuf]) -> io::Result<bool>`: `paths` are relative to `path`, which may be a subdirectory of the workdir. Returns `false` if none of them have a change. Stages modifications, new files, **and deletions**. Sets the local identity defaults if they're missing. Message `Update {paths[0]}`. Supports the first commit on an unborn branch.
  - `pub fn unpushed_count(path: &Path, branch: &str) -> io::Result<usize>`: if `refs/remotes/origin/<branch>` exists, it's the count of commits reachable from HEAD but not from it; otherwise it's all commits reachable from HEAD (0 for an unborn HEAD).
- `workspace.rs`:
  - Every local `run_git` call switches to these functions.
  - Add `pub fn disconnect_git_remote(config: &GatewayConfig) -> std::io::Result<()>` (calls `remove_origin`, ignores a missing remote). Re-export it from `lib.rs`.
  - In `server.rs`, `disconnect_repository_server_function` uses it.
  - `run_git` becomes private, and stays only until Task 3 removes it.

- [ ] **Step 1: Write the failing tests** in `crates/backend/tests/workspace.rs`, using `liroxnotes_backend::git::*` against temp repos:
  - `commit_records_a_new_note_and_reports_no_change_on_second_call`
  - `commit_records_a_deleted_note`: write and commit `a.md`, delete it, `commit_paths` → `true`, and `changed_count` → 0.
  - `commit_from_a_workspace_subdirectory_uses_repo_relative_paths`
  - `changed_count_collapses_untracked_directories`: `new/x.md` and `new/y.md` → 1.
  - `unpushed_count_counts_all_commits_without_tracking_ref`
  - `origin_can_be_set_updated_and_removed`
  - `current_branch_reads_unborn_head` (after `init`, before any commit).
- [ ] **Step 2: Run** `cargo test -p liroxnotes-backend --test workspace`. Expect the new tests to FAIL.
- [ ] **Step 3: Implement** the functions in `git.rs` and switch over `workspace.rs` and `server.rs`.
- [ ] **Step 4: Run** `cargo test -p liroxnotes-backend` and `cargo check -p liroxnotes-app --features server`. Everything must PASS, existing tests included.
- [ ] **Step 5: Commit** `refactor: local git operations via git2`

---

### Task 3: Port network operations (clone, fetch, push, pull) and remove the CLI

**Files:**
- Modify: `crates/backend/src/git.rs`, `crates/backend/src/workspace.rs`
- Test: `crates/backend/tests/workspace.rs`

**Interfaces:**
- Consumes: `GitEnv`, `credential_candidates`, `check_host_key` (Task 1); the Task 2 functions.
- Produces:
  - `pub fn clone(url: &str, branch: &str, destination: &Path, env: &GitEnv) -> io::Result<()>`: tries `branch`. When the remote lacks that branch, it removes any partial destination and clones the default branch. Overall deadline 60 s, enforced via `transfer_progress`/`sideband_progress` callbacks returning `false` after the deadline, plus `git2::opts` server connect/read timeouts if the git2 version exposes them. A timeout error reads `Git clone timed out after 60 seconds`.
  - `pub fn push(path: &Path, branch: &str, env: &GitEnv) -> io::Result<()>`: refspec `<HEAD ref>:refs/heads/<branch>`. Any `push_update_reference` status message becomes an error. On success `refs/remotes/origin/<branch>` points at the pushed commit.
  - `pub fn pull_ff_only(path: &Path, branch: &str, env: &GitEnv) -> io::Result<()>`: fetches `origin <branch>`. Up to date → Ok. Fast-forward → move the branch ref and safe checkout. Otherwise error `Not possible to fast-forward; local and origin/<branch> have diverged`.
  - A private `remote_callbacks(env: &GitEnv, deadline: Instant) -> RemoteCallbacks` wires credentials (iterating the candidates by attempt count, giving up when they run out) and `certificate_check`:
    - SSH host keys go through `check_host_key` with the `known_hosts` file content. A missing file counts as Unknown.
    - `Unknown` → error `unknown SSH host key for {host}; add it to known_hosts`.
    - `Mismatch` → error `SSH host key for {host} does not match known_hosts`.
    - TLS certs → `CertificateCheckStatus::CertificatePassthrough` (libgit2 validates them against the OpenSSL store).
- `workspace.rs`:
  - `clone_git`, `git_clone_command`, `push_workspace`, `pull_workspace` and `inspect_repository` go through these, using `GitEnv::from_env()`.
  - Delete `run_git` and every `std::process` import from `crates/backend/src`.

- [ ] **Step 1: Write the failing tests** using the existing `bare_repository` fixture with path remotes:
  - `clone_falls_back_to_default_branch_when_branch_missing`
  - `push_updates_tracking_ref_so_unpushed_count_is_zero`
  - `push_rejected_when_remote_has_diverged`: a second clone pushes first, then `push` → `Err`.
  - `pull_fast_forwards_new_remote_commits`
  - `pull_errors_when_branches_diverged`: the error contains `diverged`.
  - `inspect_repository_still_reads_lirox_toml` (the existing inspect tests must keep passing as well).
- [ ] **Step 2: Run** `cargo test -p liroxnotes-backend --test workspace`. Expect the new tests to FAIL.
- [ ] **Step 3: Implement**, then delete `run_git`.
- [ ] **Step 4: Verify**
  - `cargo test -p liroxnotes-backend` → PASS.
  - `grep -rn "process::\|Command::new" crates/backend/src` → no output.
  - `cargo clippy -p liroxnotes-app --features server --all-targets -- -D warnings` → clean.
  - Manual check against a real SSH remote: push/pull with the agent works locally, and an empty `LIROX_GIT_KNOWN_HOSTS` file gives the "unknown SSH host key" error.
- [ ] **Step 5: Commit** `feat: in-process git network operations; drop git CLI`

---

### Task 4: Static build, Dockerfile, compose, local verification

**Files:**
- Create: `Dockerfile`, `.dockerignore`, `compose.yaml`
- Modify: `crates/app/src/main.rs` (startup warning), `justfile` (add `image` and `image-run` recipes)

**Interfaces:**
- Consumes: the app feature `static` (Task 1).
- Produces:
  - Dockerfile stages, which Task 6 relies on: `builder` (outputs `/out/server`, `/out/public`), `artifact` (`FROM scratch`, `COPY --from=builder /out /`), `runtime` (the default, last stage).
  - Build arg `VERSION` (default `dev`), used for the OCI label `org.opencontainers.image.version`.

- [ ] **Step 1: Startup warning.** In `main.rs`, under `#[cfg(all(feature = "server", not(debug_assertions)))]`: if `LIROX_RP_ORIGIN` is unset, `eprintln!("warning: LIROX_RP_ORIGIN is not set; passkeys only work at http://localhost:<port>")`. Verify it compiles: `cargo check -p liroxnotes-app --features server --release`.
- [ ] **Step 2: Dockerfile.**
  - **`builder`:**
    - `FROM rust:<1.x>-alpine@sha256:<digest>`, with `apk add musl-dev perl make file`. Then `rustup target add wasm32-unknown-unknown` and `cargo install dioxus-cli --version 0.7.10 --locked` in its own cached layer.
    - Copy the workspace, then `dx bundle --web --release @server --features static` (adjust the flag spelling to `dx bundle --help`; the server must build with features `server,static` for the native musl host target). Use BuildKit cache mounts for `/usr/local/cargo/registry` and `target`.
    - Copy the produced `server` binary and `public/` to `/out`.
    - `RUN file /out/server | grep -q 'static'`, which fails the build if the binary is dynamic.
    - If `dx` can't fetch a musl-compatible `wasm-bindgen`/`wasm-opt`, install `wasm-bindgen-cli` at the `Cargo.lock` version with `cargo install --locked`.
  - **`runtime`:**
    - `FROM gcr.io/distroless/static:nonroot@sha256:<digest>`.
    - `COPY --from=builder --chown=65532:65532 /out /app`, plus empty `/config` and `/data` dirs with the same chown.
    - The env values from Global Constraints, `EXPOSE 8080`, `VOLUME ["/config","/data"]`, `WORKDIR /app`, `ENTRYPOINT ["/app/server"]`.
    - OCI labels `source=https://github.com/yoramdelangen/lirox-notes`, `licenses`, `version`.
- [ ] **Step 3: `.dockerignore`.** Ignore `target/`, `node_modules/`, `dist/`, `.lirox-runtime/`, `.lirox-workspace/`, `.git/`, `.worktrees/`, `packages/editor/node_modules/`.
- [ ] **Step 4: `compose.yaml` example.** Image `ghcr.io/yoramdelangen/lirox-notes:latest`, port `8080:8080`, named volumes for `/config` and `/data`, and env `LIROX_RP_ID`/`LIROX_RP_ORIGIN`. Include a commented-out `secrets:` block mounting `./secrets/git_key` → `/run/secrets/git_key` and `./secrets/known_hosts` → `/run/secrets/known_hosts`, with `LIROX_GIT_SSH_KEY`/`LIROX_GIT_KNOWN_HOSTS` pointing there.
- [ ] **Step 5: Verify with podman.**
  - Run `podman build -t lirox-notes:dev .` and expect success. Then run `podman run --rm -d -p 8080:8080 -v lx-config:/config -v lx-data:/data --name lx lirox-notes:dev` and `curl -fsS http://localhost:8080/ | grep -q LiroxNotes`.
  - Open `http://localhost:8080` in a browser. Register a passkey, create a local workspace, and save a note.
  - Run `podman run --rm -v lx-data:/data alpine sh -c 'apk add -q git && git -C /data/workspace/* log --oneline -1'`; it must show `Update …`.
  - Run `podman exec lx /bin/sh`; it must fail, because there's no shell.
  - Record the image size in the commit message.
- [ ] **Step 6: Commit** `feat: distroless static container image`

---

### Task 5: CI workflow, cargo-deny, Dependabot

**Files:**
- Create: `.github/workflows/ci.yml`, `deny.toml`, `.github/dependabot.yml`
- Modify: any files needed to make `cargo fmt --check` and clippy `-D warnings` pass (currently fmt is dirty and there's one clippy warning in `liroxnotes-app` lib tests)

- [ ] **Step 1: Make the tree clean.**
  - `cargo fmt --all`.
  - Fix clippy warnings until both `cargo clippy --workspace --all-targets --locked -- -D warnings` and `cargo clippy -p liroxnotes-app --features server --all-targets --locked -- -D warnings` pass.
  - Commit `style: cargo fmt and clippy fixes`.
- [ ] **Step 2: `deny.toml`.**
  - `[advisories]` denies vulnerabilities and unmaintained crates for workspace deps.
  - `[licenses]` allow-list is MIT, Apache-2.0, Apache-2.0 WITH LLVM-exception, BSD-2-Clause, BSD-3-Clause, ISC, Zlib, Unicode-3.0, MPL-2.0, CDLA-Permissive-2.0, OpenSSL, BSL-1.0, adding only permissive licenses that `cargo deny check licenses` reports. Stop and ask before allowing any copyleft license other than MPL-2.0.
  - `[sources]` allows crates.io only.
  - Verify: `cargo deny check` passes locally (`cargo install cargo-deny --locked`).
- [ ] **Step 3: `ci.yml`.**
  - Triggers: `pull_request` and `push` to `main`. `permissions: contents: read`, and `concurrency` cancel-in-progress per ref.
  - **`rust` job** on `ubuntu-24.04`, using `dtolnay/rust-toolchain` (stable, components `rustfmt`, `clippy`, target `wasm32-unknown-unknown`) and `Swatinem/rust-cache`. It runs:
    - `cargo fmt --all --check`
    - `cargo metadata --locked --format-version 1 > /dev/null` (catches release PRs whose `Cargo.lock` was left stale)
    - both clippy commands from Step 1
    - `cargo test --workspace --locked`
    - `cargo test -p liroxnotes-app --features server --locked`
    - `cargo check -p liroxnotes-app --target wasm32-unknown-unknown --locked`
  - **`deny` job:** `EmbarkStudios/cargo-deny-action`.
  - **`image` job:** `docker/setup-buildx-action` + `docker/build-push-action` with `push: false`, `platforms: linux/amd64`, and a GHA cache.
  - Pin every action to its commit SHA: resolve each with `gh api repos/<owner>/<repo>/git/ref/tags/<tag> --jq .object.sha` (dereference annotated tags) and add a `# <tag>` comment.
- [ ] **Step 4: `dependabot.yml`.** Weekly updates for `cargo` (`/`), `github-actions` (`/`), and `docker` (`/`), with grouped minor/patch updates.
- [ ] **Step 5: Verify.** Push a branch, open a PR with `gh pr create --draft`, and check `gh pr checks --watch`: all jobs green. (This publishes to GitHub; that's expected for CI.)
- [ ] **Step 6: Commit** `ci: add CI, cargo-deny and dependabot`

---

### Task 6: release-please and the release workflow

**Files:**
- Create: `release-please-config.json`, `.release-please-manifest.json` (`{".": "0.1.0"}`), `.github/workflows/release.yml`, `CHANGELOG.md` (header only)
- Modify: `Cargo.toml` (`version = "0.1.0" # x-release-please-version` in `[workspace.package]`)

**Interfaces:**
- Consumes: the Dockerfile stages `artifact`/`runtime` and the build arg `VERSION` (Task 4).

- [ ] **Step 1: release-please config.**
  - `release-type: simple`, `draft: true`, `force-tag-creation: true` (the tag must exist while the release is still a draft; check the option name against the current release-please docs), `include-v-in-tag: true`, `changelog-path: CHANGELOG.md`.
  - `extra-files`:
    - `Cargo.toml` (generic updater)
    - `Cargo.lock` (`type: toml`, a jsonpath that updates `version` for packages named `liroxnotes-app`, `liroxnotes-backend`, `liroxnotes-shared`)
  - The CI `cargo metadata --locked` step is the check that the lock update works.
- [ ] **Step 2: `release.yml`.** Trigger: `push` to `main`. Top-level `permissions: {}`.
  1. **`release-please`** (`contents: write`, `pull-requests: write`):
     - Get a token via `actions/create-github-app-token` with `RELEASE_APP_ID`/`RELEASE_APP_PRIVATE_KEY`, then run `googleapis/release-please-action` with that token.
     - Outputs: `release_created`, `tag_name`, `version`, `prerelease` (true if the version contains `-`).
  2. **`verify`** (if `release_created`): check out the tag. Fail unless the `cargo metadata` workspace member version == `version` and `git merge-base --is-ancestor $tag origin/main`.
  3. **`gate`** (needs `verify`): `environment: release` (requires manual approval); no steps beyond an echo.
  4. **`build`** (needs `gate`):
     - Matrix `{arch: amd64, runner: ubuntu-24.04, triple: x86_64}` and `{arch: arm64, runner: ubuntu-24.04-arm, triple: aarch64}`. Permissions `contents: read`, `packages: write`.
     - Steps: buildx; log in to ghcr with `GITHUB_TOKEN`.
     - Build `--target runtime` with `push-by-digest=true,name-canonical=true,push=true`, `build-args: VERSION=…`, and a per-arch GHA cache. Export the digest as an artifact.
     - Build `--target artifact` with `outputs: type=local,dest=out`. Then `tar -C out -czf liroxnotes-server-${version}-${triple}-linux-musl.tar.gz server public` and upload it as an artifact.
  5. **`publish`** (needs `build`; `contents: write`, `packages: write`, `id-token: write`, `attestations: write`):
     - Download the artifacts.
     - `docker buildx imagetools create` with tags `X.Y.Z`; add `X.Y` and `latest` only when not a pre-release. Record the manifest digest.
     - `actions/attest-build-provenance` on the image (`subject-name: ghcr.io/yoramdelangen/lirox-notes`, `subject-digest`, `push-to-registry: true`) and on both tarballs.
     - `anchore/sbom-action` on the image (SPDX JSON), then `actions/attest-sbom` on the image.
     - `sha256sum *.tar.gz > SHA256SUMS`.
     - `gh release upload $tag *.tar.gz SHA256SUMS sbom.spdx.json`.
     - `gh release edit $tag --draft=false` (and `--prerelease` when a pre-release).
  - Pin actions by SHA as in Task 5.
- [ ] **Step 3: Verify (static).** Run `actionlint` on both workflows (`go install` or `brew install actionlint`) and expect no findings. A dry run without secrets isn't possible, so the first real release goes through the checklist in Task 7.
- [ ] **Step 4: Commit** `ci: release-please release workflow with attestations`

---

### Task 7: Documentation and release checklist

**Files:**
- Modify: `README.md`, `planning/stage-7-release-first-version/RELEASE_CHECKLIST.md`, `crates/app/ONBOARDING_AUTH.md` (git credentials paragraph)
- Possibly modify: `crates/gateway/API.md` (only if any externally visible error text changed in Tasks 2–3)

- [ ] **Step 1: README "Run with Docker/Podman".**
  - A `podman run` one-liner and a pointer to `compose.yaml`.
  - The env table, copied from Global Constraints.
  - Volumes.
  - A note that passkeys need HTTPS unless you use `localhost`.
  - Deploy-key setup (`ssh-keygen -t ed25519 -f lirox_deploy -N ""`, add as a write-enabled deploy key, mount read-only).
  - `known_hosts` pinning (`ssh-keyscan github.com > known_hosts`, then compare against GitHub's published fingerprints).
  - Fine-grained token setup (one repo, Contents read/write, with expiry).
  - Verifying a release: `gh attestation verify oci://ghcr.io/yoramdelangen/lirox-notes:X.Y.Z -R yoramdelangen/lirox-notes`.
  - Fix the stale config path statement (`user_config.rs` uses `lirox-notes/config.toml`).
- [ ] **Step 2: `RELEASE_CHECKLIST.md`.**
  - **Technical Readiness**, the one-time GitHub setup, each step as a `gh`/UI instruction:
    - Branch protection on `main` (PR required, CI checks required, no force-push).
    - Tag ruleset for `v*`: creation restricted to the release App, no update or delete.
    - `release` environment with you as the required reviewer.
    - Immutable releases enabled.
    - Create the GitHub App (Contents and Pull requests read/write, installed on this repo only) and store `RELEASE_APP_ID`/`RELEASE_APP_PRIVATE_KEY`.
    - "Allow GitHub Actions to create pull requests".
    - After the first release: set the GHCR package to public and confirm an anonymous `podman pull`.
  - **Per-release steps:** merge the release PR → approve the `release` environment → check the release assets and `gh attestation verify`.
- [ ] **Step 3: Verify.** Check that every link and path mentioned exists: `grep -o '\`[^\`]*\.\(md\|yaml\|yml\|toml\)\`' README.md`, then check each one by hand.
- [ ] **Step 4: Commit** `docs: container usage, credentials and release checklist`
