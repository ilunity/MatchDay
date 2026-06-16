import { ImageResponse } from "next/og";
import { ru } from "@/lib/i18n/ru";
import {
  HOME_OG_DESCRIPTION_FONT_SIZE,
  HOME_OG_DESCRIPTION_LINE_HEIGHT,
  HOME_OG_DESCRIPTION_MAX_WIDTH,
  HOME_OG_HORIZONTAL_PADDING,
  HOME_OG_LOGO_GAP,
  HOME_OG_PADDING,
  HOME_OG_TAGLINE_FONT_SIZE,
  HOME_OG_TAGLINE_LINE_HEIGHT,
  HOME_OG_TAGLINE_MAX_WIDTH,
  HOME_OG_TEXT_GAP,
  OG_COLORS,
  getHomeOgImageSize,
} from "@/lib/og-image";

export const alt = ru.og.homeImageAlt;
export const size = getHomeOgImageSize();
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: `${HOME_OG_LOGO_GAP}px`,
          padding: `${HOME_OG_PADDING}px ${HOME_OG_HORIZONTAL_PADDING}px`,
          background: `linear-gradient(135deg, ${OG_COLORS.background} 0%, ${OG_COLORS.accent} 100%)`,
          color: OG_COLORS.foreground,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: OG_COLORS.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            M
          </div>
          <div style={{ fontSize: "40px", fontWeight: 700 }}>{ru.appName}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: `${HOME_OG_TEXT_GAP}px`,
          }}
        >
          <div
            style={{
              fontSize: `${HOME_OG_TAGLINE_FONT_SIZE}px`,
              fontWeight: 700,
              lineHeight: HOME_OG_TAGLINE_LINE_HEIGHT,
              maxWidth: `${HOME_OG_TAGLINE_MAX_WIDTH}px`,
            }}
          >
            {ru.tagline}
          </div>
          <div
            style={{
              fontSize: `${HOME_OG_DESCRIPTION_FONT_SIZE}px`,
              lineHeight: HOME_OG_DESCRIPTION_LINE_HEIGHT,
              color: OG_COLORS.muted,
              maxWidth: `${HOME_OG_DESCRIPTION_MAX_WIDTH}px`,
            }}
          >
            {ru.og.homeDescription}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
