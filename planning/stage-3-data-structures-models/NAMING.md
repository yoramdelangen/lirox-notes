# Naming Conventions

## Application Names

- Product name: LiroxNotes.
- Project code name: LiroxNotes.

## Design Inspiration

- Keep the product name and model names simple and direct.
- Prefer names that are easy to read in code, docs, and UI.
- Prefer clear, short, boring names over clever names.
- Keep naming aligned with the minimalist product style.

## Domain Names

- Use singular names for domain concepts unless the concept is inherently plural.
- Prefer clear nouns for persistent models.
- Prefer verb-noun names for operations.
- SurrealDB tables should use plural names.
- Rust structs should use default Rust naming conventions.
- Rust struct and type names should use CamelCase / TitleCase.
- Rust variables and fields should use `snake_case`.
- Prefer `User` over `User Account` in code and model naming.
- Prefer `latest_commit_hash` as the normalized commit hash field name.

## File And Directory Names

- Files and directories should use lowercase ASCII-compatible names.
- Slugs should be URL/path-safe.
- Note filenames are based on the first `h1` at creation time and stay stable afterward.
- Configuration file name: `.liroxnotes.toml`.
- Repository cache location: `repo_cache/`.

## API Names

- Use resource-based API names.
- Use workspace as the main scoping noun in UI routes.
- Use repository as the main scoping noun in gateway routes.
- Keep API names stable and explicit.
- Use kebab-case or lowercase path segments for routes.

## Operation Names

- Use short verb-led operation names.
- Prefer names that match the user action or sync action.
- Avoid clever or abbreviated names.
- Use `latest_commit_hash` consistently instead of mixing `current_commit_hash`, `base_commit`, and similar variants when possible.
