import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, PlayCircle, Search } from "lucide-react";
import { useVijeta } from "@/components/vijeta/context";

const LESSONS = [
  { subject: "मानसिक योग्यता", title: "आकृति और पैटर्न", detail: "श्रृंखला, समानता और आकृति पहचान", query: "Navodaya class 6 mental ability figure series Hindi" },
  { subject: "मानसिक योग्यता", title: "संख्या एवं अक्षर श्रृंखला", detail: "नियम पहचानकर अगला पद निकालना", query: "Navodaya class 6 number letter series Hindi" },
  { subject: "मानसिक योग्यता", title: "दर्पण और जल प्रतिबिंब", detail: "प्रतिबिंब आधारित प्रश्न", query: "Navodaya class 6 mirror water image reasoning Hindi" },
  { subject: "गणित", title: "भिन्न और दशमलव", detail: "तुलना, जोड़, घटाव और उपयोग", query: "Class 6 fractions decimals Hindi Navodaya entrance" },
  { subject: "गणित", title: "लाभ-हानि और प्रतिशत", detail: "आधारभूत गणना और शब्द-प्रश्न", query: "Navodaya class 6 profit loss percentage Hindi" },
  { subject: "गणित", title: "समय, दूरी और मापन", detail: "इकाइयाँ और समय आधारित सवाल", query: "Navodaya class 6 time distance measurement Hindi" },
  { subject: "भाषा", title: "अपठित गद्यांश", detail: "गद्यांश पढ़कर सही उत्तर चुनना", query: "Navodaya class 6 language test comprehension Hindi" },
  { subject: "भाषा", title: "शब्दार्थ और वाक्य", detail: "शब्द ज्ञान, वाक्य और व्याकरण", query: "Class 6 Hindi grammar vocabulary practice Hindi" },
];
const FILTERS = ["सभी", "मानसिक योग्यता", "गणित", "भाषा"] as const;
const KEY = "navodaya-vijeta-video-done-v1";

export function VideosTab() {
  const { student } = useVijeta();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("सभी");
  const [search, setSearch] = useState("");
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(`${KEY}:${student}`) || "[]")); } catch { setDone([]); }
  }, [student]);
  const visible = useMemo(() => LESSONS.filter((l) => (filter === "सभी" || l.subject === filter) && `${l.title} ${l.subject} ${l.detail}`.toLowerCase().includes(search.toLowerCase())), [filter, search]);
  function toggle(title: string) {
    setDone((old) => {
      const next = old.includes(title) ? old.filter((x) => x !== title) : [...old, title];
      try { localStorage.setItem(`${KEY}:${student}`, JSON.stringify(next)); } catch { /* storage may be unavailable */ }
      return next;
    });
  }
  return <section className="space-y-4">
    <div className="rounded-3xl bg-ink p-5 text-paper-2">
      <p className="text-xs font-bold tracking-wide text-saffron-soft">वीडियो पाठशाला</p>
      <h1 className="mt-1 font-display text-2xl">देखो, समझो, फिर अभ्यास करो</h1>
      <p className="mt-2 text-sm text-paper-2/75">विषय चुनें। वीडियो YouTube पर खुलेगा; उपलब्धता और इंटरनेट कनेक्शन YouTube पर निर्भर हैं।</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-saffron" style={{ width: `${Math.round(done.length / LESSONS.length * 100)}%` }} /></div>
      <p className="mt-2 text-xs">{done.length}/{LESSONS.length} पाठ पूरे · {student}</p>
    </div>
    <label className="flex items-center gap-2 rounded-2xl border border-line bg-paper-2 px-3"><Search className="size-4 text-ink-soft"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="पाठ खोजें…" className="min-h-11 w-full bg-transparent text-sm outline-none" /></label>
    <div className="flex flex-wrap gap-2">{FILTERS.map((f) => <button key={f} type="button" onClick={() => setFilter(f)} className={`min-h-10 rounded-full px-4 text-xs font-bold ${filter === f ? "bg-ink text-paper-2" : "bg-paper-2 text-ink-soft"}`}>{f}</button>)}</div>
    <div className="grid gap-3 sm:grid-cols-2">{visible.map((lesson) => {
      const isDone = done.includes(lesson.title);
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.query)}`;
      return <article key={lesson.title} className="rounded-3xl border border-line bg-paper-2 p-4">
        <div className="flex items-start justify-between gap-2"><span className="rounded-full bg-saffron-soft px-3 py-1 text-[11px] font-bold text-saffron-deep">{lesson.subject}</span>{isDone && <CheckCircle2 className="size-5 text-emerald-600"/>}</div>
        <h2 className="mt-3 text-base font-bold">{lesson.title}</h2><p className="mt-1 text-sm text-ink-soft">{lesson.detail}</p>
        <div className="mt-4 flex gap-2"><a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ink px-3 text-sm font-bold text-paper-2"><PlayCircle className="size-4"/> वीडियो खोजें <ExternalLink className="size-3"/></a><button type="button" onClick={() => toggle(lesson.title)} className="min-h-11 rounded-full border border-line px-3 text-xs font-bold">{isDone ? "फिर से बाकी" : "पूरा हुआ"}</button></div>
      </article>;
    })}</div>
    {visible.length === 0 && <p className="rounded-2xl bg-paper-2 p-5 text-center text-sm text-ink-soft">इस खोज से कोई पाठ नहीं मिला।</p>}
  </section>;
}
