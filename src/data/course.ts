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
  // Same part of speech first, so a wrong option can't be ruled out just by
  // its shape (e.g. a phrase offered for a noun slot); other words only
  // fill in if the pool runs short of same-POS candidates.
  const candidates = pool.filter((w) => w.id !== answerWord.id);
  const same = shuffle(candidates.filter((w) => w.pos === answerWord.pos));
  // A 3-unit window often holds only one or two words of a given part of
  // speech, so if it runs short, borrow same-POS words from a few earlier
  // (already studied) units before falling back to other parts of speech.
  if (same.length < count) {
    const seen = new Set([answerWord.id, ...candidates.map((w) => w.id)]);
    const minUnit = Math.min(...pool.map((w) => w.unitNo), answerWord.unitNo);
    const extra: WordItem[] = [];
    for (let u = Math.max(1, minUnit - 6); u < minUnit; u++) {
      extra.push(...getUnitWords(u).filter((w) => w.pos === answerWord.pos && !seen.has(w.id)));
    }
    same.push(...shuffle(extra).slice(0, count - same.length));
  }
  const other = shuffle(candidates.filter((w) => w.pos !== answerWord.pos));
  return [...same, ...other].slice(0, count);
}

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
