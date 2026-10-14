import { useEffect, useMemo, useState } from "react";
import type { Bank, Chapter, Paper, Question } from "@/lib/exam-types";

export function useBank() {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancel = false;
    const fail = () => {
      if (!cancel) setError("प्रश्न-संग्रह नहीं खुल सका। एक बार फिर खोलें।");
    };
    fetch("/data/chapters.json")
      .then((r) => {
        if (!r.ok) throw new Error("chapters");
        return r.json() as Promise<Chapter[]>;
      })
      .then((data) => {
        if (!cancel) setChapters(data);
      })
      .catch(fail);
    fetch("/data/papers.json")
      .then((r) => {
        if (!r.ok) throw new Error("papers");
        return r.json() as Promise<Paper[]>;
      })
      .then((data) => {
        if (!cancel) setPapers(data);
      })
      .catch(fail);
    fetch("/data/questions.json")
      .then((r) => {
        if (!r.ok) throw new Error("questions");
        return r.json() as Promise<Question[]>;
      })
      .then((data) => {
        if (cancel) return;
        setQuestions(data);
        setQuestionsReady(true);
      })
      .catch(fail);
    return () => {
      cancel = true;
    };
  }, []);

  const bank = useMemo<Bank | null>(() => {
    if (!chapters || !papers) return null;
    const byId = new Map<string, Question>();
    for (const q of questions) byId.set(q.id, q);
    return { chapters, questions, papers, byId, questionsReady };
  }, [chapters, papers, questions, questionsReady]);

  return { bank, error };
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
  const questions = paper.ids.map((id) => bank.byId.get(id)).filter((q): q is Question => !!q);
  return { paper, questions };
}