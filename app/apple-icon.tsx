import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

const COLS = 7;
const ROWS = 5;
const HIGHLIGHT_INDEX = 17;

export default function AppleIcon() {
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => {
    const isHighlight = i === HIGHLIGHT_INDEX;
    return (
      <div
        key={i}
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: isHighlight ? "#2563eb" : "#e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isHighlight ? (
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M1.5 5 L4 7.5 L8.5 2.5"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
    );
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2563eb",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 112,
            height: 100,
            background: "white",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: 28,
              background: "#1d4ed8",
              width: "100%",
            }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              padding: 10,
              alignContent: "flex-start",
            }}
          >
            {cells}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
