import { ru } from "@/lib/i18n/ru";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const HOME_OG_PADDING = 48;
export const HOME_OG_HORIZONTAL_PADDING = 80;
export const HOME_OG_LOGO_GAP = 44;
export const HOME_OG_LOGO_ROW_HEIGHT = 56;
export const HOME_OG_TEXT_GAP = 20;
export const HOME_OG_TAGLINE_FONT_SIZE = 56;
export const HOME_OG_TAGLINE_LINE_HEIGHT = 1.15;
export const HOME_OG_TAGLINE_MAX_WIDTH = 900;
export const HOME_OG_DESCRIPTION_FONT_SIZE = 28;
export const HOME_OG_DESCRIPTION_LINE_HEIGHT = 1.4;
export const HOME_OG_DESCRIPTION_MAX_WIDTH = 860;

const HOME_OG_CHAR_WIDTH_FACTOR = 0.55;

function estimateTextLines(
  text: string,
  fontSize: number,
  contentWidth: number
): number {
  if (!text) return 0;
  const charsPerLine = Math.max(
    1,
    Math.floor(contentWidth / (fontSize * HOME_OG_CHAR_WIDTH_FACTOR))
  );
  return Math.ceil(text.length / charsPerLine);
}

export function computeHomeOgHeight({
  tagline,
  description,
}: {
  tagline: string;
  description: string;
}): number {
  const taglineLines = estimateTextLines(
    tagline,
    HOME_OG_TAGLINE_FONT_SIZE,
    HOME_OG_TAGLINE_MAX_WIDTH
  );
  const taglineHeight =
    taglineLines * HOME_OG_TAGLINE_FONT_SIZE * HOME_OG_TAGLINE_LINE_HEIGHT;

  const descriptionLines = estimateTextLines(
    description,
    HOME_OG_DESCRIPTION_FONT_SIZE,
    HOME_OG_DESCRIPTION_MAX_WIDTH
  );
  const descriptionHeight =
    descriptionLines *
    HOME_OG_DESCRIPTION_FONT_SIZE *
    HOME_OG_DESCRIPTION_LINE_HEIGHT;

  return Math.ceil(
    HOME_OG_PADDING +
      HOME_OG_LOGO_ROW_HEIGHT +
      HOME_OG_LOGO_GAP +
      taglineHeight +
      HOME_OG_TEXT_GAP +
      descriptionHeight +
      HOME_OG_PADDING
  );
}

export function getHomeOgImageSize({
  tagline = ru.tagline,
  description = ru.og.homeDescription,
}: {
  tagline?: string;
  description?: string;
} = {}) {
  return {
    width: OG_IMAGE_SIZE.width,
    height: computeHomeOgHeight({ tagline, description }),
  } as const;
}

export const OG_COLORS = {
  primary: "#2563eb",
  background: "#ffffff",
  foreground: "#0a0a0a",
  muted: "#737373",
  accent: "#dbeafe",
} as const;
