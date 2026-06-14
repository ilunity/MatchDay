const MARBLE_PALETTES = [
  ["#C9D8C5", "#E8D5D0", "#A8B5A0", "#F5EDE4"],
  ["#D4E4F0", "#B8C9D9", "#E8F0F5", "#9BB5C9"],
  ["#F5E6D3", "#E8D4B8", "#D4C4A8", "#FAF3EB"],
  ["#E8D5E8", "#D4C4E0", "#F0E8F5", "#C9B8D9"],
  ["#F5D5D5", "#E8C4C4", "#FAE8E8", "#D9A8A8"],
  ["#E8E0D4", "#D9CFC0", "#F5F0E8", "#C4B8A8"],
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getMarblePalette(userId: string): readonly string[] {
  return MARBLE_PALETTES[hashString(userId) % MARBLE_PALETTES.length];
}

export const getAvatarPalette = getMarblePalette;

export const AVATAR_PALETTES = MARBLE_PALETTES;

type MarbleCircle = {
  cx: number;
  cy: number;
  r: number;
  fill: string;
};

function buildMarbleCircles(userId: string, palette: readonly string[]): MarbleCircle[] {
  return [0, 1, 2, 3].map((index) => {
    const seed = hashString(`${userId}:${index}`);
    return {
      cx: 15 + (seed % 70),
      cy: 15 + ((seed >> 8) % 70),
      r: 28 + ((seed >> 16) % 32),
      fill: palette[index % palette.length],
    };
  });
}

export function buildMarbleAvatarSvg(userId: string, size = 80): string {
  const palette = getMarblePalette(userId);
  const circles = buildMarbleCircles(userId, palette);
  const circleMarkup = circles
    .map(
      (circle) =>
        `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="${circle.fill}" />`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="${size}" height="${size}"><rect width="80" height="80" fill="${palette[0]}" />${circleMarkup}</svg>`;
}

export function buildMarbleAvatarDataUrl(userId: string, size = 80): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(buildMarbleAvatarSvg(userId, size))}`;
}
