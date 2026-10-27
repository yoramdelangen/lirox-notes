/** Line classes for a heading; the `#` marker hangs into the left margin. */
export const headingDecorationClass = (level: number) =>
  ["cm-editor-heading-line", `cm-editor-heading-level-${level}`].join(" ");
