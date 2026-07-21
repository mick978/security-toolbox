import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/* Auto-generated favicon served at /icon.svg-fallback and the
 * /favicon.ico browser-auto endpoint. Solid Shield mark in brand
 * purple, white underline. */

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
          background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
          color: "white",
          fontWeight: 800,
          fontSize: 22,
          fontFamily: "system-ui",
          letterSpacing: "-0.04em",
        }}
      >
        sb
      </div>
    ),
    { ...size },
  );
}
