import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Profile,
  type Save,
  type Student,
  type StudyTask,
  STUDENTS,
  defaultSave,
} from "@/lib/exam-types";
import {
  EMPTY_TIMESTAMP,
  normalizeSave,
  readProgressSnapshot,
  type ProgressSnapshot,
} from "@/lib/progress-model";

const KEY = "navodaya-vijeta-v1";
const FALLBACK_SNAPSHOT: ProgressSnapshot = { save: defaultSave(), updatedAt: EMPTY_TIMESTAMP };

type ProgressState = {
  userId: string | null;
  snapshot: ProgressSnapshot;
  ready: boolean;
};

function storageKey(userId: string | null) {
  return userId ? `${KEY}:user:${userId}` : KEY;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

function encodeSave(save: Save) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(save))));
}

function decodeSave(code: string): Save {
  return normalizeSave(JSON.parse(decodeURIComponent(escape(atob(code.trim())))));
}

export function useProgress(userId: string | null, authReady: boolean) {
  const [state, setState] = useState<ProgressState>(() => ({
    userId: null,
    snapshot: { save: defaultSave(), updatedAt: EMPTY_TIMESTAMP },
    ready: false,
  }));

  useEffect(() => {
    if (!authReady) return;
    let snapshot: ProgressSnapshot | null = null;
    try {
      snapshot = readProgressSnapshot(localStorage.getItem(storageKey(userId)));
      // A guest's pre-login progress is copied into the account's local scope;
      // the guest copy stays intact for later sign-out or another family member.
      if (userId && !snapshot) snapshot = readProgressSnapshot(localStorage.getItem(KEY));
    } catch {
      // Keep a fresh local default if the browser blocks storage access.
    }
    setState({
      userId,
      snapshot: snapshot ?? { save: defaultSave(), updatedAt: EMPTY_TIMESTAMP },
      ready: true,
    });
  }, [authReady, userId]);

  const ready = authReady && state.ready && state.userId === userId;
  const snapshot = ready ? state.snapshot : FALLBACK_SNAPSHOT;
  const save = snapshot.save;

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify({ version: 2, ...snapshot }));
    } catch {
      // Cloud sync can still preserve signed-in progress if local storage is full.
    }
  }, [ready, snapshot, userId]);

  const updateSave = useCallback(
    (update: (current: Save) => Save) => {
      setState((previous) => {
        if (!ready || !previous.ready || previous.userId !== userId) return previous;
        const nextSave = update(previous.snapshot.save);
        if (nextSave === previous.snapshot.save) return previous;
        return {
          ...previous,
          snapshot: { save: nextSave, updatedAt: new Date().toISOString() },
        };
      });
    },
    [ready, userId],
  );

  const replaceSnapshot = useCallback(
    (next: ProgressSnapshot) => {
      const normalized = readProgressSnapshot(JSON.stringify(next)) ?? {
        save: defaultSave(),
        updatedAt: EMPTY_TIMESTAMP,
      };
      setState((previous) => {
        if (!previous.ready || previous.userId !== userId) return previous;
        if (
          previous.snapshot.updatedAt === normalized.updatedAt &&
          JSON.stringify(previous.snapshot.save) === JSON.stringify(normalized.save)
        ) {
          return previous;
        }
        return { ...previous, snapshot: normalized };
      });
    },
    [userId],
  );

  const student = save.student;
  const profile = save.profiles[student];

  const patch = useCallback(
    (studentName: Student, fn: (current: Profile) => Profile) => {
      updateSave((previous) => {
        const current = previous.profiles[studentName];
        const next = fn(current);
        if (next === current) return previous;
        return { ...previous, profiles: { ...previous.profiles, [studentName]: next } };
      });
    },
    [updateSave],
  );

  const setStudent = useCallback(
    (next: Student) => {
      updateSave((previous) => (previous.student === next ? previous : { ...previous, student: next }));
    },
    [updateSave],
  );

  const addXp = useCallback(
    (amount: number, bumpStreak = false) => {
      patch(student, (current) => {
        let next = { ...current, xp: current.xp + amount };
        if (bumpStreak) {
          const today = todayKey();
          if (current.lastDay !== today) {
            next = {
              ...next,
              streak: current.lastDay === yesterdayKey() ? current.streak + 1 : 1,
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
      patch(student, (current) => {
        if (current.completed.includes(id)) return current;
        awarded = true;
        const today = todayKey();
        const streak =
          current.lastDay === today
            ? current.streak
            : current.lastDay === yesterdayKey()
              ? current.streak + 1
              : Math.max(1, current.streak || 1);
        return {
          ...current,
          completed: [...current.completed, id],
          xp: current.xp + 50,
          streak,
          lastDay: today,
        };
      });
      return awarded;
    },
    [patch, student],
  );

  const recordAttempt = useCallback(
    (paperKey: string | null, correctIds: string[], wrongIds: string[], xp: number, passed: boolean) => {
      patch(student, (current) => {
        const solved = new Set(current.solved);
        for (const id of correctIds) solved.add(id);
        for (const id of wrongIds) solved.add(id);
        const mistakes = current.mistakes.filter((id) => !correctIds.includes(id));
        for (const id of wrongIds) {
          if (!mistakes.includes(id)) mistakes.push(id);
        }
        const papers =
          paperKey && !current.papersSolved.includes(paperKey)
            ? [...current.papersSolved, paperKey]
            : current.papersSolved;
        const today = todayKey();
        let streak = current.streak;
        let lastDay = current.lastDay;
        if (passed && lastDay !== today) {
          streak = lastDay === yesterdayKey() ? streak + 1 : 1;
          lastDay = today;
        }
        return {
          ...current,
          xp: current.xp + xp,
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
    patch(student, (current) => (current.mistakes.length ? { ...current, mistakes: [] } : current));
  }, [patch, student]);

  const setTasks = useCallback(
    (tasks: StudyTask[]) => {
      patch(student, (current) => ({ ...current, tasks }));
    },
    [patch, student],
  );

  const resetAll = useCallback(() => {
    updateSave(() => defaultSave());
  }, [updateSave]);

  const exportCode = useCallback(() => encodeSave(save), [save]);

  const importCode = useCallback(
    (code: string) => {
      try {
        const next = decodeSave(code);
        if (!next.profiles["आरुष"] || !STUDENTS.includes(next.student)) return false;
        updateSave(() => next);
        return true;
      } catch {
        return false;
      }
    },
    [updateSave],
  );

  const solvedSet = useMemo(() => new Set(profile.solved), [profile.solved]);

  return {
    ready,
    snapshot,
    replaceSnapshot,
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
