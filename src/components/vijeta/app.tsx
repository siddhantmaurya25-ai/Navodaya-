import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Calculator,
  Cloud,
  Flame,
  Home,
  Languages,
  Layers,
  RotateCcw,
  ScrollText,
  Swords,
  UserRound,
  X,
} from "lucide-react";
import { useBank, questionsForPaper, shuffle } from "@/lib/bank";
import { useProgress } from "@/lib/progress";
import { SupabaseAuthProvider } from "@/lib/supabase/auth";
import { useSupabaseAuth } from "@/lib/supabase/use-auth";
import { supabaseConfigured } from "@/lib/supabase/client";
import { synchronizeProgress } from "@/lib/supabase/progress-sync";
import { OPT, type Chapter, type ExamSession, type Question, type Student } from "@/lib/exam-types";
import { AccountModal, type CloudSyncStatus } from "@/components/vijeta/account-modal";
import { VijetaContext, type TabId, type VijetaContextValue } from "@/components/vijeta/context";
import { HomeTab } from "@/components/vijeta/home";
import { ChapterReader, StudyTab } from "@/components/vijeta/study";
import { LabTab } from "@/components/vijeta/lab";
import { HindiTab } from "@/components/vijeta/hindi";
import { PracticeTab } from "@/components/vijeta/practice";
import { PapersTab } from "@/components/vijeta/papers";
import { ExamPlayer } from "@/components/vijeta/exam";
import { scoreExam } from "@/lib/exam-scoring";

const NAV: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "होम", label: "होम", icon: Home },
  { id: "पढ़ाई", label: "अध्याय", icon: BookOpen },
  { id: "ग्रंथालय", label: "लैब", icon: Calculator },
  { id: "शब्दसागर", label: "हिंदी", icon: Languages },
  { id: "अभ्यास", label: "सवाल", icon: Layers },
  { id: "टेस्ट", label: "पेपर", icon: ScrollText },
];

type Battle = {
  questions: Question[];
  turn: number;
  scores: Record<Student, number>;
  done: boolean;
};

export function VijetaApp() {
  return (
    <SupabaseAuthProvider>
      <VijetaAppContent />
    </SupabaseAuthProvider>
  );
}

function VijetaAppContent() {
  const auth = useSupabaseAuth();
  const { bank, error } = useBank();
  const progress = useProgress(auth.user?.id ?? null, auth.ready);
  const [tab, setTab] = useState<TabId>("होम");
  const [exam, setExam] = useState<ExamSession | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [battleOpen, setBattleOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [syncInput, setSyncInput] = useState("");
  const [syncMsg, setSyncMsg] = useState("");
  const [notice, setNotice] = useState("");
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(supabaseConfigured ? "guest" : "not-configured");
  const [cloudReadyUser, setCloudReadyUser] = useState<string | null>(null);
  const [syncAttempt, setSyncAttempt] = useState(0);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const authRef = useRef(auth);
  authRef.current = auth;
  const lastSyncedSignature = useRef("");

  useEffect(() => {
    if (!auth.ready) return;
    const userId = auth.user?.id ?? null;
    if (!userId) {
      setCloudReadyUser(null);
      lastSyncedSignature.current = "";
      setSyncStatus(supabaseConfigured ? "guest" : "not-configured");
      return;
    }
    if (!progress.ready) return;
    let active = true;
    setCloudReadyUser(null);
    setSyncStatus("loading");
    void synchronizeProgress(userId, progressRef.current.snapshot)
      .then((snapshot) => {
        if (!active) return;
        lastSyncedSignature.current = `${userId}:${snapshot.updatedAt}:${JSON.stringify(snapshot.save)}`;
        progressRef.current.replaceSnapshot(snapshot);
        setCloudReadyUser(userId);
        setSyncStatus("synced");
      })
      .catch(() => {
        if (active) setSyncStatus("offline");
      });
    return () => {
      active = false;
    };
  }, [auth.ready, auth.user?.id, progress.ready, syncAttempt]);

  useEffect(() => {
    const userId = auth.user?.id;
    if (!auth.ready || !userId || !progress.ready || cloudReadyUser !== userId) return;
    const snapshot = progress.snapshot;
    const signature = `${userId}:${snapshot.updatedAt}:${JSON.stringify(snapshot.save)}`;
    if (lastSyncedSignature.current === signature) return;
    let active = true;
    const timer = window.setTimeout(() => {
      setSyncStatus("saving");
      void synchronizeProgress(userId, snapshot)
        .then((synced) => {
          if (!active || authRef.current.user?.id !== userId) return;
          lastSyncedSignature.current = `${userId}:${synced.updatedAt}:${JSON.stringify(synced.save)}`;
          progressRef.current.replaceSnapshot(synced);
          setSyncStatus("synced");
        })
        .catch(() => {
          if (active) setSyncStatus("offline");
        });
    }, 650);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [auth.ready, auth.user?.id, cloudReadyUser, progress.ready, progress.snapshot]);

  useEffect(() => {
    const retry = () => setSyncAttempt((current) => current + 1);
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, []);

  const value = useMemo<VijetaContextValue | null>(() => {
    if (!bank) return null;
    const openFromList = (
      questions: Question[],
      title: string,
      seconds: number,
      paperKey: string | null,
      strict: boolean,
    ) => {
      if (!bank.questionsReady) {
        setNotice("सवाल अभी आ रहे हैं। एक क्षण रुकें।");
        return;
      }
      setNotice("");
      if (!questions.length) return;
      setExam({
        title,
        paperKey,
        strict,
        questions,
        idx: 0,
        answers: Array(questions.length).fill(-1),
        timeLeft: seconds,
        submitted: false,
        started: Date.now(),
      });
    };
    return {
      bank,
      tab,
      setTab,
      student: progress.student,
      setStudent: progress.setStudent,
      profile: progress.profile,
      profiles: progress.profiles,
      solvedSet: progress.solvedSet,
      openExam: (_questions, paperKey) => {
        const found = questionsForPaper(bank, paperKey);
        if (!found) return;
        openFromList(found.questions, found.paper.title, (found.paper.mins || 120) * 60, paperKey, true);
      },
      openCustomExam: openFromList,
      openChapter: setChapter,
      completeChapter: progress.completeChapter,
      clearMistakes: progress.clearMistakes,
      setTasks: progress.setTasks,
      addXp: progress.addXp,
      setBattleOpen: (open) => {
        if (!open) {
          setBattleOpen(false);
          return;
        }
        if (!bank.questionsReady) {
          setNotice("सवाल अभी आ रहे हैं। एक क्षण रुकें।");
          return;
        }
        setNotice("");
        const pool = shuffle(bank.questions.filter((q) => q.subject !== "मानसिक योग्यता")).slice(0, 6);
        setBattle({ questions: pool, turn: 0, scores: { आरुष: 0, आयुष: 0 }, done: false });
        setBattleOpen(true);
      },
    };
  }, [bank, progress, tab]);

  if (!auth.ready || !progress.ready || !value) {
    return (
      <main className="grid min-h-dvh place-items-center bg-paper p-6">
        <p className="font-display text-3xl text-ink">नवोदय विजेता</p>
      </main>
    );
  }

  function finish(session: ExamSession) {
    const result = scoreExam(session);
    progress.recordAttempt(session.paperKey, result.correctIds, result.wrongIds, result.xp, result.percent >= 60);
  }

  const level = Math.floor(progress.profile.xp / 1000) + 1;
  const syncStatusText =
    syncStatus === "loading"
      ? "क्लाउड प्रगति खुल रही है…"
      : syncStatus === "saving"
        ? "क्लाउड में सेव हो रहा है…"
        : syncStatus === "synced"
          ? "क्लाउड सेव अपडेट है"
          : syncStatus === "offline"
            ? "क्लाउड उपलब्ध नहीं — लोकल सेव सुरक्षित है"
            : syncStatus === "not-configured"
              ? "ऑनलाइन सेवा सेट नहीं है"
              : "मेहमान मोड — इस फ़ोन पर सेव";

  return (
    <VijetaContext.Provider value={value}>
      <div className="min-h-dvh bg-paper text-ink md:grid md:grid-cols-[220px_1fr]">
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-paper-2 p-4 md:flex">
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-2xl bg-ink font-display text-lg text-saffron-soft">न</span>
            <div>
              <div className="font-display text-lg leading-none">विजेता</div>
              <div className="text-[11px] text-ink-soft">कक्षा 6 · नवोदय</div>
            </div>
          </div>
          <nav className="mt-6 flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const on = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={
                    "flex min-h-11 items-center gap-2 rounded-2xl px-3 text-sm font-semibold " +
                    (on ? "bg-ink text-paper-2" : "text-ink hover:bg-paper")
                  }
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <p className="text-xs text-ink-soft">परीक्षा 28 नवम्बर 2026</p>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 md:px-5">
              <div className="md:hidden">
                <div className="font-display text-lg leading-none">नवोदय विजेता</div>
                <div className="text-[11px] text-ink-soft">लेवल {level} · {progress.profile.xp} XP</div>
              </div>
              <div className="hidden text-sm text-ink-soft md:block">
                लेवल {level} · {progress.profile.completed.length}/40 अध्याय ·{" "}
                {bank.questionsReady ? `${progress.solvedSet.size}/4062 सवाल` : "सवाल खुल रहे हैं"}
                {notice ? ` · ${notice}` : ""}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-full bg-paper-2 p-1">
                  {(["आरुष", "आयुष"] as const).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => progress.setStudent(name)}
                      className={
                        "min-h-11 rounded-full px-3 text-xs font-bold " +
                        (progress.student === name ? "bg-ink text-saffron-soft" : "text-ink-soft")
                      }
                    >
                      {name}
                      <span className="ml-1 opacity-70">{progress.profiles[name].xp}</span>
                    </button>
                  ))}
                </div>
                <span className="inline-flex min-h-11 items-center gap-1 rounded-full bg-saffron-soft px-3 text-xs font-bold text-saffron-deep">
                  <Flame className="size-3.5" />
                  {progress.profile.streak} दिन
                </span>
                <button
                  type="button"
                  onClick={() => setAccountOpen(true)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-paper-2 px-3 text-xs font-semibold"
                  aria-label={auth.user ? "ऑनलाइन खाता" : "लॉगिन या खाता बनाएँ"}
                  title={auth.user?.email ?? "ईमेल से लॉगिन"}
                >
                  <UserRound className="size-4" />
                  <span className="hidden sm:inline">{auth.user ? "खाता" : "लॉगिन"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSyncOpen(true);
                    setSyncMsg("");
                  }}
                  className="grid size-11 place-items-center rounded-full bg-paper-2"
                  aria-label="सिंक"
                >
                  <Cloud className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("आरुष और आयुष दोनों की प्रगति मिटाकर शून्य से शुरू करें?")) progress.resetAll();
                  }}
                  className="grid size-11 place-items-center rounded-full bg-paper-2"
                  aria-label="रीसेट"
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-3 pt-4 pb-28 md:px-5 md:pb-10">
            {error && (
              <p className="mb-3 rounded-2xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{error}</p>
            )}
            {tab === "होम" && <HomeTab />}
            {tab === "पढ़ाई" && <StudyTab />}
            {tab === "ग्रंथालय" && <LabTab />}
            {tab === "शब्दसागर" && <HindiTab />}
            {tab === "अभ्यास" && <PracticeTab />}
            {tab === "टेस्ट" && <PapersTab />}
          </main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper-2 md:hidden">
          <div className="grid grid-cols-6 gap-1 px-1 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
            {NAV.map((item) => {
              const Icon = item.icon;
              const on = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={"flex min-h-11 flex-col items-center justify-center rounded-2xl text-[10px] font-bold " + (on ? "bg-ink text-saffron-soft" : "text-ink-soft")}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {chapter && <ChapterReader chapter={chapter} onClose={() => setChapter(null)} />}
      {exam && (
        <ExamPlayer
          session={exam}
          setSession={setExam}
          student={progress.student}
          onClose={() => setExam(null)}
          onFinish={finish}
        />
      )}
      {battleOpen && battle && (
        <BattleModal
          battle={battle}
          setBattle={setBattle}
          onClose={() => setBattleOpen(false)}
          onAgain={() => {
            const pool = shuffle(bank.questions.filter((q) => q.subject !== "मानसिक योग्यता")).slice(0, 6);
            setBattle({ questions: pool, turn: 0, scores: { आरुष: 0, आयुष: 0 }, done: false });
          }}
        />
      )}
      {syncOpen && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/50 p-3" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-paper-2 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">प्रगति सिंक</h2>
              <button type="button" onClick={() => setSyncOpen(false)} className="grid size-11 place-items-center rounded-full bg-paper" aria-label="बंद करें">
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-ink-soft">लॉगिन से दोनों भाइयों की प्रगति ऑनलाइन सेव होती है। बिना लॉगिन पढ़ाई इस फ़ोन पर सेव रहती है; बैकअप कोड से दूसरे फ़ोन में ले जाएँ।</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-paper p-3" role="status" aria-live="polite">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{syncStatusText}</p>
                {auth.user && <p className="mt-0.5 break-all text-xs text-ink-soft">{auth.user.email}</p>}
              </div>
              {auth.user ? (
                <button type="button" onClick={() => setSyncAttempt((current) => current + 1)} className="min-h-11 rounded-full bg-ink px-3 text-xs font-bold text-paper-2">
                  अभी सिंक करें
                </button>
              ) : (
                <button type="button" onClick={() => { setSyncOpen(false); setAccountOpen(true); }} className="min-h-11 rounded-full bg-ink px-3 text-xs font-bold text-paper-2">
                  लॉगिन करें
                </button>
              )}
            </div>
            <p className="mt-3 max-h-24 overflow-auto rounded-2xl bg-paper p-3 font-mono text-[11px] break-all">
              {progress.exportCode()}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(progress.exportCode());
                    setSyncMsg("कोड कॉपी हो गया।");
                  } catch {
                    setSyncMsg("कॉपी नहीं हो सका — कोड चुनकर खुद कॉपी करें।");
                  }
                }}
                className="min-h-11 flex-1 rounded-full bg-ink text-sm font-bold text-paper-2"
              >
                कोड कॉपी करें
              </button>
            </div>
            <label className="mt-3 block text-xs font-semibold text-ink-soft">
              दूसरा कोड चिपकाएँ
              <textarea
                value={syncInput}
                onChange={(e) => setSyncInput(e.target.value)}
                className="mt-1 min-h-20 w-full rounded-2xl border border-line bg-paper p-3 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() => setSyncMsg(progress.importCode(syncInput) ? "प्रगति आ गई।" : "यह कोड सही नहीं है।")}
              className="mt-2 min-h-11 w-full rounded-full bg-saffron text-sm font-bold text-paper-2"
            >
              इम्पोर्ट
            </button>
            {syncMsg && <p className="mt-2 text-center text-sm font-semibold">{syncMsg}</p>}
          </div>
        </div>
      )}
      {accountOpen && (
        <AccountModal
          onClose={() => setAccountOpen(false)}
          syncStatus={syncStatus}
          onSyncNow={() => setSyncAttempt((current) => current + 1)}
        />
      )}
    </VijetaContext.Provider>
  );
}

function BattleModal({
  battle,
  setBattle,
  onClose,
  onAgain,
}: {
  battle: Battle;
  setBattle: (b: Battle) => void;
  onClose: () => void;
  onAgain: () => void;
}) {
  const q = battle.questions[battle.turn];
  const turnName: Student = battle.turn % 2 === 0 ? "आरुष" : "आयुष";
  const winner =
    battle.scores["आरुष"] === battle.scores["आयुष"]
      ? "बराबरी"
      : battle.scores["आरुष"] > battle.scores["आयुष"]
        ? "आरुष"
        : "आयुष";

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/50 p-3" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-3xl bg-paper-2 p-4">
        <div className="flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-base font-bold">
            <Swords className="size-4" />
            आरुष बनाम आयुष
          </h2>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full bg-paper" aria-label="बंद करें">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          {(["आरुष", "आयुष"] as const).map((name) => (
            <div
              key={name}
              className={
                "rounded-2xl border p-3 " +
                (!battle.done && turnName === name ? "border-saffron bg-saffron-soft" : "border-line bg-paper")
              }
            >
              <div className="text-sm font-bold">{name}</div>
              <div className="font-display text-2xl">{battle.scores[name]}</div>
            </div>
          ))}
        </div>
        {battle.done || !q ? (
          <div className="mt-4 text-center">
            <p className="font-display text-2xl">{winner === "बराबरी" ? "बराबरी का मुकाबला" : `विजेता: ${winner}`}</p>
            <button type="button" onClick={onAgain} className="mt-3 min-h-11 rounded-full bg-ink px-5 text-sm font-bold text-paper-2">
              नया दंगल
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-xs font-bold text-saffron-deep">
              बारी: {turnName} · सवाल {battle.turn + 1}/6
            </p>
            <p className="mt-2 text-sm font-semibold whitespace-pre-line">{q.q}</p>
            <div className="mt-3 grid gap-2">
              {q.options.map((opt, i) => (
                <button
                  key={opt + i}
                  type="button"
                  onClick={() => {
                    const correct = i === q.ans;
                    const scores = { ...battle.scores };
                    if (correct) scores[turnName] += 10;
                    const turn = battle.turn + 1;
                    setBattle({ ...battle, scores, turn, done: turn >= battle.questions.length });
                  }}
                  className="min-h-11 rounded-2xl border border-line bg-paper px-3 text-left text-sm font-semibold"
                >
                  ({OPT[i]}) {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
