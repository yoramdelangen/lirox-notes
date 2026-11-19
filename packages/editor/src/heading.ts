/** Line classes for a heading; the `#` marker hangs into the left margin. */
export const headingDecorationClass = (level: number) =>
  ["cm-editor-heading-line", `cm-editor-heading-level-${level}`].join(" ");

/** Length of a line's ATX heading marker (`# ` … `###### `), 0 if none. */
export const headingMarkerLength = (text: string) => text.match(/^#{1,6} /)?.[0].length ?? 0;

/** Where the cursor starts in a freshly loaded note: after the first line's
 * heading marker, so `# title` opens with the cursor before `t`. */
export const initialCursor = (doc: string) => headingMarkerLength(doc.split("\n", 1)[0]);
