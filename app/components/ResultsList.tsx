"use client";

import { useEffect, useRef, useState } from "react";
import { MATH_CATEGORIES } from "@/lib/ai/mathSkills";
import type { ExplanationCard } from "@/lib/ai/explanationSchema";
import type { MarkedQuestion } from "@/lib/ai/worksheetSchema";
import type { WorksheetSummary } from "@/lib/ai/summariseResult";
import type { SkillGap } from "@/lib/ai/groupSkillGaps";

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
    : skill.name;
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

// What the child needs help with, one row per skill gap, in sheet order (ADR-021).
// Fact skills get no explanation (ADR-015), so they're marked "learn by heart" instead.
function SkillGapList({ skillGaps }: { skillGaps: SkillGap[] }) {
  return (
    <section aria-labelledby="skill-gaps-heading" className="mt-6">
      <h3 id="skill-gaps-heading" className="text-sm font-semibold tracking-wide text-rust uppercase">
        Skill gaps
      </h3>
      <ul className="mt-3 space-y-2">
        {skillGaps.map((gap) => (
          <li
            key={gap.key}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg bg-peach/30 px-4 py-2.5"
          >
            <span className="font-semibold">{gap.name}</span>
            <span className="flex items-baseline gap-3 text-sm text-ink/70">
              {gap.kind === "fact" && (
                <span className="rounded-full bg-ink/8 px-2.5 py-0.5 font-semibold text-ink/70">
                  learn by heart
                </span>
              )}
              <span className="tabular-nums">
                {gap.questions.length} {gap.questions.length === 1 ? "question" : "questions"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}


// One card per explained skill gap, for the child to read with the parent (issue #4).
// Cards are matched to skill gaps by key, never by title.
function ExplanationCards({
  cards,
  skillGaps,
}: {
  cards: ExplanationCard[];
  skillGaps: SkillGap[];
}) {
  return (
    <ul className="grid gap-6">
      {cards.map((card, index) => {
        const gap = skillGaps.find((g) => g.key === card.key);
        return (
          <li
            key={card.key}
            // Same short stagger as the question rows, so cards arrive one by one.
            style={{ animationDelay: `${Math.min(index, 10) * 120}ms` }}
            className="motion-safe:animate-rise motion-reduce:animate-fade"
          >
            {card.status === "explained" ? (
              <ExplainedCard card={card} questionNumber={gap?.exampleQuestion.number} />
            ) : (
              <FailedCard
                card={card}
                skillName={gap?.name}
                questionNumber={gap?.exampleQuestion.number}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

type ExplainedCardData = Extract<ExplanationCard, { status: "explained" }>;
type FailedCardData = Extract<ExplanationCard, { status: "failed" }>;

// The child's question, their answer next to the right one.
// A blank shows "Left blank", never "you wrote…" (user story 20).
function ExampleQuestion({
  card,
  questionNumber,
}: {
  card: ExplanationCard;
  questionNumber?: string;
}) {
  const isBlank = card.childAnswer.trim() === "";
  return (
    <div className="mt-4 rounded-lg bg-linen/70 px-4 py-3">
      <p className="font-semibold">
        {questionNumber && (
          <span className="text-ink/50 tabular-nums">Q{questionNumber} </span>
        )}
        {card.question}
      </p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        {isBlank ? (
          <span className="text-sm text-ink/70">Left blank</span>
        ) : (
          <span className="text-sm text-ink/70">
            You wrote{" "}
            <span className="font-hand text-xl text-terracotta tabular-nums line-through decoration-2">
              {card.childAnswer}
            </span>
          </span>
        )}
        <span className="text-sm text-ink/70">
          Right answer{" "}
          <span className="font-hand text-xl text-olive tabular-nums">{card.correctAnswer}</span>
        </span>
      </p>
    </div>
  );
}

function ExplainedCard({
  card,
  questionNumber,
}: {
  card: ExplainedCardData;
  questionNumber?: string;
}) {
  return (
    <article className="paper-shadow">
      <div className="stamp-edge bg-paper p-6 sm:p-9">
        <h4 className="font-display text-2xl leading-tight font-medium text-balance">
          {card.title}
        </h4>
        <ExampleQuestion card={card} questionNumber={questionNumber} />

        <ol className="mt-5 space-y-3">
          {card.steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span
                aria-hidden
                className="grid size-7 shrink-0 place-items-center rounded-full bg-peach/50 text-sm font-bold text-rust tabular-nums"
              >
                {index + 1}
              </span>
              <p className="pt-0.5 text-lg leading-snug">{step}</p>
            </li>
          ))}
        </ol>

        <p className="mt-5 rounded-lg bg-terracotta/10 px-4 py-3 leading-snug">
          <span className="font-semibold text-terracotta">What went wrong: </span>
          {card.whatWentWrong}
        </p>

        {/* For the parent, not the child: set apart and smaller. */}
        <aside className="mt-6 border-t-2 border-dashed border-ink/15 pt-4 text-sm leading-relaxed text-ink/75">
          <p className="text-xs font-semibold tracking-wide text-rust uppercase">Tip for you</p>
          <p className="mt-1">{card.parentTip}</p>
        </aside>
      </div>
    </article>
  );
}

// The AI skipped this skill gap, or its explanation failed the check.
function FailedCard({
  card,
  skillName,
  questionNumber,
}: {
  card: FailedCardData;
  skillName?: string;
  questionNumber?: string;
}) {
  return (
    <article className="rounded-2xl border-2 border-dashed border-ink/20 p-6 sm:p-9">
      <h4 className="font-display text-xl font-medium">Couldn’t explain this one</h4>
      {skillName && <p className="mt-1 text-sm text-ink/70">{skillName}</p>}
      <ExampleQuestion card={card} questionNumber={questionNumber} />
    </article>
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

export default function ResultsList({
  summary,
  explanations,
}: {
  summary: WorksheetSummary;
  // Saved cards for the sample (ADR-024). Live results don't pass any yet,
  // so they keep the "coming soon" card until the explain step is connected.
  explanations?: ExplanationCard[];
}) {
  // First skill to work on, if any. Only one is named to keep the card short.
  const firstSkill = summary.questions.map(skillName).find((name) => name !== null);
  const [showCards, setShowCards] = useState(false);
  const cardsRef = useRef<HTMLElement>(null);

  // The cards land below the marks, so bring them into view once they exist.
  // Reduced motion: jump, no glide.
  const scrollToCards = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cardsRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  useEffect(() => {
    if (showCards) scrollToCards();
  }, [showCards]);

  // Sample only: show the saved cards. No request is sent.
  const handleHelp = () => {
    if (showCards) scrollToCards();
    else setShowCards(true);
  };

  const helpStyle =
    "rounded-full border-2 border-rust/30 px-3.5 py-1 text-sm font-semibold text-rust transition-colors hover:border-rust hover:bg-peach/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-espresso";

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
            {explanations ? (
              explanations.length > 0 && (
                <button
                  type="button"
                  onClick={handleHelp}
                  aria-expanded={showCards}
                  aria-controls="explanations"
                  className={`${helpStyle} cursor-pointer`}
                >
                  How Fawna can help <span aria-hidden>↓</span>
                </button>
              )
            ) : (
              firstSkill && (
                <a href="#next-steps" className={helpStyle}>
                  How Fawna can help <span aria-hidden>↓</span>
                </a>
              )
            )}
          </div>

          {summary.skillGaps.length > 0 && <SkillGapList skillGaps={summary.skillGaps} />}

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
      {explanations ? (
        showCards && (
          <section
            ref={cardsRef}
            id="explanations"
            aria-labelledby="explanations-heading"
            className="mt-10 scroll-mt-6 motion-safe:animate-fade"
          >
            <p className="text-sm font-semibold tracking-wide text-rust uppercase">
              Read these together
            </p>
            <h3 id="explanations-heading" className="mt-2 font-display text-3xl font-medium">
              How Fawna can help
            </h3>
            <p className="mt-2 max-w-[52ch] text-ink/80">
              One card for each skill gap. Learn-by-heart skills need practice, not explaining, so
              they don’t get a card.
            </p>
            <div className="mt-6">
              <ExplanationCards cards={explanations} skillGaps={summary.skillGaps} />
            </div>
          </section>
        )
      ) : (
        firstSkill && <NextSteps skill={firstSkill} />
      )}
    </>
  );
}
