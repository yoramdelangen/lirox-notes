import { describe, expect, test } from "bun:test";
import { headingDecorationClass, headingMarkerLength, initialCursor } from "./heading.ts";

describe("heading decoration classes", () => {
  test("names the heading level", () => {
    expect(headingDecorationClass(2)).toBe(
      "cm-editor-heading-line cm-editor-heading-level-2"
    );
  });
});

describe("heading marker", () => {
  test("covers the hashes and the space after them", () => {
    expect(headingMarkerLength("# title")).toBe(2);
    expect(headingMarkerLength("### Plan")).toBe(4);
    expect(headingMarkerLength("###### six")).toBe(7);
  });

  test("is empty for text that is not a heading", () => {
    expect(headingMarkerLength("plain text")).toBe(0);
    expect(headingMarkerLength("#hashtag")).toBe(0);
    expect(headingMarkerLength("####### seven")).toBe(0);
    expect(headingMarkerLength("")).toBe(0);
  });
});

describe("initial cursor", () => {
  test("starts after the heading marker of the first line", () => {
    expect(initialCursor("# title\n\nbody")).toBe(2);
    expect(initialCursor("## Notes")).toBe(3);
  });

  test("starts at the beginning otherwise", () => {
    expect(initialCursor("body\n# later heading")).toBe(0);
    expect(initialCursor("")).toBe(0);
  });
});
