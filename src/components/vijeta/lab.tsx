import { useMemo, useState } from "react";

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a)) || 1;
  let y = Math.abs(Math.trunc(b)) || 1;
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block text-xs font-semibold text-ink-soft">
      {label}
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 min-h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm font-bold text-ink"
      />
    </label>
  );
}

export function LabTab() {
  const [a, setA] = useState(24);
  const [b, setB] = useState(36);
  const [len, setLen] = useState(20);
  const [wid, setWid] = useState(15);
  const [path, setPath] = useState(2);
  const [hour, setHour] = useState(4);
  const [minute, setMinute] = useState(20);
  const [rows, setRows] = useState(5);

  const hcf = gcd(a, b);
  const lcm = Math.round((Math.abs(a || 1) * Math.abs(b || 1)) / hcf);
  const area = len * wid;
  const peri = 2 * (len + wid);
  const diag = Math.sqrt(len * len + wid * wid);
  const outer = 2 * path * (len + wid + 2 * path);
  const angleRaw = Math.abs(30 * (hour % 12) - 5.5 * minute);
  const angle = angleRaw > 180 ? 360 - angleRaw : angleRaw;
  const mirrorH = (11 - (hour % 12)) || 12;
  const mirrorM = (60 - minute) % 60;
  const triangles = (rows * (rows + 1)) / 2;

  const clock = useMemo(() => {
    const h = ((hour % 12) + minute / 60) * 30;
    const m = minute * 6;
    return { h, m };
  }, [hour, minute]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl">गणित लैब</h1>
        <p className="text-sm text-ink-soft">संख्या बदलो, सूत्र खुद जाँच लेता है। रफ़ काम परीक्षा की स्लेट पर होगा।</p>
      </header>
      <div className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-3xl border border-line bg-paper-2 p-4">
          <h2 className="text-base font-bold">ल.स. और म.स.</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Field label="पहली संख्या" value={a} onChange={setA} />
            <Field label="दूसरी संख्या" value={b} onChange={setB} />
          </div>
          <dl className="mt-3 space-y-1 rounded-2xl bg-saffron-soft p-3 text-sm">
            <div className="flex justify-between">
              <dt>म.स.</dt>
              <dd className="font-bold">{hcf}</dd>
            </div>
            <div className="flex justify-between">
              <dt>ल.स.</dt>
              <dd className="font-bold">{lcm}</dd>
            </div>
            <div className="text-xs text-ink-soft">जाँच: {a} × {b} = {a * b} और ल.स. × म.स. = {lcm * hcf}</div>
          </dl>
        </article>

        <article className="rounded-3xl border border-line bg-paper-2 p-4">
          <h2 className="text-base font-bold">आयत और रास्ता</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Field label="लंबाई" value={len} onChange={setLen} />
            <Field label="चौड़ाई" value={wid} onChange={setWid} />
            <Field label="रास्ते की चौड़ाई" value={path} onChange={setPath} />
          </div>
          <dl className="mt-3 space-y-1 rounded-2xl bg-paper p-3 text-sm">
            <div className="flex justify-between"><dt>क्षेत्रफल</dt><dd className="font-bold">{area}</dd></div>
            <div className="flex justify-between"><dt>परिमाप</dt><dd className="font-bold">{peri}</dd></div>
            <div className="flex justify-between"><dt>विकर्ण</dt><dd className="font-bold">{diag.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt>बाहर का रास्ता</dt><dd className="font-bold">{outer}</dd></div>
          </dl>
        </article>

        <article className="rounded-3xl border border-line bg-paper-2 p-4">
          <h2 className="text-base font-bold">घड़ी का कोण</h2>
          <div className="mt-3 grid grid-cols-[1fr_1fr_auto] items-end gap-3">
            <Field label="घंटा" value={hour} onChange={setHour} />
            <Field label="मिनट" value={minute} onChange={setMinute} />
            <ClockFace hour={clock.h} minute={clock.m} />
          </div>
          <p className="mt-3 text-sm">
            कोण <b>{angle.toFixed(1)}°</b> · दर्पण समय{" "}
            <b>
              {mirrorH}:{String(mirrorM).padStart(2, "0")}
            </b>
          </p>
          <p className="text-xs text-ink-soft">सूत्र: |30H − 5.5M|, 180 से बड़ा हो तो 360 में से घटाओ।</p>
        </article>

        <article className="rounded-3xl border border-line bg-paper-2 p-4">
          <h2 className="text-base font-bold">त्रिभुजों की गिनती</h2>
          <Field label="आधार पर छोटी पंक्तियाँ" value={rows} onChange={setRows} />
          <p className="mt-3 font-display text-3xl">{triangles}</p>
          <p className="text-sm text-ink-soft">n(n+1)/2 — एक पंक्ति में n छोटे त्रिभुज हों तो कुल इतने बनते हैं।</p>
          <TriangleStack n={Math.max(1, Math.min(8, Math.trunc(rows) || 1))} />
        </article>
      </div>
    </div>
  );
}

function ClockFace({ hour, minute }: { hour: number; minute: number }) {
  const hx = 36 + Math.sin((hour * Math.PI) / 180) * 16;
  const hy = 36 - Math.cos((hour * Math.PI) / 180) * 16;
  const mx = 36 + Math.sin((minute * Math.PI) / 180) * 24;
  const my = 36 - Math.cos((minute * Math.PI) / 180) * 24;
  return (
    <svg viewBox="0 0 72 72" className="size-16" aria-hidden>
      <circle cx="36" cy="36" r="32" fill="var(--color-paper-2)" stroke="var(--color-ink)" strokeWidth="2" />
      <line x1="36" y1="36" x2={hx} y2={hy} stroke="var(--color-saffron)" strokeWidth="3" strokeLinecap="round" />
      <line x1="36" y1="36" x2={mx} y2={my} stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="36" cy="36" r="2.5" fill="var(--color-ink)" />
    </svg>
  );
}

function TriangleStack({ n }: { n: number }) {
  const w = 220;
  const h = 28 + n * 18;
  const rows = [];
  for (let r = 0; r < n; r++) {
    const count = r + 1;
    const y = 16 + r * 18;
    const rowW = count * 22;
    const x0 = (w - rowW) / 2;
    for (let c = 0; c < count; c++) {
      const x = x0 + c * 22;
      rows.push(`${x},${y + 16} ${x + 10},${y} ${x + 20},${y + 16}`);
    }
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full" aria-hidden>
      {rows.map((points) => (
        <polygon key={points} points={points} fill="var(--color-saffron-soft)" stroke="var(--color-ink)" strokeWidth="1.2" />
      ))}
    </svg>
  );
}
