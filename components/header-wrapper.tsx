"use client";

import dynamic from "next/dynamic";

const HeaderInner = dynamic(
  () => import("@/components/header").then((m) => ({ default: m.Header })),
  { ssr: false }
);

export function HeaderWrapper() {
  return <HeaderInner />;
}
