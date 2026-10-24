import { z } from "zod";
import { MATH_CATEGORIES } from "./mathSkills";

// The shape the AI must reply in when it marks a worksheet.
// OpenAI uses this to force its reply into this shape, and Zod checks the reply again when it arrives.
// Field order matters: the AI writes top to bottom, so it solves the question before it judges it.

// Every skill id and category id from our fixed list, so the AI can only pick from them.
const SKILL_IDS = MATH_CATEGORIES.flatMap((category) =>
  category.skills.map((skill) => skill.id),
);
const CATEGORY_IDS = MATH_CATEGORIES.map((category) => category.id);

// Fields every question has, whatever the result.
const baseFields = {
  number: z
    .string()
    .describe('The question number as printed on the sheet, e.g. "1" or "2a".'),
  question: z.string().describe("The question, copied exactly."),
  childAnswer: z
    .string()
    .describe('What the child wrote, copied exactly. Do not fix it. Use "" if blank.'),
  correctAnswer: z
    .string()
    .describe("Solve the question yourself first, then write the right answer."),
};

// The skill behind a wrong answer: either one from our list, or a new one the AI suggests.
const listSkill = z.object({
  source: z.literal("list"),
  skillId: z
    .enum(SKILL_IDS)
    .describe("The skill for the exact step that went wrong, not the topic of the question."),
});

const suggestedSkill = z.object({
  source: z.literal("suggested"),
  categoryId: z.enum(CATEGORY_IDS),
  name: z.string().describe("A short name for the missing skill."),
});

const skill = z.discriminatedUnion("source", [listSkill, suggestedSkill]);

// Shape 1: the child got it right. Nothing else is needed.
const correctQuestion = z.object({
  ...baseFields,
  result: z.literal("correct"),
});

// Shape 2: the child got it wrong. A skill must be named.
const incorrectQuestion = z.object({
  ...baseFields,
  result: z.literal("incorrect"),
  skill: skill.describe(
    'The skill for the step that went wrong. Use "suggested" only if no skill in the list fits.',
  ),
});

// Shape 3: the AI can't read the question or the answer. It must not guess.
const unreadableQuestion = z.object({
  ...baseFields,
  result: z.literal("unreadable"),
});

// Shape 4: the child left it empty (or crossed out every answer).
// There's no wrong step to look at, so name the main skill the question tests.
// That way it can still go into practice.
const blankQuestion = z.object({
  ...baseFields,
  result: z.literal("blank"),
  skill: skill.describe(
    'The main skill this question tests. Use "suggested" only if no skill in the list fits.',
  ),
});

// Each question is one of the four shapes. `result` says which one.
const markedQuestion = z.discriminatedUnion("result", [
  correctQuestion,
  incorrectQuestion,
  unreadableQuestion,
  blankQuestion,
]);

// The full reply. OpenAI needs an object at the top, not a bare list.
export const WorksheetResult = z.object({
  questions: z.array(markedQuestion),
});

export type WorksheetResult = z.infer<typeof WorksheetResult>;
export type MarkedQuestion = z.infer<typeof markedQuestion>;
