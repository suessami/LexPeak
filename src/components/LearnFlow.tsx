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

  return (
    <div className="flex flex-col items-center gap-4">
      <WordCard item={words[index]} index={index} total={words.length} />
      <button
        onClick={() => (isLast ? onDone() : setIndex((i) => i + 1))}
        className="w-full max-w-md rounded-xl bg-[#14274d] text-white font-medium py-3 hover:opacity-90 transition"
      >
        {isLast ? "Start Quiz" : "Next Word"}
      </button>
    </div>
  );
}
