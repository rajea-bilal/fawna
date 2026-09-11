export async function POST(request: Request) {
  const valid_types = ["image/png", "image/jpeg", "image/webp"];
  const max_size = 150000;
  const formData = await request.formData();

  const file = formData.get("worksheet");

  if (!(file instanceof File)) {
    return Response.json(
      { message: "File is not of File type" },
      { status: 400 },
    );
  }

  if (!file) {
    return Response.json({ message: "File not received" }, { status: 400 });
  }

  try {
    if (file.size > max_size) {
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

    return Response.json(
      {
        message: "File successully received and validated",
      },
      { status: 200 },
    );
  } catch (Error) {
    return Response.json({
      message: "Malfuctioning in the system",
      status: 400,
    });
  }
}
