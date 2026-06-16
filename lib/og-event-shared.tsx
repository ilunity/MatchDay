import { DEFAULT_COVER_ASPECT_RATIO } from "@/lib/image-constants";
import { ru } from "@/lib/i18n/ru";
import { OG_COLORS, OG_IMAGE_SIZE } from "@/lib/og-image";

const OG_IMAGE_DESCRIPTION_MAX = 150;
const OG_CHAR_WIDTH_FACTOR = 0.55;

export const EVENT_OG_LEFT_PANEL_WIDTH = 540;
export const EVENT_OG_CARD_PADDING = 40;
const EVENT_OG_ROW_GAP = 36;
const EVENT_OG_RIGHT_CONTENT_INSET = 8;
const EVENT_OG_BADGE_HEIGHT = 40;
const EVENT_OG_BADGE_MARGIN_BOTTOM = 28;
const EVENT_OG_DESCRIPTION_MARGIN_TOP = 20;
const EVENT_OG_DESCRIPTION_FONT_SIZE = 22;
const EVENT_OG_DESCRIPTION_LINE_HEIGHT = 1.45;
const EVENT_OG_TITLE_LINE_HEIGHT = 1.15;

export function getEventOgLeftPanelHeight(aspectRatio: number) {
  return EVENT_OG_LEFT_PANEL_WIDTH / aspectRatio;
}

function getEventOgRightContentWidth() {
  return (
    OG_IMAGE_SIZE.width -
    EVENT_OG_CARD_PADDING * 2 -
    EVENT_OG_LEFT_PANEL_WIDTH -
    EVENT_OG_ROW_GAP -
    EVENT_OG_RIGHT_CONTENT_INSET -
    EVENT_OG_CARD_PADDING
  );
}

function getEventOgTitleFontSize(title: string) {
  if (title.length > 48) return 34;
  if (title.length > 32) return 40;
  return 46;
}

function estimateTextLines(
  text: string,
  fontSize: number,
  contentWidth: number
): number {
  if (!text) return 0;
  const charsPerLine = Math.max(
    1,
    Math.floor(contentWidth / (fontSize * OG_CHAR_WIDTH_FACTOR))
  );
  return text.split("\n").reduce((lineCount, segment) => {
    if (segment.length === 0) return lineCount + 1;
    return lineCount + Math.ceil(segment.length / charsPerLine);
  }, 0);
}

function truncateOgDescription(text: string, maxLength: number): string {
  const codePoints = [...text];
  if (codePoints.length <= maxLength) return text;

  let truncated = codePoints.slice(0, maxLength - 1).join("");
  truncated = truncated.replace(/\n$/, "");
  return `${truncated}…`;
}

function computeEventOgRightContentHeight({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const contentWidth = getEventOgRightContentWidth();
  const titleFontSize = getEventOgTitleFontSize(title);
  const titleLines = estimateTextLines(title, titleFontSize, contentWidth);
  const titleHeight = titleLines * titleFontSize * EVENT_OG_TITLE_LINE_HEIGHT;
  const descriptionLines = estimateTextLines(
    description,
    EVENT_OG_DESCRIPTION_FONT_SIZE,
    contentWidth
  );
  const descriptionHeight =
    descriptionLines *
    EVENT_OG_DESCRIPTION_FONT_SIZE *
    EVENT_OG_DESCRIPTION_LINE_HEIGHT;

  return (
    EVENT_OG_BADGE_HEIGHT +
    EVENT_OG_BADGE_MARGIN_BOTTOM +
    titleHeight +
    EVENT_OG_DESCRIPTION_MARGIN_TOP +
    descriptionHeight
  );
}

export function computeEventOgHeight({
  aspectRatio,
  title,
  description,
}: {
  aspectRatio: number;
  title: string;
  description: string;
}) {
  const leftPanelHeight = getEventOgLeftPanelHeight(aspectRatio);
  const rightContentHeight = computeEventOgRightContentHeight({
    title,
    description,
  });

  return (
    EVENT_OG_CARD_PADDING * 2 +
    Math.max(leftPanelHeight, rightContentHeight)
  );
}

export function resolveEventOgDescription(
  description: string | null | undefined,
  title: string
): string {
  const trimmed = description?.trim();
  const text = trimmed || ru.og.eventDescriptionFallback(title);
  return truncateOgDescription(text, OG_IMAGE_DESCRIPTION_MAX);
}

function EventOgBrandBadge() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "28px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: OG_COLORS.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: "20px",
          fontWeight: 700,
        }}
      >
        M
      </div>
      <div style={{ fontSize: "22px", fontWeight: 600, color: OG_COLORS.muted }}>
        {ru.appName}
      </div>
    </div>
  );
}

function EventOgRightContent({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: `0 ${EVENT_OG_CARD_PADDING}px 0 ${EVENT_OG_RIGHT_CONTENT_INSET}px`,
        minWidth: 0,
      }}
    >
      <EventOgBrandBadge />
      <div
        style={{
          fontSize: title.length > 48 ? "34px" : title.length > 32 ? "40px" : "46px",
          fontWeight: 700,
          lineHeight: 1.15,
          color: OG_COLORS.foreground,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: "20px",
          fontSize: "22px",
          lineHeight: 1.45,
          color: OG_COLORS.muted,
          whiteSpace: "pre-wrap",
        }}
      >
        {description}
      </div>
    </div>
  );
}

export function EventOgSplitLayout({
  leftPanel,
  title,
  description,
  leftPanelAspectRatio = DEFAULT_COVER_ASPECT_RATIO,
}: {
  leftPanel: React.ReactNode;
  title: string;
  description: string;
  leftPanelAspectRatio?: number;
}) {
  const leftPanelHeight = getEventOgLeftPanelHeight(leftPanelAspectRatio);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        padding: `${EVENT_OG_CARD_PADDING}px`,
        gap: `${EVENT_OG_ROW_GAP}px`,
        background: OG_COLORS.background,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: `${EVENT_OG_LEFT_PANEL_WIDTH}px`,
          height: `${leftPanelHeight}px`,
          flexShrink: 0,
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
        }}
      >
        {leftPanel}
      </div>
      <EventOgRightContent title={title} description={description} />
    </div>
  );
}

export function EventOgPlaceholderPanel() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${OG_COLORS.accent} 0%, ${OG_COLORS.primary} 100%)`,
      }}
    >
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "28px",
          background: "rgba(255,255,255,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: "64px",
          fontWeight: 700,
        }}
      >
        M
      </div>
    </div>
  );
}
