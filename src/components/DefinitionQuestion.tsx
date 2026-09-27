import { useEffect, useMemo, useRef, useState } from "react";
import type { WordItem } from "../data/types";
import { pickDistractors, shuffle } from "../data/course";
import { computeMinTimeMs } from "../data/timing";
import { formatHeadword } from "../data/idiom";
import TooFastModal from "./TooFastModal";

/**
 * Stage 3 — reverse-direction recall: show the word, pick its correct
 * English definition out of 4. Same word, opposite retrieval direction from
 * the cloze quiz, so it's a second real exposure rather than a repeat.
 */
export default function DefinitionQuestion({
  answer,
  pool,
  index,
  total,
  roundLabel,
  onAnswered,
}: {
  answer: WordItem;
  pool: WordItem[];
  index: number;
  total: number;
  roundLabel?: string;
  onAnswered: (correct: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tooFast, setTooFast] = useState(false);
  const startRef = useRef(Date.now());

  const options = useMemo(() => {
    const distractors = pickDistractors(answer, pool, 3);
    return shuffle([answer, ...distractors]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer.id]);

  // Scale the read-time gate to the longest option, not a flat constant —
  // otherwise a student who's seen a word many times can just glance at the
  // first word of each option and tap without ever reading the rest.
  const minTimeMs = useMemo(() => {
    const longest = options.reduce(
      (max, opt) => Math.max(max, opt.definitionEn.length),
      0,
    );
    return computeMinTimeMs("x".repeat(longest));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  useEffect(() => {
    startRef.current = Date.now();
    setSelectedId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer.id, index]);

  function choose(optId: string) {
    if (selectedId) return;

    if (Date.now() - startRef.current < minTimeMs) {
      setTooFast(true);
      return;
    }

    setSelectedId(optId);
  }

  const isCorrect = selectedId === answer.id;

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {index + 1} / {total}
        </span>
        {roundLabel && (
          <span className="uppercase tracking-wide font-medium text-[#e8722c]">
            {roundLabel}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">
          {formatHeadword(answer.word)}
        </h2>
        <span className="text-sm text-slate-400 italic">{answer.pos}</span>
      </div>

      <div className="flex flex-col gap-2">
        {options.map((opt, i) => {
          const isCorrectOpt = opt.id === answer.id;
          const isSelected = selectedId === opt.id;
          let style =
            "border-slate-200 hover:border-[#14274d] hover:bg-orange-50";
          if (selectedId) {
            if (isCorrectOpt) {
              style = "border-green-500 bg-green-50";
            } else if (isSelected) {
              style = "border-red-400 bg-red-50";
            } else {
              style = "border-slate-200 opacity-50";
            }
          }
          return (
            <button
              key={opt.id}
              disabled={!!selectedId}
              onClick={() => choose(opt.id)}
              className={`text-left rounded-xl border px-4 py-3 transition flex gap-2 ${style}`}
            >
              <span className="font-semibold text-slate-400">{i + 1}.</span>
              <span>{opt.definitionEn}</span>
            </button>
          );
        })}
      </div>

      {selectedId && (
        <button
          onClick={() => onAnswered(isCorrect)}
          className="rounded-xl bg-[#14274d] text-white font-medium py-3 hover:opacity-90 transition"
        >
          Continue
        </button>
      )}

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
