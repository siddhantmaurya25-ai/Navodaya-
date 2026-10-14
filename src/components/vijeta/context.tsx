import { createContext, useContext } from "react";
import type { Bank, Chapter, Profile, Student, StudyTask } from "@/lib/exam-types";

export type TabId = "होम" | "पढ़ाई" | "ग्रंथालय" | "शब्दसागर" | "अभ्यास" | "टेस्ट";

export type VijetaContextValue = {
  bank: Bank;
  tab: TabId;
  setTab: (tab: TabId) => void;
  student: Student;
  setStudent: (student: Student) => void;
  profile: Profile;
  profiles: Record<Student, Profile>;
  solvedSet: Set<string>;
  openExam: (questions: null, paperKey: string) => void;
  openCustomExam: (
    questions: import("@/lib/exam-types").Question[],
    title: string,
    seconds: number,
    paperKey: string | null,
    strict: boolean,
  ) => void;
  openChapter: (chapter: Chapter) => void;
  completeChapter: (id: string) => void;
  clearMistakes: () => void;
  setTasks: (tasks: StudyTask[]) => void;
  addXp: (amount: number, bumpStreak?: boolean) => void;
  setBattleOpen: (open: boolean) => void;
};

export const VijetaContext = createContext<VijetaContextValue | null>(null);

export function useVijeta() {
  const ctx = useContext(VijetaContext);
  if (!ctx) throw new Error("Vijeta context missing");
  return ctx;
}
