import { describe, expect, test } from "bun:test";
import { headingDecorationClass } from "./heading.ts";

describe("heading decoration classes", () => {
  test("names the heading level", () => {
    expect(headingDecorationClass(2)).toBe(
      "cm-editor-heading-line cm-editor-heading-level-2"
    );
  });
});
