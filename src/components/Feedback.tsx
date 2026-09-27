import type { WordItem } from "../data/types";

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
  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-4">
      <div
        className={`text-sm font-semibold ${
          wasCorrect ? "text-green-600" : "text-red-500"
        }`}
      >
        {wasCorrect ? "Correct!" : "Got there — but not on the first try"}
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
        className="mt-2 rounded-xl bg-[#14274d] text-white font-medium py-3 hover:opacity-90 transition"
      >
        {isLast ? "Finish" : "Next Question"}
      </button>
    </div>
  );
}
