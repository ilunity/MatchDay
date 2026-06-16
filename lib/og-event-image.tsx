import { DEFAULT_COVER_ASPECT_RATIO } from "@/lib/image-constants";
import { getImageDimensions } from "@/lib/image-dimensions";
import { ImageResponse } from "next/og";
import { ru } from "@/lib/i18n/ru";
import { getObject } from "@/lib/minio";
import { createEventOgFallbackImage } from "@/lib/og-event-fallback";
import {
  EventOgSplitLayout,
  computeEventOgHeight,
  getEventOgLeftPanelHeight,
  EVENT_OG_LEFT_PANEL_WIDTH,
  resolveEventOgDescription,
} from "@/lib/og-event-shared";
import { OG_IMAGE_SIZE } from "@/lib/og-image";

export type CoverImageData = {
  dataUrl: string;
  aspectRatio: number;
};

export async function getCoverImageData(
  key: string
): Promise<CoverImageData | null> {
  try {
    const response = await getObject(key);
    const body = response.Body;

    if (!body) return null;

    const contentType = response.ContentType ?? "image/jpeg";
    if (!contentType.startsWith("image/")) return null;

    const bytes = await body.transformToByteArray();
    const dimensions = getImageDimensions(bytes);
    const aspectRatio =
      dimensions && dimensions.width > 0 && dimensions.height > 0
        ? dimensions.width / dimensions.height
        : DEFAULT_COVER_ASPECT_RATIO;
    const base64 = Buffer.from(bytes).toString("base64");
    return {
      dataUrl: `data:${contentType};base64,${base64}`,
      aspectRatio,
    };
  } catch {
    return null;
  }
}

function createEventOgCoverImage({
  title,
  description,
  coverDataUrl,
  coverAspectRatio,
}: {
  title: string;
  description: string;
  coverDataUrl: string;
  coverAspectRatio: number;
}) {
  const coverHeight = getEventOgLeftPanelHeight(coverAspectRatio);
  const height = computeEventOgHeight({
    aspectRatio: coverAspectRatio,
    title,
    description,
  });

  return new ImageResponse(
    (
      <EventOgSplitLayout
        title={title}
        description={description}
        leftPanelAspectRatio={coverAspectRatio}
        leftPanel={
          /* eslint-disable-next-line @next/next/no-img-element -- required for next/og ImageResponse */
          <img
            src={coverDataUrl}
            alt=""
            style={{
              width: `${EVENT_OG_LEFT_PANEL_WIDTH}px`,
              height: `${coverHeight}px`,
              display: "block",
            }}
          />
        }
      />
    ),
    { width: OG_IMAGE_SIZE.width, height }
  );
}

export function createEventOgImage({
  title,
  description,
  coverDataUrl,
  coverAspectRatio = DEFAULT_COVER_ASPECT_RATIO,
}: {
  title: string;
  description: string;
  coverDataUrl?: string | null;
  coverAspectRatio?: number;
}) {
  if (coverDataUrl) {
    return createEventOgCoverImage({
      title,
      description,
      coverDataUrl,
      coverAspectRatio,
    });
  }

  return createEventOgFallbackImage({ title, description });
}

export async function renderEventOgImage(
  event:
    | {
        title?: string;
        description?: string | null;
        coverImageKey?: string;
      }
    | null
    | undefined
) {
  const title = event?.title ?? ru.appName;
  const description = resolveEventOgDescription(event?.description, title);
  const coverImage = event?.coverImageKey
    ? await getCoverImageData(event.coverImageKey)
    : null;

  return createEventOgImage({
    title,
    description,
    coverDataUrl: coverImage?.dataUrl,
    coverAspectRatio: coverImage?.aspectRatio,
  });
}
