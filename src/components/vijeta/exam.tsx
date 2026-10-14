import { useEffect, useRef, useState, type Dispatch, type PointerEvent, type SetStateAction } from "react";
import { Check, ChevronLeft, ChevronRight, Eraser, PenLine, X } from "lucide-react";
import type { ExamSession, Question } from "@/lib/exam-types";
import { OPT } from "@/lib/exam-types";
import { scoreExam } from "@/lib/exam-scoring";
import { Figure } from "@/components/vijeta/figure";

function clock(total: number) {
  const s = Math.max(0, total);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

function Scratchpad() {
  const [lines, setLines] = useState<number[][][]>([]);
  const drawing = useRef(false);

  function point(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return [
      ((event.clientX - rect.left) / rect.width) * 600,
      ((event.clientY - rect.top) / rect.height) * 180,
    ];
  }

  return (
    <div className="rounded-2xl border border-line-strong bg-saffron-soft p-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-saffron-deep">
        <span className="inline-flex items-center gap-1.5">
          <PenLine className="size-4" />
          रफ़ स्लेट
        </span>
        <button
          type="button"
          onClick={() => setLines([])}
          className="inline-flex min-h-11 items-center gap-1 rounded-full bg-paper-2 px-3 text-xs font-semibold text-ink"
        >
          <Eraser className="size-3.5" />
          मिटाएँ
        </button>
      </div>
      <svg
        viewBox="0 0 600 180"
        className="h-40 w-full touch-none rounded-xl bg-paper-2"
        onPointerDown={(event) => {
          drawing.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          const p = point(event);
          setLines((prev) => [...prev, [p]]);
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return;
          const p = point(event);
          setLines((prev) => {
            if (!prev.length) return prev;
            const copy = prev.slice();
            const last = copy[copy.length - 1] ?? [];
            copy[copy.length - 1] = [...last, p];
            return copy;
          });
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
        onPointerCancel={() => {
          drawing.current = false;
        }}
      >
        {lines.map((pts, i) => (
          <path
            key={i}
            d={pts.map((pt, j) => `${j === 0 ? "M" : "L"}${pt[0]?.toFixed(1)},${pt[1]?.toFixed(1)}`).join(" ")}
            fill="none"
            stroke="#1b2430"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}

export function ExamPlayer({
  session,
  setSession,
  student,
  onClose,
  onFinish,
}: {
  session: ExamSession;
  setSession: Dispatch<SetStateAction<ExamSession | null>>;
  student: string;
  onClose: () => void;
  onFinish: (session: ExamSession) => void;
}) {
  const [slate, setSlate] = useState(false);
  const done = useRef(false);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  function finish() {
    if (done.current || sessionRef.current.submitted) return;
    done.current = true;
    const current = { ...sessionRef.current, submitted: true };
    setSession(current);
    onFinish(current);
  }

  useEffect(() => {
    if (session.submitted) return;
    if (session.timeLeft <= 0) {
      finish();
      return;
    }
    const id = window.setTimeout(() => {
      setSession((prev) => (prev && !prev.submitted ? { ...prev, timeLeft: prev.timeLeft - 1 } : prev));
    }, 1000);
    return () => window.clearTimeout(id);
    // finish closes over refs; timer keyed to remaining seconds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.submitted, session.timeLeft, session.started]);

  const q = session.questions[session.idx] as Question;
  const choice = session.answers[session.idx] ?? -1;
  const result = session.submitted ? scoreExam(session) : null;
  const figureOptions = q.options.every((opt) => opt.includes("आकृति"));

  function choose(index: number) {
    if (session.submitted) return;
    setSession((prev) => {
      if (!prev || prev.submitted) return prev;
      const answers = prev.answers.slice();
      answers[prev.idx] = index;
      return { ...prev, answers };
    });
  }

  function jump(idx: number) {
    setSession((prev) => (prev ? { ...prev, idx } : prev));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper" role="dialog" aria-modal="true" aria-label={session.title}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-paper-2 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-paper text-ink"
            aria-label="बंद करें"
          >
            <X className="size-5" />
          </button>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{session.title}</div>
            <div className="text-xs text-ink-soft">
              {student} · हल {session.answers.filter((a) => a !== -1).length}/{session.questions.length}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!session.submitted && (
            <>
              <button
                type="button"
                onClick={() => setSlate((v) => !v)}
                className={
                  "inline-flex min-h-11 items-center gap-1 rounded-full border px-3 text-xs font-semibold " +
                  (slate ? "border-ink bg-ink text-paper-2" : "border-line bg-paper-2 text-ink")
                }
              >
                <PenLine className="size-3.5" />
                स्लेट
              </button>
              <button
                type="button"
                onClick={() => setSession((prev) => (prev ? { ...prev, strict: !prev.strict } : prev))}
                className="hidden min-h-11 items-center rounded-full border border-line bg-paper-2 px-3 text-xs font-semibold sm:inline-flex"
              >
                {session.strict ? "नो-हिंट" : "हल दिखे"}
              </button>
            </>
          )}
          <div
            className={
              "min-w-16 rounded-full px-3 py-2 text-center font-display text-sm font-bold " +
              (session.timeLeft < 60 && !session.submitted ? "bg-danger text-paper-2" : "bg-ink text-paper-2")
            }
          >
            {session.submitted ? "समाप्त" : clock(session.timeLeft)}
          </div>
          {!session.submitted && (
            <button
              type="button"
              onClick={finish}
              className="inline-flex min-h-11 items-center gap-1 rounded-full bg-moss px-4 text-sm font-bold text-paper-2"
            >
              <Check className="size-4" />
              जमा करें
            </button>
          )}
        </div>
      </header>

      {session.submitted && result ? (
        <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 overflow-auto px-4 py-5">
          <section className="rounded-3xl border border-line bg-paper-2 p-5 text-center">
            <p className="text-xs font-semibold tracking-wide text-saffron">परिणाम</p>
            <h2 className="mt-1 font-display text-4xl text-ink">
              {result.percent}%
              <span className="ml-2 text-xl text-ink-soft">{result.marks} अंक</span>
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              {result.correct}/{result.total} सही · {result.attempted} प्रयास · +{result.xp} XP
            </p>
            <p className="mt-2 text-sm font-semibold">
              {result.percent >= 75
                ? "चयन-स्तर का पेपर। इसी लय में चलते रहो।"
                : result.percent >= 60
                  ? "अच्छा प्रयास। गलती कॉपी वाले सवाल कल फिर से हल करना।"
                  : "हल पढ़ो, फिर यही पेपर दोबारा दो।"}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-2xl bg-moss-soft p-3">
                <div className="font-display text-2xl text-moss">{result.correct}</div>
                सही
              </div>
              <div className="rounded-2xl bg-danger-soft p-3">
                <div className="font-display text-2xl text-danger">{result.attempted - result.correct}</div>
                गलत
              </div>
              <div className="rounded-2xl bg-saffron-soft p-3">
                <div className="font-display text-2xl text-saffron-deep">{result.total - result.attempted}</div>
                छूटे
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 min-h-11 rounded-full bg-ink px-5 text-sm font-bold text-paper-2"
            >
              डैशबोर्ड पर लौटें
            </button>
          </section>
          <h3 className="text-sm font-bold">उत्तर कुंजी</h3>
          <ol className="space-y-3">
            {session.questions.map((item, i) => {
              const picked = session.answers[i] ?? -1;
              const ok = picked === item.ans;
              return (
                <li
                  key={item.id + i}
                  className={
                    "rounded-2xl border p-4 text-sm " + (ok ? "border-moss bg-moss-soft" : "border-danger bg-danger-soft")
                  }
                >
                  <p className="font-semibold">
                    {i + 1}. {item.q}
                  </p>
                  <Figure question={item} />
                  <p className="mt-2">
                    आपका उत्तर: {picked === -1 ? "छोड़ा" : `(${OPT[picked]}) ${item.options[picked]}`}
                    {ok ? " · सही" : " · गलत"}
                  </p>
                  <p className="font-semibold text-moss">
                    सही: ({OPT[item.ans]}) {item.options[item.ans]}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-ink-soft">{item.exp}</p>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 overflow-auto px-3 py-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {session.questions.map((_, i) => {
              const answered = (session.answers[i] ?? -1) !== -1;
              const here = i === session.idx;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => jump(i)}
                  className={
                    "grid size-11 shrink-0 place-items-center rounded-full text-xs font-bold " +
                    (here
                      ? "bg-saffron text-paper-2"
                      : answered
                        ? "bg-moss text-paper-2"
                        : "border border-line bg-paper-2 text-ink-soft")
                  }
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          {slate && <Scratchpad />}
          <article className="rounded-3xl border border-line bg-paper-2 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-saffron-soft px-3 py-1 text-xs font-bold text-saffron-deep">{q.subject}</span>
              <span className="text-xs font-semibold text-ink-soft">
                प्रश्न {session.idx + 1} / {session.questions.length}
                {session.strict ? " · नो-हिंट" : " · तुरंत हल"}
              </span>
            </div>
            <h2 className="mt-3 whitespace-pre-line text-lg font-bold leading-snug">
              {session.idx + 1}. {q.q}
            </h2>
            <div className="mt-3">
              <Figure question={q} />
            </div>
            <div className={"mt-4 grid gap-2 " + (figureOptions ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
              {q.options.map((opt, i) => {
                const on = choice === i;
                return (
                  <button
                    key={opt + i}
                    type="button"
                    onClick={() => choose(i)}
                    className={
                      "flex min-h-11 items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm font-semibold " +
                      (on ? "border-saffron bg-saffron text-paper-2" : "border-line bg-paper hover:border-line-strong")
                    }
                  >
                    <span
                      className={
                        "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold " +
                        (on ? "bg-paper-2 text-saffron-deep" : "bg-paper-2 text-ink")
                      }
                    >
                      {OPT[i]}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {!session.strict && choice !== -1 && (
              <div className="mt-4 rounded-2xl bg-moss-soft p-3 text-sm">
                <p className="font-bold text-moss">
                  सही उत्तर: ({OPT[q.ans]}) {q.options[q.ans]}
                  {choice === q.ans ? " — आपका चयन सही है।" : " — इस बार चूक हुई।"}
                </p>
                <p className="mt-1 whitespace-pre-line text-ink">{q.exp}</p>
              </div>
            )}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={session.idx === 0}
                onClick={() => jump(session.idx - 1)}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-full bg-paper text-sm font-bold disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
                पिछला
              </button>
              {session.idx < session.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => jump(session.idx + 1)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-full bg-ink text-sm font-bold text-paper-2"
                >
                  अगला
                  <ChevronRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finish}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-full bg-moss text-sm font-bold text-paper-2"
                >
                  जमा करें
                </button>
              )}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
