import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BookOpen, Calculator, Languages, ScrollText, Swords, Timer, Zap } from "lucide-react";
import { useVijeta } from "@/components/vijeta/context";
import { SUBJECTS } from "@/lib/exam-types";

const EXAM = new Date("2026-11-28T09:00:00+05:30").getTime();

const PHASES = [
  {
    days: "चरण 1 · दिन 1–12",
    dates: "15–26 अक्टूबर",
    focus: "मानसिक योग्यता के 12 अध्याय, संख्या पद्धति, ल.स.-म.स., भिन्न और सरलीकरण।",
    target: "रोज़ 2 अध्याय + 100 सवाल + मॉडल सेट 1–8",
    tab: "पढ़ाई" as const,
    label: "अध्याय खोलें",
  },
  {
    days: "चरण 2 · दिन 13–24",
    dates: "27 अक्टूबर – 7 नवम्बर",
    focus: "प्रतिशत, लाभ-हानि, ब्याज, चाल, क्षेत्रफल, आयतन और बीजगणित।",
    target: "गणित लैब + 100 गणित सवाल + सेट 9–16",
    tab: "ग्रंथालय" as const,
    label: "गणित लैब",
  },
  {
    days: "चरण 3 · दिन 25–34",
    dates: "8–17 नवम्बर",
    focus: "तत्सम-तद्भव, संधि, समास, पर्यायवाची, मुहावरे और गद्यांश।",
    target: "रोज़ 5 गद्यांश + सेट 17–24",
    tab: "शब्दसागर" as const,
    label: "हिंदी कोष",
  },
  {
    days: "चरण 4 · दिन 35–44",
    dates: "18–27 नवम्बर",
    focus: "ओएमआर महा-अभ्यास, 2023 और 2017 के पेपर, गलती कॉपी का सुधार।",
    target: "रोज़ 2 फुल पेपर + टॉपर चैलेंज",
    tab: "टेस्ट" as const,
    label: "पेपर हॉल",
  },
];

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function makeDrill() {
  const kind = Math.floor(Math.random() * 4);
  if (kind === 0) {
    const a = 11 + Math.floor(Math.random() * 19);
    const b = 3 + Math.floor(Math.random() * 7);
    return { prompt: `${a} × ${b}`, answer: a * b };
  }
  if (kind === 1) {
    const a = 20 + Math.floor(Math.random() * 80);
    const p = [10, 20, 25, 50][Math.floor(Math.random() * 4)] ?? 10;
    return { prompt: `${a} का ${p}%`, answer: (a * p) / 100 };
  }
  if (kind === 2) {
    const a = 6 + Math.floor(Math.random() * 12);
    const b = a + 2 + Math.floor(Math.random() * 8);
    return { prompt: `${a} + ${b} + ${a}`, answer: a + b + a };
  }
  const a = 4 + Math.floor(Math.random() * 9);
  return { prompt: `${a} का वर्ग`, answer: a * a };
}

export function HomeTab() {
  const { student, profile, bank, setTab, solvedSet, openExam, setBattleOpen } = useVijeta();
  const now = useNow();
  const left = Math.max(0, EXAM - now);
  const days = Math.floor(left / 86_400_000);
  const hours = Math.floor((left % 86_400_000) / 3_600_000);
  const mins = Math.floor((left % 3_600_000) / 60_000);
  const secs = Math.floor((left % 60_000) / 1000);

  const meters = useMemo(() => {
    if (!bank.questionsReady) return null;
    return SUBJECTS.map((subject) => {
      const all = bank.questions.filter((q) => q.subject === subject);
      const done = all.filter((q) => solvedSet.has(q.id)).length;
      const short = subject === "मानसिक योग्यता" ? "मानसिक" : subject === "अंकगणित" ? "गणित" : "हिंदी";
      return { subject, short, done, total: all.length };
    });
  }, [bank.questions, bank.questionsReady, solvedSet]);

  const level = Math.floor(profile.xp / 1000) + 1;
  const into = profile.xp % 1000;

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-3xl bg-ink text-paper-2">
        <div className="grid gap-6 p-5 md:grid-cols-[1.4fr_0.8fr] md:p-7">
          <div>
            <p className="text-xs font-semibold tracking-wide text-saffron-soft">
              जवाहर नवोदय विद्यालय · कक्षा 6 · 28 नवम्बर 2026
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">जय हिंद, {student}.</h1>
            <p className="mt-2 max-w-xl text-sm text-paper-2/80">
              आसान भाषा में 40 अध्याय, साफ़ आकृति वाले सवाल, और असली ओएमआर पेपर। दोनों भाइयों की पढ़ाई अलग-अलग बचती है।
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTab("पढ़ाई")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-saffron px-4 text-sm font-bold text-paper-2"
              >
                <BookOpen className="size-4" />
                40 अध्याय
              </button>
              <button
                type="button"
                onClick={() => openExam(null, "daily100")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-paper-2 px-4 text-sm font-bold text-ink"
              >
                <Zap className="size-4" />
                आज के 100 सवाल
              </button>
              <button
                type="button"
                onClick={() => setBattleOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-paper-2/30 px-4 text-sm font-bold"
              >
                <Swords className="size-4" />
                भाई दंगल
              </button>
            </div>
          </div>
          <div className="rounded-2xl bg-paper-2/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-saffron-soft">
              <Timer className="size-4" />
              परीक्षा तक
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                [days, "दिन"],
                [hours, "घंटे"],
                [mins, "मिनट"],
                [secs, "सेकंड"],
              ].map(([n, label]) => (
                <div key={String(label)}>
                  <div className="font-display text-2xl md:text-3xl">{n}</div>
                  <div className="text-[11px] text-paper-2/70">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span>लेवल {level}</span>
                <span>{profile.xp} XP</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-paper-2/15">
                <div className="h-full rounded-full bg-saffron" style={{ width: `${Math.max(4, into / 10)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {meters ? (
          meters.map((m) => (
          <div key={m.subject} className="rounded-2xl border border-line bg-paper-2 p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-bold">{m.short}</h2>
              <span className="font-display text-lg">
                {m.done}
                <span className="text-sm text-ink-soft">/{m.total}</span>
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper">
              <div
                className="h-full rounded-full bg-moss"
                style={{ width: `${m.total ? (m.done / m.total) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-soft">हल किए सवाल</p>
          </div>
          ))
        ) : (
          <p className="text-sm text-ink-soft sm:col-span-3">4,062 सवाल गिने जा रहे हैं…</p>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-line bg-paper-2 p-4 md:p-5">
          <h2 className="font-display text-2xl">44 दिन की योजना</h2>
          <p className="text-sm text-ink-soft">15 अक्टूबर से 27 नवम्बर तक, परीक्षा से एक दिन पहले तक।</p>
          <ol className="mt-4 space-y-3">
            {PHASES.map((phase, i) => (
              <li key={phase.days} className="grid grid-cols-[auto_1fr] gap-3">
                <div className="flex flex-col items-center">
                  <span className="grid size-8 place-items-center rounded-full bg-ink text-xs font-bold text-paper-2">{i + 1}</span>
                  {i < PHASES.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
                </div>
                <div className="pb-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-bold">{phase.days}</h3>
                    <span className="text-xs text-ink-soft">{phase.dates}</span>
                  </div>
                  <p className="mt-1 text-sm">{phase.focus}</p>
                  <p className="text-xs text-ink-soft">{phase.target}</p>
                  <button
                    type="button"
                    onClick={() => setTab(phase.tab)}
                    className="mt-2 min-h-11 rounded-full bg-paper px-4 text-xs font-bold"
                  >
                    {phase.label}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <div className="space-y-4">
          <Sprint />
          <section className="rounded-3xl border border-line bg-paper-2 p-4">
            <h2 className="text-sm font-bold">तीन खंड, एक पेपर</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Languages className="size-4 text-saffron" />
                मानसिक योग्यता · 40 प्रश्न · 50 अंक
              </li>
              <li className="flex items-center gap-2">
                <Calculator className="size-4 text-saffron" />
                अंकगणित · 20 प्रश्न · 25 अंक
              </li>
              <li className="flex items-center gap-2">
                <ScrollText className="size-4 text-saffron" />
                हिंदी भाषा · 20 प्रश्न · 25 अंक
              </li>
            </ul>
            <p className="mt-3 text-xs text-ink-soft">
              अध्याय पूरे: {profile.completed.length}/40 · पेपर हल: {profile.papersSolved.length}/36 · लगातार दिन: {profile.streak}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Sprint() {
  const { addXp, student } = useVijeta();
  const [live, setLive] = useState(false);
  const [left, setLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [drill, setDrill] = useState(makeDrill);
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!live) return;
    if (left <= 0) {
      setLive(false);
      if (score > 0) addXp(score * 5, true);
      setNote(score ? `${student} ने ${score} सही किए · +${score * 5} XP` : "इस बार शून्य। एक और कोशिश।");
      return;
    }
    const id = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [live, left, score, addXp, student]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!live) return;
    const n = Number(value);
    if (n === drill.answer) {
      setScore((s) => s + 1);
      setNote("सही");
    } else {
      setNote(`उत्तर ${drill.answer} था`);
    }
    setValue("");
    setDrill(makeDrill());
  }

  return (
    <section className="rounded-3xl border border-line bg-paper-2 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">60 सेकंड का हिसाब</h2>
        <span className="font-display text-xl">{live ? left : "60"}</span>
      </div>
      <p className="mt-1 text-xs text-ink-soft">कक्षा 6 की गति। हर सही जवाब पर XP।</p>
      {live ? (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <p className="font-display text-2xl">{drill.prompt}</p>
          <div className="flex gap-2">
            <input
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="min-h-11 flex-1 rounded-full border border-line bg-paper px-4 text-sm"
              aria-label="उत्तर"
              autoFocus
            />
            <button type="submit" className="min-h-11 rounded-full bg-ink px-4 text-sm font-bold text-paper-2">
              जाँचो
            </button>
          </div>
          <p className="text-xs font-semibold">
            अंक {score}
            {note ? ` · ${note}` : ""}
          </p>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setLive(true);
            setLeft(60);
            setScore(0);
            setNote("");
            setDrill(makeDrill());
            setValue("");
          }}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-saffron px-4 text-sm font-bold text-paper-2"
        >
          <Timer className="size-4" />
          दौड़ शुरू
        </button>
      )}
      {!live && note && <p className="mt-2 text-sm font-semibold">{note}</p>}
    </section>
  );
}
