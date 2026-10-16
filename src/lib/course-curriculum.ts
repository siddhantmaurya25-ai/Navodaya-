import type { Chapter } from "./exam-types";

export type CourseUnit = {
  id: string;
  title: string;
  summary: string;
  chapterIds: readonly string[];
};

export type CourseTrack = {
  id: string;
  subject: string;
  shortName: string;
  description: string;
  units: readonly CourseUnit[];
};

export const COURSE_TRACKS: readonly CourseTrack[] = [
  {
    id: "mental-ability",
    subject: "मानसिक योग्यता",
    shortName: "मानसिक योग्यता",
    description: "आकृतियाँ, पैटर्न और तर्क — हर नियम को देखकर समझें।",
    units: [
      { id: "mental-visual", title: "आकृति पहचान", summary: "अंतर, समानता और पैटर्न", chapterIds: ["m1", "m2", "m3"] },
      { id: "mental-patterns", title: "श्रृंखला और संबंध", summary: "घुमाव, सादृश्य और पूर्ति", chapterIds: ["m4", "m5", "m6"] },
      { id: "mental-reflections", title: "दर्पण और कागज़", summary: "प्रतिबिंब, मोड़ और काटना", chapterIds: ["m7", "m8", "m9"] },
      { id: "mental-space", title: "स्थानिक कल्पना", summary: "टुकड़े, छिपी आकृतियाँ और घन", chapterIds: ["m10", "m11", "m12"] },
    ],
  },
  {
    id: "arithmetic",
    subject: "अंकगणित",
    shortName: "गणित",
    description: "संख्या की नींव से रोज़मर्रा के सवालों तक।",
    units: [
      { id: "math-number-sense", title: "संख्या की नींव", summary: "संख्या, भिन्न, दशमलव और गुणज", chapterIds: ["a1", "a2", "a3", "a4", "a5", "a6"] },
      { id: "math-operations", title: "गणना और मापन", summary: "सरलीकरण, समय, मापन और चाल", chapterIds: ["a7", "a8", "a9"] },
      { id: "math-everyday", title: "दैनिक गणित", summary: "प्रतिशत, लाभ-हानि, ब्याज और अनुपात", chapterIds: ["a10", "a11", "a12", "a13"] },
      { id: "math-shapes", title: "आकार और चुनौती", summary: "क्षेत्रफल, बीजगणित और विशेष प्रश्न", chapterIds: ["a14", "a15", "a16", "a17", "a18"] },
    ],
  },
  {
    id: "hindi-language",
    subject: "हिंदी भाषा",
    shortName: "हिंदी",
    description: "शब्द-सम्पदा, व्याकरण और ध्यान से पढ़ने का अभ्यास।",
    units: [
      { id: "hindi-grammar", title: "शब्द और व्याकरण", summary: "वर्ण, शब्द-भेद और वाक्य के आधार", chapterIds: ["h1", "h2", "h3", "h4", "h5"] },
      { id: "hindi-vocabulary", title: "शब्द-सम्पदा और प्रयोग", summary: "पर्याय, मुहावरे और शुद्ध भाषा", chapterIds: ["h6", "h7", "h9", "h10"] },
      { id: "hindi-reading", title: "पठन-कौशल", summary: "अपठित गद्यांश से सही उत्तर चुनें", chapterIds: ["h8"] },
    ],
  },
] as const;

const ids = (prefix: string, count: number) => Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);
export const COURSE_CLASS_ORDER = [
  ...ids("m", 12),
  ...ids("a", 15),
  ...ids("h", 8),
  "a16",
  "a17",
  "a18",
  "h9",
  "h10",
];

export function orderedCourseChapters(chapters: readonly Chapter[]) {
  const byId = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  return COURSE_TRACKS.flatMap((track) => track.units.flatMap((unit) => unit.chapterIds))
    .map((id) => byId.get(id))
    .filter((chapter): chapter is Chapter => Boolean(chapter));
}

export function courseClassNumber(chapterId: string) {
  const index = COURSE_CLASS_ORDER.indexOf(chapterId);
  return index < 0 ? 0 : index + 1;
}
