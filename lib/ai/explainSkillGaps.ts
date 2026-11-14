import { buildExplanationSchema, type StreamMessage } from "./explanationSchema";
import type { SkillGap } from "./groupSkillGaps";
import type { MarkedQuestion } from "./worksheetSchema";

export interface ExplainRequest {
  instructions: string;
  input: string;
  schema: ReturnType<typeof buildExplanationSchema>;
}

// The AI call, passed in so tests can fake it. It streams the reply text, bit by bit.
export type ExplainAi = (request: ExplainRequest) => AsyncIterable<string>;

const EXPLAIN_INSTRUCTIONS = `
You help a UK primary school child understand a maths mistake from their worksheet.
The child reads it with a parent beside them.

Write one explanation for each skill gap you are given. Use its key exactly.
Build each explanation around the example question.

Rules:
- Write for a child in the school year you are told. Use short sentences and simple words.
- steps: 3 to 5 short steps that get from the question to the right answer.
- whatWentWrong: one line on what went wrong, so the child knows what to watch out for.
- If the example question was left blank, there is no answer to talk about.
  Show how to start the question instead. Never say "you wrote".
- If other questions in the skill gap show the same mistake, say so in whatWentWrong.
- A "suggested" skill is not on our list. Explain it like a method (steps to follow)
  or an idea (why it works), whichever fits it best.
- parentTip: one short, practical thing the parent can do to help.
`.trim();

// The skill gaps as plain text for the AI
function buildInput(skillGaps: SkillGap[], schoolYear: number) {
  const answer = (q: MarkedQuestion) =>
    q.result === "blank" ? "(left blank)" : q.childAnswer;
  const line = (q: MarkedQuestion) =>
    `${q.question} | child's answer: ${answer(q)} | right answer: ${q.correctAnswer}`;

  const gaps = skillGaps.map((gap) => {
    // By number, not by object: after JSON the example is a copy, not the same object
    const others = gap.questions.filter((q) => q.number !== gap.exampleQuestion.number);
    return [
      `key: ${gap.key}`,
      `skill: ${gap.name}`,
      `kind: ${gap.kind ?? "suggested"}`,
      `example question: ${line(gap.exampleQuestion)}`,
      `other questions in this skill gap: ${others.length === 0 ? "none" : ""}`,
      ...others.map((q) => `- ${line(q)}`),
    ].join("\n");
  });

  return [`The child is in Year ${schoolYear}.`, ...gaps].join("\n\n");
}

// Skill gaps in, one card per skill gap out, then "done" (stream rules: docs/how-fawna-works.md)
export async function* explainSkillGaps(
  skillGaps: SkillGap[],
  ai: ExplainAi,
  schoolYear = 5, // fixed for now, until a child's year is known
): AsyncGenerator<StreamMessage> {
  // Fact gaps need practice, not explaining (ADR-021). Removed once, here, so the
  // schema and the prompt get the same list and can't disagree (ADR-026).
  const toExplain = skillGaps.filter((gap) => gap.kind !== "fact");
  if (toExplain.length === 0) {
    yield { type: "done" };
    return;
  }

  const schema = buildExplanationSchema(toExplain);
  const itemSchema = schema.shape.explanations.element;

  const reply = ai({
    instructions: EXPLAIN_INSTRUCTIONS,
    input: buildInput(toExplain, schoolYear),
    schema,
  });

  const sentKeys = new Set<string>();

  try {
    for await (const itemText of completeExplanations(reply)) {
      const explanation = itemSchema.safeParse(parseJson(itemText));
      if (!explanation.success) {
        // Skip just this one. Its skill gap gets a failed card below, the rest still show.
        // Only the paths are logged: the values could hold a child's answers.
        const paths = explanation.error.issues.map((issue) => issue.path.join("."));
        console.error(`[explain] skipped an explanation that failed the check at: ${paths.join(", ")}`);
        continue;
      }
      const { data } = explanation;
      if (sentKeys.has(data.key)) continue; // one card per skill gap, keep the first

      // The schema only allows this sheet's keys, so the gap is always found
      const gap = toExplain.find((g) => g.key === data.key)!;
      sentKeys.add(gap.key);
      yield {
        type: "card",
        card: { status: "explained", ...questionParts(gap), ...data },
      };
    }
  } catch (error) {
    // Nothing sent yet: let the endpoint answer with a 5xx (ADR-014)
    if (sentKeys.size === 0) throw error;
    // Cards already went out, so the status is sent. Fail the rest instead (stream rules).
    console.error("[explain] AI fault halfway through:", error);
  }

  // Every skill gap gets exactly one card. Nothing disappears silently.
  for (const gap of toExplain) {
    if (!sentKeys.has(gap.key)) {
      yield { type: "card", card: { status: "failed", ...questionParts(gap) } };
    }
  }

  yield { type: "done" };
}

// The AI's reply was broken or the wrong shape. Its message never holds the reply itself.
export class ExplainAiFault extends Error {
  name = "ExplainAiFault";
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // JSON.parse's own message can quote the text, so it's replaced
    throw new ExplainAiFault("An explanation was not valid JSON");
  }
}

// The parts code fills in from the skill gap, never the AI
function questionParts(gap: SkillGap) {
  return {
    key: gap.key,
    question: gap.exampleQuestion.question,
    childAnswer: gap.exampleQuestion.childAnswer,
    correctAnswer: gap.exampleQuestion.correctAnswer,
  };
}

// The reply looks like {"explanations":[{...},{...}]}.
// Half an object can't be checked, so this hands out each explanation's text
// only once its closing } arrives.
async function* completeExplanations(chunks: AsyncIterable<string>) {
  let depth = 0; // how many { or [ we are inside
  let inString = false;
  let escaped = false;
  let current = ""; // text of the explanation being read
  let finished = false; // the top-level } has arrived

  for await (const chunk of chunks) {
    for (const char of chunk) {
      // Depth 3 and below is inside one explanation: {"explanations":[{
      if (depth >= 3) current += char;

      if (inString) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inString = false;
        continue;
      }

      if (char === '"') {
        inString = true;
      } else if (char === "{" || char === "[") {
        depth += 1;
        if (depth === 3) current = char;
      } else if (char === "}" || char === "]") {
        depth -= 1;
        if (depth === 2) yield current;
        if (depth === 0) finished = true;
      }
    }
  }

  // Cut off (e.g. hit the token limit) or not JSON at all (e.g. a refusal)
  if (!finished) throw new ExplainAiFault("The AI reply ended before it was complete");
}
