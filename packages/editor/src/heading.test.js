import { describe, expect, test } from "bun:test";
import { headingDecorationClass } from "./heading.ts";

describe("heading decoration classes", () => {
  test("marks the heading whose markdown markers are visible", () => {
    expect(headingDecorationClass(2, true)).toBe(
      "cm-editor-heading-line cm-editor-heading-level-2 cm-editor-heading-line-focused"
    );
  });

  test("leaves inactive headings without the focused class", () => {
    expect(headingDecorationClass(3, false)).toBe(
      "cm-editor-heading-line cm-editor-heading-level-3"
    );
  });
});
