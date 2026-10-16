import { useMemo, useState } from "react";
import { ArrowRight, BookOpenCheck, Check, ChevronDown, CircleCheck, Clock3, Search, Sparkles } from "lucide-react";
import { useVijeta } from "@/components/vijeta/context";
import { COURSE_TRACKS, courseClassNumber } from "@/lib/course-curriculum";
import { LESSON_MATERIALS, type LessonKit } from "@/lib/lesson-materials";
import { shuffle } from "@/lib/bank";
import type { Chapter } from "@/lib/exam-types";

export function StudyTab() {
  const { bank, profile, openChapter } = useVijeta();
  const [activeSubject, setActiveSubject] = useState(COURSE_TRACKS[0]?.subject ?? "मानसिक योग्यता");
  const [openUnit, setOpenUnit] = useState<string | null>(() => nextUnitId(COURSE_TRACKS[0]!, profile.completed));
  const [query, setQuery] = useState("");
  const selectedTrack = COURSE_TRACKS.find((track) => track.subject === activeSubject) ?? COURSE_TRACKS[0]!;
  const chapterById = useMemo(() => new Map(bank.chapters.map((chapter) => [chapter.id, chapter])), [bank.chapters]);
  const allLessons = COURSE_TRACKS.flatMap((track) => track.units.flatMap((unit) => unit.chapterIds));
  const totalCompleted = allLessons.filter((id) => profile.completed.includes(id)).length;
  const searchText = query.trim().toLocaleLowerCase("hi-IN");

  function matchingChapter(chapter: Chapter) {
    if (!searchText) return true;
    return [chapter.name, chapter.desc, chapter.formula, chapter.subject].some((text) => text.toLocaleLowerCase("hi-IN").includes(searchText));
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-saffron-deep">कक्षा 6 · नवोदय प्रवेश तैयारी</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">आपका कोर्स</h1>
          <p className="mt-1 text-sm text-ink-soft">छोटी कक्षाएँ, साफ़ उदाहरण, फिर लक्षित अभ्यास।</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper-2 px-4 py-2 text-right">
          <p className="font-display text-2xl">{totalCompleted}<span className="text-base text-ink-soft">/40</span></p>
          <p className="text-[11px] font-semibold text-ink-soft">पाठ पूरे</p>
        </div>
      </header>

      <section className="rounded-3xl bg-ink p-4 text-paper-2 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-saffron-soft">सीखने का रास्ता</p>
            <h2 className="mt-1 font-display text-2xl">3 विषय · 40 कक्षाएँ</h2>
            <p className="mt-1 max-w-2xl text-sm text-paper-2/75">हर पाठ में लक्ष्य, समझने की सीढ़ियाँ, हल किया उदाहरण और छोटा जाँच-प्रश्न। पढ़ाई फ़ोन पर भी ऑफ़लाइन रहती है।</p>
          </div>
          <span className="hidden size-12 shrink-0 place-items-center rounded-2xl bg-paper-2/10 text-saffron-soft sm:grid">
            <BookOpenCheck className="size-6" />
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper-2/15" aria-label={`कुल प्रगति ${totalCompleted} में से 40 पाठ`}>
          <div className="h-full rounded-full bg-saffron" style={{ width: `${(totalCompleted / 40) * 100}%` }} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="विषय चुनें">
        {COURSE_TRACKS.map((track, index) => {
          const ids = track.units.flatMap((unit) => unit.chapterIds);
          const done = ids.filter((id) => profile.completed.includes(id)).length;
          const active = activeSubject === track.subject;
          const tone = index === 0 ? "bg-moss" : index === 1 ? "bg-saffron" : "bg-ink";
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => {
                setActiveSubject(track.subject);
                setOpenUnit(nextUnitId(track, profile.completed));
              }}
              aria-pressed={active}
              className={
                "rounded-3xl border p-4 text-left transition duration-200 " +
                (active ? "border-ink bg-paper-2 shadow-[0_8px_24px_rgba(27,36,48,0.08)]" : "border-line bg-paper-2 hover:border-line-strong")
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`grid size-10 place-items-center rounded-2xl text-sm font-bold text-paper-2 ${tone}`}>{index + 1}</span>
                <span className="text-xs font-bold text-ink-soft">{done}/{ids.length}</span>
              </div>
              <h2 className="mt-3 text-base font-bold">{track.shortName}</h2>
              <p className="mt-1 min-h-10 text-xs leading-relaxed text-ink-soft">{track.description}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper">
                <div className={`h-full rounded-full ${tone}`} style={{ width: `${ids.length ? (done / ids.length) * 100 : 0}%` }} />
              </div>
            </button>
          );
        })}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-ink-soft">आपका चुना हुआ ट्रैक</p>
            <h2 className="font-display text-2xl">{selectedTrack.subject}</h2>
          </div>
          <label className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="पाठ या विषय खोजें"
              aria-label="पाठ खोजें"
              className="min-h-11 w-full rounded-full border border-line bg-paper-2 pr-4 pl-10 text-sm"
            />
          </label>
        </div>
        {selectedTrack.units.map((unit, unitIndex) => {
          const chapters = unit.chapterIds.map((id) => chapterById.get(id)).filter((chapter): chapter is Chapter => Boolean(chapter)).filter(matchingChapter);
          if (!chapters.length) return null;
          const done = chapters.filter((chapter) => profile.completed.includes(chapter.id)).length;
          const expanded = Boolean(searchText) || openUnit === unit.id;
          return (
            <section key={unit.id} className="overflow-hidden rounded-3xl border border-line bg-paper-2">
              <button
                type="button"
                onClick={() => setOpenUnit((current) => current === unit.id ? null : unit.id)}
                aria-expanded={expanded}
                className="flex min-h-16 w-full items-center gap-3 p-4 text-left"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-paper text-xs font-bold text-ink-soft">{String(unitIndex + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{unit.title}</span>
                  <span className="block text-xs text-ink-soft">{unit.summary} · {done}/{chapters.length} पाठ</span>
                </span>
                {expanded ? <ChevronDown className="size-4 shrink-0" /> : <ArrowRight className="size-4 shrink-0" />}
              </button>
              {expanded && (
                <ol className="divide-y divide-line border-t border-line">
                  {chapters.map((chapter) => (
                    <LessonRow
                      key={chapter.id}
                      chapter={chapter}
                      done={profile.completed.includes(chapter.id)}
                      onOpen={() => openChapter(chapter)}
                    />
                  ))}
                </ol>
              )}
            </section>
          );
        })}
        {searchText && !selectedTrack.units.some((unit) => unit.chapterIds.some((id) => {
          const chapter = chapterById.get(id);
          return chapter ? matchingChapter(chapter) : false;
        })) && <p className="rounded-2xl border border-line bg-paper-2 p-4 text-sm text-ink-soft">इस खोज से कोई पाठ नहीं मिला।</p>}
      </section>
    </div>
  );
}

function nextUnitId(track: (typeof COURSE_TRACKS)[number], completed: string[]) {
  return track.units.find((unit) => unit.chapterIds.some((id) => !completed.includes(id)))?.id ?? track.units[0]?.id ?? null;
}

function LessonRow({ chapter, done, onOpen }: { chapter: Chapter; done: boolean; onOpen: () => void }) {
  const kit = LESSON_MATERIALS[chapter.id];
  const number = courseClassNumber(chapter.id);
  return (
    <li>
      <button type="button" onClick={onOpen} className="flex min-h-20 w-full items-center gap-3 p-3 text-left transition hover:bg-paper sm:p-4">
        <span className={`grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-bold ${done ? "bg-moss text-paper-2" : "bg-saffron-soft text-saffron-deep"}`}>
          {done ? <Check className="size-5" /> : String(number).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm font-bold leading-snug">{chapter.name}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-soft">
            <span>{kit ? "निर्देशित पाठ" : chapter.level}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1"><Clock3 className="size-3" />{kit?.durationMinutes ?? 12} मिनट</span>
            <span aria-hidden="true">·</span>
            <span>{chapter.weightage}</span>
          </span>
        </span>
        <span className="shrink-0 text-ink-soft">{done ? <CircleCheck className="size-5 text-moss" /> : <ArrowRight className="size-4" />}</span>
      </button>
    </li>
  );
}

export function ChapterReader({ chapter, onClose }: { chapter: Chapter; onClose: () => void }) {
  const { profile, completeChapter, openCustomExam, bank, solvedSet } = useVijeta();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const done = profile.completed.includes(chapter.id);
  const kit = LESSON_MATERIALS[chapter.id];

  function startQuiz(count: 10 | 50) {
    if (!bank.questionsReady) return;
    const pool = bank.questions.filter((question) => question.chapterId === chapter.id);
    const unseen = pool.filter((question) => !solvedSet.has(question.id));
    const base = unseen.length ? unseen : pool.length ? pool : bank.questions.filter((question) => question.subject === chapter.subject);
    const pick = shuffle(base).slice(0, count);
    if (!pick.length) return;
    openCustomExam(pick, `${chapter.name} · ${pick.length} सवाल`, pick.length * 60, null, false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/55 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="lesson-title">
      <div className="flex max-h-[96dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-paper-2 pb-[env(safe-area-inset-bottom)] sm:max-h-[92dvh] sm:rounded-3xl">
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
          <div className="min-w-0">
            <p className="text-xs font-bold text-saffron-deep">कक्षा {String(courseClassNumber(chapter.id)).padStart(2, "0")} · {chapter.subject} · {kit?.durationMinutes ?? 12} मिनट</p>
            <h2 id="lesson-title" className="mt-1 break-words text-lg font-bold leading-snug md:text-xl">{chapter.name}</h2>
            <p className="mt-1 break-words text-sm text-ink-soft">{chapter.desc}</p>
          </div>
          <button type="button" onClick={onClose} className="grid min-h-11 shrink-0 place-items-center rounded-full bg-paper px-4 text-sm font-bold" aria-label="पाठ बंद करें">बंद</button>
        </header>
        <div className="flex-1 space-y-4 overflow-auto p-3 sm:p-4 md:p-5">
          <section className="rounded-3xl bg-saffron-soft p-4" id="lesson-objective">
            <div className="flex items-center gap-2 text-xs font-bold text-saffron-deep"><Sparkles className="size-4" />आज का सीखने का लक्ष्य</div>
            <p className="mt-2 text-sm font-semibold leading-relaxed">{kit?.objective ?? chapter.desc}</p>
            {kit && <div className="mt-3 flex flex-wrap gap-2">{kit.flow.map((step, index) => <span key={step.title} className="rounded-full bg-paper-2 px-3 py-1 text-xs font-bold">{index + 1}. {step.title}</span>)}</div>}
          </section>

          <section className="rounded-3xl bg-ink p-4 text-paper-2" id="lesson-concept">
            <p className="text-xs font-bold text-saffron-soft">मुख्य सूत्र</p>
            <p className="mt-1 break-words text-sm font-semibold leading-relaxed">{chapter.formula}</p>
            <p className="mt-3 break-words text-sm leading-relaxed text-paper-2/80"><span className="font-bold text-saffron-soft">याद रखने की बात:</span> {chapter.trick}</p>
          </section>

          {kit && <GuidedLesson kit={kit} selectedAnswer={selectedAnswer} onAnswer={setSelectedAnswer} />}

          {chapter.theorySections.map((section, index) => (
            <section key={`${chapter.id}-theory-${index}`} className="rounded-3xl border border-line bg-paper p-4">
              <h3 className="text-sm font-bold">{section.heading}</h3>
              <p className="mt-1 break-words whitespace-pre-line text-sm leading-relaxed">{section.body}</p>
            </section>
          ))}

          {chapter.solvedExamples.length > 0 && (
            <section className="rounded-3xl border border-moss/15 bg-moss-soft p-4" id="lesson-example">
              <div className="flex items-center gap-2 text-sm font-bold text-moss"><BookOpenCheck className="size-4" />हल किए उदाहरण</div>
              <div className="mt-3 space-y-2">
                {chapter.solvedExamples.map((example, index) => (
                  <div key={`${chapter.id}-example-${index}`} className="rounded-2xl bg-paper-2 p-3">
                    <p className="break-words text-sm font-semibold">{example.q}</p>
                    <p className="mt-1 break-words whitespace-pre-line text-sm leading-relaxed text-moss">{example.sol}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-line bg-paper p-4" id="lesson-practice">
            <h3 className="text-sm font-bold">अब अपनी बारी</h3>
            <p className="mt-1 text-sm text-ink-soft">पहले 10 सवाल लगाएँ। अभ्यास बढ़ाना हो तो पूरे अध्याय के 50 सवाल खोलें।</p>
          </section>
        </div>
        <footer className="grid grid-cols-2 gap-2 border-t border-line bg-paper-2 p-3 sm:px-4">
          <button
            type="button"
            onClick={() => completeChapter(chapter.id)}
            disabled={done}
            className="min-h-12 rounded-2xl border border-line bg-paper px-3 text-xs font-bold disabled:text-moss sm:text-sm"
          >
            {done ? "पाठ पूरा है ✓" : "पाठ पूरा करें · +50 XP"}
          </button>
          <button
            type="button"
            onClick={() => startQuiz(10)}
            disabled={!bank.questionsReady}
            className="min-h-12 rounded-2xl bg-saffron px-3 text-xs font-bold text-paper-2 disabled:opacity-60 sm:text-sm"
          >
            {bank.questionsReady ? "10 सवाल लगाएँ" : "सवाल तैयार हो रहे हैं"}
          </button>
          <button
            type="button"
            onClick={() => startQuiz(50)}
            disabled={!bank.questionsReady}
            className="col-span-2 min-h-10 rounded-xl text-xs font-bold text-ink-soft underline decoration-line-strong underline-offset-4 disabled:opacity-60"
          >
            पूरे अध्याय का अभ्यास · 50 सवाल
          </button>
        </footer>
      </div>
    </div>
  );
}

function GuidedLesson({ kit, selectedAnswer, onAnswer }: { kit: LessonKit; selectedAnswer: number | null; onAnswer: (answer: number) => void }) {
  return (
    <section className="space-y-3" aria-label="निर्देशित पाठ">
      <div className="grid gap-2 sm:grid-cols-3">
        {kit.flow.map((step, index) => (
          <article key={step.title} className="rounded-3xl border border-line bg-paper-2 p-4">
            <span className="grid size-8 place-items-center rounded-xl bg-paper text-xs font-bold text-saffron-deep">{index + 1}</span>
            <h3 className="mt-2 text-sm font-bold">{step.title}</h3>
            <p className="mt-1 break-words text-sm leading-relaxed text-ink-soft">{step.body}</p>
          </article>
        ))}
      </div>
      <article className="rounded-3xl border border-line bg-paper-2 p-4">
        <p className="text-xs font-bold text-moss">चलो, एक उदाहरण साथ में करें</p>
        <p className="mt-2 break-words text-sm font-semibold">{kit.example.question}</p>
        <ol className="mt-2 space-y-1 text-sm text-ink-soft">
          {kit.example.steps.map((step, index) => <li key={step} className="flex gap-2"><span className="font-bold text-moss">{index + 1}.</span><span className="break-words">{step}</span></li>)}
        </ol>
        <p className="mt-2 rounded-2xl bg-moss-soft p-3 text-sm font-bold text-moss">उत्तर: {kit.example.answer}</p>
      </article>
      <article className="rounded-3xl border border-line bg-paper-2 p-4">
        <p className="text-xs font-bold text-saffron-deep">छोटा चेक · सही उत्तर चुनें</p>
        <h3 className="mt-2 break-words text-sm font-bold">{kit.check.question}</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {kit.check.options.map((option, index) => {
            const selected = selectedAnswer === index;
            const answered = selectedAnswer !== null;
            const correct = index === kit.check.answerIndex;
            const stateClass = !answered ? "border-line bg-paper" : correct ? "border-moss bg-moss-soft text-moss" : selected ? "border-danger bg-danger-soft text-danger" : "border-line bg-paper opacity-70";
            return (
              <button
                key={option}
                type="button"
                disabled={answered}
                onClick={() => onAnswer(index)}
                className={`min-h-12 rounded-2xl border px-3 text-left text-sm font-semibold ${stateClass}`}
              >
                <span className="mr-2 text-xs font-bold">{String.fromCharCode(65 + index)}.</span>{option}
              </button>
            );
          })}
        </div>
        {selectedAnswer !== null && (
          <p className={`mt-3 rounded-2xl p-3 text-sm leading-relaxed ${selectedAnswer === kit.check.answerIndex ? "bg-moss-soft text-moss" : "bg-danger-soft text-danger"}`} role="status">
            <span className="font-bold">{selectedAnswer === kit.check.answerIndex ? "बिलकुल सही। " : "एक बार फिर सोचें। "}</span>{kit.check.explanation}
          </p>
        )}
      </article>
    </section>
  );
}
