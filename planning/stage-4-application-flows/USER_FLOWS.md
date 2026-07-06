# User Flows

## Onboarding

- User opens the app.
- User creates a new account or logs in with email and password.
- User chooses hosted mode or local mode.
- User connects or creates a repository.
- User selects or creates a workspace.
- App loads the workspace file tree and recent note state.

## Workspace Switching

- User opens the workspace switcher.
- User selects a different workspace.
- App loads the selected workspace state and file tree.
- Current workspace context updates without changing the account.

## Note Creation

- User chooses create note.
- App asks for a title when needed.
- App generates the filename from the initial title or first `h1`.
- App creates the note in the current workspace.
- App opens the new note in the editor.

## Editing

- User opens a note.
- App loads the note content from the current workspace cache or remote state.
- User edits the note in the editor.
- App keeps the note metadata and pending changes in sync with the local working state.
- User can continue editing even while offline if the note is cached.

## Search

- User opens search.
- User searches by content, filename, display title, labels, or frontmatter text.
- Search results update based on the current workspace scope.
- Selecting a result opens the matching note or label view.

## Labels

- User can browse labels in the labels/tags sidebar view.
- Labels are shown as a nested tree.
- Selecting a label filters notes in the current workspace.
- Search can also use label syntax with `#label`.
