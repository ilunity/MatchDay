import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
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
              gap: 2,
              padding: 2,
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#2563eb" }} />
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#2563eb" }} />
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#2563eb" }} />
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#2563eb" }} />
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#93c5fd" }} />
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#93c5fd" }} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
