import OpenAI from "openai";

// inputs: worksheet file, instructions to AI
// output: response from AI to backend API endpoint /api/analyze

const MARKING_INSTRUCTIONS = "";

interface AnalyzeWorksheetParams {
  imageDataUrl: string;
  schoolYear: number;
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function analyzeWorksheet(
  ai_data: AnalyzeWorksheetParams,
) {
  console.log(
    "request from backend endpoint received inside anaylyzeWorksheet function - congrats",
  );

  const completion = await client.responses.parse({
    model: "gpt-5.6-luna",
    instructions: MARKING_INSTRUCTIONS,
    input: [
      // what i send to the openAI model
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `The child is in Year ${ai_data.schoolYear}`,
          },
          {
            type: "input_image",
            image_url: ai_data.imageDataUrl,
            detail: "high",
          },
        ],
      },
    ],
    text: {}, // openAI models response
  });
  console.log(completion.choices[0].message.content);
}
