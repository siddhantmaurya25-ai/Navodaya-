export const STUDENTS = ["आरुष", "आयुष"] as const;
export type Student = (typeof STUDENTS)[number];

export type TheorySection = { heading: string; body: string };
export type SolvedExample = { q: string; sol: string };

export type Chapter = {
  id: string;
  subject: string;
  name: string;
  desc: string;
  level: string;
  weightage: string;
  diagramType: string;
  formula: string;
  trick: string;
  theorySections: TheorySection[];
  solvedExamples: SolvedExample[];
};

export type Question = {
  id: string;
  subject: string;
  chapterId: string;
  q: string;
  options: string[];
  ans: number;
  exp: string;
  svgSpec?: string;
  graphic?: string;
};

export type Paper = {
  key: string;
  title: string;
  mins: number;
  count: number;
  ids: string[];
};

export type Bank = {
  chapters: Chapter[];
  questions: Question[];
  papers: Paper[];
  byId: Map<string, Question>;
  questionsReady: boolean;
};

export type StudyTask = {
  id: string;
  title: string;
  subject: string;
  time: string;
  done: boolean;
};

export type Profile = {
  xp: number;
  streak: number;
  lastDay: string | null;
  completed: string[];
  papersSolved: string[];
  solved: string[];
  mistakes: string[];
  tasks: StudyTask[];
};

export type Save = {
  student: Student;
  profiles: Record<Student, Profile>;
};

export type ExamSession = {
  title: string;
  paperKey: string | null;
  strict: boolean;
  questions: Question[];
  idx: number;
  answers: number[];
  timeLeft: number;
  submitted: boolean;
  started: number;
};

export const OPT = ["अ", "ब", "स", "द"] as const;

export const SUBJECTS = ["मानसिक योग्यता", "अंकगणित", "हिंदी भाषा"] as const;

export function subjectOrder(subject: string) {
  const i = SUBJECTS.indexOf(subject as (typeof SUBJECTS)[number]);
  return i === -1 ? 9 : i;
}

export function chapterRank(id: string) {
  const n = Number(id.replace(/\D/g, ""));
  const kind = id[0] === "m" ? 0 : id[0] === "a" ? 1 : 2;
  return kind * 100 + n;
}

export function emptyTasks(): StudyTask[] {
  return [
    {
      id: "t1",
      title: "मानसिक योग्यता — 50 आकृति वाले सवाल",
      subject: "मानसिक योग्यता",
      time: "प्रातः 6:00",
      done: false,
    },
    {
      id: "t2",
      title: "अंकगणित — सूत्र दोहराव और 50 सवाल",
      subject: "अंकगणित",
      time: "दोपहर 2:00",
      done: false,
    },
    {
      id: "t3",
      title: "हिंदी — पर्यायवाची, विलोम और एक गद्यांश",
      subject: "हिंदी भाषा",
      time: "सायं 5:30",
      done: false,
    },
    {
      id: "t4",
      title: "रात्रि ओएमआर — एक पूरा मॉडल पेपर",
      subject: "मिश्रित",
      time: "रात्रि 8:00",
      done: false,
    },
  ];
}

export function emptyProfile(): Profile {
  return {
    xp: 0,
    streak: 0,
    lastDay: null,
    completed: [],
    papersSolved: [],
    solved: [],
    mistakes: [],
    tasks: emptyTasks(),
  };
}

export function defaultSave(): Save {
  return {
    student: "आरुष",
    profiles: { आरुष: emptyProfile(), आयुष: emptyProfile() },
  };
}
