import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        borderRadius: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          fontFamily: "Arial, sans-serif",
          fontSize: 30,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        iV
        <div
          style={{
            width: 8,
            height: 8,
            marginLeft: 3,
            marginBottom: 4,
            borderRadius: "50%",
            background: "#ebd7be",
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
