import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Shuffle, Trash2 } from "lucide-react";
import { useVijeta } from "@/components/vijeta/context";
import { Figure } from "@/components/vijeta/figure";
import { OPT, SUBJECTS, type Question } from "@/lib/exam-types";

export function PracticeTab() {
  const { bank, profile, solvedSet, setTasks, clearMistakes, openCustomExam } = useVijeta();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [subject, setSubject] = useState<string>("सभी");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [draftSubject, setDraftSubject] = useState<string>(SUBJECTS[0]);

  const deck = useMemo(() => {
    return subject === "सभी" ? bank.questions : bank.questions.filter((q) => q.subject === subject);
  }, [bank.questions, subject]);

  const card = deck[index % Math.max(deck.length, 1)] as Question | undefined;

  const found = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    return bank.questions.filter((item) => item.q.includes(q) || item.options.some((o) => o.includes(q))).slice(0, 20);
  }, [bank.questions, query]);

  const mistakes = profile.mistakes
    .map((id) => bank.byId.get(id))
    .filter((q): q is Question => !!q);

  function move(step: number) {
    setFlipped(false);
    setIndex((i) => (i + step + deck.length) % deck.length);
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl">4,062 सवाल</h1>
          <p className="text-sm text-ink-soft">
            {solvedSet.size} हल हो चुके हैं। कार्ड पलटो, खोजो, गलती कॉपी दोहराओ।
          </p>
        </div>
      </header>

      <section className="rounded-3xl bg-ink p-4 text-paper-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold">त्वरित कार्ड</h2>
          <div className="flex flex-wrap gap-1">
            {["सभी", ...SUBJECTS].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setSubject(item);
                  setIndex(0);
                  setFlipped(false);
                }}
                className={
                  "min-h-11 rounded-full px-3 text-xs font-bold " +
                  (subject === item ? "bg-saffron text-paper-2" : "bg-paper-2/10 text-paper-2")
                }
              >
                {item === "मानसिक योग्यता" ? "मानसिक" : item === "अंकगणित" ? "गणित" : item === "हिंदी भाषा" ? "हिंदी" : "सभी"}
              </button>
            ))}
          </div>
        </div>
        {card && (
          <>
            <button
              type="button"
              onClick={() => setFlipped((v) => !v)}
              className="mt-3 min-h-44 w-full rounded-2xl border border-paper-2/15 bg-ink p-4 text-left"
            >
              <p className="text-xs text-saffron-soft">
                {card.subject} · {(index % deck.length) + 1}/{deck.length}
              </p>
              {flipped ? (
                <div className="mt-2">
                  <p className="font-display text-xl text-saffron-soft">
                    ({OPT[card.ans]}) {card.options[card.ans]}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm text-paper-2/85">{card.exp}</p>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-base font-semibold leading-snug">{card.q}</p>
                  <div className="mt-3">
                    <Figure question={card} />
                  </div>
                  <p className="mt-3 text-xs text-paper-2/60">टैप करके उत्तर और हल देखें</p>
                </div>
              )}
            </button>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => move(-1)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-full bg-paper-2/10 text-sm font-bold">
                <ChevronLeft className="size-4" />
                पिछला
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlipped(false);
                  setIndex(Math.floor(Math.random() * deck.length));
                }}
                className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full bg-saffron px-4 text-sm font-bold text-paper-2"
              >
                <Shuffle className="size-4" />
                रैंडम
              </button>
              <button type="button" onClick={() => move(1)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-full bg-paper-2 text-sm font-bold text-ink">
                अगला
                <ChevronRight className="size-4" />
              </button>
            </div>
          </>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-paper-2 p-4">
          <h2 className="text-sm font-bold">आज का क्रम</h2>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const title = draft.trim();
              if (!title) return;
              setTasks([
                ...profile.tasks,
                { id: String(Date.now()), title, subject: draftSubject, time: "आज", done: false },
              ]);
              setDraft("");
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="नया काम लिखें"
              className="min-h-11 min-w-0 flex-1 rounded-full border border-line bg-paper px-4 text-sm"
            />
            <select
              value={draftSubject}
              onChange={(e) => setDraftSubject(e.target.value)}
              className="min-h-11 rounded-full border border-line bg-paper px-2 text-xs"
            >
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button type="submit" className="grid size-11 place-items-center rounded-full bg-ink text-paper-2" aria-label="जोड़ें">
              <Plus className="size-4" />
            </button>
          </form>
          <ul className="mt-3 space-y-2">
            {profile.tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2 rounded-2xl bg-paper p-2">
                <button
                  type="button"
                  onClick={() =>
                    setTasks(profile.tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))
                  }
                  className={
                    "grid size-11 shrink-0 place-items-center rounded-full border text-sm font-bold " +
                    (task.done ? "border-moss bg-moss text-paper-2" : "border-line bg-paper-2")
                  }
                  aria-label={task.done ? "अधूरा करें" : "पूरा करें"}
                >
                  {task.done ? "✓" : ""}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={"truncate text-sm font-semibold " + (task.done ? "text-ink-soft line-through" : "")}>{task.title}</p>
                  <p className="text-xs text-ink-soft">
                    {task.subject} · {task.time}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTasks(profile.tasks.filter((t) => t.id !== task.id))}
                  className="grid size-11 place-items-center text-ink-soft"
                  aria-label="हटाएँ"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-line bg-paper-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold">गलती कॉपी · {mistakes.length}</h2>
            {mistakes.length > 0 && (
              <button type="button" onClick={clearMistakes} className="min-h-11 rounded-full px-3 text-xs font-bold text-danger">
                साफ़ करें
              </button>
            )}
          </div>
          {mistakes.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">अभी कोई गलती दर्ज नहीं। टेस्ट में जो गलत होगा वह यहाँ आएगा।</p>
          ) : (
            <>
              <ul className="mt-3 max-h-72 space-y-2 overflow-auto">
                {mistakes.slice(0, 20).map((item) => (
                  <li key={item.id} className="rounded-2xl bg-danger-soft p-3 text-sm">
                    <p className="font-semibold">{item.q}</p>
                    <p className="mt-1">
                      सही: ({OPT[item.ans]}) {item.options[item.ans]}
                    </p>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() =>
                  openCustomExam(
                    mistakes,
                    `गलतियों का सुधार · ${mistakes.length} सवाल`,
                    mistakes.length * 60,
                    null,
                    false,
                  )
                }
                className="mt-3 min-h-11 w-full rounded-full bg-danger text-sm font-bold text-paper-2"
              >
                इन्हीं सवालों का टेस्ट
              </button>
            </>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-line bg-paper-2 p-4">
        <h2 className="text-sm font-bold">पूरे बैंक में खोज</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="कम से कम दो अक्षर — जैसे ल.स. या पर्याय"
          className="mt-3 min-h-11 w-full rounded-full border border-line bg-paper px-4 text-sm"
        />
        <ul className="mt-3 space-y-2">
          {found.map((item) => (
            <li key={item.id} className="rounded-2xl bg-paper p-3 text-sm">
              <p className="text-xs font-semibold text-saffron-deep">{item.subject}</p>
              <p className="font-semibold">{item.q}</p>
              <p className="text-moss">
                ({OPT[item.ans]}) {item.options[item.ans]}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
