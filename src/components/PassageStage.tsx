import { useMemo, useState } from "react";
import type { WordItem } from "../data/types";
import { buildCloze } from "../data/cloze";
import { shuffle } from "../data/course";

const MAX_ATTEMPTS = 2;

type Blank = {
  id: string;
  before: string;
  after: string;
  correctTileId: string;
};

type Tile = {
  id: string;
  word: string;
};

/**
 * Final stage — a short passage (the unit's own example sentences, one
 * blank each) with a shared word bank that has MORE tiles than blanks.
 * The student has to read each sentence and reason about which word fits,
 * not just pattern-match 1:1, since the bank holds decoys too.
 *
 * A blank allows at most MAX_ATTEMPTS taps. Two wrong taps means the
 * student is guessing without reading the sentence, so the correct word
 * is revealed for that blank (counted as wrong for scoring) and the
 * passage moves on rather than letting them keep clicking.
 */
export default function PassageStage({
  words,
  pool,
  onComplete,
}: {
  words: WordItem[];
  pool: WordItem[];
  onComplete: (correct: number, total: number) => void;
}) {
  const blanks: Blank[] = useMemo(
    () =>
      words.map((w) => {
        const c = buildCloze(w);
        return { id: w.id, before: c.before, after: c.after, correctTileId: w.id };
      }),
    [words],
  );

  const tiles: Tile[] = useMemo(() => {
    const otherWords = pool.filter((w) => !words.some((u) => u.id === w.id));
    const decoys = shuffle(otherWords).slice(0, 3);
    return shuffle([...words, ...decoys]).map((w) => ({ id: w.id, word: w.word }));
  }, [words, pool]);

  const [filled, setFilled] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(blanks.map((b) => [b.id, null])),
  );
  const [activeBlank, setActiveBlank] = useState<string | null>(blanks[0]?.id ?? null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [wrongTileId, setWrongTileId] = useState<string | null>(null);
  const [revealBlankId, setRevealBlankId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState<Set<string>>(new Set());
  const [forcedIds, setForcedIds] = useState<Set<string>>(new Set());

  const usedTileIds = new Set(Object.values(filled).filter(Boolean) as string[]);
  const bankTiles = tiles.filter((t) => !usedTileIds.has(t.id));
  const allFilled = blanks.every((b) => filled[b.id]);

  function selectBlank(blankId: string) {
    if (locked || forcedIds.has(blankId)) return;
    if (filled[blankId]) {
      // Undo: return the word to the bank (only for blanks the student
      // actually solved themselves — a revealed one stays put).
      setFilled((f) => ({ ...f, [blankId]: null }));
      setActiveBlank(blankId);
      setAttemptCount(0);
      return;
    }
    setActiveBlank(blankId);
    setAttemptCount(0);
  }

  function advanceToNext(updatedFilled: Record<string, string | null>, correctCount: number) {
    const nextEmpty = blanks.find((b) => !updatedFilled[b.id]);
    setActiveBlank(nextEmpty ? nextEmpty.id : null);
    setAttemptCount(0);
    if (!nextEmpty) {
      setTimeout(() => onComplete(correctCount, blanks.length), 500);
    }
  }

  function tapTile(tile: Tile) {
    if (!activeBlank || locked) return;
    const blank = blanks.find((b) => b.id === activeBlank)!;

    if (tile.id === blank.correctTileId) {
      const wasFirstTry = attemptCount === 0;
      const updatedFirstTry = wasFirstTry
        ? new Set(firstTryCorrect).add(activeBlank)
        : firstTryCorrect;

      const updatedFilled = { ...filled, [activeBlank]: tile.id };
      setFilled(updatedFilled);
      if (wasFirstTry) setFirstTryCorrect(updatedFirstTry);
      setWrongTileId(null);
      advanceToNext(updatedFilled, updatedFirstTry.size);
    } else {
      const nextAttempts = attemptCount + 1;
      if (nextAttempts >= MAX_ATTEMPTS) {
        // Give up on this blank for now — reveal the correct word so the
        // passage stays readable, mark it forced (no more clicking it),
        // and count it as wrong.
        setLocked(true);
        setWrongTileId(null);
        setRevealBlankId(activeBlank);
        const revealedId = activeBlank;
        const correctCountSoFar = firstTryCorrect.size;
        setTimeout(() => {
          const updatedFilled = { ...filled, [revealedId]: blank.correctTileId };
          setFilled(updatedFilled);
          setForcedIds((s) => new Set(s).add(revealedId));
          setRevealBlankId(null);
          setLocked(false);
          advanceToNext(updatedFilled, correctCountSoFar);
        }, 650);
      } else {
        setAttemptCount(nextAttempts);
        setWrongTileId(tile.id);
        setTimeout(() => setWrongTileId((id) => (id === tile.id ? null : id)), 400);
      }
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Passage</span>
        <span className="uppercase tracking-wide font-medium text-[#14274d]">
          Fill in the blanks
        </span>
      </div>

      <div className="flex flex-col gap-3 text-slate-800 leading-relaxed">
        {blanks.map((b) => {
          const filledId = filled[b.id];
          const filledTile = tiles.find((t) => t.id === filledId);
          const isActive = activeBlank === b.id;
          const isRevealing = revealBlankId === b.id;
          const isForced = forcedIds.has(b.id);
          return (
            <p key={b.id}>
              {b.before}
              <button
                onClick={() => selectBlank(b.id)}
                disabled={locked || isForced}
                className={`inline-block mx-1 px-2 py-0.5 rounded-lg border font-medium ${
                  isRevealing
                    ? "border-green-500 bg-green-50 text-green-700"
                    : filledTile
                      ? isForced
                        ? "border-slate-300 bg-slate-50 text-slate-500"
                        : "border-green-500 bg-green-50 text-green-700"
                      : isActive
                        ? "border-[#e8722c] bg-orange-50 text-slate-400"
                        : "border-slate-300 border-dashed text-slate-400"
                }`}
              >
                {filledTile ? filledTile.word : "______"}
              </button>
              {b.after}
            </p>
          );
        })}
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-400 mb-2">
          {allFilled
            ? "All filled in!"
            : `Tap a blank, then tap the matching word (${MAX_ATTEMPTS - attemptCount} ${
                MAX_ATTEMPTS - attemptCount === 1 ? "try" : "tries"
              } left)`}
        </p>
        <div className="flex flex-wrap gap-2">
          {bankTiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => tapTile(tile)}
              disabled={!activeBlank || locked}
              className={`rounded-xl border px-3 py-2 font-medium text-slate-800 transition ${
                wrongTileId === tile.id
                  ? "border-red-400 bg-red-50"
                  : "border-slate-200 hover:border-[#14274d] hover:bg-orange-50"
              } ${!activeBlank || locked ? "opacity-50" : ""}`}
            >
              {tile.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
