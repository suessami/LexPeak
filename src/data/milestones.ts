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
    headline: "Great Start",
    body: "You've cleared a quarter of the units. Keep the streak going!",
    emoji: "🎉",
  },
  {
    afterUnit: Math.round(TOTAL_UNITS * 0.5),
    headline: "Halfway There",
    body: "You're halfway through — solid work. Keep showing up.",
    emoji: "🔥",
  },
  {
    afterUnit: LAST_B2_UNIT,
    headline: "B2 Level Complete",
    body: "You've mastered every B2 word in the course. C1 words are next — you've got this.",
    emoji: "🎓",
    showFox: true,
  },
  {
    afterUnit: Math.round(TOTAL_UNITS * 0.85),
    headline: "Almost There",
    body: "Just a few more units. Keep it up — you're so close.",
    emoji: "🚀",
  },
].sort((a, b) => a.afterUnit - b.afterUnit);

export function getMilestone(unitNo: number): Milestone | undefined {
  return MILESTONES.find((m) => m.afterUnit === unitNo);
}
