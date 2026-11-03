import { describe, expect, it } from "vitest";
import { buildExplanationSchema, StreamMessage } from "./explanationSchema";
import type { SkillGap } from "./groupSkillGaps";

// Small helpers so each test only shows the parts it cares about.
function gap(key: string): SkillGap {
  const question = {
    number: "1",
    question: "Question 1",
    childAnswer: "x",
    correctAnswer: "y",
    result: "incorrect" as const,
    skill: { source: "list" as const, skillId: key },
  };
  return { key, name: key, kind: "method", exampleQuestion: question, questions: [question] };
}

function card(key: string) {
  return {
    key,
    title: "Dividing by 1000",
    whatWentWrong: "You moved the digits 2 places, not 3.",
    steps: ["Write 66 as 66.0", "Move each digit 3 places right", "66 ÷ 1000 = 0.066"],
    parentTip: "Draw a place-value grid and slide the digits together.",
  };
}

describe("buildExplanationSchema", () => {
  const schema = buildExplanationSchema([gap("dividing-by-10-100-1000"), gap("rounding")]);

  it("accepts a valid reply that uses this sheet's keys", () => {
    const reply = { explanations: [card("dividing-by-10-100-1000"), card("rounding")] };

    expect(schema.safeParse(reply).success).toBe(true);
  });

  it("rejects a key that isn't on this sheet", () => {
    // column-addition is a real skill on our list, just not on this sheet
    const reply = { explanations: [card("column-addition")] };

    expect(schema.safeParse(reply).success).toBe(false);
  });

  it("accepts suggested keys like suggested-1", () => {
    const suggestedSchema = buildExplanationSchema([gap("suggested-1")]);

    expect(suggestedSchema.safeParse({ explanations: [card("suggested-1")] }).success).toBe(true);
  });

  it("throws when there are no skill gaps to explain", () => {
    expect(() => buildExplanationSchema([])).toThrow("No skill gaps to explain");
  });
});

describe("StreamMessage", () => {
  // The parts code fills in from the skill gap
  const questionParts = {
    key: "dividing-by-10-100-1000",
    question: "66 ÷ 1000 =",
    childAnswer: "0.66",
    correctAnswer: "0.066",
  };

  it("accepts an explained card", () => {
    const message = {
      type: "card",
      card: { status: "explained", ...questionParts, ...card("dividing-by-10-100-1000") },
    };

    expect(StreamMessage.safeParse(message).success).toBe(true);
  });

  it("accepts a failed card, which has no AI parts", () => {
    const message = { type: "card", card: { status: "failed", ...questionParts } };

    expect(StreamMessage.safeParse(message).success).toBe(true);
  });

  it("rejects an explained card with no AI parts", () => {
    const message = { type: "card", card: { status: "explained", ...questionParts } };

    expect(StreamMessage.safeParse(message).success).toBe(false);
  });

  it("accepts done", () => {
    expect(StreamMessage.safeParse({ type: "done" }).success).toBe(true);
  });

  it("rejects a type it doesn't know", () => {
    expect(StreamMessage.safeParse({ type: "error" }).success).toBe(false);
  });
});
