# Onboarding & Authentication Context

## Keyboard-First Notes Workspace

This document defines the product and UX context for **first-time onboarding, passkey authentication, session recovery, and initial workspace setup**.

It is intentionally separate from the main application/workbench design context.

## 1. Goals

The experience should be:

- passwordless;
- passkey-first;
- short and focused;
- secure without feeling bureaucratic;
- keyboard-friendly;
- visually consistent with the main app;
- extensible to future Git-platform integrations;
- mediated through the Gateway/API.

The frontend must not own authentication secrets, WebAuthn policy, repository logic, or workspace-storage logic.

## 2. Initial Authentication Strategy

For v1:

```text
Authentication method:
    Passkeys only
```

Do not implement passwords, password reset, password complexity rules, or fallback password login.

A user must register at least one passkey during first-time setup.

After onboarding, unauthenticated users sign in with a passkey.

## 3. Future Direction

Future integrations may include:

- GitHub
- GitLab
- Bitbucket
- other Git platforms

These may later provide repository authorization, repository discovery/import, synchronization, or potentially identity.

Do not assume Git-provider authentication replaces passkeys.

A likely future model is:

```text
Account authentication:
    Passkey

Connected services:
    GitHub
    GitLab
    Bitbucket
```


## 4. Startup State Model

Two questions determine startup:

```text
Has the platform completed onboarding?
Is the current session authenticated?
```

Conceptual states:

```text
PlatformState
├── Uninitialized
└── Initialized

AuthenticationState
├── Unknown
├── Unauthenticated
├── Authenticating
└── Authenticated
```

Routing:

```text
Application starts
      │
      ▼
Gateway bootstrap/session status
      │
      ├── Not onboarded
      │      ▼
      │   Onboarding
      │
      └── Onboarded
             │
             ├── Authenticated → Main App
             └── Unauthenticated → Passkey Login
```

The Gateway is authoritative. The frontend must not infer onboarding state from local storage.

## 5. First-Time Onboarding Flow

Required sequence:

```text
Welcome
   ↓
Create Passkey
   ↓
Gateway verifies + stores passkey
   ↓
Authenticated session established
   ↓
Initial Workspace Setup
   ↓
Workspace created
   ↓
Onboarding marked complete
   ↓
Main Application
```

Workspace setup must not begin until passkey registration has been verified successfully by the Gateway.

## 6. Welcome Screen

Suggested content:

```text
Welcome

Set up this installation in two steps:

1. Secure access with a passkey.
2. Create your first workspace.

[Set up passkey]
```

Keep the primary screen concise. Optional secondary copy:

```text
No password required.
```


## 7. Passkey Registration

Primary action:

```text
Create passkey
```

Conceptual flow:

```text
Frontend
   │ request registration options
   ▼
Gateway
   │ challenge + WebAuthn creation options
   ▼
Browser / authenticator passkey UI
   │ credential response
   ▼
Frontend
   │ send credential response
   ▼
Gateway
   │ verify + persist credential
   ▼
Authenticated session
```

Illustrative endpoints only:

```text
POST /auth/passkeys/register/options
POST /auth/passkeys/register/verify
```

Use the Gateway's existing naming and transport conventions.

### Gateway responsibilities

The Gateway should own:

- WebAuthn challenge generation;
- challenge expiry;
- relying-party configuration;
- allowed origins;
- credential verification;
- credential public-key storage;
- credential/user association;
- replay protection;
- authenticator metadata/sign-counter handling where applicable;
- session creation after successful registration.

The frontend should only:

1. request registration options;
2. invoke the browser credential API;
3. return the credential response to the Gateway;
4. render success/failure.

## 8. Passkey Confirmation

Successful browser credential creation alone is not completion.

Completion means:

```text
Credential created
    ↓
Gateway verifies it
    ↓
Gateway persists it
    ↓
Gateway creates authenticated session
    ↓
Passkey confirmed
```

Suggested UI:

```text
Passkey ready ✓
```

Then continue to workspace setup.


## 9. Initial Workspace Setup

After passkey confirmation, collect the fields required to create the first workspace.

The Gateway remains authoritative for:

- workspace configuration;
- repository mapping;
- Git behavior;
- filesystem behavior;
- validation;
- workspace creation.

The frontend should collect only fields supported by the workspace-creation API.

## 10. API Documentation Grounding Requirement

**The exact workspace bootstrap fields must come directly from the Gateway/API documentation.**

The API documentation was not available among the files accessible while this document was generated, so the fields are intentionally not invented.

Before implementation or final design:

1. locate the workspace-create endpoint;
2. record every required field;
3. record useful optional fields;
4. identify server defaults;
5. identify validation/error responses;
6. determine whether repository initialization is implicit;
7. determine whether activation is implicit after creation.

Complete this table from the API docs:

| API field | Required | User label | Input type | Default | Validation |
|---|---|---|---|---|---|
| _From API docs_ | | | | | |

Do not introduce frontend-required fields unless there is a product requirement.

## 11. Workspace Setup UX

Keep the form short.

Prefer only:

```text
Workspace name
API-required location/root/config fields
Other fields only when the user must understand them
```

Hide advanced configuration when server defaults are sufficient.

Validation:

- client-side for obvious required/format errors;
- Gateway-side for uniqueness, filesystem validity, repository state, permissions, Git requirements, and workspace configuration validity.


## 12. Onboarding State

Prefer explicit Gateway onboarding state rather than inferring completion.

Possible conceptual values:

```text
not_started
passkey_required
workspace_required
complete
```

A bootstrap response might conceptually expose:

```json
{
  "onboarding": {
    "status": "workspace_required"
  },
  "authentication": {
    "authenticated": true
  }
}
```

Exact schema should follow the existing API.

### Resumability

Onboarding must survive:

- refresh;
- tab closure;
- network interruption;
- frontend restart.

Example:

```text
Passkey registered
Workspace not yet created
Browser closes
    ↓
Next launch
    ↓
Gateway reports workspace_required
    ↓
Resume at Workspace Setup
```

Do not require another passkey registration.

## 13. Completing Onboarding

After workspace creation succeeds:

```text
Gateway marks onboarding complete
    ↓
Frontend receives completion state
    ↓
Main Application
```

Prefer explicit onboarding completion state over simply checking whether any workspace exists.


## 14. Login Flow

When:

```text
Platform = onboarded
Session = unauthenticated
```

show a dedicated passkey login screen.

Suggested:

```text
Welcome back

Use your passkey to continue.

[Continue with passkey]
```

No username/password form should appear unless the identity model truly requires an identifier before WebAuthn.

## 15. Passkey Login Flow

Conceptually:

```text
Frontend
   │ request authentication options
   ▼
Gateway
   │ WebAuthn request options
   ▼
Browser passkey UI
   │ assertion
   ▼
Frontend
   │ send assertion
   ▼
Gateway
   │ verify
   ▼
Authenticated session
   ↓
Main Application
```

Illustrative endpoints:

```text
POST /auth/passkeys/login/options
POST /auth/passkeys/login/verify
```

Prefer discoverable-credential flows where possible so login can remain:

```text
[Continue with passkey]
```

instead of requiring a username field.

The Gateway auth design must explicitly determine whether this is supported.

## 16. Session Model

Successful registration or login must produce an authenticated Gateway session.

The frontend should ideally rely on a secure server-managed browser session rather than persisting bearer credentials in general-purpose browser storage.

Gateway/session design must define:

- session creation;
- session validation;
- expiry;
- logout;
- invalidation;
- renewal behavior;
- CSRF strategy where relevant;
- secure cookie policy where cookies are used.

At startup, prefer one authoritative bootstrap/session request that exposes onboarding + authentication state.


## 17. Logout

Provide logout even in a passkey-only application.

Conceptual command:

```text
auth.logout
```

Flow:

```text
Logout
  ↓
Gateway invalidates session
  ↓
Unauthenticated
  ↓
Passkey Login
```

Logging out does not remove the passkey.

## 18. Passkey Management — Later

The credential model should allow multiple passkeys even if v1 onboarding creates only one.

Future settings may include:

```text
Passkeys

✓ MacBook Touch ID
✓ iPhone
✓ Security Key

[Add passkey]
```

Potential actions:

- add passkey;
- rename/display passkey;
- remove passkey;
- show created/last-used metadata.

## 19. Recovery

A passkey-only system needs an explicit recovery strategy before production if credential loss could lock a user out.

Possible future strategies:

- multiple passkeys;
- hardware security key;
- administrator recovery;
- recovery codes;
- trusted provider identity.

Do not silently fall back to passwords.


## 20. Keyboard-First UX

The surrounding onboarding/login UI should be keyboard-friendly, but it should behave like conventional accessible forms rather than introducing Vim modes.

Requirements:

- sensible initial focus;
- Enter activates primary action;
- predictable Tab order;
- Escape closes cancellable dialogs;
- visible focus states;
- no app shortcuts interfere with native passkey UI.

## 21. Visual Relationship to Main App

Use the same:

- typography;
- spacing;
- color system;
- iconography;
- controls;
- focus treatment.

But onboarding/auth should use a simpler shell.

Do not show the main:

- File Tree;
- Workbench;
- Vim status bar;
- command palette

until authentication/onboarding is complete.

Suggested auth shell:

```text
┌──────────────────────────────────────┐
│                                      │
│           App identity               │
│                                      │
│      Authentication / Setup          │
│                                      │
└──────────────────────────────────────┘
```

A narrow central column is appropriate.

## 22. Onboarding Progress

Keep progress lightweight:

```text
Passkey → Workspace
```

or:

```text
1 Secure access
2 Workspace
```

Do not expose future Git integrations as disabled setup steps.


## 23. Screens to Design

### Screen 1 — First Launch / Welcome

State:

```text
Platform not initialized
```

Primary action:

```text
Set up passkey
```

### Screen 2 — Passkey Registration

```text
Secure your account

Use a passkey to sign in without a password.

[Create passkey]
```

### Screen 3 — Native Passkey Interaction

Do not recreate authenticator UI. The browser/platform owns it.

### Screen 4 — Passkey Confirmed

```text
Passkey ready ✓

[Continue]
```

### Screen 5 — Initial Workspace Setup

Fields:

```text
TO BE GROUNDED IN GATEWAY API DOCUMENTATION
```

Design:

- pristine;
- field validation;
- submitting;
- Gateway validation errors.

### Screen 6 — Creating Workspace

```text
Creating workspace…
```

### Screen 7 — Onboarding Complete

Optional:

```text
You're ready.
```

Then enter the app.

### Screen 8 — Passkey Login

```text
Welcome back

[Continue with passkey]
```

### Screen 9 — Authentication Failed

```text
We couldn't verify that passkey.

[Try again]
```

### Screen 10 — Session Expired

```text
Your session has expired.

[Continue with passkey]
```

Preserve recoverable workbench context where feasible.


## 24. Errors and Cancellation

Design states for:

- native credential prompt cancelled;
- no eligible passkey;
- unsupported browser capability;
- Gateway unavailable;
- challenge expired;
- verification failed;
- setup completed elsewhere.

Prefer calm retryable messaging.

Example:

```text
Passkey setup wasn't completed.

[Try again]
```

Cancellation is not a catastrophic error.

Use operation-specific loading labels:

```text
Preparing passkey…
Verifying passkey…
Signing you in…
Creating workspace…
```

## 25. Frontend Commands

Suggested semantic commands:

```text
auth.start_passkey_registration
auth.retry_passkey_registration
auth.start_passkey_login
auth.logout

onboarding.continue
onboarding.create_workspace

workspace.activate
```

Buttons should dispatch commands rather than contain auth logic.

## 26. Application Events

Examples:

```text
PasskeyRegistrationOptionsReceived
PasskeyRegistrationVerified
PasskeyRegistrationFailed

AuthenticationOptionsReceived
AuthenticationSucceeded
AuthenticationFailed

SessionExpired
LoggedOut

OnboardingStateLoaded
WorkspaceCreated
OnboardingCompleted
```


## 27. Gateway Capability Checklist

### Bootstrap / installation

- [ ] Report whether onboarding is complete.
- [ ] Report current onboarding step.
- [ ] Resume incomplete onboarding.
- [ ] Mark onboarding complete explicitly.

### Passkey registration

- [ ] Generate WebAuthn registration options/challenge.
- [ ] Persist challenge state securely.
- [ ] Verify registration response.
- [ ] Persist credential ID + public key.
- [ ] Associate credential with a user/account.
- [ ] Handle challenge expiry/replay.
- [ ] Establish session after registration.

### Passkey authentication

- [ ] Generate authentication challenge/options.
- [ ] Verify assertion.
- [ ] Resolve credential to user/account.
- [ ] Reject invalid/replayed assertions.
- [ ] Establish authenticated session.

### Session

- [ ] Query session/auth state.
- [ ] Create session.
- [ ] Expire session.
- [ ] Logout/invalidate.
- [ ] Define lifetime/renewal.
- [ ] Define secure browser transport/storage.

### Workspace bootstrap

- [ ] Document workspace-create fields.
- [ ] Create initial workspace.
- [ ] Validate workspace configuration.
- [ ] Return useful validation errors.
- [ ] Identify initial/default workspace.
- [ ] Activate/return created workspace as appropriate.

### Recommended passkey management

- [ ] List registered passkeys.
- [ ] Add another passkey.
- [ ] Remove passkey safely.
- [ ] Expose display metadata.

These management operations may be postponed, but the data model should not assume one credential forever.


## 28. Potential Gateway Additions

If missing, add capabilities equivalent to:

```text
GET  bootstrap/status

POST auth/passkeys/register/options
POST auth/passkeys/register/verify

POST auth/passkeys/login/options
POST auth/passkeys/login/verify

GET  auth/session
POST auth/logout

POST onboarding/workspace
POST onboarding/complete
```

Names are illustrative only.

Follow existing Gateway resource naming, response envelopes, and error conventions.

## 29. Security Boundary

The frontend must never be authoritative for:

- onboarding completion;
- authentication success;
- identity;
- passkey verification;
- credential validity;
- workspace authorization.

The Gateway decides these facts.

The frontend represents them.

## 30. Future Git Provider Integration

Potential future settings:

```text
Connected services

GitHub      Connect
GitLab      Connect
Bitbucket   Connect
```

Possible flow:

```text
Authenticated user
    ↓
Connect provider
    ↓
OAuth / provider app flow
    ↓
Gateway stores authorization
    ↓
Repository discovery/import
```

Keep this conceptually separate from passkey login unless future product requirements deliberately merge them.


## 31. Design File Structure

```text
00 — Authentication Context
01 — First-Time Onboarding
02 — Passkey Registration
03 — Workspace Bootstrap
04 — Passkey Login
05 — Session States
06 — Errors & Recovery
07 — Responsive / Accessibility
08 — Future Git Integrations
```

## 32. Prototype Flows

### Fresh installation

```text
Launch
→ Welcome
→ Create passkey
→ Native passkey UI
→ Passkey verified
→ Workspace setup
→ Create workspace
→ Main application
```

### Resume interrupted onboarding

```text
Launch
→ Gateway says workspace_required
→ Workspace setup
→ Complete onboarding
→ Main application
```

### Returning unauthenticated user

```text
Launch
→ Platform onboarded
→ No session
→ Continue with passkey
→ Native passkey UI
→ Authenticated
→ Main application
```

### Existing session

```text
Launch
→ Authenticated
→ Main application
```

### Session expiry

```text
Using app
→ Session expires
→ Authentication gate
→ Continue with passkey
→ Restore recoverable app context
```


## 33. V1 Definition of Done

1. Fresh install reports onboarding incomplete.
2. Frontend routes to onboarding.
3. User must register a passkey successfully.
4. Gateway verifies and stores the credential.
5. Authenticated session is established.
6. Onboarding resumes correctly after refresh.
7. Initial workspace fields match documented API fields.
8. Initial workspace can be created.
9. Gateway records onboarding completion.
10. User enters main app.
11. Returning unauthenticated users see Passkey Login.
12. Successful passkey auth establishes a session.
13. Existing authenticated sessions enter directly.
14. Logout invalidates the session.
15. No password flow exists.
16. Frontend does not know repository/Git topology.
17. Passkey errors and cancellation are retryable.
18. Authentication/onboarding state is Gateway-authoritative.

## 34. Open API-Grounded Decisions

Resolve these from the actual API documentation before implementation:

- exact workspace-create endpoint;
- required workspace fields;
- optional workspace fields;
- server defaults;
- validation responses;
- whether workspace activation is implicit;
- current user/account model;
- current session model;
- current bootstrap/status endpoint;
- whether WebAuthn/passkey support already exists;
- whether deployment is single-user or multi-user;
- relying-party ID/origin configuration;
- whether multiple passkeys are supported initially.

Do not guess these values.

## 35. Final Product Rule

The desired experience is:

```text
Fresh install:
    Secure it → Create workspace → Start working

Returning user without session:
    Use passkey → Start working

Returning user with session:
    Start working
```

Authentication should be secure and explicit, while occupying as little of the user's attention as possible.
