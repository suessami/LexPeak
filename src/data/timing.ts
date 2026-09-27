/**
 * Minimum dwell time before an answer can be submitted, scaled to how much
 * text the student actually has to read. A flat 1-second gate stops reflex
 * tapping on a single word, but isn't enough to make someone read a full
 * sentence or definition before answering — longer text gets a longer
 * minimum, capped so it never feels punitive.
 */
export function computeMinTimeMs(text: string): number {
  const BASE_MS = 900;
  const MS_PER_CHAR = 22;
  const CAP_MS = 4000;
  return Math.min(CAP_MS, Math.max(BASE_MS, text.length * MS_PER_CHAR));
}
