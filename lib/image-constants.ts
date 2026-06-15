export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_COVER_SIZE = 5 * 1024 * 1024;

export const DEFAULT_COVER_ASPECT_RATIO = 16 / 9;

/** @deprecated Use DEFAULT_COVER_ASPECT_RATIO */
export const COVER_ASPECT_RATIO = DEFAULT_COVER_ASPECT_RATIO;

export type CoverAspectPresetId = "16:9" | "4:3" | "3:2" | "21:9";

export const COVER_ASPECT_PRESETS: ReadonlyArray<{
  id: CoverAspectPresetId;
  label: string;
  ratio: number;
}> = [
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "3:2", label: "3:2", ratio: 3 / 2 },
  { id: "21:9", label: "21:9", ratio: 21 / 9 },
];

export function coverAspectPresetById(id: CoverAspectPresetId) {
  return COVER_ASPECT_PRESETS.find((preset) => preset.id === id)!;
}

export function nearestCoverAspectPresetId(ratio: number): CoverAspectPresetId {
  let best = COVER_ASPECT_PRESETS[0];
  let bestDiff = Math.abs(ratio - best.ratio);

  for (const preset of COVER_ASPECT_PRESETS) {
    const diff = Math.abs(ratio - preset.ratio);
    if (diff < bestDiff) {
      best = preset;
      bestDiff = diff;
    }
  }

  return best.id;
}

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
