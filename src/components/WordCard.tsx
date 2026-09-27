import type { WordItem } from "../data/types";
import { formatHeadword } from "../data/idiom";

export default function WordCard({
  item,
  index,
  total,
}: {
  item: WordItem;
  index: number;
  total: number;
}) {
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

      <div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <h2 className="text-2xl font-semibold text-slate-900">
            {formatHeadword(item.word)}
          </h2>
          <span className="text-sm text-slate-400 italic">{item.pos}</span>
        </div>
      </div>

      <p className="text-slate-700 leading-relaxed">{item.definitionEn}</p>

      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 leading-relaxed">
        {item.example}
      </div>
    </div>
  );
}
