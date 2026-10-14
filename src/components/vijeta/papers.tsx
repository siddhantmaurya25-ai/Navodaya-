import { useState } from "react";
import { useVijeta } from "@/components/vijeta/context";
import { OPT } from "@/lib/exam-types";

const SPOTLIGHT = [
  { key: "pyq2023", kicker: "आधिकारिक", title: "2023 बोर्ड पेपर", detail: "80 प्रश्न · 100 अंक · NJ623 HIND" },
  { key: "pyq2017", kicker: "बोर्ड", title: "2017 विगत वर्ष", detail: "80 प्रश्न · 100 अंक" },
  { key: "arush30", kicker: "कठिन गणित", title: "60 सवालों की मैराथन", detail: "इबारती प्रश्न · 75 मिनट" },
  { key: "daily100", kicker: "आज", title: "100 सवालों की साधना", detail: "40 + 35 + 25 · 125 अंक" },
  { key: "topper120", kicker: "टॉपर", title: "120 सवालों का चैलेंज", detail: "150 अंक · 150 मिनट" },
  { key: "full80", kicker: "मॉक", title: "महा-मैराथन", detail: "40 + 20 + 20 · 100 अंक" },
];

const OMR_KEY = [1, 3, 0, 2, 1];

export function PapersTab() {
  const { bank, profile, student, openExam } = useVijeta();
  const sets = bank.papers.filter((p) => /^set\d+$/.test(p.key));

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-ink p-5 text-paper-2">
        <p className="text-xs font-semibold text-saffron-soft">नो-हिंट ओएमआर · 120 मिनट · 100 अंक</p>
        <h1 className="mt-1 font-display text-3xl">परीक्षा हॉल</h1>
        <p className="mt-2 max-w-2xl text-sm text-paper-2/80">
          हर मॉडल पेपर में 40 मानसिक, 20 गणित और 20 हिंदी के अलग सवाल हैं। रफ़ काम के लिए स्लेट अंदर खुलेगी। जमा करने से पहले हल नहीं दिखता।
        </p>
        <button
          type="button"
          onClick={() => openExam(null, "full80")}
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-saffron px-5 text-sm font-bold text-paper-2"
        >
          80 सवालों का मॉक शुरू करें
        </button>
        <p className="mt-3 text-xs text-paper-2/70">{profile.papersSolved.length}/36 पेपर हल · परीक्षार्थी {student}</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SPOTLIGHT.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => openExam(null, item.key)}
            className="rounded-3xl border border-line bg-paper-2 p-4 text-left"
          >
            <span className="text-xs font-bold text-saffron-deep">{item.kicker}</span>
            <h2 className="mt-1 text-base font-bold">{item.title}</h2>
            <p className="mt-1 text-xs text-ink-soft">{item.detail}</p>
            <span className="mt-3 inline-flex min-h-11 items-center text-sm font-bold">पेपर खोलें</span>
          </button>
        ))}
      </div>

      <section className="rounded-3xl border border-line bg-paper-2 p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl">सेट 1 से 30</h2>
            <p className="text-xs text-ink-soft">हर सेट 80 अनूठे प्रश्न, 100 अंक, 120 मिनट।</p>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {sets.map((paper, i) => {
            const done = profile.papersSolved.includes(paper.key);
            return (
              <div key={paper.key} className={"rounded-2xl border p-3 " + (done ? "border-moss bg-moss-soft" : "border-line bg-paper")}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold">सेट {i + 1}</h3>
                  <span className={"rounded-full px-2 py-0.5 text-[11px] font-bold " + (done ? "bg-moss text-paper-2" : "bg-paper-2 text-ink-soft")}>
                    {done ? "हल" : `${paper.count} प्र.`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">{paper.mins} मिनट</p>
                <button
                  type="button"
                  onClick={() => openExam(null, paper.key)}
                  className={"mt-2 min-h-11 w-full rounded-full text-xs font-bold text-paper-2 " + (done ? "bg-moss" : "bg-ink")}
                >
                  {done ? "फिर से हल करें" : "शुरू करें"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <AdmitCard name={student} />
    </div>
  );
}

function AdmitCard({ name }: { name: string }) {
  const [shade, setShade] = useState<number[]>([-1, -1, -1, -1, -1]);
  const [checked, setChecked] = useState(false);
  const roll = name === "आरुष" ? "NV-2026-01" : "NV-2026-02";

  return (
    <section className="overflow-hidden rounded-3xl border border-line-strong bg-paper-2">
      <div className="grid gap-0 md:grid-cols-[200px_1fr]">
        <div className="bg-saffron p-4 text-paper-2">
          <p className="text-xs font-semibold">प्रवेश-पत्र</p>
          <p className="mt-4 font-display text-5xl leading-none">{name.slice(0, 1)}</p>
          <p className="mt-3 text-lg font-bold">{name}</p>
          <p className="text-sm text-paper-2/80">{roll}</p>
        </div>
        <div className="p-4">
          <h2 className="font-display text-2xl">जवाहर नवोदय विद्यालय चयन परीक्षा</h2>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-ink-soft">कक्षा</dt>
              <dd className="font-bold">6</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">तिथि</dt>
              <dd className="font-bold">28 नवम्बर 2026</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">समय</dt>
              <dd className="font-bold">120 मिनट</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">अंक</dt>
              <dd className="font-bold">100</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm font-bold">ओएमआर शेडिंग अभ्यास</p>
          <p className="text-xs text-ink-soft">पाँच नमूना पंक्तियाँ भरें, फिर मिलान करें।</p>
          <div className="mt-2 space-y-2">
            {shade.map((picked, row) => (
              <div key={row} className="flex items-center gap-2">
                <span className="w-6 text-xs font-bold">{row + 1}</span>
                {OPT.map((letter, i) => {
                  const on = picked === i;
                  const reveal = checked && OMR_KEY[row] === i;
                  const wrong = checked && on && OMR_KEY[row] !== i;
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => {
                        setChecked(false);
                        setShade((prev) => prev.map((v, idx) => (idx === row ? i : v)));
                      }}
                      className={
                        "grid size-11 place-items-center rounded-full border text-xs font-bold " +
                        (wrong
                          ? "border-danger bg-danger text-paper-2"
                          : reveal
                            ? "border-moss bg-moss text-paper-2"
                            : on
                              ? "border-ink bg-ink text-paper-2"
                              : "border-line bg-paper")
                      }
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setChecked(true)}
            className="mt-3 min-h-11 rounded-full bg-ink px-4 text-sm font-bold text-paper-2"
          >
            शेडिंग मिलाएँ
          </button>
        </div>
      </div>
    </section>
  );
}
