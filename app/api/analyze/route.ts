export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("worksheet");

  // console.log("file in the backend", file);

  try {
    return Response.json({
      message: "File successully received and now being processed",
      status: 200,
    });
  } catch {
    Error;
  }
}
