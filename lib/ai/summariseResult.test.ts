import { describe, expect, it } from "vitest";
import { summariseResult } from "./summariseResult";
import { SAMPLE_RESULT } from "../demo/sampleResult";

describe("summariseResult", () => {
  it("includes the skill gaps, so the page can show them before any click", () => {
    const summary = summariseResult(SAMPLE_RESULT);

    expect(summary.skillGaps.map((gap) => [gap.key, gap.questions.length])).toEqual([
      ["dividing-by-10-100-1000", 1],
      ["percentage-facts", 1],
    ]);
  });

  it("gives an empty list when every answer is correct", () => {
    const summary = summariseResult({
      questions: SAMPLE_RESULT.questions.filter((question) => question.result === "correct"),
    });

    expect(summary.skillGaps).toEqual([]);
  });
});
