import OpenAI from "openai";

// inputs: worksheet file, instructions to AI
// output: response from AI to backend API endpoint /api/analyze

interface AnalyzeWorksheetParams {
  imageDataUrl: string;
  instructions: string;
}

export default async function analyzeWorksheet(
  ai_data: AnalyzeWorksheetParams,
) {
  console.log(
    "request from backend endpoint received inside anaylyzeWorksheet function - congrats",
  );
//   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//   const completion = await client.chat.completions.create({
//     model: "gpt-5.6-luna",
//     messages: [
//       { role: "system", content: "You are a helpful assistant." },
//       { role: "user", content: ai_data.instructions },
//     ],
//   });
//   console.log(completion.choices[0].message.content);
}
