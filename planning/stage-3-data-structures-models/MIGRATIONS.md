# Migrations

## Database Setup

- The initial database setup should load the required SurrealQL schema.
- The schema should create the core tables, indexes, permissions, and relationships needed for the application.
- The initial setup should be repeatable and safe to run on a fresh database.

## Incremental Migrations

- Future schema changes should be incremental.
- Migrations should run when the application starts or during installation of a new version.
- Migrations should only add or alter what is needed for the new version.
- Migration steps should be ordered and versioned.
- Schema changes should be safe to re-run or detect already-applied versions.

## Permissions

- SurrealDB permissions should be defined per record where needed.
- User-scoped access should query only allowed data for the current SurrealDB user identity.
- Permissions should be explicit in the schema and data model.
