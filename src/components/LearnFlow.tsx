import { useState } from "react";
import type { WordItem } from "../data/types";
import WordCard from "./WordCard";

export default function LearnFlow({
  words,
  onDone,
}: {
  words: WordItem[];
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const isLast = index === words.length - 1;
  const isFirst = index === 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <WordCard item={words[index]} index={index} total={words.length} />
      <div className="w-full max-w-md flex gap-3">
        {!isFirst && (
          <button
            onClick={() => setIndex((i) => i - 1)}
            aria-label="Previous word"
            className="rounded-xl border border-slate-200 bg-white text-slate-500 font-medium px-4 hover:bg-slate-50 transition"
          >
            ←
          </button>
        )}
        <button
          onClick={() => (isLast ? onDone() : setIndex((i) => i + 1))}
          className="flex-1 rounded-xl bg-[#14274d] text-white font-medium py-3 hover:opacity-90 transition"
        >
          {isLast ? "Start Quiz" : "Next Word"}
        </button>
      </div>
    </div>
  );
}
