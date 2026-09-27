import { useEffect, useMemo, useRef, useState } from "react";
import type { WordItem } from "../data/types";
import { buildCloze } from "../data/cloze";
import { pickDistractors, shuffle } from "../data/course";
import { computeMinTimeMs } from "../data/timing";
import TooFastModal from "./TooFastModal";

export default function QuizQuestion({
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
  const cloze = useMemo(() => buildCloze(answer), [answer]);
  const minTimeMs = useMemo(
    () => computeMinTimeMs(`${cloze.before} ${cloze.after}`),
    [cloze],
  );

  const options = useMemo(() => {
    const distractors = pickDistractors(answer, pool, 3);
    return shuffle([answer, ...distractors]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer.id]);

  // Every time a (possibly requeued) question instance mounts, reset the
  // anti-guessing clock and any leftover selection.
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
        {roundLabel ? (
          <span className="uppercase tracking-wide font-medium text-[#e8722c]">
            {roundLabel}
          </span>
        ) : (
          <span className="uppercase tracking-wide font-medium text-[#14274d]">
            Build
          </span>
        )}
      </div>

      <p className="text-lg leading-relaxed text-slate-800">
        {cloze.before}
        <span className="inline-block min-w-[4.5rem] border-b-2 border-[#14274d] text-transparent select-none">
          {cloze.blank || "     "}
        </span>
        {cloze.after}
      </p>

      <div className="flex flex-col gap-2">
        {options.map((opt) => {
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
              className={`text-left rounded-xl border px-4 py-3 transition ${style}`}
            >
              {opt.word}
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
