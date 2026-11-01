import { describe, expect, it } from "vitest";
import { groupSkillGaps } from "./groupSkillGaps";
import type { MarkedQuestion } from "./worksheetSchema";
import { SAMPLE_RESULT } from "../demo/sampleResult";

// Small helpers so each test only shows the parts it cares about.
function wrong(number: string, skillId: string): MarkedQuestion {
  return {
    number,
    question: `Question ${number}`,
    childAnswer: "x",
    correctAnswer: "y",
    result: "incorrect",
    skill: { source: "list", skillId },
  };
}

function blank(number: string, skillId: string): MarkedQuestion {
  return {
    number,
    question: `Question ${number}`,
    childAnswer: "",
    correctAnswer: "y",
    result: "blank",
    skill: { source: "list", skillId },
  };
}

function wrongSuggested(number: string, name: string): MarkedQuestion {
  return {
    number,
    question: `Question ${number}`,
    childAnswer: "x",
    correctAnswer: "y",
    result: "incorrect",
    skill: { source: "suggested", categoryId: "fractions", name },
  };
}

function other(number: string, result: "correct" | "unreadable"): MarkedQuestion {
  return { number, question: `Question ${number}`, childAnswer: "x", correctAnswer: "x", result };
}

// Question numbers are enough to tell which questions landed where.
const numbers = (questions: MarkedQuestion[]) => questions.map((q) => q.number);

describe("groupSkillGaps", () => {
  it("groups the sample worksheet into its two skill gaps", () => {
    const gaps = groupSkillGaps(SAMPLE_RESULT);

    expect(gaps.map((gap) => [gap.key, gap.name, gap.kind])).toEqual([
      ["dividing-by-10-100-1000", "Dividing by 10, 100, 1000", "method"],
      ["percentage-facts", "Percentage facts (50% = ½, 25% = ¼, 10% = ⅒)", "fact"],
    ]);
    expect(gaps.map((gap) => gap.exampleQuestion.number)).toEqual(["2", "8"]);
  });

  it("puts wrong and blank answers with the same skill into one skill gap", () => {
    const gaps = groupSkillGaps({
      questions: [wrong("1", "rounding"), blank("2", "rounding")],
    });

    expect(gaps).toHaveLength(1);
    expect(numbers(gaps[0].questions)).toEqual(["1", "2"]);
  });

  it("uses the first blank as the example when a skill gap has only blanks", () => {
    const [gap] = groupSkillGaps({
      questions: [blank("1", "rounding"), blank("2", "rounding")],
    });

    expect(gap.exampleQuestion.number).toBe("1");
  });

  it("picks a wrong answer as the example over an earlier blank", () => {
    const [gap] = groupSkillGaps({
      questions: [blank("1", "rounding"), wrong("2", "rounding")],
    });

    expect(gap.exampleQuestion.number).toBe("2");
  });

  it("numbers suggested skills suggested-1, suggested-2 in sheet order", () => {
    const gaps = groupSkillGaps({
      questions: [
        wrongSuggested("1", "Halving odd numbers"),
        wrong("2", "rounding"),
        wrongSuggested("3", "Reading a ruler"),
      ],
    });

    expect(gaps.map((gap) => [gap.key, gap.name, gap.kind])).toEqual([
      ["suggested-1", "Halving odd numbers", null],
      ["rounding", "Rounding", "method"],
      ["suggested-2", "Reading a ruler", null],
    ]);
  });

  it("puts two suggested skills with the same name into one skill gap", () => {
    const gaps = groupSkillGaps({
      questions: [
        wrongSuggested("1", "Halving odd numbers"),
        wrongSuggested("2", "Halving odd numbers"),
      ],
    });

    expect(gaps).toHaveLength(1);
    expect(gaps[0].key).toBe("suggested-1");
    expect(numbers(gaps[0].questions)).toEqual(["1", "2"]);
  });

  it("leaves out correct and unreadable questions", () => {
    const gaps = groupSkillGaps({
      questions: [other("1", "correct"), wrong("2", "rounding"), other("3", "unreadable")],
    });

    expect(gaps).toHaveLength(1);
    expect(numbers(gaps[0].questions)).toEqual(["2"]);
  });

  it("keeps fact skills in the list with kind fact", () => {
    const gaps = groupSkillGaps({
      questions: [wrong("1", "times-tables-3-4-8")],
    });

    expect(gaps.map((gap) => [gap.key, gap.kind])).toEqual([["times-tables-3-4-8", "fact"]]);
  });

  it("gives an empty list for an empty result", () => {
    expect(groupSkillGaps({ questions: [] })).toEqual([]);
  });
});
