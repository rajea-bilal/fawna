import sharp from "sharp";
import { MAX_LONG_SIDE, JPEG_QUALITY } from "./imageSettings";

export async function processImageOnServer(buffer: Buffer): Promise<Buffer> {
  const resizedBuffer = await sharp(buffer)
    .autoOrient() // read rotation note
    .resize({
      width: MAX_LONG_SIDE,
      height: MAX_LONG_SIDE,
      fit: "inside", // shrink the photo until it fits completely inside the box
      withoutEnlargement: true, // if the photo already fits, leave it
    })
    .jpeg({ quality: Math.round(JPEG_QUALITY * 100) })
    .toBuffer();

  return resizedBuffer;
}
