import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
              gap: 10,
              padding: 14,
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#2563eb" }} />
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#2563eb" }} />
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#2563eb" }} />
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#2563eb" }} />
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#93c5fd" }} />
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#93c5fd" }} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
