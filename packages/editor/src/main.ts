import { minimalSetup } from "codemirror";
import { javascriptLanguage } from "@codemirror/lang-javascript";
import { EditorSelection, EditorState, StateField } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { HighlightStyle, defaultHighlightStyle, syntaxHighlighting, syntaxTree } from "@codemirror/language";
import { Decoration, DecorationSet, EditorView, WidgetType, lineNumbers, showPanel, type Panel } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

type EditorRoot = HTMLElement & {
  dataset: {
    initialDoc?: string;
    editorMounted?: string;
    lineNumbers?: string;
    writingWidth?: string;
    titleTarget?: string;
  };
};

type EditorEventDetail = {
  doc: string;
  title: string;
  hasHeading: boolean;
  headingLevel: number;
  selectionText: string;
  selectionEmpty: boolean;
};

type HeadingSplit = {
  exists: boolean;
  level: number;
  title: string;
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value == null) {
    return fallback;
  }

  return value === "true";
};

const splitHeading = (doc: string): HeadingSplit => {
  const match = doc.match(/^(#{1,6})\s+(.+?)(?:\n|$)/);
  if (!match) {
    return {
      exists: false,
      level: 0,
      title: ""
    };
  }

  return {
    exists: true,
    level: match[1].length,
    title: match[2].trim()
  };
};

const hiddenMarkdownMarker = Decoration.replace({});

const codeEditorHighlightStyle = HighlightStyle.define([
  { tag: t.comment, color: "#3e4b59", fontStyle: "italic" },
  { tag: [t.keyword, t.operatorKeyword, t.controlKeyword], color: "#d2a6ff" },
  { tag: [t.string, t.special(t.string)], color: "#b8cc52" },
  { tag: [t.number, t.bool, t.null], color: "#ff8f40" },
  { tag: [t.variableName, t.propertyName, t.name], color: "#e6e1cf" },
  { tag: [t.typeName, t.className, t.definition(t.variableName)], color: "#59c2ff" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#95e6cb" },
  { tag: [t.atom, t.meta, t.url], color: "#ffb454" },
  { tag: t.heading, color: "#f3f4f5", fontWeight: "bold", textDecoration: "none" }
]);

const isPosInCode = (state: EditorState, pos: number) => {
  const cursor = syntaxTree(state).cursor();
  if (!cursor.moveTo(pos, -1)) return false;
  do {
    if (cursor.type.name === "FencedCode" || cursor.type.name === "InlineCode") return true;
  } while (cursor.parent());
  return false;
};

class InlineIconWidget extends WidgetType {
  constructor(private readonly symbol: string, private readonly className: string) {
    super();
  }

  eq(other: InlineIconWidget) {
    return other.symbol === this.symbol && other.className === this.className;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = this.className;
    span.textContent = this.symbol;
    return span;
  }
}

class HeadingLabelWidget extends WidgetType {
  constructor(
    private readonly level: number,
    private readonly start: number,
    private readonly end: number
  ) { super(); }

  eq(other: HeadingLabelWidget) {
    return other.level === this.level;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-editor-heading-label";
    span.textContent = `H${this.level}`;
    span.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const view = EditorView.findFromDOM(span);
      if (view) showHeadingDropdown(view, span, this.start, this.end, this.level);
    });
    return span;
  }
}

type ToolbarMenuItem = {
  label: string;
  active?: boolean;
  run: () => void;
};

const closeToolbarDropdowns = () => {
  document.querySelectorAll(".cm-editor-toolbar-dropdown").forEach(el => el.remove());
};

const showToolbarDropdown = (anchor: HTMLElement, items: ToolbarMenuItem[]) => {
  closeToolbarDropdowns();
  const dropdown = document.createElement("div");
  dropdown.className = "cm-editor-toolbar-dropdown";

  for (const item of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cm-editor-toolbar-dropdown-item";
    if (item.active) {
      button.classList.add("cm-editor-toolbar-dropdown-item-active");
    }
    button.textContent = item.label;
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      item.run();
      dropdown.remove();
    });
    dropdown.append(button);
  }

  const rect = anchor.getBoundingClientRect();
  dropdown.style.position = "fixed";
  dropdown.style.top = `${rect.bottom + 2}px`;
  dropdown.style.left = `${rect.left}px`;

  const close = (ev: MouseEvent) => {
    if (!dropdown.contains(ev.target as Node)) {
      dropdown.remove();
      document.removeEventListener("click", close);
    }
  };

  requestAnimationFrame(() => document.addEventListener("click", close));
  document.body.append(dropdown);
};

const headingMarkerDecorations = StateField.define<DecorationSet>({
  create(state) {
    return buildHeadingMarkerDecorations(state);
  },
  update(_, transaction) {
    if (!transaction.docChanged && !transaction.selection) {
      return buildHeadingMarkerDecorations(transaction.state);
    }
    return buildHeadingMarkerDecorations(transaction.state);
  },
  provide(field) {
    return EditorView.decorations.from(field);
  }
});

const buildHeadingMarkerDecorations = (state: EditorState) => {
  const doc = state.doc.toString();
  const main = state.selection.main;
  const decorations = [];
  const headingRegex = /^(#{1,6})\s/gm;

  for (const match of doc.matchAll(headingRegex)) {
    const level = match[1].length;
    const start = match.index ?? 0;
    const end = start + match[0].length;

    if (isPosInCode(state, start)) continue;

    const cursorNear = main.from <= end && main.to >= start;
    if (cursorNear) continue;

    decorations.push(
      Decoration.replace({
        widget: new HeadingLabelWidget(level, start, end)
      }).range(start, end)
    );
  }

  return decorations.length ? Decoration.set(decorations, true) : Decoration.none;
};

const showHeadingDropdown = (
  view: EditorView,
  anchor: HTMLElement,
  start: number,
  end: number,
  currentLevel: number
) => {
  const items = [
    { level: 0, label: "Paragraph" },
    { level: 1, label: "Heading 1" },
    { level: 2, label: "Heading 2" },
    { level: 3, label: "Heading 3" },
    { level: 4, label: "Heading 4" },
    { level: 5, label: "Heading 5" },
    { level: 6, label: "Heading 6" },
  ];

  showToolbarDropdown(anchor, items.map((item) => ({
    label: item.label,
    active: item.level === currentLevel,
    run: () => {
      if (item.level === 0) {
        view.dispatch({ changes: { from: start, to: end, insert: "" } });
      } else {
        view.dispatch({ changes: { from: start, to: end, insert: "#".repeat(item.level) + " " } });
      }
      view.focus();
    }
  })));
};

const headingDecorations = StateField.define<DecorationSet>({
  create(state) {
    return buildHeadingDecorations(state);
  },
  update(_, transaction) {
    return buildHeadingDecorations(transaction.state);
  },
  provide(field) {
    return EditorView.decorations.from(field);
  }
});

const buildHeadingDecorations = (state: EditorState) => {
  const doc = state.doc.toString();
  const decorations = [];
  const headingRegex = /^(#{1,6})\s+.+$/gm;

  for (const match of doc.matchAll(headingRegex)) {
    const level = match[1]?.length;
    const from = match.index;
    if (level == null || from == null) {
      continue;
    }

    if (isPosInCode(state, from)) {
      continue;
    }

    decorations.push(
      Decoration.line({
        attributes: {
          class: `cm-editor-heading-line cm-editor-heading-level-${level}`
        }
      }).range(from)
    );
  }

  if (!decorations.length) {
    return Decoration.none;
  }

  return Decoration.set(decorations, true);
};

const strongMarkerDecorations = StateField.define<DecorationSet>({
  create(state) {
    return buildStrongMarkerDecorations(state);
  },
  update(_, transaction) {
    if (!transaction.docChanged && !transaction.selection) {
      return buildStrongMarkerDecorations(transaction.state);
    }

    return buildStrongMarkerDecorations(transaction.state);
  },
  provide(field) {
    return EditorView.decorations.from(field);
  }
});

const linkDecorations = StateField.define<DecorationSet>({
  create(state) {
    return buildLinkDecorations(state);
  },
  update(_, transaction) {
    if (!transaction.docChanged && !transaction.selection) {
      return buildLinkDecorations(transaction.state);
    }

    return buildLinkDecorations(transaction.state);
  },
  provide(field) {
    return EditorView.decorations.from(field);
  }
});

const hrLineDecorations = StateField.define<DecorationSet>({
  create(state) {
    return buildHrLineDecorations(state.doc.toString());
  },
  update(_, transaction) {
    return buildHrLineDecorations(transaction.state.doc.toString());
  },
  provide(field) {
    return EditorView.decorations.from(field);
  }
});

const codeBlockDecorations = StateField.define<DecorationSet>({
  create(state) {
    return buildCodeBlockDecorations(state);
  },
  update(_, transaction) {
    if (!transaction.docChanged && !transaction.selection) {
      return buildCodeBlockDecorations(transaction.state);
    }
    return buildCodeBlockDecorations(transaction.state);
  },
  provide(field) {
    return EditorView.decorations.from(field);
  }
});

const buildCodeBlockDecorations = (state: EditorState) => {
  const main = state.selection.main;
  const decorations: Decoration[] = [];

  const walk = (nodeCursor: any) => {
      if (nodeCursor.type.name === "FencedCode") {
        const from = nodeCursor.from;
        const to = nodeCursor.to;
        const docText = state.doc.sliceString(from, to);

      const firstNl = docText.indexOf('\n');
      const openEnd = firstNl >= 0 ? from + firstNl + 1 : to;

      const lastNl = docText.lastIndexOf('\n', docText.length - 2);
      const closeStart = lastNl > firstNl ? from + lastNl + 1 : openEnd;

      const cursorTouches = main.from <= to && main.to >= from;
      const firstLine = state.doc.lineAt(from);
      const lastLine = state.doc.lineAt(Math.max(from, to - 1));

      if (!cursorTouches) {
        decorations.push(hiddenMarkdownMarker.range(from, openEnd));
        decorations.push(hiddenMarkdownMarker.range(closeStart, to));
      }

      for (let pos = from; pos < to; ) {
        const line = state.doc.lineAt(pos);
        const classes = ["cm-editor-code-block"];
        if (line.from === firstLine.from) classes.push("cm-editor-code-block-first");
        if (line.from === lastLine.from) classes.push("cm-editor-code-block-last");
        decorations.push(
          Decoration.line({
            attributes: { class: classes.join(" ") }
          }).range(line.from)
        );
        pos = line.to < to ? line.to + 1 : to;
      }
    }

    if (nodeCursor.firstChild()) {
      do {
        walk(nodeCursor);
      } while (nodeCursor.nextSibling());
      nodeCursor.parent();
    }
  };

  const root = syntaxTree(state).cursor();
  if (root.firstChild()) {
    do {
      walk(root);
    } while (root.nextSibling());
  }

  return decorations.length ? Decoration.set(decorations, true) : Decoration.none;
};

const buildStrongMarkerDecorations = (state: EditorState) => {
  const doc = state.doc.toString();
  const main = state.selection.main;
  const decorations = [];
  const strongRegex = /\*\*([^*\n][\s\S]*?)\*\*/g;

  for (const match of doc.matchAll(strongRegex)) {
    const full = match[0];
    const content = match[1];
    const start = match.index ?? 0;
    const contentFrom = start + 2;
    const contentTo = contentFrom + content.length;
    const end = start + full.length;
    const selectionTouches = main.from <= contentTo && main.to >= contentFrom;
    const cursorInside = main.empty && main.from >= contentFrom && main.from <= contentTo;

    if (selectionTouches || cursorInside) {
      continue;
    }

    if (isPosInCode(state, start)) {
      continue;
    }

    decorations.push(hiddenMarkdownMarker.range(start, start + 2));
    decorations.push(hiddenMarkdownMarker.range(end - 2, end));
  }

  return decorations.length ? Decoration.set(decorations, true) : Decoration.none;
};

const buildLinkDecorations = (state: EditorState) => {
  const doc = state.doc.toString();
  const main = state.selection.main;
  const decorations = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  for (const match of doc.matchAll(linkRegex)) {
    const full = match[0];
    const label = match[1];
    const start = match.index ?? 0;
    const labelFrom = start + 1;
    const labelTo = labelFrom + label.length;
    const end = start + full.length;
    const selectionTouches = main.from <= end && main.to >= start;
    const cursorInside = main.empty && main.from >= start && main.from <= end;

    if (selectionTouches || cursorInside) {
      continue;
    }

    if (isPosInCode(state, start)) {
      continue;
    }

    decorations.push(hiddenMarkdownMarker.range(start, start + 1));
    decorations.push(hiddenMarkdownMarker.range(labelTo, end));
    decorations.push(
      Decoration.widget({
        widget: new InlineIconWidget("↗", "cm-editor-link-icon"),
        side: 1
      }).range(labelTo)
    );
  }

  return decorations.length ? Decoration.set(decorations, true) : Decoration.none;
};

const buildHrLineDecorations = (doc: string) => {
  const decorations = [];
  const hrRegex = /^(?:---+|\*\*\*+|___+)$/gm;

  for (const match of doc.matchAll(hrRegex)) {
    const from = match.index;
    if (from == null) {
      continue;
    }

    decorations.push(
      Decoration.line({
        attributes: {
          class: "cm-editor-hr-line"
        }
      }).range(from)
    );
  }

  return decorations.length ? Decoration.set(decorations, true) : Decoration.none;
};

const wrapMainSelection = (view: EditorView, open: string, close = open) => {
  const range = view.state.selection.main;
  if (range.empty) {
    view.dispatch({
      changes: { from: range.from, to: range.to, insert: `${open}${close}` },
      selection: EditorSelection.cursor(range.from + open.length)
    });
    view.focus();
    return;
  }

  const selected = view.state.sliceDoc(range.from, range.to);
  view.dispatch({
    changes: { from: range.from, to: range.to, insert: `${open}${selected}${close}` },
    selection: EditorSelection.range(range.from + open.length, range.to + open.length)
  });
  view.focus();
};

const insertAtLineStart = (view: EditorView, insert: string, cursorOffset = insert.length) => {
  const range = view.state.selection.main;
  const line = view.state.doc.lineAt(range.from);
  view.dispatch({
    changes: { from: line.from, to: line.from, insert },
    selection: EditorSelection.cursor(line.from + cursorOffset)
  });
  view.focus();
};

const showListDropdown = (view: EditorView, anchor: HTMLElement) => {
  showToolbarDropdown(anchor, [
    { label: "Bullet list", run: () => insertAtLineStart(view, "- ") },
    { label: "Numbered list", run: () => insertAtLineStart(view, "1. ") },
    { label: "Task list", run: () => insertAtLineStart(view, "- [ ] ") }
  ]);
};

const showFormatDropdown = (view: EditorView, anchor: HTMLElement) => {
  showToolbarDropdown(anchor, [
    { label: "Inline code", run: () => wrapMainSelection(view, "`") },
    { label: "Code block", run: () => insertAtLineStart(view, "```javascript\n\n```", "```javascript\n".length) },
    { label: "Quote", run: () => insertAtLineStart(view, "> ") }
  ]);
};

const showMoreDropdown = (view: EditorView, anchor: HTMLElement) => {
  showToolbarDropdown(anchor, [
    { label: "Horizontal rule", run: () => insertAtLineStart(view, "---\n\n", 5) }
  ]);
};

const getTitleText = (doc: string) => {
  const heading = splitHeading(doc);
  if (!heading.exists || !heading.title.trim()) {
    return "New file";
  }

  return heading.title;
};

const readEditorDetail = (view: EditorView): EditorEventDetail => {
  const doc = view.state.doc.toString();
  const heading = splitHeading(doc);
  const selection = view.state.selection.main;

  return {
    doc,
    title: getTitleText(doc),
    hasHeading: heading.exists,
    headingLevel: heading.level,
    selectionText: selection.empty ? "" : view.state.sliceDoc(selection.from, selection.to),
    selectionEmpty: selection.empty
  };
};

const emitEditorState = (root: EditorRoot, view: EditorView) => {
  const detail = readEditorDetail(view);

  if (root.dataset.titleTarget) {
    document.querySelectorAll<HTMLElement>(root.dataset.titleTarget).forEach((node) => {
      node.textContent = detail.title;
    });
  }

  root.dispatchEvent(new CustomEvent<EditorEventDetail>("lirox-editor-change", { detail }));
};

const theme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "transparent",
    color: "rgb(var(--theme-text))",
    fontFamily: "Victor Mono, monospace"
  },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "Victor Mono, monospace",
    padding: "0 1.5rem 1.5rem"
  },
  ".cm-content, .cm-gutter": {
    minHeight: "100%",
    paddingTop: "0",
    paddingBottom: "1.25rem"
  },
  ".cm-content": {
    caretColor: "rgb(var(--theme-accent))"
  },
  ".cm-panels": {
    backgroundColor: "transparent",
    color: "rgb(var(--theme-text))",
    border: "0"
  },
  ".cm-panels-bottom": {
    border: "0"
  },
  ".cm-editor-heading-line": {
    position: "relative",
    fontFamily: "Victor Mono, monospace",
    fontWeight: "600",
    lineHeight: "1.15",
    color: "rgb(var(--theme-text))"
  },
  ".cm-editor-heading-line .tok-heading": {
    color: "rgb(var(--theme-subtle))"
  },
  ".cm-editor-heading-label": {
    position: "absolute",
    left: "0",
    bottom: "0",
    transform: "translate(-100%, -0.3em)",
    display: "inline-flex",
    alignItems: "center",
    fontSize: "0.5em",
    fontWeight: "700",
    color: "rgb(var(--theme-subtle))",
    letterSpacing: "0.02em",
    cursor: "pointer",
    borderRadius: "3px",
    padding: "0 2px",
    lineHeight: "1",
    userSelect: "none"
  },
  ".cm-editor-heading-label:hover": {
    color: "rgb(var(--theme-text))",
    backgroundColor: "rgb(var(--theme-surface-alt) / 0.5)"
  },
  ".cm-editor-heading-dropdown": {
    position: "fixed",
    zIndex: "100",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "rgb(var(--theme-surface))",
    border: "1px solid rgb(var(--shell-border))",
    borderRadius: "8px",
    padding: "4px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    minWidth: "140px"
  },
  ".cm-editor-heading-dropdown-item": {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "6px 12px",
    border: "0",
    backgroundColor: "transparent",
    color: "rgb(var(--theme-text))",
    fontSize: "13px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  ".cm-editor-heading-dropdown-item:hover": {
    backgroundColor: "rgb(var(--theme-surface-alt))"
  },
  ".cm-editor-heading-dropdown-item-active": {
    fontWeight: "600",
    color: "rgb(var(--theme-accent))"
  },
  ".cm-editor-code-block": {
    backgroundColor: "#0f1419",
    color: "#e6e1cf",
    borderLeft: "1px solid #272d38",
    borderRight: "1px solid #272d38",
    paddingLeft: "0.85rem",
    paddingRight: "0.85rem",
    fontSize: "0.98em"
  },
  ".cm-editor-code-block-first": {
    borderTop: "1px solid #272d38",
    borderTopLeftRadius: "0.9rem",
    borderTopRightRadius: "0.9rem",
    paddingTop: "0.65rem"
  },
  ".cm-editor-code-block-last": {
    borderBottom: "1px solid #272d38",
    borderBottomLeftRadius: "0.9rem",
    borderBottomRightRadius: "0.9rem",
    paddingBottom: "0.65rem"
  },
  ".cm-editor-heading-level-1": { fontSize: "2.25rem" },
  ".cm-editor-heading-level-2": { fontSize: "1.875rem" },
  ".cm-editor-heading-level-3": { fontSize: "1.5rem" },
  ".cm-editor-heading-level-4": { fontSize: "1.25rem" },
  ".cm-editor-heading-level-5": { fontSize: "1.125rem" },
  ".cm-editor-heading-level-6": { fontSize: "1rem" },
  ".cm-editor-toolbar": {
    display: "flex",
    justifyContent: "center",
    padding: "0.5rem 1.5rem 1rem"
  },
  ".cm-editor-toolbar[hidden]": {
    display: "none"
  },
  ".cm-editor-toolbar-inner": {
    display: "flex",
    alignItems: "center",
    gap: "0.15rem",
    borderRadius: "0.5rem",
    backgroundColor: "rgba(var(--shell-panel), 0.9)",
    border: "1px solid rgb(var(--shell-border) / 0.65)",
    padding: "0.35rem"
  },
  ".cm-editor-toolbar-button": {
    border: "0",
    backgroundColor: "transparent",
    color: "rgb(var(--theme-muted))",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.15rem",
    minWidth: "2rem",
    padding: "0.4rem 0.55rem",
    borderRadius: "0.375rem",
    fontSize: "14px",
    lineHeight: "1",
    fontWeight: "600",
    fontFamily: "inherit"
  },
  ".cm-editor-toolbar-button:hover": {
    backgroundColor: "rgb(var(--theme-surface-alt) / 0.85)",
    color: "rgb(var(--theme-text))"
  },
  ".cm-editor-toolbar-button:disabled": {
    opacity: "0.45"
  },
  ".cm-editor-toolbar-button-active": {
    backgroundColor: "rgb(var(--theme-surface-alt) / 0.95)",
    color: "rgb(var(--theme-text))"
  },
  ".cm-editor-toolbar-button-arrow": {
    fontSize: "0.72em",
    transform: "translateY(-1px)"
  },
  ".cm-editor-toolbar-dropdown": {
    position: "fixed",
    zIndex: "100",
    display: "flex",
    flexDirection: "column",
    minWidth: "160px",
    backgroundColor: "rgb(var(--theme-surface))",
    border: "1px solid rgb(var(--shell-border))",
    borderRadius: "8px",
    padding: "4px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
  },
  ".cm-editor-toolbar-dropdown-item": {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "6px 12px",
    border: "0",
    backgroundColor: "transparent",
    color: "rgb(var(--theme-text))",
    fontSize: "13px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  ".cm-editor-toolbar-dropdown-item:hover": {
    backgroundColor: "rgb(var(--theme-surface-alt))"
  },
  ".cm-editor-toolbar-dropdown-item-active": {
    fontWeight: "600",
    color: "rgb(var(--theme-accent))"
  },
  ".cm-editor-link-icon": {
    display: "inline-block",
    marginLeft: "0.35rem",
    color: "rgb(var(--theme-accent))",
    fontSize: "0.85em"
  },
  ".cm-editor-hr-line": {
    borderTop: "1px solid rgb(var(--shell-border))",
    paddingBottom: "0.75rem",
    height: "0",
    fontSize: "0",
    lineHeight: "0"
  },
  ".cm-focused": {
    outline: "none"
  },
  ".cm-lineNumbers": {
    color: "rgb(var(--theme-subtle))"
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "0",
    color: "rgb(var(--theme-subtle))"
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(var(--theme-surface), 0.45)"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent"
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(var(--theme-accent), 0.22)"
  },
  ".cm-cursor": {
    borderLeftColor: "rgb(var(--theme-accent-soft))"
  },
});

const toolbarPanel = (view: EditorView): Panel => {
  const dom = document.createElement("div");
  dom.className = "cm-editor-toolbar";

  const inner = document.createElement("div");
  inner.className = "cm-editor-toolbar-inner";

  const addButton = (label: string, title: string, run: () => void, active = false) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cm-editor-toolbar-button";
    if (active) {
      button.classList.add("cm-editor-toolbar-button-active");
    }
    button.title = title;
    button.setAttribute("aria-label", title);
    button.textContent = label;
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => run());
    inner.append(button);
  };

  const addMenuButton = (label: string, title: string, run: (button: HTMLButtonElement) => void) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cm-editor-toolbar-button";
    button.title = title;
    button.setAttribute("aria-label", title);
    const text = document.createElement("span");
    text.textContent = label;
    const arrow = document.createElement("span");
    arrow.className = "cm-editor-toolbar-button-arrow";
    arrow.textContent = "▾";
    button.append(text, arrow);
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => run(button));
    inner.append(button);
  };

  addMenuButton("H", "Headings", (button) => {
    const range = view.state.selection.main;
    const line = view.state.doc.lineAt(range.from);
    const match = line.text.match(/^(#{1,6})\s+/);
    showHeadingDropdown(view, button, line.from, line.to, match ? match[1].length : 0);
  });

  addButton("☑", "Task list", () => insertAtLineStart(view, "- [ ] "));
  addMenuButton("•", "Lists", (button) => showListDropdown(view, button));
  addButton("B", "Bold", () => wrapMainSelection(view, "**"));
  addButton("I", "Italic", () => wrapMainSelection(view, "*"));
  addMenuButton("✎", "Formatting", (button) => showFormatDropdown(view, button));
  addButton("↗", "Link", () => wrapMainSelection(view, "[", "](https://)"));
  addButton("▦", "Table", () => insertAtLineStart(view, "| Column 1 | Column 2 |\n| --- | --- |\n|  |  |\n", "| Column 1 | Column 2 |\n| --- | --- |\n| ".length));
  addButton("🖼", "Image", () => insertAtLineStart(view, "![](https://)", 4));
  addMenuButton("⋮", "More", (button) => showMoreDropdown(view, button));

  const sync = () => {
    dom.hidden = !view.hasFocus;
  };

  dom.append(inner);
  sync();

  return {
    top: false,
    dom,
    update(update) {
      if (update.selectionSet || update.focusChanged) {
        sync();
      }
    }
  };
};

export const mountLiroxNotesEditor = (root: EditorRoot, initialDoc?: string) => {
  if (root.dataset.editorMounted === "true") {
    return;
  }

  const source = initialDoc ?? root.dataset.initialDoc ?? "";
  const writingWidth = root.dataset.writingWidth ?? "650px";
  const showLineNumbers = parseBoolean(root.dataset.lineNumbers, false);
  root.style.height = "100%";
  root.style.maxWidth = writingWidth;
  root.style.margin = "0 auto";

  const extensions = [
    minimalSetup,
    EditorView.lineWrapping,
    markdown({ defaultCodeLanguage: javascriptLanguage }),
    syntaxHighlighting(defaultHighlightStyle),
    syntaxHighlighting(codeEditorHighlightStyle),
    headingDecorations,
    linkDecorations,
    hrLineDecorations,
    codeBlockDecorations,
    strongMarkerDecorations,
    headingMarkerDecorations,
    theme,
    showPanel.of(toolbarPanel),
    EditorView.updateListener.of((update) => {
      if (update.docChanged || update.selectionSet) {
        emitEditorState(root, update.view);
      }
    })
  ];

  if (showLineNumbers) {
    extensions.splice(1, 0, lineNumbers());
  }

  const state = EditorState.create({
    doc: source,
    extensions
  });

  const view = new EditorView({
    state,
    parent: root
  });

  emitEditorState(root, view);

  root.dataset.editorMounted = "true";
  return view;
};

export const mountAllLiroxNotesEditors = () => {
  document
    .querySelectorAll<EditorRoot>("[data-lirox-editor-root]")
    .forEach((root) => mountLiroxNotesEditor(root));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountAllLiroxNotesEditors, { once: true });
} else {
  mountAllLiroxNotesEditors();
}
