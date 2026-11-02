# Release Checklist

## Product Readiness

- Undecided.

## Technical Readiness

Releases are automated: every push to `main` updates a release-please PR
(version bump in `Cargo.toml`/`Cargo.lock`, `CHANGELOG.md`). Merging it tags
`vX.Y.Z` and creates a draft release; `.github/workflows/release.yml` then
waits for approval, builds amd64/arm64 on native runners, pushes
`ghcr.io/yoramdelangen/lirox-notes`, attests provenance and SBOM, uploads the
tarballs and publishes the release.

### One-time GitHub setup

1. **Actions settings**: default workflow permissions *read repository
   contents*, and *Allow GitHub Actions to create and approve pull requests*
   enabled (release-please opens its PR with `GITHUB_TOKEN`).
2. **Environment `release`**: you as required reviewer, deployment branches
   limited to `main` (the release jobs run from the push to `main`).
3. **Ruleset for `main`**: block force pushes and deletion. Do not require
   status checks: release PRs made with `GITHUB_TOKEN` do not trigger CI.
4. **Tag ruleset for `v*`**: block updates and deletion.
5. **Immutable releases** (Settings → General → Releases): enable.
6. **After the first release**: set the `lirox-notes` package to *Public*
   (Packages → Package settings) and confirm `podman pull
   ghcr.io/yoramdelangen/lirox-notes:latest` works without logging in.

Optional hardening: create a GitHub App (Contents + Pull requests write,
installed on this repository only) and pass its token to release-please, so
CI also runs on release PRs and the `v*` ruleset can restrict tag creation to
the App.

### Per release

1. Review and merge the release-please PR.
2. Approve the `release` environment in the Release workflow run.
3. Check the published release: two tarballs, `SHA256SUMS`, `sbom.spdx.json`.
4. Verify: `gh attestation verify oci://ghcr.io/yoramdelangen/lirox-notes:X.Y.Z -R yoramdelangen/lirox-notes`.

Pre-releases: merge a release PR whose version contains a `-` (for example via
a `Release-As: 0.2.0-rc.1` commit footer); it is marked as a pre-release and
does not move `latest` or `X.Y`.

## Security Readiness

- Dependencies: `cargo deny check` (advisories, licenses, sources) runs in CI;
  Dependabot updates crates, Actions (pinned by SHA) and base images (pinned by
  digest) weekly.
- Runtime: distroless/static, non-root uid 65532, no shell, no `git` binary.

## Documentation Readiness

- Container usage, environment, Git credentials and release verification are
  documented in the README.
