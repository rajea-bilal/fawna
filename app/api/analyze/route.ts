import analyzeWorksheet from "@/lib/ai/analyzeWorksheet";

// extract the incoming file from formData
// validate it
// The backend reads the uploaded image’s bytes using file.arrayBuffer().
// It then uses Node.js’s built-in Buffer class to access those bytes
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

  try {
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
    const base64 = Buffer.from(arrayBuffer).toString("base64"); // puts those bytes into a Nodejs buffer + converts the into a base64 string

    const imageDataUrl = `data:${file.type};base64,${base64}`; // prepare the image url string for openAI

    const ai_data = {
      imageDataUrl,
      instructions: `hey Rajea, i love building things`,
    };

    const response = await analyzeWorksheet(ai_data);

    console.log("response back from AI", response);

    return Response.json(
      {
        message: "File successully received and validated",
      },
      { status: 200 },
    );
  } catch (Error) {
    return Response.json(
      {
        message: "Malfuctioning in the system",
      },
      { status: 400 },
    );
  }
}
