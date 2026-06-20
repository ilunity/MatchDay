import type { Metadata } from "next";
import { DEFAULT_COVER_ASPECT_RATIO } from "@/lib/image-constants";
import { ru } from "@/lib/i18n/ru";
import { computeEventOgHeight, resolveEventOgDescription } from "@/lib/og-event-shared";
import { getHomeOgImageSize, OG_IMAGE_SIZE } from "@/lib/og-image";

let warnedAboutBaseUrl = false;

export function getBaseUrl(): string {
  const url =
    process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (
    !warnedAboutBaseUrl &&
    process.env.NODE_ENV === "production" &&
    /localhost|127\.0\.0\.1/.test(url)
  ) {
    warnedAboutBaseUrl = true;
    console.warn(
      "[metadata] Set APP_URL to your public domain in production for correct SEO and OG URLs"
    );
  }

  return url;
}

export const robotsNoIndex: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
};

export const privatePageMetadata: Metadata = {
  robots: robotsNoIndex,
};

export function absoluteUrl(path: string): string {
  const base = getBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function storagePublicUrl(key: string): string {
  return absoluteUrl(`/api/storage/${key}`);
}

export function eventOpenGraphImageUrl(slug: string): string {
  return absoluteUrl(`/e/${encodeURIComponent(slug)}/opengraph-image`);
}

/** @deprecated Use eventOpenGraphImageUrl */
export function eventOgFallbackImageUrl(slug: string): string {
  return eventOpenGraphImageUrl(slug);
}

export function getOgImageUrls(
  images: NonNullable<Metadata["openGraph"]>["images"]
): string[] | undefined {
  if (!images) return undefined;

  const list = Array.isArray(images) ? images : [images];
  return list.map((image) => {
    if (typeof image === "string") return image;
    if (image instanceof URL) return image.toString();
    return typeof image.url === "string" ? image.url : image.url.toString();
  });
}
export function buildEventOgImages({
  slug,
  title,
  description,
  aspectRatio = DEFAULT_COVER_ASPECT_RATIO,
}: {
  slug: string;
  title: string;
  description?: string | null;
  aspectRatio?: number;
}): NonNullable<Metadata["openGraph"]>["images"] {
  const resolvedDescription = resolveEventOgDescription(description, title);
  const height = computeEventOgHeight({
    aspectRatio,
    title,
    description: resolvedDescription,
  });

  return [
    {
      url: eventOpenGraphImageUrl(slug),
      alt: ru.og.eventImageAlt(title),
      width: OG_IMAGE_SIZE.width,
      height,
    },
  ];
}

export function truncateDescription(text: string, maxLength = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildHomeOgImages(): NonNullable<Metadata["openGraph"]>["images"] {
  const { width, height } = getHomeOgImageSize();

  return [
    {
      url: "/opengraph-image",
      alt: ru.og.homeImageAlt,
      width,
      height,
    },
  ];
}

export const defaultOpenGraph: NonNullable<Metadata["openGraph"]> = {
  siteName: ru.appName,
  locale: "ru_RU",
  type: "website",
};

export const defaultTwitter: NonNullable<Metadata["twitter"]> = {
  card: "summary_large_image",
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: ru.appName,
    template: `%s | ${ru.appName}`,
  },
  description: ru.description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  openGraph: defaultOpenGraph,
  twitter: defaultTwitter,
};
