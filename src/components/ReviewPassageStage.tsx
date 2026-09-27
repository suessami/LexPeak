import { useEffect, useMemo, useRef, useState } from "react";
import type { WordItem } from "../data/types";
import type { ReviewPassage } from "../data/reviewPassages";
import { withAuthoredSurface } from "../data/reviewPassages";
import { shuffle } from "../data/course";
import { computeMinTimeMs } from "../data/timing";
import { formatHeadword, splitIdiomSurface } from "../data/idiom";
import TooFastModal from "./TooFastModal";

const MAX_ATTEMPTS = 2;

type Segment = { text: string; wordId?: string };
type Tile = { id: string; word: string };

function FilledWord({ item }: { item: WordItem }) {
  const { head, middle, tail } = splitIdiomSurface(item);
  if (!tail) {
    return <span className="underline decoration-2 underline-offset-2">{head}</span>;
  }
  return (
    <>
      <span className="underline decoration-2 underline-offset-2">{head}</span>
      <span>{middle}</span>
      <span className="underline decoration-2 underline-offset-2">{tail}</span>
    </>
  );
}

function parseParagraph(text: string): Segment[] {
  const segments: Segment[] = [];
  const re = /\{\{(.*?)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index) });
    }
    segments.push({ text: "", wordId: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }
  return segments;
}

/**
 * Review "Part 2" — a genuinely new passage (not reused unit examples)
 * covering a subset of the review's words in a fresh context, so a student
 * has to apply the word rather than just recognize a sentence they've
 * already memorized. Same tap-to-fill mechanics as the unit Win stage
 * (2-attempt cap, lock-on-wrong, reveal-after-max, min-time read gate).
 */
export default function ReviewPassageStage({
  passage,
  reviewWords,
  onComplete,
}: {
  passage: ReviewPassage;
  reviewWords: WordItem[];
  onComplete: (correct: number, total: number) => void;
}) {
  const wordById = useMemo(
    () => new Map(reviewWords.map((w) => [w.id, w])),
    [reviewWords],
  );
  const surfaceByWordId = useMemo(
    () => new Map(passage.blanks.map((b) => [b.wordId, b.surface])),
    [passage],
  );

  const parsedParagraphs = useMemo(
    () => passage.paragraphs.map(parseParagraph),
    [passage],
  );

  const blankIds = useMemo(() => {
    const ids: string[] = [];
    for (const para of parsedParagraphs) {
      for (const seg of para) {
        if (seg.wordId) ids.push(seg.wordId);
      }
    }
    return ids;
  }, [parsedParagraphs]);

  // Which paragraph each blank lives in, so the min-time gate is based on
  // that sentence's own reading length (not the whole passage).
  const paragraphOf = useMemo(() => {
    const map = new Map<string, number>();
    parsedParagraphs.forEach((para, i) => {
      para.forEach((seg) => {
        if (seg.wordId) map.set(seg.wordId, i);
      });
    });
    return map;
  }, [parsedParagraphs]);

  const paragraphPlainText = useMemo(
    () =>
      parsedParagraphs.map((para) =>
        para.map((seg) => (seg.wordId ? "____" : seg.text)).join(""),
      ),
    [parsedParagraphs],
  );

  const tiles: Tile[] = useMemo(() => {
    const usedIds = new Set(blankIds);
    const unused = reviewWords.filter((w) => !usedIds.has(w.id));
    const decoys = shuffle(unused).slice(0, 3);
    const blankWords = blankIds.map((id) => wordById.get(id)!).filter(Boolean);
    return shuffle([...blankWords, ...decoys]).map((w) => ({ id: w.id, word: w.word }));
  }, [blankIds, reviewWords, wordById]);

  const [filled, setFilled] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(blankIds.map((id) => [id, null])),
  );
  const [activeBlank, setActiveBlank] = useState<string | null>(blankIds[0] ?? null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [wrongTileId, setWrongTileId] = useState<string | null>(null);
  const [revealBlankId, setRevealBlankId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState<Set<string>>(new Set());
  const [forcedIds, setForcedIds] = useState<Set<string>>(new Set());
  const [tooFast, setTooFast] = useState(false);
  const startRef = useRef(Date.now());

  const usedTileIds = new Set(Object.values(filled).filter(Boolean) as string[]);
  const bankTiles = tiles.filter((t) => !usedTileIds.has(t.id));
  const allFilled = blankIds.every((id) => filled[id]);

  const minTimeMs = useMemo(() => {
    if (!activeBlank) return 0;
    const paraIdx = paragraphOf.get(activeBlank);
    const context = paraIdx !== undefined ? paragraphPlainText[paraIdx] : "";
    return computeMinTimeMs(context);
  }, [activeBlank, paragraphOf, paragraphPlainText]);

  useEffect(() => {
    startRef.current = Date.now();
  }, [activeBlank]);

  function selectBlank(id: string) {
    if (locked || forcedIds.has(id)) return;
    if (filled[id]) {
      setFilled((f) => ({ ...f, [id]: null }));
      setActiveBlank(id);
      setAttemptCount(0);
      return;
    }
    setActiveBlank(id);
    setAttemptCount(0);
  }

  function advanceToNext(updatedFilled: Record<string, string | null>, correctCount: number) {
    const nextEmpty = blankIds.find((id) => !updatedFilled[id]);
    setActiveBlank(nextEmpty ?? null);
    setAttemptCount(0);
    if (!nextEmpty) {
      setTimeout(() => onComplete(correctCount, blankIds.length), 500);
    }
  }

  function tapTile(tile: Tile) {
    if (!activeBlank || locked) return;

    if (Date.now() - startRef.current < minTimeMs) {
      setTooFast(true);
      return;
    }

    if (tile.id === activeBlank) {
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
        setLocked(true);
        setWrongTileId(null);
        setRevealBlankId(activeBlank);
        const revealedId = activeBlank;
        const correctCountSoFar = firstTryCorrect.size;
        setTimeout(() => {
          const updatedFilled = { ...filled, [revealedId]: revealedId };
          setFilled(updatedFilled);
          setForcedIds((s) => new Set(s).add(revealedId));
          setRevealBlankId(null);
          setLocked(false);
          advanceToNext(updatedFilled, correctCountSoFar);
        }, 650);
      } else {
        setAttemptCount(nextAttempts);
        setWrongTileId(tile.id);
        setLocked(true);
        setTimeout(() => {
          setWrongTileId(null);
          setLocked(false);
        }, 600);
      }
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Review Passage</span>
        <span className="uppercase tracking-wide font-medium text-[#14274d]">
          Apply It
        </span>
      </div>

      <div className="flex flex-col gap-3 text-slate-800 leading-relaxed">
        {parsedParagraphs.map((para, pIdx) => (
          <p key={pIdx}>
            {para.map((seg, sIdx) => {
              if (!seg.wordId) return <span key={sIdx}>{seg.text}</span>;
              const id = seg.wordId;
              const filledId = filled[id];
              const isActive = activeBlank === id;
              const isRevealing = revealBlankId === id;
              const isForced = forcedIds.has(id);
              const surface = surfaceByWordId.get(id) ?? "";
              const wordItem = wordById.get(id);
              return (
                <button
                  key={sIdx}
                  onClick={() => selectBlank(id)}
                  disabled={locked || isForced}
                  className={`inline-block mx-1 px-2 py-0.5 rounded-lg border font-medium ${
                    isRevealing
                      ? "border-green-500 bg-green-50 text-green-700"
                      : filledId
                        ? isForced
                          ? "border-slate-300 bg-slate-50 text-slate-500"
                          : "border-green-500 bg-green-50 text-green-700"
                        : isActive
                          ? "border-[#e8722c] bg-orange-50 text-slate-400"
                          : "border-slate-300 border-dashed text-slate-400"
                  }`}
                >
                  {filledId && wordItem ? (
                    <FilledWord item={withAuthoredSurface(wordItem, surface)} />
                  ) : (
                    "______"
                  )}
                </button>
              );
            })}
          </p>
        ))}
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
              {formatHeadword(tile.word)}
            </button>
          ))}
        </div>
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
