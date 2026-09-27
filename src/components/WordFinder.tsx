import { useMemo, useState } from "react";
import type { WordItem } from "../data/types";
import { shuffle } from "../data/course";

/**
 * Stage 4 — word-finding tap game. One clue (the English definition) is
 * shown at a time; the student taps the matching word out of a tile bank
 * that also holds a few decoys from recent units. Tap-only, no typing.
 */
export default function WordFinder({
  words,
  pool,
  onDone,
}: {
  words: WordItem[];
  pool: WordItem[];
  onDone: () => void;
}) {
  const clueOrder = useMemo(() => shuffle(words), [words]);
  const tiles = useMemo(() => {
    const otherWords = pool.filter((w) => !words.some((u) => u.id === w.id));
    const decoys = shuffle(otherWords).slice(0, 3);
    return shuffle([...words, ...decoys]);
  }, [words, pool]);

  const [clueIndex, setClueIndex] = useState(0);
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);

  const currentClue = clueOrder[clueIndex];
  const isDone = clueIndex >= clueOrder.length;

  function tap(tile: WordItem) {
    if (foundIds.has(tile.id) || isDone) return;
    if (tile.id === currentClue.id) {
      const next = new Set(foundIds);
      next.add(tile.id);
      setFoundIds(next);
      setWrongId(null);
      if (clueIndex + 1 >= clueOrder.length) {
        setTimeout(onDone, 500);
      }
      setClueIndex((i) => i + 1);
    } else {
      setWrongId(tile.id);
      setTimeout(() => setWrongId((id) => (id === tile.id ? null : id)), 400);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {Math.min(clueIndex + 1, clueOrder.length)} / {clueOrder.length}
        </span>
        <span className="uppercase tracking-wide font-medium text-[#14274d]">
          Find the word
        </span>
      </div>

      <p className="text-slate-700 leading-relaxed min-h-[3.5rem]">
        {isDone ? "Nice work!" : currentClue.definitionEn}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {tiles.map((tile) => {
          const found = foundIds.has(tile.id);
          const wrong = wrongId === tile.id;
          let style = "border-slate-200 hover:border-[#14274d] hover:bg-orange-50";
          if (found) style = "border-green-500 bg-green-50 opacity-50";
          else if (wrong) style = "border-red-400 bg-red-50";
          return (
            <button
              key={tile.id}
              disabled={found}
              onClick={() => tap(tile)}
              className={`rounded-xl border px-3 py-3 font-medium text-slate-800 transition ${style}`}
            >
              {tile.word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
