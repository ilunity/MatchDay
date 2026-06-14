import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

const COLS = 4;
const ROWS = 3;
const HIGHLIGHT_INDEX = 5;

export default function Icon() {
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => {
    const isHighlight = i === HIGHLIGHT_INDEX;
    return (
      <div
        key={i}
        style={{
          width: 3,
          height: 3,
          borderRadius: 1,
          background: isHighlight ? "#2563eb" : "#e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isHighlight ? (
          <svg width="4" height="4" viewBox="0 0 10 10">
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
          borderRadius: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 20,
            height: 18,
            background: "white",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: 5,
              background: "#1d4ed8",
              width: "100%",
            }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              padding: 2,
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
