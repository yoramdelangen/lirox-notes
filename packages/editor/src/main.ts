import { minimalSetup } from "codemirror";
import { indentLess, indentMore, redo, undo } from "@codemirror/commands";
import { Compartment, EditorSelection, EditorState, RangeSetBuilder } from "@codemirror/state";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { getCM, Vim, vim } from "@replit/codemirror-vim";
import { HighlightStyle, syntaxHighlighting, syntaxTree } from "@codemirror/language";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate, lineNumbers } from "@codemirror/view";
import { styleTags, Tag, tags as t } from "@lezer/highlight";
import { headingDecorationClass } from "./heading";

type EditorRoot = HTMLElement & {
	dataset: {
		initialDoc?: string;
		editorMounted?: string;
		lineNumbers?: string;
		vimModeEnabled?: string;
		autofocus?: string;
	};
};

type EditorEventDetail = {
	doc: string;
	mode: string;
	hasHeading: boolean;
	headingLevel: number;
	selectionText: string;
	selectionEmpty: boolean;
	/** 1-based cursor line and column. */
	line: number;
	col: number;
};

type LiroxNotesEditorApi = {
	mountAllLiroxNotesEditors: () => void;
	setVimModeEnabled: (enabled: boolean) => void;
	updateLiroxNotesEditor: (root: EditorRoot, nextDoc?: string) => EditorView | undefined;
	run: (action: string) => void;
	gotoLine: (line: number) => void;
	focus: () => void;
};

type MountedEditor = {
	view: EditorView;
	vimMode: Compartment;
};

const mountedEditors = new WeakMap<EditorRoot, MountedEditor>();
let activeView: EditorView | undefined;
let vimModeEnabled = true;

const FENCE = "```";

// Markdown syntax marks stay visible, drawn faint, except the block markers
// that carry structure (headings, list bullets, quotes), which use the accent.
const blockMark = Tag.define();

const markdownStyle = HighlightStyle.define([
	{ tag: t.processingInstruction, color: "var(--faint)" },
	{ tag: blockMark, color: "var(--blue)" },
	{ tag: t.heading, fontWeight: "700", textDecoration: "none" },
	{ tag: t.strong, fontWeight: "700" },
	{ tag: t.emphasis, fontStyle: "italic" },
	{ tag: t.strikethrough, textDecoration: "line-through", color: "var(--dim)" },
	{ tag: t.monospace, color: "var(--coral)" },
	{ tag: t.link, color: "var(--blue)", textDecoration: "underline", textUnderlineOffset: "3px" },
	{ tag: t.url, color: "var(--faint)" },
	{ tag: t.quote, color: "var(--dim)", fontStyle: "italic" },
	{ tag: t.contentSeparator, color: "var(--faint)" }
]);

const markdownExtension = markdown({
	base: markdownLanguage,
	extensions: [{ props: [styleTags({ "HeaderMark ListMark QuoteMark": blockMark })] }]
});

const isPosInCode = (state: EditorState, pos: number) => {
	const cursor = syntaxTree(state).cursor();
	if (!cursor.moveTo(pos, 1)) return false;
	do {
		if (cursor.type.name === "FencedCode" || cursor.type.name === "InlineCode") return true;
	} while (cursor.parent());
	return false;
};

// Code blocks use one small highlighter for every language, so the colors
// follow the theme's four syntax roles instead of per-language grammars.
const KEYWORDS = new Set(
	"fn let mut pub use mod impl struct enum match if else for while loop return async await const type interface function class import export from new true false null None Some Ok Err self Self in of where select create index on and or not is sudo cd".split(" ")
);

const codeTokenRegex = (lang: string) => {
	const comment = /^(sh|bash|zsh|py|python|nix|toml|yaml|yml)$/.test(lang) ? "(?:^|\\s)#" : lang === "sql" ? "--" : "\\/\\/";
	return new RegExp(`(${comment}.*$)|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')|(\\b\\d[\\d_.]*\\b)|([A-Za-z_][\\w-]*!?)`, "g");
};

const codeMark = (name: string) => Decoration.mark({ class: `cm-lx-${name}` });
const CODE_MARKS = {
	comment: codeMark("comment"),
	string: codeMark("str"),
	number: codeMark("num"),
	keyword: codeMark("kw"),
	call: codeMark("call"),
	type: codeMark("type")
};
const hashtagMark = codeMark("tag");
const taskDoneMark = codeMark("task-done");
const taskOpenMark = codeMark("task-open");
const doneTextMark = codeMark("done");

const lineDecoration = (className: string) => Decoration.line({ attributes: { class: className } });

/** Line classes for headings, code blocks and rules, plus inline marks for code tokens, tasks and #tags. */
const buildDecorations = (view: EditorView) => {
	const { state } = view;
	const builder = new RangeSetBuilder<Decoration>();
	let inFence = false;
	let lang = "";

	for (const { from, to } of view.visibleRanges) {
		let pos = from;
		// Recover fence state for the first visible line.
		const startLine = state.doc.lineAt(from);
		inFence = isPosInCode(state, startLine.from) && !startLine.text.startsWith(FENCE);
		if (inFence) {
			for (let n = startLine.number - 1; n >= 1; n--) {
				const text = state.doc.line(n).text;
				if (text.startsWith(FENCE)) {
					lang = text.slice(3).trim().toLowerCase();
					break;
				}
			}
		}

		while (pos <= to) {
			const line = state.doc.lineAt(pos);
			const text = line.text;

			if (text.startsWith(FENCE)) {
				const opening = !inFence;
				if (opening) lang = text.slice(3).trim().toLowerCase();
				builder.add(line.from, line.from, lineDecoration(`cm-lx-code cm-lx-fence ${opening ? "cm-lx-fence-open" : "cm-lx-fence-close"}`));
				builder.add(line.from, line.to, codeMark("fence-mark"));
				inFence = !inFence;
			} else if (inFence) {
				builder.add(line.from, line.from, lineDecoration("cm-lx-code"));
				const re = codeTokenRegex(lang);
				let match: RegExpExecArray | null;
				while ((match = re.exec(text))) {
					if (match[0] === "") {
						re.lastIndex++;
						continue;
					}
					const start = line.from + match.index;
					const end = start + match[0].length;
					let mark: Decoration | undefined;
					if (match[1]) mark = CODE_MARKS.comment;
					else if (match[2]) mark = CODE_MARKS.string;
					else if (match[3]) mark = CODE_MARKS.number;
					else if (match[4]) {
						const next = text[match.index + match[0].length];
						if (KEYWORDS.has(match[0])) mark = CODE_MARKS.keyword;
						else if (match[0].endsWith("!") || next === "(") mark = CODE_MARKS.call;
						else if (/^[A-Z]/.test(match[0])) mark = CODE_MARKS.type;
					}
					if (mark) builder.add(start, end, mark);
				}
			} else {
				const heading = text.match(/^(#{1,6}) /);
				if (heading) {
					builder.add(line.from, line.from, lineDecoration(headingDecorationClass(heading[1].length)));
				} else if (/^(?:---+|\*\*\*+|___+)\s*$/.test(text)) {
					builder.add(line.from, line.from, lineDecoration("cm-lx-hr"));
				}

				const marks: [number, number, Decoration][] = [];
				const task = text.match(/^(\s*- )\[( |x)\] /);
				if (task) {
					const markerFrom = line.from + task[1].length;
					const done = task[2] === "x";
					marks.push([markerFrom, markerFrom + 3, done ? taskDoneMark : taskOpenMark]);
					if (done && line.to > markerFrom + 4) marks.push([markerFrom + 4, line.to, doneTextMark]);
				}
				for (const tag of text.matchAll(/(?:^|(?<=\s))#[A-Za-z][\w-]*/g)) {
					const start = line.from + (tag.index ?? 0);
					if (!heading || start > line.from) marks.push([start, start + tag[0].length, hashtagMark]);
				}
				marks.sort((a, b) => a[0] - b[0]);
				for (const [start, end, mark] of marks) builder.add(start, end, mark);
			}

			if (line.to >= to) break;
			pos = line.to + 1;
		}
	}
	return builder.finish();
};

const tuiDecorations = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;
		constructor(view: EditorView) {
			this.decorations = buildDecorations(view);
		}
		update(update: ViewUpdate) {
			if (update.docChanged || update.viewportChanged) this.decorations = buildDecorations(update.view);
		}
	},
	{ decorations: (plugin) => plugin.decorations }
);

const theme = EditorView.theme({
	"&": {
		height: "100%",
		backgroundColor: "transparent",
		color: "var(--fg)",
		fontSize: "inherit"
	},
	"&.cm-focused": { outline: "none" },
	".cm-scroller": {
		overflow: "auto",
		fontFamily: "inherit",
		lineHeight: "1.62",
		scrollbarWidth: "none"
	},
	".cm-content": {
		caretColor: "var(--coral)",
		fontFamily: "inherit",
		whiteSpace: "pre-wrap"
	},
	".cm-line": { padding: "0" },
	".cm-cursor, .cm-dropCursor": { borderLeft: "2px solid var(--coral)", marginLeft: "-1px" },
	".cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, ::selection": {
		backgroundColor: "var(--sel) !important"
	},
	".cm-fat-cursor": {
		background: "var(--coral) !important",
		color: "var(--bg) !important",
		outline: "none !important",
		border: "none"
	},
	"&:not(.cm-focused) .cm-fat-cursor": {
		background: "transparent !important",
		outline: "1px solid var(--coral) !important"
	},
	".cm-gutters": { backgroundColor: "transparent", border: "0", color: "var(--faint)" },
	".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "transparent" },
	".cm-editor-heading-line": { fontWeight: "700" },
	".cm-editor-heading-level-1": { fontSize: "1.38em", lineHeight: "1.3", padding: "0.1em 0 0.45em", textIndent: "-2ch" },
	".cm-editor-heading-level-2": { fontSize: "1.12em", lineHeight: "1.35", padding: "0.9em 0 0.25em", textIndent: "-3ch" },
	".cm-editor-heading-level-3": { padding: "0.6em 0 0.15em", textIndent: "-4ch" },
	".cm-editor-heading-level-4": { textIndent: "-5ch" },
	".cm-editor-heading-level-5": { textIndent: "-6ch" },
	".cm-editor-heading-level-6": { textIndent: "-7ch" },
	".cm-lx-code": {
		background: "var(--surface)",
		fontSize: ".86em",
		padding: "0 12px !important",
		margin: "0 -8px 0 -12px"
	},
	".cm-lx-fence-open": { paddingTop: "6px !important" },
	".cm-lx-fence-close": { paddingBottom: "6px !important" },
	".cm-lx-fence-mark, .cm-lx-comment": { color: "var(--faint)" },
	".cm-lx-comment": { fontStyle: "italic" },
	".cm-lx-str": { color: "var(--str)" },
	".cm-lx-num": { color: "var(--num)" },
	".cm-lx-kw": { color: "var(--kw)" },
	".cm-lx-call": { color: "var(--coral)" },
	".cm-lx-type": { color: "var(--blue)" },
	".cm-lx-tag": { color: "var(--coral)" },
	".cm-lx-task-open": { color: "var(--faint)" },
	".cm-lx-task-done": { color: "var(--blue)" },
	".cm-lx-done": { textDecoration: "line-through", color: "var(--dim)" },
	".cm-lx-hr": {
		color: "var(--faint)",
		backgroundImage: "linear-gradient(var(--line2), var(--line2))",
		backgroundSize: "calc(100% - 4ch) 1px",
		backgroundPosition: "right center",
		backgroundRepeat: "no-repeat"
	}
});

const lineRange = (state: EditorState) => {
	const head = state.selection.main.head;
	return state.doc.lineAt(head);
};

const BLOCK_PREFIX = /^(\s*)(#{1,6} |- \[[ x]\] |[-*] |\d+\. |> )?/;
const PREFIXES: Record<string, string> = { h1: "# ", h2: "## ", h3: "### ", task: "- [ ] ", ul: "- ", ol: "1. ", quote: "> ", p: "" };

/** Turns the cursor line into `kind`, or back into a paragraph if it already is one. */
const setBlock = (view: EditorView, kind: string) => {
	const line = lineRange(view.state);
	const match = line.text.match(BLOCK_PREFIX)!;
	const indent = match[1];
	const current = match[2] ?? "";
	let prefix = PREFIXES[kind] ?? "";
	if (current === prefix || (kind === "task" && current === "- [x] ")) prefix = "";
	const rest = line.text.slice(indent.length + current.length);
	const keepIndent = kind.startsWith("h") || kind === "quote" ? "" : indent;
	const next = keepIndent + prefix + rest;
	const head = view.state.selection.main.head;
	view.dispatch({
		changes: { from: line.from, to: line.to, insert: next },
		selection: EditorSelection.cursor(Math.max(line.from + keepIndent.length + prefix.length, head + next.length - line.text.length))
	});
};

const cycleHeading = (view: EditorView) => {
	const level = lineRange(view.state).text.match(/^(#{0,3}) ?/)![1].length;
	setBlock(view, ["h1", "h2", "h3", "p"][level] ?? "p");
};

const wrap = (view: EditorView, open: string, close = open) => {
	const range = view.state.selection.main;
	const selected = view.state.sliceDoc(range.from, range.to);
	view.dispatch({
		changes: { from: range.from, to: range.to, insert: `${open}${selected}${close}` },
		selection: range.empty
			? EditorSelection.cursor(range.from + open.length)
			: EditorSelection.range(range.from + open.length, range.to + open.length)
	});
};

/** Inserts `text` on its own line below the cursor line (or in place of an empty one). */
const insertLine = (view: EditorView, text: string, caret = text.length) => {
	const line = lineRange(view.state);
	const empty = line.length === 0;
	const insertAt = empty ? line.from : line.to;
	const insert = empty ? text : `\n${text}`;
	const start = empty ? line.from : line.to + 1;
	view.dispatch({ changes: { from: insertAt, insert }, selection: EditorSelection.cursor(start + caret) });
};

const toggleDone = (view: EditorView) => {
	const line = lineRange(view.state);
	const match = line.text.match(/^(\s*)- \[( |x)\] /);
	if (!match) return setBlock(view, "task");
	const at = line.from + match[1].length + 3;
	view.dispatch({ changes: { from: at, to: at + 1, insert: match[2] === "x" ? " " : "x" } });
};

const ACTIONS: Record<string, (view: EditorView) => unknown> = {
	heading: cycleHeading,
	h1: (view) => setBlock(view, "h1"),
	h2: (view) => setBlock(view, "h2"),
	h3: (view) => setBlock(view, "h3"),
	p: (view) => setBlock(view, "p"),
	task: (view) => setBlock(view, "task"),
	lists: (view) => setBlock(view, "ul"),
	ul: (view) => setBlock(view, "ul"),
	ol: (view) => setBlock(view, "ol"),
	quote: (view) => setBlock(view, "quote"),
	done: toggleDone,
	bold: (view) => wrap(view, "**"),
	italic: (view) => wrap(view, "*"),
	strike: (view) => wrap(view, "~~"),
	mark: (view) => wrap(view, "=="),
	code: (view) => wrap(view, "`"),
	link: (view) => wrap(view, "[", "](https://)"),
	image: (view) => insertLine(view, "![photo](photo.jpg)"),
	table: (view) => insertLine(view, "| col | col |\n| --- | --- |\n|  |  |", 30),
	fence: (view) => insertLine(view, `${FENCE}\n\n${FENCE}`, 4),
	hr: (view) => insertLine(view, "---"),
	indent: indentMore,
	outdent: indentLess,
	undo,
	redo
};

/** Runs a formatting action on the active editor, see `ACTIONS`. */
export const run = (action: string) => {
	const view = activeView;
	const command = ACTIONS[action];
	if (!view || !command) return;
	command(view);
	view.focus();
};

/** Puts the cursor after the line's heading marker and scrolls it to the top. */
export const gotoLine = (lineNumber: number) => {
	const view = activeView;
	if (!view) return;
	const line = view.state.doc.line(Math.max(1, Math.min(lineNumber, view.state.doc.lines)));
	const marker = line.text.match(/^#{1,6} /)?.[0].length ?? 0;
	view.dispatch({
		selection: EditorSelection.cursor(line.from + marker),
		effects: EditorView.scrollIntoView(line.from, { y: "start", yMargin: 12 })
	});
	view.focus();
};

export const focus = () => activeView?.focus();

// `:w` saves, and the leader (space) opens the same menus as the action bar.
Vim.defineEx("write", "w", (cm) => {
	cm.getWrapperElement().dispatchEvent(new CustomEvent("lirox-editor-save", { bubbles: true }));
});

Vim.defineAction("liroxCommand", (cm, args) => {
	const id = (args as { id?: string }).id ?? "";
	if (id.startsWith("action:")) {
		run(id.slice("action:".length));
		return;
	}
	cm.getWrapperElement().dispatchEvent(new CustomEvent("lirox-editor-command", { bubbles: true, detail: { id } }));
});

const LEADER: [string, string][] = [
	["h", "menu:heading"],
	["l", "menu:lists"],
	["f", "menu:format"],
	[".", "menu:more"],
	["t", "action:task"],
	["b", "action:bold"],
	["i", "action:italic"],
	["k", "action:link"],
	["m", "action:image"],
	["T", "action:table"],
	["<Space>", "palette"]
];
for (const [key, id] of LEADER) {
	Vim.mapCommand(`<Space>${key}`, "action", "liroxCommand", { id }, { context: "normal" });
}
Vim.mapCommand("?", "action", "liroxCommand", { id: "cheat" }, { context: "normal" });

const readEditorMode = (view: EditorView) => {
	if (!vimModeEnabled) return "plain";
	const vimState = (getCM(view)?.state as unknown as { vim?: { mode?: string; insertMode?: boolean; visualMode?: boolean } }).vim;
	if (vimState?.insertMode) return "insert";
	if (vimState?.visualMode) return "visual";
	return vimState?.mode ?? "normal";
};

const readEditorDetail = (view: EditorView): EditorEventDetail => {
	const doc = view.state.doc.toString();
	const heading = doc.match(/^(#{1,6})\s+(.+?)(?:\n|$)/);
	const selection = view.state.selection.main;
	const line = view.state.doc.lineAt(selection.head);

	return {
		doc,
		mode: readEditorMode(view),
		hasHeading: Boolean(heading),
		headingLevel: heading ? heading[1].length : 0,
		selectionText: selection.empty ? "" : view.state.sliceDoc(selection.from, selection.to),
		selectionEmpty: selection.empty,
		line: line.number,
		col: selection.head - line.from + 1
	};
};

/** Reports mode and cursor; the document only when `withDoc`, so a focus or
 * cursor move never overwrites a note the host has just loaded. */
const emitEditorState = (root: EditorRoot, view: EditorView, withDoc = false) => {
	const detail: Partial<EditorEventDetail> = readEditorDetail(view);
	if (!withDoc) delete detail.doc;
	root.dispatchEvent(new CustomEvent("lirox-editor-change", { detail }));
};

/** The first H1 once it has scrolled above the viewport, else "". */
const stickyHeading = (view: EditorView) => {
	const doc = view.state.doc;
	for (let n = 1; n <= doc.lines; n++) {
		const line = doc.line(n);
		const match = line.text.match(/^# (.+)/);
		if (!match || isPosInCode(view.state, line.from)) continue;
		const block = view.lineBlockAt(line.from);
		return block.bottom < view.scrollDOM.scrollTop - view.documentPadding.top + 4 ? match[1].trim() : "";
	}
	return "";
};

const watchScroll = (root: EditorRoot, view: EditorView) => {
	let last = "";
	view.scrollDOM.addEventListener(
		"scroll",
		() => {
			const sticky = stickyHeading(view);
			if (sticky === last) return;
			last = sticky;
			root.dispatchEvent(new CustomEvent("lirox-editor-scroll", { detail: { sticky } }));
		},
		{ passive: true }
	);
};

export const mountLiroxNotesEditor = (root: EditorRoot, initialDoc?: string) => {
	const mounted = mountedEditors.get(root);
	if (mounted) {
		return mounted.view;
	}

	const source = initialDoc ?? root.dataset.initialDoc ?? "";
	const showLineNumbers = root.dataset.lineNumbers === "true";
	vimModeEnabled = root.dataset.vimModeEnabled !== "false";
	const vimMode = new Compartment();
	root.style.height = "100%";

	const extensions = [
		vimMode.of(vimModeEnabled ? vim() : []),
		minimalSetup,
		EditorView.lineWrapping,
		markdownExtension,
		syntaxHighlighting(markdownStyle),
		tuiDecorations,
		theme,
		EditorView.domEventHandlers({
			focus: (_, view) => {
				activeView = view;
				emitEditorState(root, view);
			}
		}),
		EditorView.updateListener.of((update) => {
			if (update.docChanged || update.selectionSet) {
				emitEditorState(root, update.view, update.docChanged);
			}
		})
	];

	if (showLineNumbers) {
		extensions.splice(1, 0, lineNumbers());
	}

	const view = new EditorView({
		state: EditorState.create({ doc: source, extensions }),
		parent: root
	});
	activeView = view;

	getCM(view)?.on("vim-mode-change", () => emitEditorState(root, view));
	watchScroll(root, view);
	emitEditorState(root, view);
	if (root.dataset.autofocus === "true") view.focus();

	// The host reuses this root when another note opens and only updates
	// `data-initial-doc`. Edits flow back into that attribute too, so only a
	// value that differs from the editor's own text is a newly loaded note.
	new MutationObserver(() => {
		const next = root.dataset.initialDoc ?? "";
		if (next === view.state.doc.toString()) return;
		view.setState(EditorState.create({ doc: next, extensions }));
		view.dispatch({ effects: vimMode.reconfigure(vimModeEnabled ? vim() : []) });
		view.scrollDOM.scrollTop = 0;
		emitEditorState(root, view);
		if (root.dataset.autofocus === "true") view.focus();
	}).observe(root, { attributes: true, attributeFilter: ["data-initial-doc"] });

	root.dataset.editorMounted = "true";
	mountedEditors.set(root, { view, vimMode });
	return view;
};

export const setVimModeEnabled = (enabled: boolean) => {
	vimModeEnabled = enabled;
	document.querySelectorAll<EditorRoot>("[data-lirox-editor-root]").forEach((root) => {
		root.dataset.vimModeEnabled = String(enabled);
		const mounted = mountedEditors.get(root);
		if (mounted) {
			mounted.view.dispatch({
				effects: mounted.vimMode.reconfigure(enabled ? vim() : [])
			});
			emitEditorState(root, mounted.view);
		}
	});
};

export const updateLiroxNotesEditor = (root: EditorRoot, nextDoc?: string) => {
	const doc = nextDoc ?? root.dataset.initialDoc ?? "";
	const mounted = mountedEditors.get(root);

	if (!mounted) {
		return mountLiroxNotesEditor(root, doc);
	}

	if (mounted.view.state.doc.toString() === doc) {
		return mounted.view;
	}

	mounted.view.dispatch({
		changes: { from: 0, to: mounted.view.state.doc.length, insert: doc }
	});

	return mounted.view;
};

export const mountAllLiroxNotesEditors = () => {
	document
		.querySelectorAll<EditorRoot>("[data-lirox-editor-root]")
		.forEach((root) => mountLiroxNotesEditor(root));
};

const editorGlobal = globalThis as typeof globalThis & { LiroxNotesEditor?: LiroxNotesEditorApi };

// The fullstack client can append this script again after SSR already included
// it. A second copy has its own `mountedEditors`, so it would mount a duplicate
// editor into every root; only the first loaded copy may register and mount.
if (!editorGlobal.LiroxNotesEditor) {
	editorGlobal.LiroxNotesEditor = {
		mountAllLiroxNotesEditors,
		setVimModeEnabled,
		updateLiroxNotesEditor,
		run,
		gotoLine,
		focus
	};
	startAutoMount();
}

function startAutoMount() {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", mountAllLiroxNotesEditors, { once: true });
	} else {
		mountAllLiroxNotesEditors();
	}

	if (document.documentElement) {
		const observer = new MutationObserver(() => {
			if (!document.querySelector("[data-lirox-editor-root]")) {
				return;
			}
			mountAllLiroxNotesEditors();
			observer.disconnect();
		});
		observer.observe(document.documentElement, { childList: true, subtree: true });
		if (document.querySelector("[data-lirox-editor-root]")) {
			mountAllLiroxNotesEditors();
			observer.disconnect();
		}
	}
}
