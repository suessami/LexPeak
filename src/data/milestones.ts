import { TOTAL_UNITS, LAST_B2_UNIT } from "./course";

export type Milestone = {
  afterUnit: number;
  headline: string;
  body: string;
  emoji: string;
  showFox?: boolean;
};

export const MILESTONES: Milestone[] = [
  {
    afterUnit: Math.round(TOTAL_UNITS * 0.25),
    headline: "Basecamp Cleared",
    body: "You've finished a quarter of the climb. Keep going!",
    emoji: "🏕️",
  },
  {
    afterUnit: Math.round(TOTAL_UNITS * 0.5),
    headline: "Halfway Up the Mountain",
    body: "You're halfway to the peak. The view only gets better from here.",
    emoji: "⛰️",
  },
  {
    afterUnit: LAST_B2_UNIT,
    headline: "B2 Level Complete",
    body: "You've mastered every B2 word in the course. From here on, it's all C1 — the air gets thinner!",
    emoji: "🎓",
    showFox: true,
  },
  {
    afterUnit: Math.round(TOTAL_UNITS * 0.85),
    headline: "Almost at the Summit",
    body: "Just a little further. The peak is in sight!",
    emoji: "🌄",
  },
].sort((a, b) => a.afterUnit - b.afterUnit);

export function getMilestone(unitNo: number): Milestone | undefined {
  return MILESTONES.find((m) => m.afterUnit === unitNo);
}
