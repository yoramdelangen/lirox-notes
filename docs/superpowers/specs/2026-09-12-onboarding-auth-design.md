# Onboarding and Passkey Authentication Design

## Scope

Replace the gateway's legacy local password/passwordless login with a
passkey-only authentication flow and explicit, resumable onboarding state.
The gateway remains authoritative for authentication, sessions, onboarding,
and workspace creation. The Dioxus workbench remains inaccessible until the
gateway reports an authenticated session and completed onboarding.

This change does not include Git-provider OAuth, passkey management screens,
credential recovery, or frontend API wiring beyond the onboarding/auth gate.

## Current Context

The gateway currently persists a single local user record, accepts a username
and optional password, and stores one session token in a file. Workspace setup
is already implemented through `POST /api/workspaces` and accepts:

- `repo_mode` (optional; `remote` selects a remote repository)
- `workspace_slug` (optional; defaults to `workspace`)
- `workspace_name` (optional; defaults to `My Workspace`)
- `repo_url` (optional; required for remote mode)
- `branch` (optional; defaults to `main`)

The existing gateway API documentation at `crates/gateway/API.md` is
authoritative and must be updated with every changed endpoint or contract.

## State Model

The gateway exposes one bootstrap response containing:

- installation state;
- explicit onboarding status: `not_started`, `workspace_required`, or
  `complete`;
- authentication state: authenticated or unauthenticated;
- current user when authenticated;
- workspace root/defaults needed by the setup form.

The frontend only renders the state returned by this response. It does not
infer onboarding from local storage, files, or workspace existence.

Routing is:

```text
not installed       -> installation/setup
not_started         -> passkey registration
workspace_required  -> workspace setup
complete + no auth  -> passkey login
complete + auth     -> workbench
```

Registration completion establishes the session before workspace setup. A
refresh or restart after registration returns `workspace_required` without
requiring another registration.

## Gateway Authentication

Use a WebAuthn implementation in the gateway. The gateway owns relying-party
configuration, allowed origins, challenge generation and expiry, credential
verification, credential persistence, user association, replay protection,
and sign-counter handling where supported.

Persist an account record that can contain multiple credentials even though
the first setup creates one. Persist challenges as short-lived, single-use
records associated with the operation and account context. Consume a
challenge only after successful verification and reject expired or reused
challenges.

Expose the following gateway routes, following existing `/api` JSON and error
conventions:

```text
GET  /api/bootstrap
POST /api/auth/passkeys/register/options
POST /api/auth/passkeys/register/verify
POST /api/auth/passkeys/login/options
POST /api/auth/passkeys/login/verify
GET  /api/auth/session
POST /api/auth/logout
POST /api/workspaces
```

Registration options may be started only while onboarding requires a
passkey. Login options may be requested only after onboarding is complete.
Verification success creates or renews the secure server-side session.

Sessions use an opaque server-side token delivered in an `HttpOnly` cookie
with `Secure` when configured for HTTPS, `SameSite=Lax`, `Path=/`, expiry, and
rotation on authentication. Logout invalidates the server-side session and
clears the cookie. No bearer token is stored in general-purpose browser
storage.

RP ID and origin are environment-configurable, with local development
defaults for `localhost`. Invalid configuration fails clearly at startup or
returns a controlled gateway error; it is never guessed from an arbitrary
request host.

## Frontend Flow

The frontend uses the gateway bootstrap response to select one of four simple
screens: registration welcome, workspace setup, passkey login, or the main
workbench. Buttons dispatch semantic commands and effects perform network and
browser credential operations. Native WebAuthn UI is never recreated.

The browser credential bridge is isolated in the web platform layer. It
converts WebAuthn JSON/base64url values and reports operation success,
cancellation, unsupported capability, or gateway failure as application
events. Authentication failures and cancellation remain retryable.

The onboarding shell reuses the app typography, colors, spacing, and focus
treatment but omits the workbench, file tree, command palette, and Vim status
bars. Forms have normal accessible keyboard behavior: initial focus, Enter
submission, predictable Tab order, Escape only for cancellable dialogs, and
visible focus states.

## Workspace Bootstrap

Once registration has been verified and a session exists, the setup form sends
only the documented workspace fields. Client validation covers empty names and
obvious slug/URL format errors. The gateway remains authoritative for path
validity, repository initialization or cloning, Git configuration,
permissions, and all filesystem validation.

Successful workspace creation persists configuration and sets onboarding to
`complete` explicitly. If creation fails, the response preserves the setup
step and returns an operation-specific, retryable error.

## Security and Failure Handling

- No password fields, password hashing, password fallback, or password reset.
- Credential verification and onboarding completion are never client-authoritative.
- Challenges are short-lived and single-use.
- Session cookies are opaque, server-managed, and invalidated on logout.
- Protected workspace routes reject missing or invalid sessions.
- WebAuthn cancellation, unsupported browser, unavailable gateway, expired
  challenge, invalid assertion, and setup validation errors render retryable
  messages without exposing credential or filesystem internals.
- API error responses retain the existing `{"error":"..."}` shape.

## Verification

Add gateway tests for:

- bootstrap state transitions for fresh, passkey-registered, incomplete, and
  complete installations;
- registration/login challenge expiry and single-use behavior;
- invalid verification rejection;
- session creation, validation, expiry, rotation, and logout;
- workspace setup authorization and explicit completion;
- absence of password flow in the new routes.

Run `cargo test --workspace`, `cargo check --workspace --locked`,
`cargo fmt --all -- --check`, and `dx check --package liroxnotes-app`.
