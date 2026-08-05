const MAX_INPUT = 15 * 1024 * 1024;
const TARGET = 2.5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function validateWallpaperFile(file: File): void {
  if (!ALLOWED.has(file.type)) throw new Error("Gunakan JPG, PNG, WebP, atau AVIF.");
  if (file.size > MAX_INPUT) throw new Error("Ukuran gambar maksimal 15 MB.");
}

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

async function decodeImage(file: File): Promise<DecodedImage> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;
    await image.decode();
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/webp" | "image/jpeg",
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function optimizeWallpaper(file: File): Promise<Blob> {
  validateWallpaperFile(file);
  const decoded = await decodeImage(file);

  try {
    const ratio = Math.min(1, 2560 / decoded.width, 1440 / decoded.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(decoded.width * ratio));
    canvas.height = Math.max(1, Math.round(decoded.height * ratio));

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Canvas tidak tersedia.");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);

    let quality = 0.88;
    let output = await canvasToBlob(canvas, "image/webp", quality);
    let outputType: "image/webp" | "image/jpeg" = "image/webp";

    if (!output) {
      outputType = "image/jpeg";
      output = await canvasToBlob(canvas, outputType, quality);
    }
    if (!output) throw new Error("Browser gagal mengompres gambar.");

    while (output.size > TARGET && quality > 0.52) {
      quality -= 0.08;
      const next = await canvasToBlob(canvas, outputType, quality);
      if (!next) break;
      output = next;
    }

    return output;
  } finally {
    decoded.close();
  }
}
