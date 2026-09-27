import { useMemo, useState } from "react";
import type { WordItem } from "../data/types";
import { pickDistractors, shuffle } from "../data/course";

/**
 * Stage 3 — reverse-direction recall: show the word, pick its correct
 * English definition out of 4. Same word, opposite retrieval direction from
 * the cloze quiz, so it's a second real exposure rather than a repeat.
 */
export default function DefinitionQuestion({
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
  const [selected, setSelected] = useState<string | null>(null);

  const options = useMemo(() => {
    const distractors = pickDistractors(answer, pool, 3);
    return shuffle([answer, ...distractors]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer.id]);

  const isAnswered = selected !== null;

  function choose(optId: string) {
    if (isAnswered) return;
    setSelected(optId);
    onAnswered(optId === answer.id);
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {index + 1} / {total}
        </span>
        <span className="uppercase tracking-wide font-medium text-[#14274d]">
          Which meaning?
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">
          {answer.word}
        </h2>
        <span className="text-sm text-slate-400 italic">{answer.pos}</span>
      </div>

      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const chosen = selected === opt.id;
          const correct = opt.id === answer.id;
          let style =
            "border-slate-200 hover:border-[#14274d] hover:bg-orange-50";
          if (isAnswered && correct) {
            style = "border-green-500 bg-green-50";
          } else if (isAnswered && chosen && !correct) {
            style = "border-red-400 bg-red-50";
          } else if (isAnswered) {
            style = "border-slate-200 opacity-60";
          }
          return (
            <button
              key={opt.id}
              disabled={isAnswered}
              onClick={() => choose(opt.id)}
              className={`text-left rounded-xl border px-4 py-3 transition ${style}`}
            >
              {opt.definitionEn}
            </button>
          );
        })}
      </div>
    </div>
  );
}
