import type { WordItem } from "./types";
import { splitIdiomSurface } from "./idiom";

export interface ClozeSegment {
  text: string;
  blank: boolean;
}

export interface ClozeParts {
  segments: ClozeSegment[];
}

/**
 * Splits an example sentence into text/blank segments around the word (or
 * idiom) being tested. For a plain word this is just before/blank/after —
 * one blank. For a mid-phrase idiom like "take ~ into account", the real
 * sentence has genuine content sitting inside the idiom ("take THE
 * NARRATOR'S LIMITED KNOWLEDGE into account"), so blanking the whole span
 * would hide plain sentence content that has nothing to do with the tested
 * vocabulary. Instead this blanks only the two fixed anchors and leaves the
 * inserted content visible as a plain segment in between.
 */
export function buildCloze(item: WordItem): ClozeParts {
  const { example, clozeSurface } = item;
  const idx = example.toLowerCase().indexOf(clozeSurface.toLowerCase());
  if (idx === -1) {
    // Shouldn't happen (validated at data-build time), but fail safe.
    return { segments: [{ text: example, blank: false }] };
  }

  const before = example.slice(0, idx);
  const after = example.slice(idx + clozeSurface.length);
  const { head, middle, tail } = splitIdiomSurface(item);

  if (tail) {
    return {
      segments: [
        { text: before, blank: false },
        { text: head, blank: true },
        { text: middle, blank: false },
        { text: tail, blank: true },
        { text: after, blank: false },
      ],
    };
  }

  return {
    segments: [
      { text: before, blank: false },
      { text: head, blank: true },
      { text: after, blank: false },
    ],
  };
}
