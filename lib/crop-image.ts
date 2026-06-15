import type { Area } from "react-easy-crop";

import { DEFAULT_COVER_ASPECT_RATIO } from "@/lib/image-constants";

/** @deprecated Use DEFAULT_COVER_ASPECT_RATIO from image-constants */
export const COVER_ASPECT = DEFAULT_COVER_ASPECT_RATIO;

const MAX_OUTPUT_WIDTH = 1920;

export function getImageAspectRatio(src: string): Promise<number> {
  return loadImage(src).then(
    (image) => image.naturalWidth / image.naturalHeight,
    () => DEFAULT_COVER_ASPECT_RATIO
  );
}

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
  mimeType: string,
  maxOutputWidth = MAX_OUTPUT_WIDTH
): Promise<File> {
  const image = await loadImage(imageSrc);
  const scale =
    crop.width > maxOutputWidth ? maxOutputWidth / crop.width : 1;
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
