import assert from "node:assert/strict";
import test from "node:test";
import { defaultSave } from "./exam-types.ts";
import { EMPTY_TIMESTAMP, mergeProgressSnapshots, normalizeSave, readProgressSnapshot } from "./progress-model.ts";

const arush = "आरुष" as const;
const ayush = "आयुष" as const;

test("normalizes malformed and partial saves to the two-student shape", () => {
  const save = normalizeSave({ student: "unknown", profiles: { [arush]: { xp: 12, completed: ["m1", 4] } } });
  assert.equal(save.student, arush);
  assert.equal(save.profiles[arush].xp, 12);
  assert.deepEqual(save.profiles[arush].completed, ["m1"]);
  assert.equal(save.profiles[ayush].xp, 0);
  assert.equal(save.profiles[ayush].tasks.length, defaultSave().profiles[ayush].tasks.length);
});

test("reads legacy raw localStorage saves without losing their progress", () => {
  const oldSave = defaultSave();
  oldSave.profiles[arush].xp = 175;
  const snapshot = readProgressSnapshot(JSON.stringify(oldSave));
  assert.ok(snapshot);
  assert.equal(snapshot.updatedAt, EMPTY_TIMESTAMP);
  assert.equal(snapshot.save.profiles[arush].xp, 175);
});

test("merges achievements from both devices and prefers the latest activity", () => {
  const local = defaultSave();
  local.student = arush;
  local.profiles[arush].xp = 150;
  local.profiles[arush].completed = ["m1", "a1"];
  local.profiles[arush].solved = ["q1"];
  local.profiles[arush].lastDay = "2026-10-14";
  local.profiles[arush].streak = 2;

  const remote = defaultSave();
  remote.student = ayush;
  remote.profiles[arush].xp = 110;
  remote.profiles[arush].completed = ["m2"];
  remote.profiles[arush].solved = ["q2"];
  remote.profiles[arush].mistakes = ["q2"];
  remote.profiles[arush].lastDay = "2026-10-15";
  remote.profiles[arush].streak = 3;

  const merged = mergeProgressSnapshots(
    { save: local, updatedAt: "2026-10-15T09:00:00.000Z" },
    { save: remote, updatedAt: "2026-10-15T10:00:00.000Z" },
  );
  assert.equal(merged.save.student, ayush);
  assert.equal(merged.save.profiles[arush].xp, 150);
  assert.deepEqual(merged.save.profiles[arush].completed, ["m1", "a1", "m2"]);
  assert.deepEqual(merged.save.profiles[arush].solved, ["q1", "q2"]);
  assert.deepEqual(merged.save.profiles[arush].mistakes, ["q2"]);
  assert.equal(merged.save.profiles[arush].lastDay, "2026-10-15");
  assert.equal(merged.save.profiles[arush].streak, 3);
});
