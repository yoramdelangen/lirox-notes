# Product Agent

## Core Concept

- LiroxNotes is a personal Markdown note-taking app.
- LiroxNotes is web-first.
- LiroxNotes should be built as a PWA.
- LiroxNotes should be usable remotely on a phone.
- The app is local-first.
- The app stores notes as real files.
- The app uses Git as the default remote sync and storage layer.
- The app should be lightweight, fast, clean, and minimalist.
- The app should be useful without requiring a cloud account.
- The app should keep user notes readable outside the application.

## Product Identity

- LiroxNotes is a local Markdown workspace.
- LiroxNotes is a file-based personal knowledge system.
- LiroxNotes is a clean writing environment.
- LiroxNotes is a Git-backed notes vault.
- LiroxNotes is a customizable editor for technical users.

## Product Principles

- Markdown files are the source of truth.
- The filesystem is the main storage model.
- The user should never be locked in.
- The app should work offline.
- Sync should not block local editing.
- Git should be powerful but not intrusive.
- The interface should remain minimal.
- Advanced customization should be possible without making the default experience complicated.
- Data safety is more important than hidden automation.

## Main Functional Areas

- Notes
- File tree
- Workspace switcher
- Labels and tags
- Markdown editor
- Search
- Git sync
- Directory config
- Optional frontmatter metadata
- Editor and syntax highlighting customization

## Early MVP Direction

- Build a web-first PWA.
- Onboarding should support connecting an existing Git repository.
- Onboarding should support creating a new Git repository.
- MVP onboarding should start from a Git-backed repository/workspace flow.
- The exact technical implementation of repository setup is decided later based on the chosen stack.
- Support switching between workspaces.
- Treat a workspace as a directory inside a Git repository.
- Support a single repository containing multiple workspace directories.
- Support a dedicated repository for a single workspace.
- Show Markdown notes in a file tree.
- Create notes.
- Rename notes.
- Move notes.
- Delete notes safely.
- Edit Markdown.
- Save locally.
- Detect inline labels.
- Show nested label tree.
- Support Markdown links.
- Support tag links.
- Search notes.
- Search note content, filenames, display titles, labels, and frontmatter as plain text.
- Sync with Git manually.
- Read inherited directory config.

## Not MVP For Now

- Mobile app.
- Collaboration.
- AI features.
- Graph view.
- Static website generation from notes.
- Broad Git hosting provider integrations.
- Web publishing.
- Sidebar frontmatter editing.
- Global label rename.
- Automatic link rewriting.
- Advanced merge tooling beyond per-block conflict resolution.
- Plugin marketplace.
- Full WYSIWYG editing.
- Advanced merge conflict UI.
- Sidebar frontmatter editor.
