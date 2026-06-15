import type { Area } from "react-easy-crop";

export const COVER_ASPECT = 16 / 9;

const MAX_OUTPUT_WIDTH = 1920;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

export async function getCroppedImageFile(
  imageSrc: string,
  crop: Area,
  fileName: string,
  mimeType: string
): Promise<File> {
  const image = await loadImage(imageSrc);
  const scale = crop.width > MAX_OUTPUT_WIDTH ? MAX_OUTPUT_WIDTH / crop.width : 1;
  const width = Math.round(crop.width * scale);
  const height = Math.round(crop.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    width,
    height
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Failed to crop image"));
      },
      mimeType,
      mimeType === "image/jpeg" ? 0.92 : undefined
    );
  });

  return new File([blob], fileName, { type: mimeType });
}
