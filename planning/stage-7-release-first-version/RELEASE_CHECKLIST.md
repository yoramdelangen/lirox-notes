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

1. **GitHub App for releases** (Settings → Developer settings → GitHub Apps →
   New): no webhook; repository permissions *Contents: read and write* and
   *Pull requests: read and write*; install it on this repository only.
   Generate a private key.
2. **Environment `release-pr`** (Settings → Environments): deployment branches
   limited to `main`, no reviewers. Add secrets `RELEASE_APP_ID` and
   `RELEASE_APP_PRIVATE_KEY`.
3. **Environment `release`**: you as required reviewer, deployment branches
   limited to `main` (the release jobs run from the push to `main`, so a
   tag-only policy would block every release; tag integrity comes from the
   `v*` ruleset below).
4. **Branch protection / ruleset for `main`**: require a pull request, require
   the CI checks (`rust`, `deny`, `image`), block force pushes and deletion.
5. **Tag ruleset for `v*`**: restrict creation to the release GitHub App,
   block updates and deletion.
6. **Immutable releases** (Settings → General → Releases): enable.
7. **Actions settings**: workflow permissions *read repository contents*;
   allow GitHub Actions to create pull requests is *not* needed (the App
   creates them).
8. **After the first release**: set the `lirox-notes` package to *Public*
   (Packages → Package settings) and confirm `podman pull
   ghcr.io/yoramdelangen/lirox-notes:latest` works without logging in.

### Per release

1. Review and merge the release-please PR (CI must be green).
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
