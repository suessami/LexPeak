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
 * This is a pilot: only reviews with an entry here get the extra passage
 * stage. Reviews without one keep the existing (word-quiz-only) flow.
 */
export interface ReviewPassageBlank {
  wordId: string;
  surface: string;
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
      "{{u001-w4}}, she trusts only one local supplier who has never let her down. She also serves an {{u002-w1}} blend for customers who avoid caffeine, and the shop's warm wooden decor {{u002-w2}} a cozy, homey feeling the moment you walk in.",
      "When setting her prices, Maria {{u003-w1}}, since she never wants to lose regulars over a few cents. As the afternoon rush {{u003-w2}}, the line stretches out the door — but she'd rather {{u003-w3}} loyal customers than chase a quick sale. On {{u003-w4}} summer days, iced drinks outsell hot ones three to one.",
    ],
    blanks: [
      { wordId: "u001-w1", surface: "aroma" },
      { wordId: "u001-w2", surface: "adverse" },
      { wordId: "u001-w4", surface: "When it comes to choosing beans" },
      { wordId: "u002-w1", surface: "alternate" },
      { wordId: "u002-w2", surface: "conveys" },
      { wordId: "u003-w1", surface: "takes the neighborhood's average income into account" },
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
