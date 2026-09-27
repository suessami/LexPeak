import { useEffect, useMemo, useState } from "react";
import type { WordItem } from "../data/types";
import { computeMinTimeMs } from "../data/timing";

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
        <h2 className="text-2xl font-semibold text-slate-900">{item.word}</h2>
        <span className="text-sm text-slate-400 italic">{item.pos}</span>
      </div>

      <div className="rounded-xl bg-[#fff1e8] border border-[#e8722c] px-4 py-3">
        <p className="text-xs text-slate-500 mb-1">Korean meaning</p>
        <p className="text-lg font-semibold text-slate-800">{item.meaningKo}</p>
      </div>

      <p className="text-slate-700 leading-relaxed">{item.definitionEn}</p>
      <p className="text-sm text-slate-500 leading-relaxed">{item.example}</p>

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
