import type { ExamSession } from "./exam-types";

export function scoreExam(session: ExamSession) {
  let correct = 0;
  let attempted = 0;
  const correctIds: string[] = [];
  const wrongIds: string[] = [];
  session.questions.forEach((question, index) => {
    const choice = session.answers[index] ?? -1;
    if (choice === -1) return;
    attempted += 1;
    if (choice === question.ans) {
      correct += 1;
      correctIds.push(question.id);
    } else {
      wrongIds.push(question.id);
    }
  });
  const percent = Math.round((correct / session.questions.length) * 100);
  const marks = Math.round(correct * 1.25 * 100) / 100;
  const xp = correct * 20 + (percent >= 60 ? 100 : 0);
  return { correct, attempted, percent, marks, xp, correctIds, wrongIds, total: session.questions.length };
}
