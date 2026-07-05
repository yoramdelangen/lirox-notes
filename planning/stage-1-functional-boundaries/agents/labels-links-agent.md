# Labels And Links Agent

## Labels

- Labels are primarily written directly in Markdown content.
- Labels use `#labelname` syntax.
- Labels are case-insensitive.
- Labels display as lowercase.
- Labels allow letters, numbers, hyphens, underscores, and `/`.
- Labels do not allow spaces.
- When entering a space in a label, it automatically changes to `-`.
- Labels inside headings count.
- Labels inside normal text count.
- Labels inside inline code are ignored.
- Labels inside fenced code blocks are ignored.
- Labels inside links are ignored.
- Labels in frontmatter are optional.
- Frontmatter labels are parsed separately and merged with inline labels.
- The app discovers labels by scanning Markdown content.
- The app can also read optional frontmatter labels.
- Inline labels and frontmatter labels should be combined in the label index.
- Labels are searched using `#label` syntax.

## Nested Labels

- Labels are nestable.
- Nested labels should use slash syntax.
- Example: `#work/projects/liroxnotes`.
- `/` is the nesting separator for labels.
- Parent labels can be virtual.
- Filtering a parent label should include child labels.
- Parent label counts include child label notes.
- A note with `#work/project` is treated as part of `#work` for navigation, filtering, and counts.

## Cross-Workspace Labels

- Cross-workspace label references are a V2 concept.
- Cross-workspace label references can use `#label@workspace` unless a better syntax is chosen later.
- Example: `#ideas@personal`.
- Labels without `@workspace` belong to the current local workspace.

## Label Role

- The file tree provides physical organization.
- Labels provide flexible organization.
- Labels allow notes to belong to multiple contexts.
- Labels should be shown as a nested list or tree.

## Tag Links

- Tags can be linked with `[[#tag]]`.
- Tag links point to labels or tag views.
- Nested tag links should be possible.
- Example: `[[#work/projects]]`.
- `[[#tag]]` tag-link behavior is V2 for now.

## Sidebar Label View

- MVP should have a sidebar toggle between file tree view and labels/tags view.
- File tree view shows files and directories.
- Labels/tags view shows labels/tags in a tree format based on nesting.

## Markdown Links

- Notes can link to other notes with normal Markdown links.
- Markdown links can be relative.
- Markdown links can be absolute.
- Relative links resolve from the current note.
- MVP supports normal relative Markdown links.
- MVP supports absolute workspace-root Markdown links.
- In MVP, absolute links point to the current workspace root.
- Cross-workspace absolute links are V2.
- Links written into Markdown should stay human-readable paths, not numeric IDs.
- File links should include `.md`.
- Broken links should be detected.
- Broken links should be highlighted in the editor.
- Automatically updating links after file rename is V2.
- Links should support existing filenames with spaces.
- LiroxNotes should not allow spaces when creating or renaming files.
- Existing filenames with spaces are tolerated but not encouraged.
- When a linked file does not exist, the editor should show a warning, highlight, or broken-link indicator.

## Suggested Defaults To Confirm

- Markdown heading markers should not be treated as labels.
