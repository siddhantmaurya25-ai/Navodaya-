import { useCallback, useEffect, useMemo, useState } from "react";
import {
  defaultSave,
  emptyProfile,
  type Profile,
  type Save,
  type Student,
  type StudyTask,
  STUDENTS,
} from "@/lib/exam-types";

const KEY = "navodaya-vijeta-v1";

function localDayKey(date = new Date()) {
  // Use the learner's local calendar day, not UTC. UTC dates can roll over
  // several hours before/after the learner's actual day (notably in India).
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return localDayKey();
}

function yesterdayKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return localDayKey(yesterday);
}

function asProfile(raw: unknown): Profile {
  const base = emptyProfile();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<Profile>;
  return {
    xp: typeof p.xp === "number" ? p.xp : 0,
    streak: typeof p.streak === "number" ? p.streak : 0,
    lastDay: typeof p.lastDay === "string" ? p.lastDay : null,
    completed: Array.isArray(p.completed) ? p.completed.filter((x) => typeof x === "string") : [],
    papersSolved: Array.isArray(p.papersSolved) ? p.papersSolved.filter((x) => typeof x === "string") : [],
    solved: Array.isArray(p.solved) ? p.solved.filter((x) => typeof x === "string") : [],
    mistakes: Array.isArray(p.mistakes) ? p.mistakes.filter((x) => typeof x === "string") : [],
    tasks:
      Array.isArray(p.tasks) && p.tasks.length
        ? p.tasks.filter((t): t is StudyTask => !!t && typeof t === "object" && typeof (t as StudyTask).title === "string")
        : base.tasks,
  };
}

function normalize(raw: unknown): Save {
  const base = defaultSave();
  if (!raw || typeof raw !== "object") return base;
  const s = raw as Partial<Save>;
  const profiles = (s.profiles ?? {}) as Partial<Record<Student, Profile>>;
  return {
    student: s.student === "आयुष" ? "आयुष" : "आरुष",
    profiles: {
      आरुष: asProfile(profiles["आरुष"]),
      आयुष: asProfile(profiles["आयुष"]),
    },
  };
}

function encodeSave(save: Save) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(save))));
}

function decodeSave(code: string): Save {
  return normalize(JSON.parse(decodeURIComponent(escape(atob(code.trim())))));
}

export function useProgress() {
  const [save, setSave] = useState<Save>(defaultSave);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSave(normalize(JSON.parse(raw)));
    } catch {
      /* keep defaults */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(save));
    } catch {
      // Keep the app usable in private browsing or when device storage is full.
      // The current session still works; persistence will retry on the next save.
    }
  }, [ready, save]);

  const student = save.student;
  const profile = save.profiles[student];

  const patch = useCallback((studentName: Student, fn: (p: Profile) => Profile) => {
    setSave((prev) => ({
      ...prev,
      profiles: { ...prev.profiles, [studentName]: fn(prev.profiles[studentName]) },
    }));
  }, []);

  const setStudent = useCallback((next: Student) => {
    setSave((prev) => ({ ...prev, student: next }));
  }, []);

  const addXp = useCallback(
    (amount: number, bumpStreak = false) => {
      patch(student, (p) => {
        let next = { ...p, xp: p.xp + amount };
        if (bumpStreak) {
          const today = todayKey();
          if (p.lastDay !== today) {
            next = {
              ...next,
              streak: p.lastDay === yesterdayKey() ? p.streak + 1 : 1,
              lastDay: today,
            };
          }
        }
        return next;
      });
    },
    [patch, student],
  );

  const completeChapter = useCallback(
    (id: string) => {
      let awarded = false;
      patch(student, (p) => {
        if (p.completed.includes(id)) return p;
        awarded = true;
        const today = todayKey();
        const streak =
          p.lastDay === today ? p.streak : p.lastDay === yesterdayKey() ? p.streak + 1 : Math.max(1, p.streak || 1);
        return {
          ...p,
          completed: [...p.completed, id],
          xp: p.xp + 50,
          streak: p.lastDay === today ? p.streak : streak,
          lastDay: today,
        };
      });
      return awarded;
    },
    [patch, student],
  );

  const recordAttempt = useCallback(
    (paperKey: string | null, correctIds: string[], wrongIds: string[], xp: number, passed: boolean) => {
      patch(student, (p) => {
        const solved = new Set(p.solved);
        for (const id of correctIds) solved.add(id);
        for (const id of wrongIds) solved.add(id);
        const mistakes = p.mistakes.filter((id) => !correctIds.includes(id));
        for (const id of wrongIds) {
          if (!mistakes.includes(id)) mistakes.push(id);
        }
        const papers =
          paperKey && !p.papersSolved.includes(paperKey) ? [...p.papersSolved, paperKey] : p.papersSolved;
        const today = todayKey();
        let streak = p.streak;
        let lastDay = p.lastDay;
        if (passed && lastDay !== today) {
          streak = lastDay === yesterdayKey() ? streak + 1 : 1;
          lastDay = today;
        }
        return {
          ...p,
          xp: p.xp + xp,
          solved: [...solved],
          mistakes,
          papersSolved: papers,
          streak,
          lastDay,
        };
      });
    },
    [patch, student],
  );

  const clearMistakes = useCallback(() => {
    patch(student, (p) => ({ ...p, mistakes: [] }));
  }, [patch, student]);

  const setTasks = useCallback(
    (tasks: StudyTask[]) => {
      patch(student, (p) => ({ ...p, tasks }));
    },
    [patch, student],
  );

  const resetAll = useCallback(() => {
    setSave(defaultSave());
  }, []);

  const exportCode = useCallback(() => encodeSave(save), [save]);

  const importCode = useCallback((code: string) => {
    try {
      const next = decodeSave(code);
      if (!next.profiles["आरुष"] || !STUDENTS.includes(next.student)) return false;
      setSave(next);
      return true;
    } catch {
      return false;
    }
  }, []);

  const solvedSet = useMemo(() => new Set(profile.solved), [profile.solved]);

  return {
    ready,
    student,
    setStudent,
    profile,
    profiles: save.profiles,
    solvedSet,
    addXp,
    completeChapter,
    recordAttempt,
    clearMistakes,
    setTasks,
    resetAll,
    exportCode,
    importCode,
  };
}
