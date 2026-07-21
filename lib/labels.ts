// Shared Chinese label helpers for tool-level enums (difficulty / platform)
// so we don't render raw English slugs to users.
//
// Both helpers accept the full enum union plus an "all" sentinel for filter
// chips. They fall back to the raw string for unknown values to stay
// forward-compatible if new enum members are added without updating the map.

import type { Difficulty, Platform } from "@/lib/tools";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "入门",
  medium: "进阶",
  hard: "高级",
};

export function difficultyLabel(d: Difficulty): string {
  return DIFFICULTY_LABELS[d] ?? d;
}

export function platformLabel(p: Platform | "all"): string {
  switch (p) {
    case "all":
      return "全部";
    case "linux":
      return "Linux";
    case "macos":
      return "macOS";
    case "windows":
      return "Windows";
    case "web":
      return "Web";
    default:
      return p;
  }
}