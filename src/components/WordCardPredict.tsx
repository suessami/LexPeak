import { useEffect, useMemo, useRef, useState } from "react";
import type { WordItem } from "../data/types";
import { buildCloze } from "../data/cloze";
import { pickDistractors, shuffle } from "../data/course";
import { computeMinTimeMs } from "../data/timing";
import { formatHeadword } from "../data/idiom";
import TooFastModal from "./TooFastModal";

/**
 * Warm-up card, "predict" variant (sample / not yet the default).
 *
 * Same layout as the plain WordCard (word on top, example below), but the
 * meaning isn't just handed over — the student sees the word used in
 * context first, guesses which of 4 English definitions fits, and only
 * then gets the confirmed meaning. Same pretest-then-reveal mechanic
 * already used in the Challenge stage, just moved to first exposure.
 */
export default function WordCardPredict({
  item,
  pool,
  index,
  total,
  onNext,
}: {
  item: WordItem;
  pool: WordItem[];
  index: number;
  total: number;
  onNext: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tooFast, setTooFast] = useState(false);
  const startRef = useRef(Date.now());

  const cloze = useMemo(() => buildCloze(item), [item]);

  const options = useMemo(() => {
    const distractors = pickDistractors(item, pool, 3);
    return shuffle([item, ...distractors]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

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
  }, [item.id]);

  function choose(optId: string) {
    if (selectedId) return;
    if (Date.now() - startRef.current < minTimeMs) {
      setTooFast(true);
      return;
    }
    setSelectedId(optId);
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {index + 1} / {total}
        </span>
        <span className="uppercase tracking-wide font-medium text-[#14274d]">
          Warm-up · {item.itemType === "idiom" ? "Phrase" : "Vocabulary"} · {item.level}
        </span>
      </div>

      <div className="flex items-baseline gap-2 flex-wrap">
        <h2 className="text-2xl font-bold text-[#e8722c]">
          {formatHeadword(item.word)}
        </h2>
        <span className="text-sm text-slate-400 italic">{item.pos}</span>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide font-medium text-slate-400 mb-1">
          Example
        </p>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#14274d] leading-relaxed">
          {cloze.segments.map((seg, i) =>
            seg.blank ? (
              <span
                key={i}
                className="font-semibold underline decoration-2 underline-offset-2 text-[#e8722c]"
              >
                {seg.text}
              </span>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide font-medium text-slate-400 mb-1">
          {selectedId ? "Meaning" : "What do you think this means?"}
        </p>
        <div className="flex flex-col gap-2">
          {options.map((opt) => {
            const isCorrectOpt = opt.id === item.id;
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
                className={`text-left rounded-xl border px-4 py-3 text-sm transition ${style}`}
              >
                {opt.definitionEn}
              </button>
            );
          })}
        </div>
      </div>

      {selectedId && (
        <button
          onClick={onNext}
          className="rounded-xl bg-[#14274d] text-white font-medium py-3 hover:opacity-90 transition"
        >
          Next Word
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
