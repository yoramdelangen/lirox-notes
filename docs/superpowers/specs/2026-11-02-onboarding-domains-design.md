# Onboarding Domains Design

## Intent

Setting `LIROX_RP_ID` / `LIROX_RP_ORIGIN` before the first start is the least
developer-friendly part of running LiroxNotes: get them wrong and passkey
registration fails with an opaque browser error. Instead, the first
onboarding step asks which domain(s) the app is served on, prefilled from the
browser's own address, and the server stores the answer locally.

## Decided by the user

- The domain is asked **before** the initial passkey is created.
- It defaults to the domain in the browser, including the port
  (`http://localhost:8989`, `https://something.example.com:6789`), and is only
  stored after the user confirms it.
- It is stored locally by the server instead of in environment variables.
- Multiple domains are allowed.
- Future: the frontend + editor can be hosted on their own (no server); before
  login the user specifies their own server. That is a separate, scheduled
  project (see `2026-11-02-hosted-frontend-design.md`); this design must not
  block it.

## Design (executor's calls, made while the user was away)

- **Domain step.** New first onboarding screen while no passkey exists and no
  domains are configured: an editable list of origins, prefilled with
  `window.location.origin`. Rows can be added and removed. The current origin
  must stay in the list (the passkey is created on this page). Confirming
  stores the list, then the existing passkey step follows.
- **Origins.** `scheme://host[:port]`, no path. `https` for any host; `http`
  only for `localhost` / `*.localhost` (browsers only allow WebAuthn over HTTP
  there). Normalised, deduplicated, order kept.
- **RP ID** (the domain passkeys are bound to) = the host of the first origin.
  Every other origin must be the same host (another port) or a subdomain of
  it. Unrelated domains (e.g. `localhost` + `notes.example.com`) cannot share
  a passkey and are rejected with a clear message; supporting them needs
  per-domain passkeys and is part of the scheduled follow-up.
- **Storage.** `domains` file next to the application config
  (`<config dir>/domains`), lines `rp_id=…` and `origin=…`, written
  atomically.
- **Precedence.** `LIROX_RP_ID` + `LIROX_RP_ORIGIN` environment variables
  (when set) → stored `domains` → legacy development default
  (`http://localhost:8989`, `http://localhost:3010`) *only* when a passkey
  already exists (keeps existing installs working) → otherwise "not
  configured" and the domain step is shown. With the environment override the
  domain step is skipped.
- **Who may set domains.** Only while no passkey account exists, and only when
  the request's `Origin` header is one of the submitted origins. After
  onboarding, changing domains is out of scope here (scheduled).
- **Cookies.** `Secure` when the first origin is `https`.
- **Image / dev defaults.** The Dockerfile and `just dev` stop setting
  `LIROX_RP_*`, so the domain step is what configures them; the release-build
  warning about a missing `LIROX_RP_ORIGIN` is removed.
- **Bootstrap** additionally returns `domains: { origins, rp_id, source }`
  with `source` one of `environment`, `stored`, `default`, `none`. Origins are
  public URLs, so exposing them before login is fine.

## Non-goals

- Managing domains after onboarding; unrelated domains with separate
  passkeys; CORS / cross-site cookies for a separately hosted frontend.

## Anti-goals

- Accepting `http` origins for non-localhost hosts.
- Letting anyone change domains once a passkey exists.
