import { ImageResponse } from "next/og";
import { DEFAULT_COVER_ASPECT_RATIO } from "@/lib/image-constants";
import {
  EventOgPlaceholderPanel,
  EventOgSplitLayout,
  computeEventOgHeight,
} from "@/lib/og-event-shared";
import { OG_IMAGE_SIZE } from "@/lib/og-image";

export function createEventOgFallbackImage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const height = computeEventOgHeight({
    aspectRatio: DEFAULT_COVER_ASPECT_RATIO,
    title,
    description,
  });

  return new ImageResponse(
    (
      <EventOgSplitLayout
        title={title}
        description={description}
        leftPanel={<EventOgPlaceholderPanel />}
      />
    ),
    { width: OG_IMAGE_SIZE.width, height }
  );
}
