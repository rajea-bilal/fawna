import OpenAI from "openai";
import analyzeWorksheet from "@/lib/ai/analyzeWorksheet";
import type { MarkedQuestion } from "@/lib/ai/worksheetSchema";
import { processImageOnServer } from "@/lib/image/processImageOnServer";

// extract the incoming file from formData
// validate it
// The backend reads the uploaded image’s bytes using file.arrayBuffer().
// uses Node.js’s built-in Buffer class to access those bytes
// convert them into a base64 string. (33% bigger than original file)
// a format suitable for AI consumption

export async function POST(request: Request) {
  const valid_types = ["image/png", "image/jpeg", "image/webp"];
  const max_file_size = 10 * 1024 * 1024; // 10 MB
  const formData = await request.formData();

  const file = formData.get("worksheet");

  if (!file) {
    return Response.json({ message: "File not received" }, { status: 400 });
  }

  // check if the file is of File type
  if (!(file instanceof File)) {
    return Response.json(
      { message: "File is not of File type" },
      { status: 400 },
    );
  }

  if (file.size > max_file_size) {
    return Response.json(
      {
        message: "File size is too large, my friend",
      },
      { status: 413 },
    );
  }

  if (!valid_types.includes(file.type)) {
    return Response.json(
      {
        message: "File type ",
      },
      { status: 415 },
    );
  }

  // convert file to base64
  const arrayBuffer = await file.arrayBuffer(); // reads image's bytes
  const buffer = Buffer.from(arrayBuffer);

  console.log("buffer on server length", buffer.length);

  // Layer 1: the image. Caught here, because we know exactly what went wrong.
  // Declared before the try so we can use it after the braces.
  let shrunkImage: Buffer;
  try {
    shrunkImage = await processImageOnServer(buffer);
  } catch (error) {
    console.error("sharp could not read the image:", error); // full details for us, in the server logs
    return Response.json(
      { message: "We couldn't open this photo. Please try another one." },
      { status: 422 },
    );
  }
  console.log("shrunk imaage on server", shrunkImage.length);

  const base64 = shrunkImage.toString("base64"); // puts those bytes into a Nodejs buffer + converts the into a base64 string

  const imageDataUrl = `data:image/jpeg;base64,${base64}`; // prepare the image url string for openAI

  const ai_data = {
    imageDataUrl,
    schoolYear: 5,
  };

  // Layer 2: the AI. The parent gets a simple message, never the real error.
  try {
    const result = await analyzeWorksheet(ai_data);

    console.log("response back from AI", result);

    // Code counts, not the AI (ADR-007)
    const count = (kind: MarkedQuestion["result"]) =>
      result.questions.filter((question) => question.result === kind).length;
    const correct = count("correct");
    const incorrect = count("incorrect");
    const blank = count("blank");
    const unreadable = count("unreadable");

    return Response.json(
      {
        message: `${correct} correct · ${incorrect} to work on · ${blank} not answered · ${unreadable} couldn't read`,
        correct,
        incorrect,
        blank,
        unreadable,
        questions: result.questions,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("AI marking failed:", error); // full details for us, in the server logs

    // `error` is unknown, so check what it is before using it
    if (error instanceof OpenAI.RateLimitError) {
      return Response.json(
        { message: "Fawna is busy right now. Please try again in a minute." },
        { status: 503 },
      );
    }
    if (error instanceof OpenAI.APIConnectionTimeoutError) {
      return Response.json(
        { message: "This took too long. Please try again." },
        { status: 504 },
      );
    }
    // Anything else (bad API key, empty AI reply, a bug) is our fault, not the parent's
    return Response.json(
      { message: "Something went wrong on our side. Please try again." },
      { status: 502 },
    );
  }
}
