import OpenAI from "openai";
import analyzeWorksheet from "@/lib/ai/analyzeWorksheet";
import { summariseResult } from "@/lib/ai/summariseResult";
import { processImageOnServer } from "@/lib/image/processImageOnServer";

// extract the incoming file from formData
// validate it
// The backend reads the uploaded image’s bytes using file.arrayBuffer().
// uses Node.js’s built-in Buffer class to access those bytes
// convert them into a base64 string. (33% bigger than original file)
// a format suitable for AI consumption

// Seconds the host lets this route run. The AI call can take 60s, plus 1 retry.
export const maxDuration = 150;

export async function POST(request: Request) {
  // Demo lock, until login exists. Checked first, before we read the upload,
  // so a stranger costs us nothing. No code set on the server means no one gets in.
  const demoCode = process.env.DEMO_ACCESS_CODE;
  if (!demoCode) {
    console.error("DEMO_ACCESS_CODE is not set, so live marking is locked");
  }
  if (!demoCode || request.headers.get("x-demo-code") !== demoCode) {
    return Response.json(
      { message: "That demo code isn't right. Try the sample instead." },
      { status: 401 },
    );
  }

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
        message: "Please upload a JPEG, PNG or WebP image.",
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

    const summary = summariseResult(result);

    // Counts only. The questions hold a child's answers, so they stay out of the logs.
    console.log("[analyze] marked", summary.message);

    return Response.json(summary, { status: 200 });
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
