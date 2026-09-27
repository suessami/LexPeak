import type { WordItem } from "./types";

/**
 * Hand-authored review passages ("Part 2" of a review).
 *
 * Unlike the unit Win-stage passage (which reuses each word's own example
 * sentence), a review passage is a genuinely NEW short text that puts a
 * subset of the review's words into a fresh context — testing whether a
 * student can apply the word, not just recall its meaning from a sentence
 * they've already memorized.
 *
 * `paragraphs` holds the passage text, with each blank marked inline as
 * `{{wordId}}` (wordId must be one of the words covered by that review).
 * `blanks` gives, for each marked wordId, the exact text that belongs in
 * that blank — i.e. the real inflected/surface form as authored for this
 * passage (analogous to a unit word's `clozeSurface`, but written fresh
 * rather than pulled from `example`). This is required for idiom words
 * (a "~" placeholder like "take ~ into account" has no natural surface of
 * its own here) and also lets a pure word be authored in an inflected form
 * ("intensifies") without needing to match `example` at all.
 *
 * A bracketing idiom (fixed head + free middle + fixed tail, e.g.
 * "take ~ into account") uses `head`/`tail` instead of `surface`, paired
 * with TWO markers in the paragraph — `{{wordId#head}}` and
 * `{{wordId#tail}}` — with the free object written as ordinary plain text
 * in between. Both markers share one blank: tapping either activates the
 * same tile choice, and a correct pick fills both at once. This keeps the
 * free object visible as context from the start (unlike a trailing-slot
 * idiom's single `{{wordId}}`, which is followed by plain text but starts
 * as one closed blank) while never surprising the student with an object
 * appearing only after the blank is answered.
 *
 * This is a pilot: only reviews with an entry here get the extra passage
 * stage. Reviews without one keep the existing (word-quiz-only) flow.
 */
export interface ReviewPassageBlank {
  wordId: string;
  surface?: string;
  head?: string;
  tail?: string;
}

export interface ReviewPassage {
  reviewNo: number;
  paragraphs: string[];
  blanks: ReviewPassageBlank[];
}

export const REVIEW_PASSAGES: ReviewPassage[] = [
  {
    reviewNo: 1,
    paragraphs: [
      "Maria runs a small café in the old town. Every morning, the {{u001-w1}} of freshly ground coffee fills the shop before the first customer arrives, though {{u001-w2}} weather can keep people away entirely.",
      "Maria is picky about where her ingredients come from. {{u001-w4}} choosing beans, she trusts only one local supplier who has never let her down. She also serves an {{u002-w1}} blend for customers who avoid caffeine, and the shop's warm wooden decor {{u002-w2}} a cozy, homey feeling the moment you walk in.",
      "Maria's café sits between a wealthy suburb and a working-class neighborhood, so setting a fair price is never simple. Before raising anything, she {{u003-w1#head}} the neighborhood's average income{{u003-w1#tail}}, since she never wants to lose regulars over a few cents. As the afternoon rush {{u003-w2}}, the line stretches out the door — but she'd rather {{u003-w3}} loyal customers than chase a quick sale. On {{u003-w4}} summer days, iced drinks outsell hot ones three to one.",
    ],
    blanks: [
      { wordId: "u001-w1", surface: "aroma" },
      { wordId: "u001-w2", surface: "adverse" },
      { wordId: "u001-w4", surface: "When it comes to" },
      { wordId: "u002-w1", surface: "alternate" },
      { wordId: "u002-w2", surface: "conveys" },
      { wordId: "u003-w1", head: "takes", tail: "into account" },
      { wordId: "u003-w2", surface: "intensifies" },
      { wordId: "u003-w3", surface: "cultivate" },
      { wordId: "u003-w4", surface: "humid" },
    ],
  },
];

const byReviewNo = new Map<number, ReviewPassage>(
  REVIEW_PASSAGES.map((p) => [p.reviewNo, p]),
);

export function getReviewPassage(reviewNo: number): ReviewPassage | undefined {
  return byReviewNo.get(reviewNo);
}

/** Builds a synthetic WordItem carrying the authored surface for this passage,
 *  so the same idiom-split / display logic used elsewhere (`splitIdiomSurface`,
 *  `FilledWord`) can be reused without changes. */
export function withAuthoredSurface(item: WordItem, surface: string): WordItem {
  return { ...item, clozeSurface: surface };
}
