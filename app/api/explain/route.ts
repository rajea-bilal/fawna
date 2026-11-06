import OpenAI from "openai";
import { z } from "zod";
import { explainSkillGaps } from "@/lib/ai/explainSkillGaps";
import type { StreamMessage } from "@/lib/ai/explanationSchema";
import { openAiExplainer } from "@/lib/ai/openAiExplainer";
import { MarkedQuestion } from "@/lib/ai/worksheetSchema";

// The explain step: skill gaps in, one explanation card per skill gap streamed out.
// A thin wrapper around explainSkillGaps. Stream rules: docs/how-fawna-works.md

// Seconds the host lets this route run. The AI call can take 60s, plus 1 retry.
export const maxDuration = 150;

// Limits, so one request can't run up a big AI bill
const MAX_BODY_LENGTH = 100_000; // characters
const MAX_SKILL_GAPS = 30;
const MAX_QUESTIONS_PER_GAP = 60;

const SkillGapInput = z.object({
  key: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  kind: z.enum(["fact", "method", "idea"]).nullable(),
  exampleQuestion: MarkedQuestion,
  questions: z.array(MarkedQuestion).min(1).max(MAX_QUESTIONS_PER_GAP),
});

const ExplainBody = z.object({
  skillGaps: z
    .array(SkillGapInput)
    .min(1)
    .max(MAX_SKILL_GAPS)
    // Cards are matched by key, so two gaps can't share one
    .refine((gaps) => new Set(gaps.map((g) => g.key)).size === gaps.length, {
      message: "Each skill gap needs its own key",
    }),
});

export async function POST(request: Request) {
  // Demo lock, same as marking. Checked first, before we read the request,
  // so a stranger costs us nothing. No code set on the server means no one gets in.
  const demoCode = process.env.DEMO_ACCESS_CODE;
  if (!demoCode) {
    console.error("DEMO_ACCESS_CODE is not set, so live explaining is locked");
  }
  if (!demoCode || request.headers.get("x-demo-code") !== demoCode) {
    return Response.json(
      { message: "That demo code isn't right. Try the sample instead." },
      { status: 401 },
    );
  }

  // Bad requests are the caller's fault: 4xx (ADR-014)
  const text = await request.text();
  if (text.length > MAX_BODY_LENGTH) {
    return Response.json({ message: "That request is too big." }, { status: 413 });
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return Response.json({ message: "The request wasn't valid JSON." }, { status: 400 });
  }
  const body = ExplainBody.safeParse(json);
  if (!body.success) {
    return Response.json({ message: "The skill gaps weren't in the right shape." }, { status: 400 });
  }
  const { skillGaps } = body.data;

  const messages = explainSkillGaps(skillGaps, openAiExplainer(request.signal));

  // Wait for the first message before answering. If the AI fails before any card,
  // the parent still gets a proper 5xx, not a 200 with a broken stream.
  let first: IteratorResult<StreamMessage>;
  try {
    first = await messages.next();
  } catch (error) {
    return aiErrorResponse(error);
  }

  // Counts only. Cards hold a child's answers, so they stay out of the logs.
  const counts = { explained: 0, failed: 0 };
  const encoder = new TextEncoder();
  let next: IteratorResult<StreamMessage> | null = first;

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const result = next ?? (await messages.next());
        next = null;
        if (result.done) {
          controller.close();
          return;
        }
        const message = result.value;
        if (message.type === "card") counts[message.card.status] += 1;
        if (message.type === "done") {
          console.log(
            `[explain] ${skillGaps.length} skill gaps · ${counts.explained} explained · ${counts.failed} failed`,
          );
        }
        // One JSON message per line
        controller.enqueue(encoder.encode(JSON.stringify(message) + "\n"));
      } catch (error) {
        // A bug after the stream started. No "done" is sent, so the page knows it broke.
        console.error("[explain] stream broke:", error);
        controller.close();
      }
    },
    async cancel() {
      // The parent left: stop reading, which also stops the AI call
      await messages.return(undefined);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}

// What the parent sees when the AI fails before any card (ADR-014).
// The real error is logged. The parent only gets a simple message.
function aiErrorResponse(error: unknown) {
  console.error("AI explaining failed:", error);

  if (error instanceof OpenAI.RateLimitError) {
    return Response.json(
      { message: "Fawna is busy right now. Please try again in a minute." },
      { status: 503 },
    );
  }
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return Response.json({ message: "This took too long. Please try again." }, { status: 504 });
  }
  // Anything else (bad API key, a broken reply, a bug) is our fault, not the parent's
  return Response.json(
    { message: "Something went wrong on our side. Please try again." },
    { status: 502 },
  );
}
