export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_COVER_SIZE = 5 * 1024 * 1024;

export const COVER_ASPECT_RATIO = 16 / 9;

export type ImageValidationError = "invalid_type" | "too_large" | null;

export function validateImageFile(
  file: File,
  maxSize = MAX_COVER_SIZE
): ImageValidationError {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    return "invalid_type";
  }
  if (file.size > maxSize) {
    return "too_large";
  }
  return null;
}
