# Hosted Frontend & Server Selection (scheduled)

Status: **scheduled, not started.** Tracked in GitHub issues (see
"Follow-ups" in `planning/stage-7-release-first-version/KNOWN_ISSUES.md`).

## Intent

Serve the frontend + editor as static files without a server (e.g. one public
site), and let each person point it at their own LiroxNotes server before
logging in.

## What it builds on

The onboarding domain list (`2026-11-02-onboarding-domains-design.md`) is the
server's list of places allowed to open your notes. A hosted frontend is one
more entry in that list.

## Open design points

1. **Server selection.** Before login, the static frontend asks for the server
   URL, validates it (`/api` reachable, TLS), and remembers it in browser
   storage. Switching servers clears local state.
2. **Passkeys are bound to the page's domain**, so passkeys created on the
   hosted frontend belong to its domain, not the server's. The server must
   accept that frontend's origin and RP ID; because unrelated domains cannot
   share a passkey, each domain needs its own passkey.
3. **Adding a domain after onboarding.** Signed in on an existing domain, the
   owner adds a new domain and receives a short-lived one-time code / link; on
   the new domain the code allows registering a passkey for that domain.
   Requires per-RP-ID credential storage on the server (one `Webauthn`
   instance per RP ID).
4. **Cross-origin API.** CORS allowlist = configured origins;
   session cookies become `SameSite=None; Secure` or move to a bearer token
   held in memory. CSRF protection must be re-evaluated.
5. **Build.** A `dx bundle --web` build without the server feature, with the
   server URL resolved at runtime instead of `LIROX_SERVER_URL` at compile
   time.
6. **Domain management UI.** List, add (with the code flow), remove domains
   while signed in; never remove the domain you are using.
