import rawWords from "./course.json";
import type { WordItem, ReviewSchedule } from "./types";

export const ALL_WORDS: WordItem[] = rawWords as WordItem[];

export const TOTAL_UNITS = Math.max(...ALL_WORDS.map((w) => w.unitNo));

export const LAST_B2_UNIT = Math.max(
  ...ALL_WORDS.filter((w) => w.level === "B2").map((w) => w.unitNo),
);

// unitNo -> words in that unit, ordered by slot
const unitIndex = new Map<number, WordItem[]>();
for (const w of ALL_WORDS) {
  const list = unitIndex.get(w.unitNo) ?? [];
  list.push(w);
  unitIndex.set(w.unitNo, list);
}
for (const list of unitIndex.values()) {
  list.sort((a, b) => a.slot - b.slot);
}

export function getUnitWords(unitNo: number): WordItem[] {
  return unitIndex.get(unitNo) ?? [];
}

/**
 * Distractor pool rule: for any word in `unitNo`, wrong-answer candidates
 * are drawn from that unit plus the two units immediately before it.
 * (Applies to both new-unit practice and review sessions.)
 */
export function getDistractorPool(unitNo: number): WordItem[] {
  const lo = Math.max(1, unitNo - 2);
  const pool: WordItem[] = [];
  for (let u = lo; u <= unitNo; u++) {
    pool.push(...getUnitWords(u));
  }
  return pool;
}

/**
 * Review schedule: starts after unit 3, sliding 3-unit window
 * (1-2-3, 2-3-4, 3-4-5, ... up to the last unit).
 */
export const REVIEWS: ReviewSchedule[] = (() => {
  const list: ReviewSchedule[] = [];
  for (let r = 1; r <= TOTAL_UNITS - 2; r++) {
    list.push({ reviewNo: r, afterUnit: r + 2, coversUnits: [r, r + 1, r + 2] });
  }
  return list;
})();

export function getReviewByAfterUnit(unitNo: number): ReviewSchedule | undefined {
  return REVIEWS.find((r) => r.afterUnit === unitNo);
}

export function getReviewWords(review: ReviewSchedule): WordItem[] {
  return review.coversUnits.flatMap((u) => getUnitWords(u));
}

/** Pick `count` random distractors for `answerWord`, excluding the answer itself. */
export function pickDistractors(
  answerWord: WordItem,
  pool: WordItem[],
  count: number,
): WordItem[] {
  const candidates = pool.filter((w) => w.id !== answerWord.id);
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
