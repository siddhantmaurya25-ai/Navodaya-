import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useVijeta } from "@/components/vijeta/context";
import { OPT } from "@/lib/exam-types";

export function HindiTab() {
  const { bank, openCustomExam, openChapter } = useVijeta();
  const [query, setQuery] = useState("");
  const chapters = useMemo(
    () => bank.chapters.filter((c) => c.subject === "हिंदी भाषा"),
    [bank.chapters],
  );
  const hits = useMemo(() => {
    const q = query.trim();
    const pool = bank.questions.filter((item) => item.subject === "हिंदी भाषा");
    if (!q) return pool.slice(0, 8);
    return pool.filter((item) => item.q.includes(q) || item.exp.includes(q) || item.options.some((o) => o.includes(q))).slice(0, 12);
  }, [bank.questions, query]);

  function quiz() {
    const pool = bank.questions.filter((item) => item.subject === "हिंदी भाषा");
    const pick = [...pool].sort(() => Math.random() - 0.5).slice(0, 50);
    openCustomExam(pick, "हिंदी भाषा · 50 सवाल", 50 * 60, null, false);
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-col justify-between gap-3 rounded-3xl bg-moss p-5 text-paper-2 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-paper-2/80">खंड 3 · 20 प्रश्न · 25 अंक</p>
          <h1 className="font-display text-3xl">हिंदी कोष</h1>
          <p className="mt-1 max-w-xl text-sm text-paper-2/85">
            संधि, समास, पर्यायवाची, मुहावरे और अपठित गद्यांश — दस अध्यायों में।
          </p>
        </div>
        <button type="button" onClick={quiz} className="min-h-11 rounded-full bg-paper-2 px-4 text-sm font-bold text-ink">
          50 सवालों का टेस्ट
        </button>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        {chapters.map((chapter) => (
          <article key={chapter.id} className="rounded-3xl border border-line bg-paper-2 p-4">
            <button type="button" onClick={() => openChapter(chapter)} className="text-left">
              <h2 className="text-base font-bold">{chapter.name}</h2>
              <p className="mt-1 text-xs font-semibold text-moss">{chapter.weightage}</p>
            </button>
            <p className="mt-2 rounded-xl bg-moss-soft p-3 text-sm">{chapter.formula}</p>
            <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm text-ink-soft">
              {chapter.theorySections[0]?.body}
            </p>
          </article>
        ))}
      </div>

      <section className="rounded-3xl border border-line bg-paper-2 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold">शब्द खोज</h2>
          <label className="relative sm:w-80">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="पर्याय, विलोम, मुहावरा, तत्सम"
              className="min-h-11 w-full rounded-full border border-line bg-paper pr-4 pl-10 text-sm"
            />
          </label>
        </div>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {hits.map((item) => (
            <li key={item.id} className="rounded-2xl bg-paper p-3 text-sm">
              <p className="font-semibold">{item.q}</p>
              <p className="mt-1 text-moss">
                ({OPT[item.ans]}) {item.options[item.ans]}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
