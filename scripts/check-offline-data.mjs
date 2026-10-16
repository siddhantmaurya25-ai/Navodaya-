import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const readJson = (file) => JSON.parse(readFileSync(join(root, file), "utf8"));
const chapters = readJson("src/data/chapters.json");
const questions = readJson("public/data/questions.json");
const papers = readJson("src/data/papers.json");

assert.equal(chapters.length, 40, "expected all 40 lesson chapters");
assert.equal(papers.length, 36, "expected all 36 practice papers");
assert.equal(questions.length, 4062, "question bank count changed; review the app's displayed count");

const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
assert.equal(chapterById.size, chapters.length, "chapter IDs must be unique");
const questionIds = new Set();
for (const question of questions) {
  assert.ok(question && typeof question === "object", "question must be a record");
  assert.ok(typeof question.id === "string" && question.id.length > 0, "question ID is required");
  assert.ok(!questionIds.has(question.id), `duplicate question ID: ${question.id}`);
  questionIds.add(question.id);
  assert.ok(chapterById.has(question.chapterId), `unknown chapter for ${question.id}`);
  assert.equal(question.subject, chapterById.get(question.chapterId).subject, `subject mismatch for ${question.id}`);
  assert.ok(typeof question.q === "string" && question.q.length > 0, `prompt missing for ${question.id}`);
  assert.ok(typeof question.exp === "string", `explanation missing for ${question.id}`);
  assert.equal(question.options?.length, 4, `four options required for ${question.id}`);
  assert.ok(question.options.every((option) => typeof option === "string"), `option text missing for ${question.id}`);
  assert.ok(Number.isInteger(question.ans) && question.ans >= 0 && question.ans <= 3, `answer index invalid for ${question.id}`);
}

for (const paper of papers) {
  assert.ok(Array.isArray(paper.ids) && paper.ids.length > 0, `paper ${paper.key} has no questions`);
  for (const id of paper.ids) assert.ok(questionIds.has(id), `paper ${paper.key} references unknown question ${id}`);
}

console.log(`Validated ${questions.length} offline questions, ${chapters.length} chapters, and ${papers.length} papers.`);
