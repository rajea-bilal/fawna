import { MAX_LONG_SIDE, JPEG_QUALITY } from "./imageSettings";

export default async function shrinkImage(file: File): Promise<File> {
  // Decode the photo file into pixels, so the browser can redraw those pixels onto a smaller canvas to resize
  const imageBitmap = await createImageBitmap(file);

  try {
    // Work out the new size, keeping the photo's shape.
    // Math.min(1, ...) means a photo that is already small is never enlarged.
    const longSide = Math.max(imageBitmap.width, imageBitmap.height);
    const howMuchToShrink = Math.min(1, MAX_LONG_SIDE / longSide);
    const shrunkWidth = Math.round(imageBitmap.width * howMuchToShrink);
    const shrunkHeight = Math.round(imageBitmap.height * howMuchToShrink);

    // Create a canvas in memory at the new size. It is never added to the page.
    const canvas = document.createElement("canvas");
    canvas.width = shrunkWidth;
    canvas.height = shrunkHeight;

    // Get the 2D drawing tools. Throw an error instead of silently returning a blank image.
    const drawingTools = canvas.getContext("2d");
    if (!drawingTools) {
      throw new Error("This browser can't draw images");
    }

    // Draw the photo scaled down to fit the canvas.
    drawingTools.drawImage(imageBitmap, 0, 0, shrunkWidth, shrunkHeight);

    // turn canvas into a JPEG blob
    // toBlob uses a callback instead of returning a Promise, so we wrap it in
    // a Promise to be able to `await` it. It gives back null if the export fails.
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) {
      throw new Error("Could not export the shrunk image");
    }

    // wrap the Blob in a File so the rest of the app (preview, FormData,
    // the server's `instanceof File` check) works exactly as before.

    // take the original name, remove ending and add .jpg
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } finally {
    // Free the decoded pixels straight away, whether we succeeded or threw.
    imageBitmap.close();
  }
}
