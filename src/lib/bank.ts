import { useCallback, useEffect, useMemo, useState } from "react";
import chaptersData from "../data/chapters.json";
import papersData from "../data/papers.json";
import type { Bank, Chapter, Paper, Question } from "@/lib/exam-types";

const chapters = chaptersData as Chapter[];
const papers = papersData as Paper[];
const chapterIds = new Set(chapters.map((chapter) => chapter.id));

function parseQuestionBank(value: unknown): Question[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error("question bank is empty");
  const ids = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object") throw new Error("invalid question record");
    const question = item as Partial<Question>;
    if (
      typeof question.id !== "string" ||
      !question.id ||
      typeof question.subject !== "string" ||
      typeof question.chapterId !== "string" ||
      !chapterIds.has(question.chapterId) ||
      typeof question.q !== "string" ||
      typeof question.exp !== "string" ||
      !Array.isArray(question.options) ||
      question.options.length !== 4 ||
      !question.options.every((option) => typeof option === "string") ||
      !Number.isInteger(question.ans) ||
      question.ans! < 0 ||
      question.ans! > 3
    ) {
      throw new Error("question record failed validation");
    }
    if (ids.has(question.id)) throw new Error("duplicate question id");
    ids.add(question.id);
  }
  return value as Question[];
}

export function useBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [error, setError] = useState("");
  const [loadVersion, setLoadVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function load() {
      setError("");
      setQuestionsReady(false);
      try {
        const base = new URL(import.meta.env.BASE_URL, window.location.href);
        const assetUrl = new URL("data/questions.json", base).toString();
        const response = await fetch(assetUrl, { cache: "no-cache", signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = parseQuestionBank(await response.json());
        if (!active) return;
        setQuestions(data);
        setQuestionsReady(true);
      } catch (cause) {
        if (!active || (cause instanceof DOMException && cause.name === "AbortError")) return;
        console.error("[Navodaya] Offline question bank could not be loaded", cause);
        setError("सवालों की ऑफ़लाइन सामग्री नहीं खुल सकी। पढ़ाई जारी है; फिर कोशिश करें।");
      }
    }

    const timer = window.setTimeout(() => void load(), 40);
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [loadVersion]);

  const retry = useCallback(() => {
    setError("");
    setQuestionsReady(false);
    setLoadVersion((version) => version + 1);
  }, []);

  const bank = useMemo<Bank>(() => {
    const byId = new Map<string, Question>();
    for (const question of questions) byId.set(question.id, question);
    return { chapters, questions, papers, byId, questionsReady };
  }, [questions, questionsReady]);

  return { bank, error, retry };
}

export function shuffle<T>(list: T[]) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j]!;
    a[j] = tmp!;
  }
  return a;
}

export function questionsForPaper(bank: Bank, key: string) {
  const paper = bank.papers.find((p) => p.key === key);
  if (!paper) return null;
  const questions = paper.ids.map((id) => bank.byId.get(id)).filter((question): question is Question => !!question);
  return { paper, questions };
}
