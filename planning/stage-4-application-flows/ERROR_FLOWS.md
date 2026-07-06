# Error Flows

## Invalid Frontmatter

- App shows a clear warning in the note editor.
- Raw frontmatter remains visible and editable.
- Structured metadata editing may be limited until the frontmatter is fixed.

## Invalid Config

- App shows a clear warning for the affected directory.
- Note editing remains available.
- Config-driven metadata features for that directory may be limited until fixed.

## Broken Links

- App highlights broken links in the editor.
- Broken links are visible but do not block note editing.

## Sync Failure

- App shows sync failure status.
- App preserves pending local changes.
- User can retry sync after fixing the issue.
- Sync failure can surface repository, auth, conflict, or network issues.
