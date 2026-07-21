import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/* Apple touch icon served at /apple-icon.png — bigger and richer than
 * the favicon, displayed by iOS when the user adds the site to their
 * home screen. The square logo with the brand gradient carries over
 * from /icon.tsx. */

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
          background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
          color: "white",
          fontWeight: 800,
          fontSize: 96,
          fontFamily: "system-ui",
          letterSpacing: "-0.05em",
        }}
      >
        sb
      </div>
    ),
    { ...size },
  );
}
