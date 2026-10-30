import { MATH_CATEGORIES } from "@/lib/ai/mathSkills";
import type { MarkedQuestion } from "@/lib/ai/worksheetSchema";
import type { WorksheetSummary } from "@/lib/ai/summariseResult";

// Skill id → readable name, built once from the fixed skill list.
const SKILL_NAMES = new Map(
  MATH_CATEGORIES.flatMap((category) =>
    category.skills.map((skill) => [skill.id, skill.name] as const),
  ),
);

const RESULT_LABELS: Record<MarkedQuestion["result"], string> = {
  correct: "Correct",
  incorrect: "To work on",
  blank: "Not answered",
  unreadable: "Couldn't read",
};

function skillName(question: MarkedQuestion): string | null {
  if (!("skill" in question)) return null;
  const { skill } = question;
  return skill.source === "list"
    ? (SKILL_NAMES.get(skill.skillId) ?? skill.skillId)
    : `${skill.name} (suggested)`;
}

export default function ResultsList({ summary }: { summary: WorksheetSummary }) {
  return (
    <div>
      <p className="font-display text-2xl font-medium">{summary.message}</p>

      <ol className="mt-5 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-paper">
        {summary.questions.map((question, index) => {
          const isCorrect = question.result === "correct";
          const skill = skillName(question);
          return (
            <li key={`${question.number}-${index}`} className="p-4 sm:p-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-semibold">
                  <span className="text-ink/60">Q{question.number}.</span>{" "}
                  {question.question}
                </p>
                <span
                  className={`shrink-0 text-sm font-semibold ${isCorrect ? "text-olive" : "text-terracotta"}`}
                >
                  {RESULT_LABELS[question.result]}
                </span>
              </div>
              <p className="mt-1 text-sm tabular-nums text-ink/80">
                Answer: {question.childAnswer || "—"}
                {!isCorrect && <> · Right answer: {question.correctAnswer}</>}
              </p>
              {skill && (
                <p className="mt-1 text-sm text-rust">Skill to practise: {skill}</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
