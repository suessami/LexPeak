import { useEffect, useMemo, useState } from "react";
import type { WordItem } from "../data/types";
import { computeMinTimeMs } from "../data/timing";
import { formatHeadword } from "../data/idiom";
import { buildCloze } from "../data/cloze";

export default function Feedback({
  item,
  wasCorrect,
  onNext,
  isLast,
}: {
  item: WordItem;
  wasCorrect: boolean;
  onNext: () => void;
  isLast: boolean;
}) {
  // Gate the Next button behind a read-time minimum scaled to the
  // definition + example — otherwise students tap through without ever
  // reading the meaning they just got wrong (or right).
  const minTimeMs = useMemo(
    () => computeMinTimeMs(`${item.definitionEn} ${item.example}`),
    [item.definitionEn, item.example],
  );
  const [remainingMs, setRemainingMs] = useState(minTimeMs);

  useEffect(() => {
    setRemainingMs(minTimeMs);
    const start = Date.now();
    const id = setInterval(() => {
      const left = minTimeMs - (Date.now() - start);
      setRemainingMs(left > 0 ? left : 0);
      if (left <= 0) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, minTimeMs]);

  const cloze = useMemo(() => buildCloze(item), [item]);
  const ready = remainingMs <= 0;
  const secondsLeft = Math.ceil(remainingMs / 1000);
  const label = isLast ? "Finish" : "Next Question";

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-4">
      <div
        className={`text-sm font-semibold ${
          wasCorrect ? "text-green-600" : "text-red-500"
        }`}
      >
        {wasCorrect ? "Nice one!" : "Not this time — you'll see it again"}
      </div>

      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">
          {formatHeadword(item.word)}
        </h2>
        <span className="text-sm text-slate-400 italic">{item.pos}</span>
      </div>

      <div className="rounded-xl bg-[#fff1e8] border border-[#e8722c] px-4 py-3">
        <p className="text-xs text-slate-500 mb-1">Korean meaning</p>
        <p className="text-lg font-semibold text-slate-800">{item.meaningKo}</p>
      </div>

      <p className="text-slate-700 leading-relaxed">{item.definitionEn}</p>
      {/* Big, highlighted example: this exact sentence comes back in the
          Win passage, so students are told to actually read it. */}
      <div className="rounded-xl border-2 border-[#14274d]/15 bg-slate-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#e8722c] mb-2">
          Remember this sentence — it'll be on your quiz
        </p>
        <p className="text-lg leading-relaxed text-[#14274d]">
          {cloze.segments.map((seg, i) =>
            seg.blank ? (
              <span
                key={i}
                className="font-bold text-[#e8722c] underline decoration-2 underline-offset-4"
              >
                {seg.text}
              </span>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>
      </div>

      <button
        onClick={onNext}
        disabled={!ready}
        className={`mt-2 rounded-xl font-medium py-3 transition ${
          ready
            ? "bg-[#14274d] text-white hover:opacity-90"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        {ready ? label : `${label} (${secondsLeft}s)`}
      </button>
    </div>
  );
}
