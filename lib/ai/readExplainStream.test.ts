import { describe, expect, it } from "vitest";
import type { ExplanationCard } from "./explanationSchema";
import { ExplainStreamError, readExplainStream } from "./readExplainStream";
import { SAMPLE_EXPLANATIONS } from "../demo/sampleExplanations";

// A fake server reply, sent in the chunks given.
function fakeReply(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

const line = (message: unknown) => JSON.stringify(message) + "\n";
const [card1, card2] = SAMPLE_EXPLANATIONS;
const done = line({ type: "done" });

function read(chunks: string[]) {
  const cards: ExplanationCard[] = [];
  const finished = readExplainStream(fakeReply(chunks), (card) =>
    cards.push(card),
  );
  return { cards, finished };
}

describe("readExplainStream", () => {
  it("hands over each card in order, then stops at done", async () => {
    const { cards, finished } = await read([
      line({ type: "card", card: card1 }),
      line({ type: "card", card: card2 }),
      done,
    ]);
    await finished;
    expect(cards).toEqual([card1, card2]);
  });

  it("joins a line that arrives in two pieces", async () => {
    const whole = line({ type: "card", card: card1 });
    const { cards, finished } = await read([
      whole.slice(0, 20),
      whole.slice(20),
      done,
    ]);
    await finished;
    expect(cards).toEqual([card1]);
  });

  it("accepts done with no cards", async () => {
    const { cards, finished } = await read([done]);
    await finished;
    expect(cards).toEqual([]);
  });

  it("accepts a last line with no line break after it", async () => {
    const { finished } = await read([
      line({ type: "card", card: card1 }),
      '{"type":"done"}',
    ]);
    await expect(finished).resolves.toBeUndefined();
  });

  it("fails when the reply ends without done, but keeps the cards before it", async () => {
    const { cards, finished } = await read([
      line({ type: "card", card: card1 }),
    ]);
    await expect(finished).rejects.toBeInstanceOf(ExplainStreamError);
    expect(cards).toEqual([card1]);
  });

  it("fails on a line that isn't JSON", async () => {
    const { finished } = await read(["not json\n", done]);
    await expect(finished).rejects.toBeInstanceOf(ExplainStreamError);
  });

  it("fails on a card in the wrong shape", async () => {
    const { finished } = await read([
      line({ type: "card", card: { key: "x" } }),
      done,
    ]);
    await expect(finished).rejects.toBeInstanceOf(ExplainStreamError);
  });
});
