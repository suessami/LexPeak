import { useEffect, useMemo, useRef, useState } from "react";
import type { WordItem } from "../data/types";
import { shuffle } from "../data/course";
import { computeMinTimeMs } from "../data/timing";
import { formatHeadword } from "../data/idiom";
import TooFastModal from "./TooFastModal";

const MAX_ATTEMPTS = 2;
const MAX_ROUNDS = 3;

/**
 * Stage 4 — word-finding tap game. One clue (the English definition) is
 * shown at a time; the student taps the matching word out of a tile bank
 * that also holds a few decoys from recent units. Tap-only, no typing.
 *
 * A clue allows at most MAX_ATTEMPTS taps, and taps are gated by a
 * read-time minimum scaled to the clue's length (see data/timing) so a
 * memorized-shape guess doesn't beat actually reading it. Two wrong taps
 * in a row means the student is guessing without reading, so that word
 * drops into the wrong pool: the correct tile is revealed, and the word
 * comes back for a fresh attempt in a later round (up to MAX_ROUNDS).
 */
export default function WordFinder({
  words,
  pool,
  onDone,
}: {
  words: WordItem[];
  pool: WordItem[];
  onDone: (wrongIds: string[]) => void;
}) {
  const tiles = useMemo(() => {
    const otherWords = pool.filter((w) => !words.some((u) => u.id === w.id));
    const decoys = shuffle(otherWords).slice(0, 3);
    return shuffle([...words, ...decoys]);
  }, [words, pool]);

  const [roundQueue, setRoundQueue] = useState<WordItem[]>(() => shuffle(words));
  const [roundNum, setRoundNum] = useState(1);
  const [roundWrongs, setRoundWrongs] = useState<WordItem[]>([]);
  const [firstAttemptWrongIds, setFirstAttemptWrongIds] = useState<Set<string>>(
    new Set(),
  );

  const [clueIndex, setClueIndex] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [revealId, setRevealId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [tooFast, setTooFast] = useState(false);
  const [finished, setFinished] = useState(false);
  const startRef = useRef(Date.now());

  const currentClue = roundQueue[clueIndex];
  const minTimeMs = useMemo(
    () => computeMinTimeMs(currentClue?.definitionEn ?? ""),
    [currentClue],
  );

  useEffect(() => {
    startRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClue?.id, roundNum]);

  function goToNext(
    nextFound: Set<string>,
    nextWrongs: WordItem[],
    nextFirstWrongIds: Set<string>,
  ) {
    const nextIndex = clueIndex + 1;
    if (nextIndex < roundQueue.length) {
      setClueIndex(nextIndex);
      setAttemptCount(0);
      setLocked(false);
      return;
    }

    if (nextWrongs.length > 0 && roundNum < MAX_ROUNDS) {
      setRoundQueue(shuffle(nextWrongs));
      setRoundWrongs([]);
      setClueIndex(0);
      setAttemptCount(0);
      setRoundNum((n) => n + 1);
      setLocked(false);
      return;
    }

    // Out of rounds — anything still unresolved just gets marked found so
    // the session can move on.
    if (nextWrongs.length > 0) {
      const finalFound = new Set(nextFound);
      nextWrongs.forEach((w) => finalFound.add(w.id));
      setFoundIds(finalFound);
    }
    setFinished(true);
    setTimeout(() => onDone(Array.from(nextFirstWrongIds)), 500);
  }

  function tap(tile: WordItem) {
    if (locked || !currentClue || foundIds.has(tile.id) || finished) return;

    if (Date.now() - startRef.current < minTimeMs) {
      setTooFast(true);
      return;
    }

    if (tile.id === currentClue.id) {
      const nextFound = new Set(foundIds);
      nextFound.add(tile.id);
      setFoundIds(nextFound);
      setWrongId(null);
      goToNext(nextFound, roundWrongs, firstAttemptWrongIds);
    } else {
      const nextAttempts = attemptCount + 1;
      setLocked(true);
      if (nextAttempts >= MAX_ATTEMPTS) {
        setWrongId(null);
        setRevealId(currentClue.id);
        const nextWrongs = [...roundWrongs, currentClue];
        setRoundWrongs(nextWrongs);
        const nextFirstWrongIds =
          roundNum === 1
            ? new Set(firstAttemptWrongIds).add(currentClue.id)
            : firstAttemptWrongIds;
        if (roundNum === 1) setFirstAttemptWrongIds(nextFirstWrongIds);
        setTimeout(() => {
          setRevealId(null);
          goToNext(foundIds, nextWrongs, nextFirstWrongIds);
        }, 750);
      } else {
        setAttemptCount(nextAttempts);
        setWrongId(tile.id);
        setTimeout(() => {
          setWrongId(null);
          setLocked(false);
        }, 600);
      }
    }
  }

  const roundLabel = roundNum > 1 ? `Round ${roundNum} · Retry missed words` : "Practice";
  const triesLeft = MAX_ATTEMPTS - attemptCount;

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {Math.min(clueIndex + 1, roundQueue.length)} / {roundQueue.length}
        </span>
        <span className="uppercase tracking-wide font-medium text-[#14274d]">
          {roundLabel}
        </span>
      </div>

      <div className="min-h-[3.5rem]">
        <p className="text-slate-700 leading-relaxed">
          {finished || !currentClue
            ? "Nice work!"
            : revealId
              ? "Not quite — here's the word. Let's keep going."
              : currentClue.definitionEn}
        </p>
        {!finished && currentClue && !revealId && (
          <p className="text-xs text-slate-400 mt-1">
            {triesLeft} {triesLeft === 1 ? "try" : "tries"} left
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tiles.map((tile) => {
          const found = foundIds.has(tile.id);
          const wrong = wrongId === tile.id;
          const revealed = revealId === tile.id;
          let style = "border-slate-200 hover:border-[#14274d] hover:bg-orange-50";
          if (found) style = "border-green-500 bg-green-50 opacity-50";
          else if (revealed) style = "border-green-500 bg-green-50";
          else if (wrong) style = "border-red-400 bg-red-50";
          return (
            <button
              key={tile.id}
              disabled={found || locked}
              onClick={() => tap(tile)}
              className={`rounded-xl border px-3 py-3 font-medium text-slate-800 transition ${style}`}
            >
              {formatHeadword(tile.word)}
            </button>
          );
        })}
      </div>

      <TooFastModal
        open={tooFast}
        onClose={() => {
          setTooFast(false);
          startRef.current = Date.now();
        }}
      />
    </div>
  );
}
