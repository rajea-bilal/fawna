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

// A teacher's mark in the margin: olive tick, terracotta cross, ink dash.
function Mark({ result }: { result: MarkedQuestion["result"] }) {
  const tone =
    result === "correct"
      ? "bg-olive text-linen"
      : result === "incorrect"
        ? "bg-terracotta text-linen"
        : "border-2 border-dashed border-ink/25 text-ink/50";
  const symbol = result === "correct" ? "✓" : result === "incorrect" ? "✗" : "–";
  return (
    <span
      aria-hidden
      className={`grid size-8 shrink-0 place-items-center rounded-full text-base font-bold ${tone}`}
    >
      {symbol}
    </span>
  );
}

const NEXT_STEPS = [
  {
    title: "Explain it.",
    text: "Your child’s answer next to the right one, step by step, with a picture when it helps.",
  },
  { title: "Check it.", text: "One quick question, to make sure it clicked." },
  { title: "Practise it.", text: "Questions on this skill, then mixed with others." },
];

// The plan after marking (ADR-015), shown on the parent's own result.
// Dashed and button-free so it can't be mistaken for part of the marks.
function NextSteps({ skill }: { skill: string }) {
  return (
    <aside id="next-steps" className="mt-6 scroll-mt-6 rounded-2xl border-2 border-dashed border-ink/15 p-7 motion-safe:animate-rise motion-reduce:animate-fade sm:p-10">
      <p className="text-sm font-semibold tracking-wide text-rust uppercase">Coming soon</p>
      <h3 className="mt-2 font-display text-2xl font-medium">From mistake to practice</h3>
      <p className="mt-3 text-ink/80">
        For <span className="font-semibold text-ink">{skill}</span>, Fawna will:
      </p>
      <ol className="mt-4 space-y-3">
        {NEXT_STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span
              aria-hidden
              className="grid size-7 shrink-0 place-items-center rounded-full bg-peach/50 text-sm font-bold text-rust tabular-nums"
            >
              {index + 1}
            </span>
            <p className="text-ink/80">
              <span className="font-semibold text-ink">{step.title}</span> {step.text}
            </p>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export default function ResultsList({ summary }: { summary: WorksheetSummary }) {
  // First skill to work on, if any. Only one is named to keep the card short.
  const firstSkill = summary.questions.map(skillName).find((name) => name !== null);

  // Only the counts that happened, so "0 couldn't read" doesn't add noise.
  const counts = [
    { label: "correct", value: summary.correct, tone: "bg-olive/12 text-olive" },
    { label: "to work on", value: summary.incorrect, tone: "bg-terracotta/12 text-terracotta" },
    { label: "not answered", value: summary.blank, tone: "bg-ink/8 text-ink/70" },
    { label: "couldn't read", value: summary.unreadable, tone: "bg-ink/8 text-ink/70" },
  ].filter((count, index) => index < 2 || count.value > 0);

  return (
    <>
      <div className="paper-shadow">
        <div className="stamp-edge bg-paper p-7 sm:p-10">
          <h2 className="font-display text-3xl font-medium">Marked</h2>
          {/* The full sentence for screen readers; the chips below show the same counts. */}
          <p className="sr-only">{summary.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ul aria-hidden className="contents">
              {counts.map((count) => (
                <li
                  key={count.label}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold tabular-nums ${count.tone}`}
                >
                  {count.value} {count.label}
                </li>
              ))}
            </ul>
            {/* Outside the aria-hidden list, so screen readers can reach the link. */}
            {firstSkill && (
              <a
                href="#next-steps"
                className="rounded-full border-2 border-rust/30 px-3.5 py-1 text-sm font-semibold text-rust transition-colors hover:border-rust hover:bg-peach/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-espresso"
              >
                How Fawna can help <span aria-hidden>↓</span>
              </a>
            )}
          </div>

          <ol className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
            {summary.questions.map((question, index) => {
              const isCorrect = question.result === "correct";
              const skill = skillName(question);
              return (
                <li
                  key={`${question.number}-${index}`}
                  // Short stagger (40ms) so the sheet reads top to bottom. Capped so long sheets don't wait.
                  style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
                  className="flex gap-4 py-5 motion-safe:animate-rise motion-reduce:animate-fade"
                >
                  <Mark result={question.result} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <p className="font-semibold">
                        <span className="text-ink/50 tabular-nums">Q{question.number}</span>{" "}
                        {question.question}
                      </p>
                      <span
                        className={`text-sm font-semibold ${isCorrect ? "text-olive" : question.result === "incorrect" ? "text-terracotta" : "text-ink/60"}`}
                      >
                        {RESULT_LABELS[question.result]}
                      </span>
                    </div>

                    <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="sr-only">Child’s answer:</span>
                      {/* The child's own answer, in handwriting. Crossed through when wrong. */}
                      <span
                        className={`font-hand text-xl tabular-nums ${isCorrect ? "text-ink" : "text-terracotta line-through decoration-2"}`}
                      >
                        {question.childAnswer || "blank"}
                      </span>
                      {!isCorrect && (
                        <span className="text-sm text-ink/70">
                          Right answer:{" "}
                          <span className="font-semibold text-ink tabular-nums">
                            {question.correctAnswer}
                          </span>
                        </span>
                      )}
                    </p>

                    {skill && (
                      <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-peach/50 px-3 py-1.5 text-sm text-rust">
                        <span className="font-semibold">Practise:</span> {skill}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      {firstSkill && <NextSteps skill={firstSkill} />}
    </>
  );
}
