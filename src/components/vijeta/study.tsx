import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useVijeta } from "@/components/vijeta/context";
import { chapterRank, SUBJECTS, subjectOrder, type Chapter } from "@/lib/exam-types";

export function StudyTab() {
  const { bank, profile } = useVijeta();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string>("सभी");

  const list = useMemo(() => {
    const q = query.trim();
    return bank.chapters
      .filter((c) => (subject === "सभी" ? true : c.subject === subject))
      .filter((c) => !q || c.name.includes(q) || c.desc.includes(q) || c.formula.includes(q) || c.subject.includes(q))
      .slice()
      .sort((a, b) => subjectOrder(a.subject) - subjectOrder(b.subject) || chapterRank(a.id) - chapterRank(b.id));
  }, [bank.chapters, query, subject]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl">चालीस अध्याय</h1>
        <p className="text-sm text-ink-soft">
          {profile.completed.length}/40 पूरे। हर अध्याय में सूत्र, उदाहरण और पचास सवाल।
        </p>
      </header>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="अध्याय, सूत्र या विषय खोजें"
            className="min-h-11 w-full rounded-full border border-line bg-paper-2 pr-4 pl-10 text-sm"
          />
        </label>
        <div className="flex gap-1 overflow-x-auto">
          {["सभी", ...SUBJECTS].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSubject(item)}
              className={
                "min-h-11 shrink-0 rounded-full px-3 text-xs font-bold " +
                (subject === item ? "bg-ink text-paper-2" : "bg-paper-2 text-ink")
              }
            >
              {item === "मानसिक योग्यता" ? "मानसिक" : item === "अंकगणित" ? "गणित" : item === "हिंदी भाषा" ? "हिंदी" : item}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} done={profile.completed.includes(chapter.id)} />
        ))}
      </div>
      {list.length === 0 && <p className="text-sm text-ink-soft">इस खोज से कोई अध्याय नहीं मिला।</p>}
    </div>
  );
}

function ChapterCard({ chapter, done }: { chapter: Chapter; done: boolean }) {
  const { openChapter } = useVijeta();
  return (
    <button
      type="button"
      onClick={() => openChapter(chapter)}
      className="rounded-3xl border border-line bg-paper-2 p-4 text-left transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-saffron-deep">{chapter.subject}</span>
        <span className={"rounded-full px-2 py-0.5 text-[11px] font-bold " + (done ? "bg-moss text-paper-2" : "bg-paper text-ink-soft")}>
          {done ? "पूरा" : chapter.level}
        </span>
      </div>
      <h2 className="mt-2 text-base font-bold leading-snug">{chapter.name}</h2>
      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{chapter.desc}</p>
      <p className="mt-3 text-xs font-semibold text-ink">{chapter.weightage}</p>
    </button>
  );
}

export function ChapterReader({
  chapter,
  onClose,
}: {
  chapter: Chapter;
  onClose: () => void;
}) {
  const { profile, completeChapter, openCustomExam, bank, solvedSet } = useVijeta();
  const done = profile.completed.includes(chapter.id);

  function startQuiz() {
    const pool = bank.questions.filter((q) => q.chapterId === chapter.id);
    const unseen = pool.filter((q) => !solvedSet.has(q.id));
    const base = unseen.length >= 20 ? unseen : pool.length ? pool : bank.questions.filter((q) => q.subject === chapter.subject);
    const pick = [...base].sort(() => Math.random() - 0.5).slice(0, 50);
    openCustomExam(pick, `${chapter.name} · ${pick.length} सवाल`, pick.length * 60, null, false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-paper-2 sm:rounded-3xl">
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-saffron-deep">
              {chapter.subject} · {chapter.weightage}
            </p>
            <h2 className="text-lg font-bold leading-snug">{chapter.name}</h2>
            <p className="text-sm text-ink-soft">{chapter.desc}</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full bg-paper text-sm font-bold">
            बंद
          </button>
        </header>
        <div className="flex-1 space-y-3 overflow-auto p-4">
          <section className="rounded-2xl bg-ink p-4 text-paper-2">
            <p className="text-xs font-semibold text-saffron-soft">सूत्र</p>
            <p className="mt-1 text-sm font-semibold">{chapter.formula}</p>
            <p className="mt-2 text-sm text-paper-2/80">ट्रिक: {chapter.trick}</p>
          </section>
          {chapter.theorySections.map((section, i) => (
            <section key={i} className="rounded-2xl border border-line bg-paper p-4">
              <h3 className="text-sm font-bold">{section.heading}</h3>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{section.body}</p>
            </section>
          ))}
          {chapter.solvedExamples?.length > 0 && (
            <section className="rounded-2xl bg-moss-soft p-4">
              <h3 className="text-sm font-bold text-moss">हल किए उदाहरण</h3>
              <div className="mt-2 space-y-2">
                {chapter.solvedExamples.map((ex, i) => (
                  <div key={i} className="rounded-xl bg-paper-2 p-3 text-sm">
                    <p className="font-semibold">{ex.q}</p>
                    <p className="mt-1 text-moss">{ex.sol}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <footer className="flex flex-col gap-2 border-t border-line p-3 sm:flex-row">
          <button
            type="button"
            onClick={() => completeChapter(chapter.id)}
            className="min-h-11 flex-1 rounded-full bg-ink text-sm font-bold text-paper-2"
          >
            {done ? "यह अध्याय पूरा है" : "समझ आ गया · +50 XP"}
          </button>
          <button type="button" onClick={startQuiz} className="min-h-11 flex-1 rounded-full bg-saffron text-sm font-bold text-paper-2">
            इस अध्याय के 50 सवाल
          </button>
        </footer>
      </div>
    </div>
  );
}
