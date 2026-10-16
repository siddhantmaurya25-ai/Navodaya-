import { useState } from "react";
import { BookOpenCheck, Calculator, Languages } from "lucide-react";
import { HindiTab } from "@/components/vijeta/hindi";
import { LabTab } from "@/components/vijeta/lab";
import { PracticeTab } from "@/components/vijeta/practice";

const TOOLS = [
  { id: "questions", label: "सवाल", icon: BookOpenCheck },
  { id: "math", label: "गणित लैब", icon: Calculator },
  { id: "hindi", label: "हिंदी कोष", icon: Languages },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export function PracticeHub() {
  const [active, setActive] = useState<ToolId>("questions");

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-line bg-paper-2 p-4 md:p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-saffron-deep">अभ्यास स्टूडियो</p>
        <h1 className="mt-1 font-display text-2xl md:text-3xl">सीखें · लगाएँ · जाँचें</h1>
        <p className="mt-1 text-sm text-ink-soft">सवालों की कार्ड-पुस्तक, काम करने वाली गणित लैब और हिंदी शब्द-अभ्यास — सब एक जगह।</p>
      </section>
      <div className="grid grid-cols-3 gap-2 rounded-3xl border border-line bg-paper-2 p-2" role="tablist" aria-label="अभ्यास का तरीका">
        {TOOLS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`practice-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={active === id}
            aria-controls="practice-panel"
            onClick={() => setActive(id)}
            className={
              "flex min-h-12 items-center justify-center gap-1.5 rounded-2xl px-2 text-xs font-bold sm:text-sm " +
              (active === id ? "bg-ink text-paper-2" : "text-ink-soft hover:bg-paper")
            }
          >
            <Icon className="size-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div id="practice-panel" role="tabpanel" aria-labelledby={`practice-tab-${active}`}>
        {active === "questions" ? <PracticeTab /> : active === "math" ? <LabTab /> : <HindiTab />}
      </div>
    </div>
  );
}
