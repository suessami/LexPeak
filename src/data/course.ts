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
 * Review schedule: one review after every clean block of 3 units — units
 * 1-3 → Review 1 (after Unit 3), 4-6 → Review 2 (after Unit 6), 7-9 →
 * Review 3 (after Unit 9), and so on. Non-overlapping: each unit is
 * covered by exactly one review, not re-tested in the next one too.
 * (The review's own distractor pool can still reach a bit further back
 * via getDistractorPool, so adjacent blocks' words can appear as
 * wrong-answer options without the review "covering" them.)
 */
export const REVIEWS: ReviewSchedule[] = (() => {
  const list: ReviewSchedule[] = [];
  const blocks = Math.floor(TOTAL_UNITS / 3);
  for (let r = 1; r <= blocks; r++) {
    const last = r * 3;
    list.push({ reviewNo: r, afterUnit: last, coversUnits: [last - 2, last - 1, last] });
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
