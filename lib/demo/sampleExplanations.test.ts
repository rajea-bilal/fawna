import { describe, expect, it } from "vitest";
import { ExplanationCard } from "../ai/explanationSchema";
import { groupSkillGaps } from "../ai/groupSkillGaps";
import { SAMPLE_RESULT } from "./sampleResult";
import { SAMPLE_EXPLANATIONS } from "./sampleExplanations";

// The sample's skill gaps that should get a card (fact gaps don't, ADR-021)
const explainedGaps = groupSkillGaps(SAMPLE_RESULT).filter((gap) => gap.kind !== "fact");

describe("SAMPLE_EXPLANATIONS", () => {
  it("passes the shared card shape", () => {
    for (const card of SAMPLE_EXPLANATIONS) {
      expect(ExplanationCard.safeParse(card).success).toBe(true);
    }
  });

  it("has one card per non-fact skill gap, in sheet order", () => {
    expect(SAMPLE_EXPLANATIONS.map((card) => card.key)).toEqual(
      explainedGaps.map((gap) => gap.key),
    );
  });

  it("copies the question and answers from each skill gap's example question", () => {
    for (const [index, gap] of explainedGaps.entries()) {
      const card = SAMPLE_EXPLANATIONS[index];
      expect([card.question, card.childAnswer, card.correctAnswer]).toEqual([
        gap.exampleQuestion.question,
        gap.exampleQuestion.childAnswer,
        gap.exampleQuestion.correctAnswer,
      ]);
    }
  });

  it("includes a blank question and a failed card, so both can be checked on screen", () => {
    expect(SAMPLE_EXPLANATIONS.some((card) => card.childAnswer === "")).toBe(true);
    expect(SAMPLE_EXPLANATIONS.some((card) => card.status === "failed")).toBe(true);
  });
});
