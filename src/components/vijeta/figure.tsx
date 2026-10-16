import { useMemo } from "react";
import { generateDynamicMatSvg } from "@/lib/mat-svg.js";
import type { Question } from "@/lib/exam-types";

export function Figure({ question }: { question: Question }) {
  const html = useMemo(() => {
    if (question.subject !== "मानसिक योग्यता" && !question.svgSpec) return "";
    const svg = generateDynamicMatSvg(question);
    return typeof svg === "string" && svg.includes("<svg") ? svg : "";
  }, [question]);

  if (!html) return null;
  return (
    <div className="figure-frame rounded-2xl border border-line bg-paper-2 p-3">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
