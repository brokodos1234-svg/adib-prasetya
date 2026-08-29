import type { DashboardRaw } from "@/lib/data";

// Produces a ready-to-paste replacement for the DEFAULT_RAW block in lib/data.ts,
// so a daily upload can be made permanent (visible to everyone after redeploy)
// instead of only living in the uploader's browser localStorage.
//
// Accepts anything that *contains* a DashboardRaw (e.g. the derived
// DashboardBundle) and strips it down to exactly the raw fields first —
// pasting extra derived properties into a `const x: DashboardRaw = {...}`
// literal would otherwise fail TypeScript's excess-property check.
export function rawToTsLiteral(source: DashboardRaw): string {
  const raw: DashboardRaw = {
    period: source.period,
    asOf: source.asOf,
    asOfLabel: source.asOfLabel,
    sourceLabel: source.sourceLabel,
    daily: source.daily,
    categories: source.categories,
    sites: source.sites,
    statusBreakdown: source.statusBreakdown,
    deadStock: source.deadStock,
    timeline: source.timeline,
  };
  return `export const DEFAULT_RAW: DashboardRaw = ${JSON.stringify(raw, null, 2)};\n`;
}
