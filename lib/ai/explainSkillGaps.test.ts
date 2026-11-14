import { describe, expect, it } from "vitest";
import {
  ExplainAiFault,
  explainSkillGaps,
  type ExplainAi,
  type ExplainRequest,
} from "./explainSkillGaps";
import type { StreamMessage } from "./explanationSchema";
import type { SkillGap } from "./groupSkillGaps";
import type { SkillKind } from "./mathSkills";

// Small helpers so each test only shows the parts it cares about.
function gap(key: string, kind: SkillKind | null = "method"): SkillGap {
  const question = {
    number: "1",
    question: `Question for ${key}`,
    childAnswer: `child answer for ${key}`,
    correctAnswer: `right answer for ${key}`,
    result: "incorrect" as const,
    skill: { source: "list" as const, skillId: key },
  };
  return { key, name: `Name of ${key}`, kind, exampleQuestion: question, questions: [question] };
}

function explanation(key: string) {
  return {
    key,
    title: `Title for ${key}`,
    whatWentWrong: "You moved the digits 2 places, not 3.",
    steps: ["Step one", "Step two", "Step three"],
    parentTip: "Draw a place-value grid.",
  };
}

// A fake AI. It streams the reply text in small chunks, like the real one,
// and remembers what it was asked so tests can check it.
function fakeAi(reply: unknown) {
  const text = typeof reply === "string" ? reply : JSON.stringify(reply);
  const calls: ExplainRequest[] = [];
  const ai: ExplainAi = async function* (request) {
    calls.push(request);
    for (let i = 0; i < text.length; i += 7) {
      yield text.slice(i, i + 7);
    }
  };
  return { ai, calls };
}

// An explanation that fails Zod: it has no steps
function withoutSteps(key: string) {
  const broken: Partial<ReturnType<typeof explanation>> = explanation(key);
  delete broken.steps;
  return broken;
}

async function collect(stream: AsyncIterable<StreamMessage>) {
  const messages: StreamMessage[] = [];
  for await (const message of stream) messages.push(message);
  return messages;
}

describe("explainSkillGaps", () => {
  it("matches each explanation to its skill gap by key, with the question and answers from the skill gap", async () => {
    const { ai } = fakeAi({
      // Out of order on purpose: matching uses the key, not the position
      explanations: [explanation("rounding"), explanation("column-addition")],
    });

    const messages = await collect(explainSkillGaps([gap("column-addition"), gap("rounding")], ai));

    expect(messages).toEqual([
      {
        type: "card",
        card: {
          status: "explained",
          question: "Question for rounding",
          childAnswer: "child answer for rounding",
          correctAnswer: "right answer for rounding",
          ...explanation("rounding"),
        },
      },
      {
        type: "card",
        card: {
          status: "explained",
          question: "Question for column-addition",
          childAnswer: "child answer for column-addition",
          correctAnswer: "right answer for column-addition",
          ...explanation("column-addition"),
        },
      },
      { type: "done" },
    ]);
  });

  it("doesn't send fact skill gaps to the AI, and gives them no card", async () => {
    const { ai, calls } = fakeAi({ explanations: [explanation("rounding")] });

    const messages = await collect(
      explainSkillGaps([gap("times-tables-3-4-8", "fact"), gap("rounding")], ai),
    );

    expect(calls[0].input).not.toContain("times-tables-3-4-8");
    // The schema won't accept the fact gap's key either
    const factReply = { explanations: [explanation("times-tables-3-4-8")] };
    expect(calls[0].schema.safeParse(factReply).success).toBe(false);
    expect(messages.map((m) => (m.type === "card" ? m.card.key : m.type))).toEqual([
      "rounding",
      "done",
    ]);
  });

  it("makes no AI call when every skill gap is a fact", async () => {
    const { ai, calls } = fakeAi({ explanations: [] });

    const messages = await collect(explainSkillGaps([gap("times-tables-3-4-8", "fact")], ai));

    expect(calls).toHaveLength(0);
    expect(messages).toEqual([{ type: "done" }]);
  });

  it("marks a skill gap with no explanation from the AI as failed", async () => {
    const { ai } = fakeAi({ explanations: [explanation("rounding")] });

    const messages = await collect(explainSkillGaps([gap("column-addition"), gap("rounding")], ai));

    expect(messages).toEqual([
      expect.objectContaining({ card: expect.objectContaining({ status: "explained", key: "rounding" }) }),
      {
        type: "card",
        card: {
          status: "failed",
          key: "column-addition",
          question: "Question for column-addition",
          childAnswer: "child answer for column-addition",
          correctAnswer: "right answer for column-addition",
        },
      },
      { type: "done" },
    ]);
  });

  it("sends only one card when the AI explains the same skill gap twice", async () => {
    const second = { ...explanation("rounding"), title: "Second go" };
    const { ai } = fakeAi({ explanations: [explanation("rounding"), second] });

    const messages = await collect(explainSkillGaps([gap("rounding")], ai));

    expect(messages).toEqual([
      expect.objectContaining({ card: expect.objectContaining({ title: "Title for rounding" }) }),
      { type: "done" },
    ]);
  });

  describe("AI faults", () => {
    const statuses = (messages: StreamMessage[]) =>
      messages.map((m) => (m.type === "card" ? `${m.card.key}:${m.card.status}` : m.type));

    it("fails only the explanation that fails Zod, and still sends the good ones", async () => {
      const { ai } = fakeAi({
        explanations: [explanation("column-addition"), withoutSteps("rounding"), explanation("place-value")],
      });

      const messages = await collect(
        explainSkillGaps([gap("column-addition"), gap("rounding"), gap("place-value")], ai),
      );

      expect(statuses(messages)).toEqual([
        "column-addition:explained",
        "place-value:explained",
        "rounding:failed",
        "done",
      ]);
    });

    it("still sends the rest when the first explanation fails Zod", async () => {
      const { ai } = fakeAi({ explanations: [withoutSteps("rounding"), explanation("place-value")] });

      const messages = await collect(explainSkillGaps([gap("rounding"), gap("place-value")], ai));

      expect(statuses(messages)).toEqual(["place-value:explained", "rounding:failed", "done"]);
    });

    it("throws when the AI call fails before any card is sent", async () => {
      const ai: ExplainAi = async function* () {
        throw new Error("rate limited");
      };

      await expect(collect(explainSkillGaps([gap("rounding")], ai))).rejects.toThrow("rate limited");
    });

    it("fails the rest when the AI call breaks halfway", async () => {
      const ai: ExplainAi = async function* () {
        yield JSON.stringify({ explanations: [explanation("rounding")] }).slice(0, -2); // the first card is complete
        throw new Error("connection lost");
      };

      const messages = await collect(explainSkillGaps([gap("rounding"), gap("column-addition")], ai));

      expect(statuses(messages)).toEqual(["rounding:explained", "column-addition:failed", "done"]);
    });

    it("throws when the reply is cut off before any explanation is complete", async () => {
      const { ai } = fakeAi('{"explanations":[{"key":"rounding","title":"Round');

      await expect(collect(explainSkillGaps([gap("rounding")], ai))).rejects.toThrow(ExplainAiFault);
    });

    it("throws when the reply isn't the expected JSON at all", async () => {
      const { ai } = fakeAi("Sorry, I can't help with that.");

      await expect(collect(explainSkillGaps([gap("rounding")], ai))).rejects.toThrow(ExplainAiFault);
    });
  });

  it("keeps suggested skill gaps, which have no kind", async () => {
    const { ai, calls } = fakeAi({ explanations: [explanation("suggested-1")] });

    const messages = await collect(explainSkillGaps([gap("suggested-1", null)], ai));

    expect(calls[0].input).toContain("suggested-1");
    expect(messages[0]).toMatchObject({ type: "card", card: { status: "explained", key: "suggested-1" } });
  });

  it("sends the AI each skill gap's details and its other questions, so it can spot a pattern", async () => {
    const example = {
      number: "2",
      question: "66 ÷ 1000 =",
      childAnswer: "0.66",
      correctAnswer: "0.066",
      result: "incorrect" as const,
      skill: { source: "list" as const, skillId: "dividing-by-10-100-1000" },
    };
    const other = { ...example, number: "5", question: "450 ÷ 100 =", childAnswer: "", correctAnswer: "4.5", result: "blank" as const };
    const dividing: SkillGap = {
      key: "dividing-by-10-100-1000",
      name: "Dividing by 10, 100, 1000",
      kind: "method",
      exampleQuestion: example,
      questions: [example, other],
    };
    const { ai, calls } = fakeAi({ explanations: [explanation("dividing-by-10-100-1000")] });

    await collect(explainSkillGaps([dividing], ai));

    const { input } = calls[0];
    for (const part of ["Year 5", "dividing-by-10-100-1000", "Dividing by 10, 100, 1000", "method", "66 ÷ 1000 =", "0.66", "0.066", "450 ÷ 100 =", "4.5"]) {
      expect(input).toContain(part);
    }
    expect(input).toContain("left blank");
  });

  it("doesn't list the example question again as another question, even after a JSON round trip", async () => {
    // Skill gaps reach the endpoint as JSON, so the example is a copy, not the same object
    const [copied] = JSON.parse(JSON.stringify([gap("rounding")])) as SkillGap[];
    const { ai, calls } = fakeAi({ explanations: [explanation("rounding")] });

    await collect(explainSkillGaps([copied], ai));

    expect(calls[0].input.split("Question for rounding")).toHaveLength(2); // shown once
    expect(calls[0].input).toContain("other questions in this skill gap: none");
  });

  it("tells the AI a suggested skill has no kind", async () => {
    const { ai, calls } = fakeAi({ explanations: [explanation("suggested-1")] });

    await collect(explainSkillGaps([gap("suggested-1", null)], ai));

    expect(calls[0].input).toContain("suggested");
    expect(calls[0].input).not.toContain("null");
  });
});
