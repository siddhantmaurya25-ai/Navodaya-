import {
  defaultSave,
  emptyProfile,
  type Profile,
  type Save,
  type Student,
  type StudyTask,
} from "./exam-types.ts";

export const EMPTY_TIMESTAMP = "1970-01-01T00:00:00.000Z";

export type ProgressSnapshot = {
  save: Save;
  updatedAt: string;
};

function timestamp(value: unknown) {
  if (typeof value !== "string") return EMPTY_TIMESTAMP;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : EMPTY_TIMESTAMP;
}

function normalizeProfile(raw: unknown): Profile {
  const base = emptyProfile();
  if (!raw || typeof raw !== "object") return base;
  const value = raw as Partial<Profile>;
  const tasks = Array.isArray(value.tasks)
    ? value.tasks.filter(
        (task): task is StudyTask =>
          !!task &&
          typeof task === "object" &&
          typeof (task as StudyTask).id === "string" &&
          typeof (task as StudyTask).title === "string" &&
          typeof (task as StudyTask).subject === "string" &&
          typeof (task as StudyTask).time === "string" &&
          typeof (task as StudyTask).done === "boolean",
      )
    : [];
  return {
    xp: typeof value.xp === "number" && Number.isFinite(value.xp) ? Math.max(0, value.xp) : 0,
    streak: typeof value.streak === "number" && Number.isFinite(value.streak) ? Math.max(0, value.streak) : 0,
    lastDay: typeof value.lastDay === "string" ? value.lastDay : null,
    completed: Array.isArray(value.completed) ? value.completed.filter((item): item is string => typeof item === "string") : [],
    papersSolved: Array.isArray(value.papersSolved) ? value.papersSolved.filter((item): item is string => typeof item === "string") : [],
    solved: Array.isArray(value.solved) ? value.solved.filter((item): item is string => typeof item === "string") : [],
    mistakes: Array.isArray(value.mistakes) ? value.mistakes.filter((item): item is string => typeof item === "string") : [],
    tasks: tasks.length ? tasks : base.tasks,
  };
}

export function normalizeSave(raw: unknown): Save {
  const base = defaultSave();
  if (!raw || typeof raw !== "object") return base;
  const value = raw as Partial<Save>;
  const profiles = (value.profiles ?? {}) as Partial<Record<Student, Profile>>;
  return {
    student: value.student === "आयुष" ? "आयुष" : "आरुष",
    profiles: {
      आरुष: normalizeProfile(profiles["आरुष"]),
      आयुष: normalizeProfile(profiles["आयुष"]),
    },
  };
}

export function readProgressSnapshot(raw: string | null): ProgressSnapshot | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    if (record.save && typeof record.save === "object") {
      return {
        save: normalizeSave(record.save),
        updatedAt: timestamp(record.updatedAt),
      };
    }
    // Older releases stored the Save directly. Keep its contents but treat its
    // timestamp as unknown so a known cloud snapshot is preferred on conflict.
    return { save: normalizeSave(value), updatedAt: EMPTY_TIMESTAMP };
  } catch {
    return null;
  }
}

function union(left: string[], right: string[]) {
  return [...new Set([...left, ...right])];
}

function newerSnapshot(local: ProgressSnapshot, remote: ProgressSnapshot) {
  return Date.parse(local.updatedAt) >= Date.parse(remote.updatedAt) ? local : remote;
}

function mergeProfile(local: Profile, remote: Profile): Profile {
  const recent =
    (local.lastDay ?? "") > (remote.lastDay ?? "")
      ? local
      : (local.lastDay ?? "") < (remote.lastDay ?? "")
        ? remote
        : local;
  return {
    xp: Math.max(local.xp, remote.xp),
    streak: recent.streak,
    lastDay: recent.lastDay,
    completed: union(local.completed, remote.completed),
    papersSolved: union(local.papersSolved, remote.papersSolved),
    solved: union(local.solved, remote.solved),
    mistakes: union(local.mistakes, remote.mistakes),
    tasks: recent.tasks,
  };
}

export function mergeProgressSnapshots(
  localInput: ProgressSnapshot,
  remoteInput: ProgressSnapshot,
): ProgressSnapshot {
  const local = { save: normalizeSave(localInput.save), updatedAt: timestamp(localInput.updatedAt) };
  const remote = { save: normalizeSave(remoteInput.save), updatedAt: timestamp(remoteInput.updatedAt) };
  const recent = newerSnapshot(local, remote);
  return {
    save: {
      student: recent.save.student,
      profiles: {
        आरुष: mergeProfile(local.save.profiles["आरुष"], remote.save.profiles["आरुष"]),
        आयुष: mergeProfile(local.save.profiles["आयुष"], remote.save.profiles["आयुष"]),
      },
    },
    updatedAt: recent.updatedAt,
  };
}
