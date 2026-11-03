import type { SkillGap } from "./groupSkillGaps";
import { z } from "zod";

const aiFields = {
  title: z
    .string()
    .describe(
      "A short, child-friendly name for the skill, e.g. 'Carrying when you add'",
    ),
  whatWentWrong: z.string().describe("What went wrong"),
  steps: z.array(z.string()).describe("The steps to fix the problem"),
  parentTip: z.string().describe("A tip for the parent to help the child"),
};

// filled in by code from the skill gap, not by AI
const questionFields = {
  key: z.string(),
  question: z.string(),
  childAnswer: z.string(),
  correctAnswer: z.string(),
};

export function buildExplanationSchema(skillGaps: SkillGap[]) {
  // Safety net: the explain step should never call this with nothing to explain (ADR-026)
  if (skillGaps.length === 0) {
    throw new Error("No skill gaps to explain");
  }

  const gapKeys = skillGaps.map((gap) => gap.key);

  // what the ai writes for one skill gap
  const aiExplanation = z.object({
    key: z.enum(gapKeys),
    ...aiFields,
  });

  // the shape of the AI response with multiple explanations based on the skill gaps
  // OpenAI needs an object at the top, not a bare list
  return z.object({
    explanations: z.array(aiExplanation).describe("The explanation cards"),
  });
}

const explainedCardSchema = z.object({
  status: z.literal("explained"),
  ...questionFields,
  ...aiFields,
});

const failedCardSchema = z.object({
  status: z.literal("failed"),
  ...questionFields,
});

// the rule - checks data while the app runs
export const ExplanationCard = z.discriminatedUnion("status", [
  explainedCardSchema,
  failedCardSchema,
]);

// make a typescript type from the zod rule
export type ExplanationCard = z.infer<typeof ExplanationCard>;

// The stream: the server sends the page one JSON message per line.
// A card for each skill gap (explained or failed), then { type: "done" }.
// No "done" at the end means the stream broke. Full rules: docs/how-fawna-works.md
const cardMessage = z.object({
  type: z.literal("card"),
  card: ExplanationCard,
});

const doneMessage = z.object({
  type: z.literal("done"),
});

// the rule - checks data while the app runs
export const StreamMessage = z.discriminatedUnion("type", [
  cardMessage,
  doneMessage,
]);

// typescript type from the zod rule on stream message
export type StreamMessage = z.infer<typeof StreamMessage>;
