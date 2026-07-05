# Security

This file contains security topics LiroxNotes must account for during technical design and implementation.

## Security Principles

- Git is the durable source of truth for notes.
- The gateway should not become a permanent note database.
- The gateway should store as little long-lived user data as possible.
- The gateway should be able to rebuild repository state from Git when possible.
- Sensitive credentials should never be stored in plain text.
- User note content should not be logged.
- User note content should not be indexed permanently on the server unless explicitly needed later.

## Gateway Data Minimization

- Store minimal user identity information.
- Store minimal repository connection information.
- Avoid storing device fingerprints.
- Avoid storing permanent note content outside Git.
- Avoid storing permanent search indexes of note content on the server.
- Keep temporary repository clones as cache, not source of truth.
- Repository caches should be deletable and rebuildable.
- Embedded SurrealDB stores persistent metadata and user accounts.
- SurrealDB should not store note content as the primary source of truth.

## Persistent Metadata Store

- Use embedded SurrealDB for user accounts and metadata.
- SurrealDB can store users, sessions, repository connections, encrypted credential references, workspace metadata, and app settings.
- Git remains the source of truth for notes, attachments, workspace config, trash, and history.
- Repository URLs and credential references stored in SurrealDB should be encrypted at rest.

## Git Access Credentials

- The gateway needs a secure way to access Git repositories.
- Credential options need careful review before implementation.
- Possible options include OAuth tokens, deploy keys, SSH keys, personal access tokens, or provider-specific app tokens.
- Tokens or private keys must be encrypted at rest if stored.
- Credentials should be scoped to the least permissions possible.
- Read/write repository access is needed for sync.
- Credentials should be revocable.
- Credentials should never be sent to the browser after setup.
- Hosted MVP supports SSH Git remotes only.
- Hosted MVP uses per-repository Ed25519 deploy keys.
- The gateway generates the deploy key pair for hosted repository connections.
- The user adds the generated public key to the Git provider with write access.
- The gateway stores the private key encrypted at rest.
- Local mode can use SSH or HTTPS through the user's local Git setup.
- Hosted HTTPS support is deferred to V2 because it requires provider-specific credential handling.

## Public Key Consideration

- A user-provided public key alone cannot authenticate Git write access.
- A public key can be useful if the user encrypts data for themselves or identifies a key pair.
- For SSH Git access, the gateway would need access to a private key or signing mechanism, not only the public key.
- Storing only a public key is safer but does not solve pushing to Git by itself.
- One possible model is user-provided SSH public key plus an external signing/agent flow, but this is likely too complex for MVP.
- Another possible model is the gateway generates a deploy key pair and asks the user to add the public key to the Git provider.
- If the gateway generates a deploy key pair, the private key must be encrypted at rest.

## Encrypting Git Location And Repository Metadata

- Repository URLs can reveal sensitive information such as organization names, project names, or usernames.
- Repository connection metadata should be treated as sensitive.
- Repository URLs should be encrypted at rest if stored server-side.
- Workspace paths may reveal sensitive context and should also be treated carefully.
- Server logs should not print repository URLs, access tokens, or workspace paths unless explicitly scrubbed.

## Encrypting Repository Cache

- Temporary repository clones may contain user note content.
- Repository cache storage should be protected at the filesystem and hosting level.
- Encrypting repository cache at rest should be considered if deployment environment supports it.
- Cache directories should be scoped per user/repository.
- Cache directories should have strict permissions.
- Cache cleanup policy should be defined.
- Cache should be considered disposable.

## Authentication And Sessions

- User access should stay simple but secure.
- Session cookies should be secure, HTTP-only, and same-site where possible.
- CSRF protection should be considered for state-changing gateway routes.
- API requests should require authenticated sessions.
- Session expiration and revocation should be defined.
- The app should avoid storing unnecessary long-lived device information.

## Git Command Safety

- The gateway should use an internal Git backend interface so the concrete Git implementation can be changed later.
- Candidate implementations include system `git` CLI and gitoxide.
- The initial Git backend uses command-based Git operations behind the internal Git interface.
- Because command-based Git is used initially, command safety rules apply.
- Do not execute shell strings built from user input.
- Use structured command arguments.
- Validate repository IDs, workspace paths, and file paths.
- Prevent path traversal with `..` or absolute server paths.
- Restrict Git commands to controlled repository directories.
- Do not expose arbitrary Git commands through the API.
- Do not allow clients to pass raw Git arguments.

## Hosted And Local Modes

- Hosted mode runs the Actix gateway as a server binary.
- Hosted mode exposes the gateway over the normal HTTP web server.
- Hosted mode should use encrypted stored credentials or deploy keys.
- Local mode means a Dioxus desktop app running on the user's own machine.
- Local mode can use the user's local Git configuration, local SSH keys, and SSH agent.
- Local mode should avoid uploading private keys to a remote server.
- Local mode uses the local SSH agent by default.
- Local mode uses a Unix socket for the local gateway API.

## Commit Author And Signing

- Local mode uses the local Git author configuration by default.
- If local Git author configuration is missing, onboarding asks for commit author name and email.
- Hosted mode asks for commit author name and email during onboarding.
- Hosted mode stores commit author information in user or repository settings.
- Commit signing is not required for MVP.
- Hosted commit signing is a later security and usability topic.

## File Path Safety

- All workspace paths must stay inside the selected workspace directory.
- All repository paths must stay inside the controlled repository cache directory.
- Absolute server filesystem paths should never be exposed to the client.
- File creation, rename, move, delete, and attachment operations must validate target paths.
- Hidden control files should be protected where needed.

## Conflict And Merge Safety

- Conflict content may include private note content.
- Conflict data should not be logged.
- Conflict resolution should not silently discard local or remote changes.
- Keep mine, keep remote, and per-block choices should be explicit.
- Safe automatic merges are allowed only when they are truly conflict-free.

## Logging

- Do not log note content.
- Do not log frontmatter content by default.
- Do not log credentials or tokens.
- Do not log repository URLs without redaction.
- Do not log raw Git command output if it can contain sensitive paths or content.
- Log operation IDs, high-level status, and safe error categories instead.

## Open Security Questions

- What authentication model should MVP use?
- Should repository URLs be encrypted at rest on the server?
- Should Git credentials be stored server-side, or should users provide them per session?
- Should MVP use OAuth, deploy keys, SSH keys, personal access tokens, or a simpler manual setup?
- Should the gateway generate deploy keys for repositories?
- Should repository cache be encrypted at rest?
- How long should repository caches be kept?
- How should users revoke repository access?
- How should secrets be rotated?
- What deployment environment will provide filesystem encryption, secret storage, and process isolation?
