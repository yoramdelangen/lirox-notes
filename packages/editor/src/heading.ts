export const headingDecorationClass = (level: number, markersVisible: boolean) =>
  [
    "cm-editor-heading-line",
    `cm-editor-heading-level-${level}`,
    ...(markersVisible ? ["cm-editor-heading-line-focused"] : [])
  ].join(" ");
