import { useEffect, useMemo, useRef, useState } from "react";
import type { WordItem } from "../data/types";
import { buildCloze } from "../data/cloze";
import { pickDistractors, shuffle } from "../data/course";
import { computeMinTimeMs } from "../data/timing";
import { formatHeadword } from "../data/idiom";
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
  const minTimeMs = useMemo(() => computeMinTimeMs(answer.example), [answer]);

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
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">
          {index + 1} / {total}
        </span>
        <h2
          className={`text-2xl font-extrabold uppercase tracking-wide ${
            roundLabel ? "text-[#e8722c]" : "text-[#14274d]"
          }`}
        >
          {roundLabel || "Build"}
        </h2>
      </div>

      <p className="text-lg leading-relaxed text-slate-800">
        {cloze.segments.map((seg, i) =>
          seg.blank ? (
            <span
              key={i}
              className="inline-block min-w-[3rem] border-b-2 border-[#14274d] text-transparent select-none"
            >
              {seg.text || "   "}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </p>

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
              <span>{formatHeadword(opt.word)}</span>
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
