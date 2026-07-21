// Single source of truth for dynamic lucide-icon lookup.
//
// Why this file exists: every `app/*-client.tsx` and the homepage used to
// write `import * as Icons from "lucide-react"` + `(Icons as any)[name]` to
// map a string field into a component. That pulled the entire `lucide-react`
// namespace (~1MB un-bundled) into the chunk graph, made the icon used at
// runtime opaque to tree-shaking, and silently broke for any new icon name
// that hadn't made it into the bundle.
//
// This module pre-resolves each known icon name to its named import so:
//   - tree-shaking works (each icon becomes a real import)
//   - we fail loudly at build time when a config references a missing icon
//     (typo in `icon: "Sward"` is now a type error, not a Circle fallback)
//   - we have ONE place to audit the catalog of icons used in user-facing UI

import {
  Activity,
  Boxes,
  Cable,
  Cloud,
  Container,
  Cpu,
  Database,
  EthernetPort,
  ExternalLink,
  FileCheck,
  FileSearch,
  FileText,
  GitBranch,
  Globe,
  Key,
  KeyRound,
  List,
  Lock,
  Monitor,
  Network,
  PackageOpen,
  Plug,
  Radio,
  Route,
  Satellite,
  ScanLine,
  ScrollText,
  Search,
  Shield,
  ShieldAlert,
  Skull,
  Sparkles,
  Swords,
  Waves,
  Workflow,
  Zap,
  Circle,
  type LucideIcon,
} from "lucide-react";

/** Every icon name referenced from runtime config (categories, agent
 *  categories, etc.) must be a key here. TypeScript will reject typos. */
export const ICONS = {
  Activity,
  Boxes,
  Cable,
  Cloud,
  Container,
  Cpu,
  Database,
  EthernetPort,
  ExternalLink,
  FileCheck,
  FileSearch,
  FileText,
  GitBranch,
  Globe,
  Key,
  KeyRound,
  List,
  Lock,
  Monitor,
  Network,
  PackageOpen,
  Plug,
  Radio,
  Route,
  Satellite,
  ScanLine,
  ScrollText,
  Search,
  Shield,
  ShieldAlert,
  Skull,
  Sparkles,
  Swords,
  Waves,
  Workflow,
  Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

/** Look up a Lucide component by its runtime string name. Falls back to
 *  `Circle` when the name is unknown — defensive only; in practice the
 *  keys above cover every config. */
export function iconByName(name: string): LucideIcon {
  return (ICONS as Record<string, LucideIcon>)[name] ?? Circle;
}
