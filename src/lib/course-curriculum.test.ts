import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { COURSE_TRACKS, courseClassNumber, orderedCourseChapters } from "./course-curriculum.ts";
import { LESSON_MATERIALS } from "./lesson-materials.ts";

const chaptersPath = fileURLToPath(new URL("../data/chapters.json", import.meta.url));
const chapters = JSON.parse(readFileSync(chaptersPath, "utf8")) as { id: string; subject: string }[];

test("course tracks cover all 40 chapter IDs exactly once in the intended sequence", () => {
  const ids = COURSE_TRACKS.flatMap((track) => track.units.flatMap((unit) => unit.chapterIds));
  assert.equal(ids.length, 40);
  assert.equal(new Set(ids).size, 40);
  assert.deepEqual(new Set(ids), new Set(chapters.map((chapter) => chapter.id)));
  assert.deepEqual(COURSE_TRACKS.map((track) => track.units.reduce((sum, unit) => sum + unit.chapterIds.length, 0)), [12, 18, 10]);
  assert.equal(orderedCourseChapters(chapters as never[]).length, 40);
  assert.equal(courseClassNumber("m1"), 1);
  assert.equal(courseClassNumber("a1"), 13);
  assert.equal(courseClassNumber("h10"), 40);
});

test("guided lesson kits have readable objectives and valid multiple-choice checkpoints", () => {
  const ids = new Set(chapters.map((chapter) => chapter.id));
  assert.ok(Object.keys(LESSON_MATERIALS).length >= 9);
  for (const [id, kit] of Object.entries(LESSON_MATERIALS)) {
    assert.ok(ids.has(id), `unknown lesson kit chapter ${id}`);
    assert.ok(kit.objective.length > 0);
    assert.ok(kit.flow.length >= 2);
    assert.ok(kit.example.steps.length >= 1);
    assert.equal(kit.check.options.length, 4);
    assert.ok(kit.check.answerIndex >= 0 && kit.check.answerIndex < 4);
  }
});
