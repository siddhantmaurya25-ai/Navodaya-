import assert from "node:assert/strict";
import test from "node:test";
import { missingCapacitorUtilities } from "./check-capacitor-css.mjs";

test("accepts a mobile stylesheet with all critical layout utilities", () => {
  const css = ".flex{display:flex}.grid{display:grid}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.z-30{z-index:30}.bottom-0{bottom:0}.min-h-dvh{min-height:100dvh}.bg-paper{background:#fff}.text-ink{color:#111}";
  assert.deepEqual(missingCapacitorUtilities(css), []);
});

test("reports omitted mobile layout utilities instead of accepting a broken APK bundle", () => {
  const css = ".flex{display:flex}.grid{display:grid}.bg-paper{background:#fff}";
  assert.deepEqual(missingCapacitorUtilities(css), ["fixed", "absolute", "relative", "z-30", "bottom-0", "min-h-dvh", "text-ink"]);
});
