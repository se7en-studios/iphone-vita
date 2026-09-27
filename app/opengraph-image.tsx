import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          fontSize: 88,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        <span style={{ fontWeight: 700 }}>iPhone</span>
        <span style={{ fontWeight: 300, marginLeft: 16 }}>Vita</span>
        <div
          style={{
            width: 16,
            height: 16,
            marginLeft: 10,
            marginBottom: 18,
            borderRadius: "50%",
            background: "#ebd7be",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 24,
          fontSize: 30,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        iPhone sellados · garantía oficial · semi nuevos revisados
      </div>
    </div>,
    { ...size },
  );
}
