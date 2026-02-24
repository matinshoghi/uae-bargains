import sharp from "sharp";

const MAX_WIDTH = 1200;
const WEBP_QUALITY = 80;

/**
 * Optimizes an image buffer: resizes to max width, converts to WebP.
 * Never upscales. Returns the optimized buffer with metadata.
 */
export async function optimizeImage(
  input: ArrayBuffer | Buffer
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const buffer = Buffer.from(input instanceof ArrayBuffer ? new Uint8Array(input) : input);

  const optimized = await sharp(buffer)
    .resize(MAX_WIDTH, undefined, {
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return {
    buffer: optimized,
    contentType: "image/webp",
    ext: "webp",
  };
}
