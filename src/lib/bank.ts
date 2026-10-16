import { useEffect, useMemo, useState } from "react";
import chaptersData from "../../public/data/chapters.json";
import papersData from "../../public/data/papers.json";
import type { Bank, Chapter, Paper, Question } from "@/lib/exam-types";

const chapters = chaptersData as Chapter[];
const papers = papersData as Paper[];

export function useBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancel = false;
    const load = () => {
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
        .catch(() => {
          if (!cancel) setError("सवालों की फाइल नहीं खुल सकी। पेज एक बार फिर खोलें।");
        });
    };
    const id = window.setTimeout(load, 40);
    return () => {
      cancel = true;
      window.clearTimeout(id);
    };
  }, []);

  const bank = useMemo<Bank>(() => {
    const byId = new Map<string, Question>();
    for (const q of questions) byId.set(q.id, q);
    return { chapters, questions, papers, byId, questionsReady };
  }, [questions, questionsReady]);

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
