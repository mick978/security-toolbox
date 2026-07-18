// Backwards-compatible re-export. All data lives in lib/github-projects.ts
// (verified real GitHub repos). The homepage imports `securityAgents` and
// `agentCategories`; we re-export the same names so `app/page.tsx` only needs
// minimal edits.
export { agentProjects as securityAgents } from "@/lib/github-projects";
export { securityAreas as agentCategories } from "@/lib/github-projects";
export type { SecurityArea as AgentCategory } from "@/lib/github-projects";
export type { GitHubProject as SecurityAgent } from "@/lib/github-projects";
