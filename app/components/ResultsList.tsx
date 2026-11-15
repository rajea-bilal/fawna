"use client";

import { useEffect, useRef, useState } from "react";
import type { ExplanationCard } from "@/lib/ai/explanationSchema";
import { readExplainStream } from "@/lib/ai/readExplainStream";
import type { MarkedQuestion } from "@/lib/ai/worksheetSchema";
import type { WorksheetSummary } from "@/lib/ai/summariseResult";
import type { SkillGap } from "@/lib/ai/groupSkillGaps";
import BuildingBricks from "./BuildingBricks";
import { BrickStuds, brickButton } from "./brickButton";

// Results page design: issue #18. A magazine-style opener (big score, a ruled
// list of skills) above a row of cards the child works through one step at a time.

type Result = MarkedQuestion["result"];
type ExplainedCardData = Extract<ExplanationCard, { status: "explained" }>;
type FailedCardData = Extract<ExplanationCard, { status: "failed" }>;

const RESULT_LABELS: Record<Result, string> = {
  correct: "Correct",
  incorrect: "Mistake",
  blank: "Left blank",
  unreadable: "Couldn’t read",
};

// Small stroke icons. Each mark pairs with a word, so colour is never the only signal.
const ICON_PATHS = {
  check: "M4 10.5l4 4 8-9",
  cross: "M5 5l10 10M15 5L5 15",
  dash: "M5 10h10",
  question: "M7.6 7.6a2.4 2.4 0 1 1 3.4 2.2c-.6.3-1 .8-1 1.5v.5M10 14.6v.1",
  arrow: "M3.5 10h13M11 4.5l5.5 5.5-5.5 5.5",
  chevron: "M5.5 8l4.5 4.5L14.5 8",
} as const;

function Icon({ name, className = "" }: { name: keyof typeof ICON_PATHS; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={`size-[1em] shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={name === "chevron" ? 1.8 : 2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

const MARKS: Record<Result, { icon: keyof typeof ICON_PATHS; tone: string }> = {
  correct: { icon: "check", tone: "text-olive" },
  incorrect: { icon: "cross", tone: "text-clay" },
  blank: { icon: "dash", tone: "text-dusk" },
  unreadable: { icon: "question", tone: "text-dusk" },
};

function Mark({ result, className = "" }: { result: Result; className?: string }) {
  const { icon, tone } = MARKS[result];
  return <Icon name={icon} className={`${tone} ${className}`} />;
}

const label = "text-xs font-semibold tracking-[0.13em] text-dusk uppercase";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-charcoal";
const softButton = `inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-honey/16 px-[18px] text-[15px] font-semibold text-charcoal transition-[background-color,scale] duration-150 ease-snappy hover:bg-honey/26 active:scale-[0.97] ${focusRing}`;
const quietButton = `inline-flex min-h-11 cursor-pointer items-center px-2.5 text-[15px] font-semibold text-dusk underline decoration-charcoal/25 underline-offset-4 hover:text-charcoal ${focusRing}`;

// The top of the page: score, counts and the skills to practise (issue #18).
// Unreadable questions are left out of the score: Fawna couldn't check them.
function Summary({
  summary,
  doneKeys,
  showCards,
  canExplain,
  onOpenCard,
}: {
  summary: WorksheetSummary;
  doneKeys: string[];
  showCards: boolean;
  canExplain: boolean;
  onOpenCard: (key: string) => void;
}) {
  const checked = summary.questions.length - summary.unreadable;
  const counts = [
    { result: "incorrect" as const, value: summary.incorrect, text: "Mistakes" },
    { result: "blank" as const, value: summary.blank, text: "Left blank" },
    { result: "unreadable" as const, value: summary.unreadable, text: "Couldn’t read" },
  ].filter((count) => count.result !== "unreadable" || count.value > 0);

  return (
    <section
      aria-labelledby="summary-heading"
      className="grid gap-10 border-b border-charcoal/16 pb-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-end md:gap-x-16"
    >
      <div>
        <h2 id="summary-heading" className={label}>
          {summary.questions.length} questions marked
        </h2>
        <p className="sr-only">{summary.message}</p>

        <div className="mt-5 flex items-end gap-6">
          {checked > 0 ? (
            <p
              aria-hidden
              className="flex items-end text-[clamp(112px,19vw,200px)] leading-[0.74] font-medium tracking-[-0.055em] tabular-nums"
            >
              <span>{summary.correct}</span>
              <span className="ml-[0.06em] text-[0.4em] leading-[0.9] tracking-[-0.02em] text-dusk">
                /{checked}
              </span>
            </p>
          ) : (
            <p className="text-2xl leading-snug font-semibold">Fawna couldn’t read this sheet.</p>
          )}
          <dl className="grid min-w-0 flex-1">
            {counts.map((count) => (
              <div
                key={count.result}
                className="flex items-baseline gap-2.5 border-t border-charcoal/16 py-[7px] last:border-b"
              >
                <dt className={`order-2 flex items-center gap-1.5 ${label}`}>
                  <Mark result={count.result} className="text-[15px]" />
                  {count.text}
                </dt>
                <dd
                  className={`min-w-[0.7em] text-[34px] leading-none font-semibold tracking-[-0.03em] tabular-nums ${count.result === "incorrect" && count.value > 0 ? "text-clay" : ""}`}
                >
                  {count.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        {summary.unreadable > 0 && checked > 0 && (
          <p className="mt-5 max-w-[40ch] text-sm leading-relaxed text-dusk">
            Fawna couldn’t read {summary.unreadable === 1 ? "one answer" : `${summary.unreadable} answers`}, so{" "}
            {summary.unreadable === 1 ? "it isn’t" : "they aren’t"} in the score.
          </p>
        )}
      </div>

      <div>
        <h3 className={`${label} mb-2`}>Skills to practise</h3>
        {summary.skillGaps.length === 0 ? (
          <p className="border-y border-charcoal/16 py-4 leading-relaxed">
            Nothing to practise. Every answer Fawna checked was right.
          </p>
        ) : (
          <ul>
            {summary.skillGaps.map((gap) => (
              <SkillRow
                key={gap.key}
                gap={gap}
                done={doneKeys.includes(gap.key)}
                showCards={showCards}
                canExplain={canExplain}
                onOpenCard={onOpenCard}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// One skill gap. Fact skills get no card (ADR-015, ADR-021), so they say "learn by heart".
function SkillRow({
  gap,
  done,
  showCards,
  canExplain,
  onOpenCard,
}: {
  gap: SkillGap;
  done: boolean;
  showCards: boolean;
  canExplain: boolean;
  onOpenCard: (key: string) => void;
}) {
  const isFact = gap.kind === "fact";
  const numbers = gap.questions.map((question) => `Q${question.number}`).join(", ");
  return (
    <li className="grid min-h-[52px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-t border-charcoal/16 py-2 last:border-b">
      <div className="min-w-0">
        <p className="text-base leading-snug font-semibold md:text-lg">{gap.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-dusk">
          <Mark result={gap.exampleQuestion.result} />
          <span className="tabular-nums">{numbers}</span>
          {isFact && <span>· Learn by heart</span>}
        </p>
      </div>
      {!isFact && canExplain && (
        <button
          type="button"
          onClick={() => onOpenCard(gap.key)}
          aria-label={`${done ? "Worked through. " : ""}${showCards ? "Open card" : "Show card"}: ${gap.name}`}
          className={`group inline-flex min-h-11 cursor-pointer items-center gap-1.5 px-1 text-sm font-semibold hover:underline hover:underline-offset-4 ${focusRing}`}
        >
          {done ? (
            <>
              <Icon name="check" className="text-olive" />
              Done
            </>
          ) : (
            <>
              Card
              <Icon
                name="arrow"
                className="transition-transform duration-200 ease-snappy group-hover:translate-x-[3px]"
              />
            </>
          )}
        </button>
      )}
    </li>
  );
}

// One stud per step along the card's top edge. Finished steps fill peach, the
// current one honey; when the card is worked through they turn olive and pop in turn.
function StepStuds({ total, step, done }: { total: number; step: number; done: boolean }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -top-[10px] right-[22px] left-[22px] flex gap-[9px]"
    >
      {Array.from({ length: total }, (_, i) => {
        const filled = done || i <= step;
        const current = !done && i === step;
        return (
          <span
            key={i}
            style={done ? { animationDelay: `${i * 70}ms` } : undefined}
            className={`block h-[10px] max-w-8 flex-1 origin-bottom overflow-hidden rounded-t-[4px] border border-b-0 border-charcoal bg-canvas ${done ? "motion-safe:animate-stud-pop" : ""}`}
          >
            <span
              className={`block h-full origin-bottom transition-[scale,background-color] duration-[220ms] ease-snappy ${filled ? "scale-y-100" : "scale-y-0"} ${done ? "bg-olive" : current ? "bg-honey" : "bg-peach"}`}
            />
          </span>
        );
      })}
    </span>
  );
}

// What the child wrote next to the right answer.
// A blank shows "Left blank", never "you wrote…" (user story 20).
function AnswerPair({ card, result }: { card: ExplanationCard; result: Result }) {
  const isBlank = card.childAnswer.trim() === "";
  return (
    <dl className="mt-3.5 grid grid-cols-2 border-t border-charcoal/16">
      <div className="min-w-0 pt-2.5">
        <dt className={`flex items-center gap-1.5 ${label}`}>
          <Mark result={result} className="text-sm" />
          You wrote
        </dt>
        <dd className="flex min-h-11 items-center">
          {isBlank ? (
            <span className="text-[15px] font-semibold text-dusk">Left blank</span>
          ) : (
            <span className="font-hand text-[34px] leading-none break-all">{card.childAnswer}</span>
          )}
        </dd>
      </div>
      <div className="min-w-0 border-l border-charcoal/16 pt-2.5 pl-4">
        <dt className={`flex items-center gap-1.5 ${label}`}>
          <Icon name="check" className="text-sm text-olive" />
          Should be
        </dt>
        <dd className="flex min-h-11 items-center text-[26px] leading-none font-semibold tracking-[-0.02em] break-all text-olive tabular-nums">
          {card.correctAnswer}
        </dd>
      </div>
    </dl>
  );
}

// One explanation card, built like a brick (issue #18): a fine outline, a solid
// peach shade, and one stud per step on top. Closed: the mistake. Open: what went
// wrong, then the steps one at a time, laid like a brick wall. Worked through: the
// studs turn olive and the card presses into its shade, like the brick button.
function ExplainedCard({
  card,
  gap,
  open,
  done,
  hasNextCard,
  onToggle,
  onDone,
  onNextCard,
}: {
  card: ExplainedCardData;
  gap?: SkillGap;
  open: boolean;
  done: boolean;
  hasNextCard: boolean;
  onToggle: () => void;
  onDone: (done: boolean) => void;
  onNextCard: () => void;
}) {
  const [step, setStep] = useState(0);
  const [tipOpen, setTipOpen] = useState(false);
  const doneRef = useRef<HTMLButtonElement>(null);
  const total = card.steps.length;
  const result = gap?.exampleQuestion.result ?? "incorrect";
  const questionNumber = gap?.exampleQuestion.number;
  const bodyId = `card-body-${card.key}`;
  const tipId = `card-tip-${card.key}`;

  // The Next button disappears when the card is done, so move focus to the done buttons.
  const finish = () => {
    onDone(true);
    requestAnimationFrame(() => doneRef.current?.focus({ preventScroll: true }));
  };
  const again = () => {
    setStep(0);
    onDone(false);
  };

  const visibleSteps = done ? total : step + 1;

  return (
    <article
      className={`relative mt-[10px] mr-[7px] rounded-[3px] border border-charcoal bg-white p-6 transition-[translate,box-shadow] duration-[260ms] ease-snappy sm:p-7 ${done ? "shadow-[3px_3px_0_var(--color-olive-soft)] motion-safe:translate-x-1 motion-safe:translate-y-1" : "shadow-[7px_7px_0_var(--color-peach)]"}`}
    >
      <StepStuds total={total} step={step} done={done} />
      <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${label}`}>
        <Mark result={result} className="text-sm" />
        <span>
          {questionNumber ? `Q${questionNumber} · ` : ""}
          {RESULT_LABELS[result]}
        </span>
        {done && (
          <span className="inline-flex items-center gap-1 text-olive">
            <Icon name="check" className="text-sm" />
            Worked through
          </span>
        )}
      </p>

      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className={`mt-1 flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-md text-left ${focusRing}`}
        >
          <span className={`leading-tight font-semibold tracking-[-0.01em] text-balance ${open ? "text-2xl lg:text-[28px]" : "text-[22px]"}`}>
            {card.title}
          </span>
          <Icon
            name="chevron"
            className={`text-base text-dusk transition-transform duration-200 ease-snappy ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>

      {/* On wide screens closed cards fold to their title, so the open one has room. */}
      <div
        className={`mt-2.5 ${open ? "lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end lg:gap-x-9" : "lg:hidden"}`}
      >
        <p className="text-lg leading-snug font-semibold tabular-nums">{card.question}</p>
        <AnswerPair card={card} result={result} />
      </div>

      {open && (
        <div
          id={bodyId}
          className="mt-5 border-t border-dashed border-charcoal/16 pt-4 motion-safe:animate-rise motion-reduce:animate-fade lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:content-start lg:gap-x-9"
        >
          <div className="lg:col-start-1">
            <p className={label}>What went wrong</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-dusk">{card.whatWentWrong}</p>
          </div>

          <div className="mt-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
            <p className={`${label} tabular-nums`}>
              {done ? `All ${total} steps` : `Step ${step + 1} of ${total}`}
            </p>
            {/* Steps stack like a brick wall: every other course is offset. */}
            <ol aria-live="polite" className="mt-2 grid gap-1.5">
              {card.steps.slice(0, visibleSteps).map((text, index) => {
                const current = index === step && !done;
                return (
                  <li
                    key={index}
                    aria-current={current ? "step" : undefined}
                    className={`flex items-start gap-3 rounded-[5px] border py-3 pr-3 pl-2.5 transition-colors duration-200 motion-safe:animate-rise motion-reduce:animate-fade ${index % 2 === 0 ? "mr-3.5" : "ml-3.5"} ${current ? "border-honey bg-honey-soft text-charcoal" : done ? "border-charcoal/16 text-charcoal" : "border-charcoal/16 text-dusk"}`}
                  >
                    <span
                      aria-hidden
                      className={`mt-px grid size-6 shrink-0 place-items-center rounded-[4px] border text-[13px] font-semibold text-charcoal tabular-nums ${current ? "border-honey bg-honey" : done ? "border-olive-soft bg-olive-pale" : "border-peach bg-peach-soft"}`}
                    >
                      {index + 1}
                    </span>
                    <p className={`min-w-0 leading-snug ${current ? "text-[17px] font-medium" : "text-[15px]"}`}>
                      {text}
                    </p>
                  </li>
                );
              })}
            </ol>

            {done ? (
              <div className="mt-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-t border-charcoal/16 pt-4 motion-safe:animate-rise motion-reduce:animate-fade">
                <div>
                  <p className="flex items-center gap-2 text-lg leading-tight font-semibold text-olive">
                    <Icon name="check" />
                    Worked through
                  </p>
                  <p className="mt-1 text-[15px] text-dusk">The answer is {card.correctAnswer}.</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  <button
                    ref={hasNextCard ? undefined : doneRef}
                    type="button"
                    onClick={again}
                    className={quietButton}
                  >
                    Go again
                  </button>
                  {hasNextCard && (
                    <button
                      ref={doneRef}
                      type="button"
                      onClick={onNextCard}
                      className={`mt-1.5 mb-1 min-h-11 px-5 text-[15px] ${brickButton}`}
                    >
                      <BrickStuds small />
                      Next card
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-end justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className={`${quietButton} ${step === 0 ? "invisible" : ""}`}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => (step < total - 1 ? setStep((s) => s + 1) : finish())}
                  className={`mt-1.5 mb-1 min-h-11 px-5 text-[15px] ${brickButton}`}
                >
                  <BrickStuds small />
                  {step < total - 1 ? "Next step" : "We’ve got it"}
                </button>
              </div>
            )}
          </div>

          {/* For the grown-up, not the child: tucked away until asked for. */}
          <div className="mt-6 border-t border-charcoal/16 lg:col-start-1">
            <button
              type="button"
              onClick={() => setTipOpen((o) => !o)}
              aria-expanded={tipOpen}
              aria-controls={tipId}
              className={`flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 text-left ${focusRing}`}
            >
              <span className={label}>Tip for the grown-up</span>
              <Icon
                name="chevron"
                className={`text-sm text-dusk transition-transform duration-200 ease-snappy ${tipOpen ? "rotate-180" : ""}`}
              />
            </button>
            {tipOpen && (
              <p
                id={tipId}
                className="pb-1 text-[15px] leading-relaxed text-dusk motion-safe:animate-rise motion-reduce:animate-fade"
              >
                {card.parentTip}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

// The AI skipped this skill gap, or its explanation failed the check.
function FailedCard({ card, gap }: { card: FailedCardData; gap?: SkillGap }) {
  return (
    // Same brick shape, unbuilt: a dashed outline with no shade or studs.
    <article className="mt-[10px] mr-[7px] rounded-[3px] border border-dashed border-charcoal/35 bg-white p-6 sm:p-7">
      <p className={label}>{gap?.exampleQuestion.number ? `Q${gap.exampleQuestion.number}` : "Card"}</p>
      <h3 className="mt-1.5 text-[22px] leading-tight font-semibold">Couldn’t explain this one</h3>
      {gap && <p className="mt-1 text-[15px] text-dusk">{gap.name}</p>}
      <p className="mt-4 text-lg leading-snug font-semibold tabular-nums">{card.question}</p>
      <AnswerPair card={card} result={gap?.exampleQuestion.result ?? "incorrect"} />
    </article>
  );
}

// Shown in the row while the AI writes more cards.
function WritingCard({ cardNumber, total, skillName }: { cardNumber: number; total: number; skillName?: string }) {
  return (
    <div className="grid min-h-[236px] place-content-center justify-items-center gap-3.5 rounded-xl border-[1.5px] border-dashed border-charcoal/16 p-6 text-center">
      <BuildingBricks className="w-[150px]" />
      <p role="status">
        <span className="shimmer-text inline-block text-[15px] font-semibold tabular-nums">
          Writing card {cardNumber} of {total}
        </span>
        {skillName && <span className="mt-0.5 block text-sm text-dusk">{skillName}</span>}
      </p>
    </div>
  );
}

// Every question on the sheet, hidden until asked for.
function QuestionList({ questions }: { questions: MarkedQuestion[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section aria-labelledby="questions-heading" className="mt-12 border-t border-charcoal/16">
      <h2 id="questions-heading">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="question-list"
          className={`flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 text-left text-2xl font-semibold tracking-[-0.01em] ${focusRing}`}
        >
          All {questions.length} questions
          <Icon
            name="chevron"
            className={`text-base text-dusk transition-transform duration-200 ease-snappy ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h2>
      {open && (
        <ol
          id="question-list"
          className="grid gap-x-8 pb-2 motion-safe:animate-rise motion-reduce:animate-fade md:grid-cols-2"
        >
          {questions.map((question, index) => {
            const isCorrect = question.result === "correct";
            return (
              <li
                key={`${question.number}-${index}`}
                className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-2 border-t border-charcoal/9 py-3"
              >
                <span className="pt-0.5 font-semibold text-dusk tabular-nums">Q{question.number}</span>
                <div className="min-w-0">
                  <p className="text-[15px] leading-snug">{question.question}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-dusk">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Mark result={question.result} />
                      {RESULT_LABELS[question.result]}
                    </span>
                    {question.childAnswer && (
                      <span>
                        <span className="sr-only">Child’s answer: </span>
                        <span className="font-hand text-xl leading-none text-charcoal">
                          {question.childAnswer}
                        </span>
                      </span>
                    )}
                    {!isCorrect && question.result !== "unreadable" && (
                      <span>
                        Should be{" "}
                        <span className="font-semibold text-olive tabular-nums">{question.correctAnswer}</span>
                      </span>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

// Live explaining: nothing asked yet, writing, finished, or failed.
type ExplainStatus = "idle" | "loading" | "done" | "error";

export default function ResultsList({
  summary,
  explanations,
  demoCode,
}: {
  summary: WorksheetSummary;
  // Saved cards for the sample (ADR-024). The button shows these, with no AI call.
  explanations?: ExplanationCard[];
  // Live results only: the demo code, so the button can ask the explain endpoint.
  demoCode?: string;
}) {
  const isSample = explanations !== undefined;
  // Fact gaps get no card (ADR-021), so with only facts there's nothing to explain.
  const canExplain = summary.skillGaps.some((gap) => gap.kind !== "fact");
  const [showCards, setShowCards] = useState(false);
  // Live cards, added one by one as they arrive. The sample uses its saved cards.
  const [liveCards, setLiveCards] = useState<ExplanationCard[]>([]);
  const [status, setStatus] = useState<ExplainStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  // Which card is open. undefined = the first card; null = all closed.
  const [openKey, setOpenKey] = useState<string | null | undefined>(undefined);
  // Cards the child has worked through. Browser only, nothing is saved.
  const [doneKeys, setDoneKeys] = useState<string[]>([]);
  const cardsRef = useRef<HTMLElement>(null);
  // Lets us stop a running request, e.g. when the parent marks a new sheet.
  const requestRef = useRef<AbortController | null>(null);

  // Leaving this result stops the AI call, so we don't pay for cards no one sees.
  useEffect(() => () => requestRef.current?.abort(), []);

  const cards = isSample ? explanations : liveCards;
  // The server drops fact gaps (ADR-026), so this is how many cards to expect.
  const explainable = summary.skillGaps.filter((gap) => gap.kind !== "fact");
  const activeKey = openKey === undefined ? (cards[0]?.key ?? null) : openKey;
  const explainedCards = cards.filter((card) => card.status === "explained");
  const doneCount = explainedCards.filter((card) => doneKeys.includes(card.key)).length;

  // The cards land below the marks, so bring them into view once they exist.
  // Reduced motion: jump, no glide.
  const scrollToCards = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cardsRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  useEffect(() => {
    if (showCards) scrollToCards();
  }, [showCards]);

  // Live only: ask the explain endpoint and show each card as it arrives.
  // Try again runs this again and starts from no cards.
  const explain = async () => {
    requestRef.current?.abort();
    const request = new AbortController();
    requestRef.current = request;
    setLiveCards([]);
    setError(null);
    setStatus("loading");

    let gotReply = false;
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-demo-code": demoCode ?? "" },
        // The server removes fact gaps itself (ADR-026), so send them all.
        body: JSON.stringify({ skillGaps: summary.skillGaps }),
        signal: request.signal,
      });
      gotReply = true;

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "Fawna couldn't write the explanations. Please try again.");
        setStatus("error");
        return;
      }

      await readExplainStream(response.body, (card) =>
        setLiveCards((previous) => [...previous, card]),
      );
      setStatus("done");
    } catch {
      // We stopped it on purpose (new sheet, or try again). Nothing to show.
      if (request.signal.aborted) return;
      setError(
        gotReply
          ? "Fawna stopped before it finished. Please try again."
          : "We couldn't reach Fawna. Check your connection and try again.",
      );
      setStatus("error");
    }
  };

  // First click shows the cards. Later clicks just scroll back to them.
  const handleHelp = () => {
    if (showCards) {
      scrollToCards();
      return;
    }
    setShowCards(true);
    if (!isSample) explain();
  };

  // From the skills list: show the cards if needed, then open this one.
  const openCard = (key: string) => {
    setOpenKey(key);
    if (!showCards) {
      handleHelp();
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() =>
      document
        .getElementById(`card-${key}`)
        ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center", inline: "start" }),
    );
  };

  const setDone = (key: string, done: boolean) =>
    setDoneKeys((previous) =>
      done ? [...previous.filter((k) => k !== key), key] : previous.filter((k) => k !== key),
    );

  // The next explained card the child hasn't finished, going round from this one.
  const nextUndone = (key: string) => {
    const index = explainedCards.findIndex((card) => card.key === key);
    for (let step = 1; step < explainedCards.length; step++) {
      const next = explainedCards[(index + step) % explainedCards.length];
      if (!doneKeys.includes(next.key)) return next;
    }
    return undefined;
  };

  return (
    <div className="font-ui text-charcoal">
      <Summary
        summary={summary}
        doneKeys={doneKeys}
        showCards={showCards}
        canExplain={canExplain}
        onOpenCard={openCard}
      />

      {canExplain && !showCards && (
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={handleHelp}
            aria-controls="explanations"
            aria-expanded={false}
            className={softButton}
          >
            How Fawna can help
            <Icon name="arrow" className="rotate-90 text-honey-deep" />
          </button>
          <p className="text-[15px] text-dusk">One card for each skill, to work through together.</p>
        </div>
      )}

      {showCards && (
        <section
          ref={cardsRef}
          id="explanations"
          aria-labelledby="explanations-heading"
          aria-busy={status === "loading"}
          className="mt-10 scroll-mt-6 motion-safe:animate-fade"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
            <h2
              id="explanations-heading"
              className="text-[clamp(24px,3vw,32px)] leading-tight font-semibold tracking-[-0.01em]"
            >
              Work through them together
            </h2>
            {explainedCards.length > 0 && (
              <p className={label} aria-live="polite">
                <b className="font-bold text-charcoal tabular-nums">{doneCount}</b> of{" "}
                {explainedCards.length} worked through
              </p>
            )}
          </div>
          {summary.skillGaps.some((gap) => gap.kind === "fact") && (
            <p className="mt-1.5 max-w-[56ch] text-[15px] text-dusk">
              Learn-by-heart skills need practice, not explaining, so they don’t get a card.
            </p>
          )}

          <ol className="-mx-5 flex snap-x snap-mandatory scroll-px-5 items-start gap-4 overflow-x-auto overscroll-x-contain px-5 pt-3.5 pb-6 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:snap-none lg:gap-6 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
            {cards.map((card, index) => {
              const gap = summary.skillGaps.find((g) => g.key === card.key);
              const open = activeKey === card.key;
              return (
                <li
                  key={card.key}
                  id={`card-${card.key}`}
                  // Saved cards all arrive at once, so stagger them. Live cards already arrive one by one.
                  style={isSample ? { animationDelay: `${Math.min(index, 10) * 120}ms` } : undefined}
                  className={`w-[min(86%,360px)] shrink-0 snap-start motion-safe:animate-rise motion-reduce:animate-fade lg:w-auto lg:min-w-0 lg:shrink lg:basis-0 ${open ? "lg:grow-[2.5]" : "lg:grow"}`}
                >
                  <div
                    className={`transition-[translate,rotate] duration-200 ease-snappy ${open ? "" : "motion-safe:hover:-translate-y-1 motion-safe:hover:-rotate-[0.4deg]"}`}
                  >
                    {card.status === "explained" ? (
                      <ExplainedCard
                        card={card}
                        gap={gap}
                        open={open}
                        done={doneKeys.includes(card.key)}
                        hasNextCard={nextUndone(card.key) !== undefined}
                        onToggle={() => setOpenKey(open ? null : card.key)}
                        onDone={(done) => setDone(card.key, done)}
                        onNextCard={() => {
                          const next = nextUndone(card.key);
                          if (next) openCard(next.key);
                        }}
                      />
                    ) : (
                      <FailedCard card={card} gap={gap} />
                    )}
                  </div>
                </li>
              );
            })}
            {status === "loading" && (
              <li className="w-[min(86%,360px)] shrink-0 snap-start lg:w-auto lg:min-w-0 lg:shrink lg:grow lg:basis-0">
                <WritingCard
                  cardNumber={Math.min(cards.length + 1, Math.max(explainable.length, 1))}
                  total={Math.max(explainable.length, 1)}
                  skillName={explainable[cards.length]?.name}
                />
              </li>
            )}
          </ol>

          {status === "error" && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-clay/10 p-6"
            >
              <p className="text-charcoal">{error}</p>
              <button type="button" onClick={explain} className={softButton}>
                Try again
              </button>
            </div>
          )}

          {explainedCards.length > 0 && doneCount === explainedCards.length && status !== "loading" && (
            <p className="flex items-center gap-2.5 text-[22px] leading-snug font-semibold text-balance motion-safe:animate-rise motion-reduce:animate-fade">
              <Icon name="check" className="text-olive" />
              All worked through. Nice work, both of you.
            </p>
          )}
        </section>
      )}

      <QuestionList questions={summary.questions} />
    </div>
  );
}
