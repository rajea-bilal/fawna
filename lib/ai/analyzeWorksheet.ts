import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { WorksheetResult } from "./worksheetSchema";

// inputs: worksheet file, instructions to AI
// output: response from AI to backend API endpoint /api/analyze

const MARKING_INSTRUCTIONS = `
You mark UK primary school maths worksheets that a child has already done.

For every question on the sheet:
1. Copy the question and the child's answer exactly. Do not fix the child's answer.
2. Solve the question yourself, then write the correct answer.
3. Only then decide if the child's answer is correct.
4. If the answer is wrong, pick the skill for the exact step that went wrong,
   not the topic of the question. For example, in 36 + 47 = 82 the carrying is right
   but 7 + 8 was added wrongly, so the skill is addition facts.

Rules:
- If you cannot read a question or an answer clearly, mark it "unreadable". Never guess.
- If a question is left blank, mark it "blank" and name the main skill it tests.
- If an answer is crossed out, mark only the answer that is not crossed out.
  If every answer is crossed out, mark it "blank".
- Accept answers that mean the same thing (0.5 and ½, £2.50 and 250p).
- Mark every question on the sheet, in order.
`.trim();

interface AnalyzeWorksheetParams {
  imageDataUrl: string;
  schoolYear: number;
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60_000,
  maxRetries: 1,
});

// No try/catch here on purpose: this function can't fix a failure,
// so errors go up to the route, which decides what the parent sees.
export default async function analyzeWorksheet(
  ai_data: AnalyzeWorksheetParams,
): Promise<WorksheetResult> {
  const response = await client.responses.parse({
    model: "gpt-6.1-sol",
    instructions: MARKING_INSTRUCTIONS,
    input: [
      // what i send to the openAI model
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `The child is in Year ${ai_data.schoolYear}.`,
          },
          {
            type: "input_image",
            image_url: ai_data.imageDataUrl,
            detail: "high",
          },
        ],
      },
    ],
    text: { format: zodTextFormat(WorksheetResult, "worksheet_result") }, // openAI models response
  });

  // Empty if the model refused or its reply was cut off
  if (!response.output_parsed) {
    throw new Error("The AI did not return a marked worksheet");
  }

  return response.output_parsed;
}
