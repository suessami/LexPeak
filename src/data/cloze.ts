import type { WordItem } from "./types";

export interface ClozeParts {
  before: string;
  blank: string;
  after: string;
}

/** Splits an example sentence into the part before/after the word being tested. */
export function buildCloze(item: WordItem): ClozeParts {
  const { example, clozeSurface } = item;
  const idx = example.toLowerCase().indexOf(clozeSurface.toLowerCase());
  if (idx === -1) {
    // Shouldn't happen (validated at data-build time), but fail safe.
    return { before: example, blank: "", after: "" };
  }
  return {
    before: example.slice(0, idx),
    blank: example.slice(idx, idx + clozeSurface.length),
    after: example.slice(idx + clozeSurface.length),
  };
}
