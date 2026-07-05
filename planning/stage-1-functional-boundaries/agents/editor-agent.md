# Editor Agent

## Editor Direction

- The editor is a central feature.
- The editor should support Markdown editing.
- MVP uses a Markdown text editor, not WYSIWYG.
- MVP should include built-in Markdown highlighting.
- The editor should be lightweight and fast.
- The editor should feel clean and minimalist.
- The editor should be hackable.
- The highlighter should be adjustable.
- A preview pane is not necessary for MVP.
- Vim support is a V2 goal if the chosen editor does not already support it easily.

## Recommended Editor Technology

- CodeMirror 6 is the current recommended editor candidate.
- CodeMirror 6 is lighter than Monaco.
- CodeMirror 6 is highly customizable.
- CodeMirror 6 supports Markdown well.
- CodeMirror 6 supports custom syntax highlighting and themes.
- The final editor technology choice is a technical implementation decision tracked in `../TECHNICAL_CHALLENGES.md`.

## Highlighter Customization

- Users should be able to customize highlighting.
- Highlight customization should start simple and safe.
- JSON-based rules are preferred for MVP planning.
- Arbitrary JavaScript plugins should wait until later.
- Technical details for highlighter customization are tracked in `../TECHNICAL_CHALLENGES.md`.

## Possible Custom Highlight Rules

- Highlight `TODO:`.
- Highlight `QUESTION:`.
- Highlight `IMPORTANT:`.
- Highlight `[[#tag]]` links.
- Highlight inline labels.
- Highlight custom keywords.
- Highlight custom Markdown patterns.

## Suggested Defaults To Confirm

- Shared editor rules can live in workspace config.
- Personal editor preferences should live outside the workspace.
- Themes should be customizable later.
- Vim mode or advanced keymaps should be optional later.
- Split preview is optional and not required for the first editor version.
