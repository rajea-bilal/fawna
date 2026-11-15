import { StreamMessage, type ExplanationCard } from "./explanationSchema";

// The explain reply stopped early, or a line wasn't a message we know.
// The page shows "try again" for this.
export class ExplainStreamError extends Error {}

// Reads the explain endpoint's reply on the page (ADR-022).
// The server sends one JSON message per line: a card for each skill gap,
// then { type: "done" }. Each card is handed to onCard as soon as its line
// arrives, so the page can show it straight away.
// Throws ExplainStreamError if a line is broken or "done" never comes.
// Cards that arrived before the problem have already been handed over.
export async function readExplainStream(
  body: ReadableStream<Uint8Array>,
  onCard: (card: ExplanationCard) => void,
): Promise<void> {
  const reader = body.getReader();
  // Bytes → text. { stream: true } keeps a letter that is split across chunks (like "÷") in one piece.
  const decoder = new TextDecoder();
  // Text that arrived but isn't a full line yet. A line can be split across chunks.
  let leftover = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      leftover += decoder.decode(value, { stream: true });
      const lines = leftover.split("\n");
      // The last piece has no "\n" after it yet, so keep it for the next chunk
      leftover = lines.pop() ?? "";

      for (const line of lines) {
        if (line.trim() === "") continue;
        const message = parseLine(line);
        if (message.type === "done") return;
        onCard(message.card);
      }
    }

    // The reply ended. A last line with no "\n" can still be a message.
    if (leftover.trim() !== "") {
      const message = parseLine(leftover);
      if (message.type === "done") return;
      onCard(message.card);
    }
    throw new ExplainStreamError("The reply ended before 'done'");
  } finally {
    // Stop reading. Safe to call even when the reply already ended.
    reader.cancel().catch(() => {});
  }
}

// One line → one checked message. Zod checks it again on the page,
// because the server could change without the page knowing.
function parseLine(line: string): StreamMessage {
  let json: unknown;
  try {
    json = JSON.parse(line);
  } catch {
    throw new ExplainStreamError("A line wasn't valid JSON");
  }
  const result = StreamMessage.safeParse(json);
  if (!result.success) {
    throw new ExplainStreamError("A line wasn't a card or 'done'");
  }
  return result.data;
}
