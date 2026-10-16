import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, BookOpen, Check, Clock3, Flame, Languages, Play, ScrollText, ShieldCheck, Swords, Target, Timer, Zap } from "lucide-react";
import { useVijeta } from "@/components/vijeta/context";
import { COURSE_TRACKS, orderedCourseChapters } from "@/lib/course-curriculum";
import { shuffle } from "@/lib/bank";

export function HomeTab() {
  const { student, profile, bank, setTab, openChapter, openCustomExam, setBattleOpen } = useVijeta();
  const courseChapters = useMemo(() => orderedCourseChapters(bank.chapters), [bank.chapters]);
  const nextChapter = courseChapters.find((chapter) => !profile.completed.includes(chapter.id));
  const lessonOfDay = nextChapter ?? courseChapters[0];
  const completedCount = courseChapters.filter((chapter) => profile.completed.includes(chapter.id)).length;
  const courseProgress = Math.round((completedCount / Math.max(courseChapters.length, 1)) * 100);
  const subjectProgress = COURSE_TRACKS.map((track) => {
    const ids = track.units.flatMap((unit) => unit.chapterIds);
    return { ...track, done: ids.filter((id) => profile.completed.includes(id)).length, total: ids.length };
  });

  function startQuickPractice() {
    if (!bank.questionsReady) return;
    const questions = shuffle(bank.questions).slice(0, 10);
    if (questions.length) openCustomExam(questions, "आज का छोटा अभ्यास · 10 सवाल", 10 * 60, null, false);
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="course-hero relative overflow-hidden rounded-[2rem] p-5 text-paper-2 md:p-7">
        <div className="course-hero-mark" aria-hidden="true">न</div>
        <div className="relative z-10 grid gap-5 md:grid-cols-[1fr_0.72fr] md:items-end">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-paper-2/20 bg-paper-2/10 px-3 py-1 text-xs font-bold text-saffron-soft">
              <span className="size-1.5 rounded-full bg-saffron" />कक्षा 6 · नवोदय तैयारी
            </p>
            <h1 className="mt-4 font-display text-3xl leading-tight md:text-5xl">जय हिंद, {student}.</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-paper-2/80 md:text-base">
              आज की पढ़ाई यहीं से शुरू करें। छोटा पाठ, साफ़ उदाहरण और फिर अभ्यास — आपकी प्रगति इस फ़ोन पर सुरक्षित रहती है।
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {lessonOfDay ? (
                <button type="button" onClick={() => openChapter(lessonOfDay)} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-saffron px-4 text-sm font-bold text-paper-2 shadow-sm">
                  <Play className="size-4 fill-current" />{!nextChapter ? "कोर्स दोहराएँ" : completedCount ? "अगला पाठ जारी रखें" : "पहली कक्षा शुरू करें"}<ArrowRight className="size-4" />
                </button>
              ) : (
                <button type="button" onClick={() => setTab("पढ़ाई")} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-saffron px-4 text-sm font-bold text-paper-2">
                  <BookOpen className="size-4" />कोर्स दोहराएँ
                </button>
              )}
              <button type="button" onClick={() => setTab("पढ़ाई")} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-paper-2/25 bg-paper-2/5 px-4 text-sm font-bold text-paper-2">
                पूरा कोर्स देखें<ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-paper-2/15 bg-paper-2/10 p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-paper-2/70">कोर्स प्रगति</p>
                <p className="mt-1 font-display text-4xl">{courseProgress}<span className="text-lg text-paper-2/65">%</span></p>
              </div>
              <span className="grid size-10 place-items-center rounded-2xl bg-paper-2/10 text-saffron-soft"><Target className="size-5" /></span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-2/15">
              <div className="h-full rounded-full bg-saffron" style={{ width: `${courseProgress}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-paper-2/75">
              <span>{completedCount}/40 पाठ पूरे</span>
              <span>{profile.xp.toLocaleString("hi-IN")} XP</span>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-paper-2/10 px-3 py-2 text-xs">
              <Flame className="size-4 text-saffron-soft" />
              <span className="font-bold">{profile.streak} दिन</span>
              <span className="text-paper-2/70">नियमित अभ्यास</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="विषयवार प्रगति">
        {subjectProgress.map((track, index) => {
          const color = index === 0 ? "bg-moss" : index === 1 ? "bg-saffron" : "bg-ink";
          const label = index === 0 ? "दृश्य सोच" : index === 1 ? "गणित" : "भाषा";
          return (
            <button key={track.id} type="button" onClick={() => setTab("पढ़ाई")} className="rounded-3xl border border-line bg-paper-2 p-4 text-left transition hover:border-line-strong">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink-soft">{label}</span>
                <span className="text-xs font-bold">{track.done}/{track.total} पाठ</span>
              </div>
              <h2 className="mt-1 text-base font-bold">{track.shortName}</h2>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${track.total ? (track.done / track.total) * 100 : 0}%` }} />
              </div>
            </button>
          );
        })}
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-line bg-paper-2 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-saffron-deep">आज का सीखने का क्रम</p>
              <h2 className="mt-1 font-display text-2xl">छोटे कदम, पक्की तैयारी</h2>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-saffron-soft text-saffron-deep"><Clock3 className="size-5" /></span>
          </div>
          <ol className="mt-4 space-y-2">
            <li className="flex items-center gap-3 rounded-2xl bg-paper p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-ink text-xs font-bold text-paper-2">1</span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-bold">एक कक्षा सीखें</span><span className="block text-xs text-ink-soft">लक्ष्य, समझ और हल किया उदाहरण</span></span>
              {lessonOfDay && <button type="button" onClick={() => openChapter(lessonOfDay)} className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper-2" aria-label="अगली कक्षा खोलें"><ArrowRight className="size-4" /></button>}
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-paper p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-saffron text-xs font-bold text-paper-2">2</span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-bold">10 सवाल लगाएँ</span><span className="block text-xs text-ink-soft">कम समय का मिश्रित अभ्यास</span></span>
              <button type="button" onClick={startQuickPractice} disabled={!bank.questionsReady} className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper-2 disabled:opacity-50" aria-label="10 सवाल शुरू करें"><Zap className="size-4" /></button>
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-paper p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-moss text-xs font-bold text-paper-2">3</span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-bold">गलतियों पर लौटें</span><span className="block text-xs text-ink-soft">गलती कॉपी और सही हल दोहराएँ</span></span>
              <button type="button" onClick={() => setTab("अभ्यास")} className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper-2" aria-label="अभ्यास केंद्र खोलें"><ArrowRight className="size-4" /></button>
            </li>
          </ol>
        </section>

        <div className="space-y-4">
          <section className="rounded-3xl border border-line bg-paper-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-moss">ऑफ़लाइन सामग्री</p>
                <h2 className="mt-1 text-base font-bold">{bank.questionsReady ? "पढ़ाई तैयार है" : "कक्षा खुली है"}</h2>
              </div>
              <span className={`grid size-10 place-items-center rounded-2xl ${bank.questionsReady ? "bg-moss-soft text-moss" : "bg-saffron-soft text-saffron-deep"}`}>
                {bank.questionsReady ? <ShieldCheck className="size-5" /> : <BookOpen className="size-5" />}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              {bank.questionsReady
                ? `${bank.questions.length.toLocaleString("hi-IN")} सवाल और ${bank.papers.length} पेपर इस डिवाइस पर उपलब्ध हैं।`
                : "पाठ पढ़ना जारी रखें; सवालों की स्थानीय फ़ाइल पृष्ठभूमि में खुल रही है।"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-paper px-3 py-1.5">बिना लॉगिन पढ़ें</span>
              <span className="rounded-full bg-paper px-3 py-1.5">लोकल प्रगति सुरक्षित</span>
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-paper-2 p-4">
            <h2 className="text-sm font-bold">अभ्यास के रास्ते</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setTab("अभ्यास")} className="flex min-h-12 items-center gap-2 rounded-2xl bg-paper px-3 text-left text-xs font-bold"><BookOpen className="size-4 text-saffron-deep" />सवाल अभ्यास</button>
              <button type="button" onClick={() => setBattleOpen(true)} className="flex min-h-12 items-center gap-2 rounded-2xl bg-paper px-3 text-left text-xs font-bold"><Swords className="size-4 text-saffron-deep" />भाई दंगल</button>
              <button type="button" onClick={() => setTab("टेस्ट")} className="flex min-h-12 items-center gap-2 rounded-2xl bg-paper px-3 text-left text-xs font-bold"><ScrollText className="size-4 text-saffron-deep" />मॉडल पेपर</button>
              <button type="button" onClick={() => setTab("अभ्यास")} className="flex min-h-12 items-center gap-2 rounded-2xl bg-paper px-3 text-left text-xs font-bold"><Languages className="size-4 text-saffron-deep" />गणित और हिंदी</button>
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <Sprint />
        <section className="rounded-3xl border border-line bg-paper-2 p-4 md:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-saffron-deep">परीक्षा का ढाँचा</p>
              <h2 className="mt-1 font-display text-2xl">तीन खंड · एक लक्ष्य</h2>
            </div>
            <span className="grid size-10 place-items-center rounded-2xl bg-paper text-saffron-deep"><Target className="size-5" /></span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <ExamSection title="मानसिक योग्यता" detail="40 प्रश्न · 50 अंक" icon="◇" />
            <ExamSection title="अंकगणित" detail="20 प्रश्न · 25 अंक" icon="＋" />
            <ExamSection title="हिंदी भाषा" detail="20 प्रश्न · 25 अंक" icon="अ" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-paper p-3 text-xs text-ink-soft">
            <span>{completedCount}/40 पाठ · {profile.papersSolved.length}/36 पेपर · {profile.streak} दिन नियमित</span>
            <button type="button" onClick={() => setTab("टेस्ट")} className="inline-flex min-h-10 items-center gap-1 rounded-full bg-paper-2 px-3 font-bold text-ink">पेपर हॉल<ArrowRight className="size-3.5" /></button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ExamSection({ title, detail, icon }: { title: string; detail: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-paper p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-paper-2 font-bold text-saffron-deep">{icon}</span>
      <span className="min-w-0"><span className="block break-words text-xs font-bold">{title}</span><span className="block text-[11px] text-ink-soft">{detail}</span></span>
    </div>
  );
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!live) return;
    const n = Number(value);
    if (n === drill.answer) {
      setScore((current) => current + 1);
      setNote("सही");
    } else {
      setNote(`उत्तर ${drill.answer} था`);
    }
    setValue("");
    setDrill(makeDrill());
  }

  return (
    <section className="rounded-3xl border border-line bg-paper-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-saffron-deep">गति अभ्यास</p>
          <h2 className="mt-1 text-base font-bold">60 सेकंड का हिसाब</h2>
        </div>
        <span className="grid size-11 place-items-center rounded-2xl bg-saffron-soft font-display text-xl text-saffron-deep">{live ? left : <Timer className="size-5" />}</span>
      </div>
      <p className="mt-2 text-xs text-ink-soft">कक्षा 6 की गति। हर सही जवाब पर XP।</p>
      {live ? (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <p className="font-display text-2xl">{drill.prompt}</p>
          <div className="flex gap-2">
            <input inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-full border border-line bg-paper px-4 text-sm" aria-label="उत्तर" autoFocus />
            <button type="submit" className="min-h-11 rounded-full bg-ink px-4 text-sm font-bold text-paper-2">जाँचें</button>
          </div>
          <p className="text-xs font-semibold" role="status">अंक {score}{note ? ` · ${note}` : ""}</p>
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
          <Timer className="size-4" />दौड़ शुरू
        </button>
      )}
      {!live && note && <p className="mt-2 text-sm font-semibold" role="status"><Check className="mr-1 inline size-4 text-moss" />{note}</p>}
    </section>
  );
}
