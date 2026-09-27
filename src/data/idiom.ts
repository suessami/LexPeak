import type { WordItem } from "./types";

export interface IdiomSplit {
  head: string;
  middle: string;
  tail: string;
}

/**
 * Idiom words are stored in dictionary form with an internal "~" marking a
 * free object slot (e.g. "take ~ into account"). `clozeSurface` holds the
 * real text as it appears in the example sentence, with that slot filled in
 * (e.g. "take the narrator's limited knowledge into account"). This tries
 * to locate the two fixed anchor pieces (head/tail) inside the real surface
 * text, so callers can highlight only the tested idiom and leave the free
 * content in between alone. Falls back to treating the whole surface as one
 * piece when the anchors can't be reliably matched (a trailing-slot idiom
 * with nothing captured after it, an inflected verb, multiple "~"s, etc.) —
 * degrading to "no split" is always safe; showing a bare "~" is not.
 */
export function splitIdiomSurface(item: WordItem): IdiomSplit {
  const surface = item.clozeSurface;
  if (!item.word.includes("~")) {
    return { head: surface, middle: "", tail: "" };
  }

  const rawParts = item.word.split("~");
  if (rawParts.length !== 2) {
    // More than one "~" (e.g. "contrasts ~ with ~ to emphasise ...") is
    // rare and not worth a fragile multi-way split.
    return { head: surface, middle: "", tail: "" };
  }
  if (/^\S/.test(rawParts[1])) {
    // A suffix glued directly onto the slot ("~ing" in "amuses the
    // audience by ~ing") isn't a separate word — splitting it out would
    // style-break a single inflected word (e.g. "exaggerat" + "ing").
    return { head: surface, middle: "", tail: "" };
  }
  const [headRaw, tailRaw] = rawParts.map((s) => s.trim());
  if (!tailRaw) {
    // Trailing-slot idiom ("when it comes to ~") — clozeSurface only ever
    // captures the fixed anchor, so there's nothing to split.
    return { head: surface, middle: "", tail: "" };
  }

  const headIdx = headRaw ? surface.toLowerCase().indexOf(headRaw.toLowerCase()) : 0;
  const tailIdx = surface.toLowerCase().lastIndexOf(tailRaw.toLowerCase());

  if (headIdx !== -1 && tailIdx !== -1 && tailIdx >= headIdx + headRaw.length) {
    return {
      head: surface.slice(headIdx, headIdx + headRaw.length),
      middle: surface.slice(headIdx + headRaw.length, tailIdx),
      tail: surface.slice(tailIdx, tailIdx + tailRaw.length),
    };
  }

  // Couldn't reliably locate both anchors (inflected verb, etc.) — treat
  // the whole surface as one piece rather than guessing wrong.
  return { head: surface, middle: "", tail: "" };
}

/**
 * Standalone headword display (flashcards, tile labels, MCQ options) —
 * never show a bare "~"; "sb/sth" is the standard dictionary convention
 * for this exact kind of open object slot.
 */
export function formatHeadword(word: string): string {
  if (!word.includes("~")) return word;
  // "~ing" (e.g. "amuses the audience by ~ing") is a glued gerund suffix,
  // not a separate word — "sb/sthing" would read as broken, so this
  // becomes a natural gerund placeholder instead.
  return word.replace(/~ing\b/g, "doing sth").replace(/~/g, "sb/sth");
}
