import { useMemo, useState } from "react";
import type { WordItem } from "../data/types";
import { buildCloze } from "../data/cloze";
import { pickDistractors, shuffle } from "../data/course";

export default function QuizQuestion({
  answer,
  pool,
  index,
  total,
  onAnswered,
}: {
  answer: WordItem;
  pool: WordItem[];
  index: number;
  total: number;
  onAnswered: (correct: boolean) => void;
}) {
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [resolved, setResolved] = useState(false);
  const cloze = useMemo(() => buildCloze(answer), [answer]);

  const options = useMemo(() => {
    const distractors = pickDistractors(answer, pool, 3);
    return shuffle([answer, ...distractors]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer.id]);

  function choose(optId: string) {
    if (resolved || wrongIds.has(optId)) return;
    if (optId === answer.id) {
      setResolved(true);
      onAnswered(wrongIds.size === 0);
    } else {
      setWrongIds((prev) => new Set(prev).add(optId));
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {index + 1} / {total}
        </span>
        <span className="uppercase tracking-wide font-medium text-[#14274d]">
          {answer.itemType === "idiom" ? "Phrase" : "Vocabulary"} Quiz
        </span>
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
          const isWrong = wrongIds.has(opt.id);
          let style =
            "border-slate-200 hover:border-[#14274d] hover:bg-orange-50";
          if (resolved && isCorrectOpt) {
            style = "border-green-500 bg-green-50";
          } else if (isWrong) {
            style = "border-red-400 bg-red-50 opacity-60";
          }
          return (
            <button
              key={opt.id}
              disabled={resolved || isWrong}
              onClick={() => choose(opt.id)}
              className={`text-left rounded-xl border px-4 py-3 transition ${style}`}
            >
              {opt.word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
