# Agents And Skills

This file defines the project-specific AI agents and reusable skills for LiroxNotes development.

## Development Agents

- The opencode agent files are created under `.opencode/agents/`.
- They are disabled for now and should only be used when Stage 4 building begins.

## 1. Rust Developer Agent

- Writes clean, logical Rust code.
- Thinks like a senior engineer.
- Covers edge cases without overcomplicating the implementation.
- Prefers readable, maintainable code over clever code.
- Keeps abstractions small and purposeful.
- Writes code in a style that feels practical and direct.

## 2. JavaScript Developer Agent

- Writes clean, logical JavaScript or TypeScript code for the editor package.
- Thinks like a senior engineer.
- Covers edge cases without overcomplicating the implementation.
- Prefers readable, maintainable code over clever code.
- Keeps abstractions small and purposeful.
- Writes code in a style that feels practical and direct.

## 1. Architecture Agent

- Focuses on package boundaries, module boundaries, dependency direction, and system design.
- Checks whether changes preserve separation between UI, gateway, Git logic, shared models, and editor code.

## 2. Git Agent

- Focuses on repository access, clone/cache behavior, commit/sync flow, conflict flow, and Git backend abstraction.
- Helps keep Git logic isolated and testable.

## 3. UI/UX Design Agent

- Focuses on Dioxus UI behavior, UX flow, route structure, component boundaries, and editor integration points.
- Checks that UI/UX logic stays separate from domain logic.

## 4. Data Agent

- Focuses on models, naming conventions, storage layout, SurrealDB metadata, and workspace/repository structures.
- Helps keep shared Rust models consistent.

## 5. Security Agent

- Focuses on sessions, credentials, secrets, encryption, logs, cache safety, and repository access.
- Reviews security-sensitive choices before implementation.

## 6. Testing Agent

- Focuses on unit tests, integration tests, package tests, and end-to-end coverage.
- Ensures core logic stays testable without the UI or HTTP server.

## 7. Release Agent

- Focuses on MVP readiness, release checklist, known issues, and launch criteria.
- Helps confirm the project is ready for first release.

## Reusable Skills

## 1. Planning Consistency Skill

- Checks whether new decisions conflict with earlier decisions.
- Helps keep Stage 1 through Stage 7 aligned.

## 2. Route Design Skill

- Checks frontend routes and gateway routes for consistency and readability.

## 3. Model Design Skill

- Checks note, workspace, repository, label, frontmatter, and sync model definitions.

## 4. Security Review Skill

- Checks credentials, session rules, encryption, and logging behavior.

## 5. Architecture Review Skill

- Checks package structure, dependency direction, and layer separation.

## 6. Test Planning Skill

- Checks what should be unit tested, integration tested, and end-to-end tested.

## 7. Documentation Sync Skill

- Checks whether planning documents, design docs, and code-level decisions stay synchronized.

## Usage Guidance

- Use Architecture Agent for structure and boundaries.
- Use Git Agent for repository behavior and sync logic.
- Use UI/UX Design Agent for Dioxus, UX flow, and route behavior.
- Use Data Agent for models and storage naming.
- Use Security Agent for anything involving secrets, auth, or access.
- Use Testing Agent when deciding how to verify a change.
- Use Release Agent when approaching MVP completion.
- Use skills when reviewing consistency across multiple files or stages.
