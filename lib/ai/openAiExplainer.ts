import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ExplainAi } from "./explainSkillGaps";

// The real AI call for the explain step. Kept apart from explainSkillGaps.ts,
// so tests can use that module without an OpenAI client or an API key.

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60_000,
  maxRetries: 1,
});

// One streamed call, text only (ADR-022). It hands back the reply text bit by bit.
// `signal` stops the call if the parent leaves the page.
export function openAiExplainer(signal?: AbortSignal): ExplainAi {
  return async function* ({ instructions, input, schema }) {
    const stream = client.responses.stream(
      {
        model: "gpt-6.1-sol",
        instructions,
        input,
        text: { format: zodTextFormat(schema, "explanations") },
      },
      { signal },
    );

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        yield event.delta;
      } else if (event.type === "response.completed") {
        // Token counts, so we can compare cost when the instructions change
        console.log("[explain] usage", JSON.stringify(event.response.usage));
      } else if (event.type === "error" || event.type === "response.failed") {
        // No try/catch here: the module and the route decide what happens (ADR-014)
        throw new Error(`The AI stream failed: ${event.type}`);
      }
    }
  };
}
