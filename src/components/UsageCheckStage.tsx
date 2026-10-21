import { useEffect, useMemo, useRef, useState } from "react";
import type { WordItem } from "../data/types";
import type { UsageCheck } from "../data/usageChecks";
import { shuffle } from "../data/course";
import { computeMinTimeMs } from "../data/timing";
import { formatHeadword } from "../data/idiom";
import TooFastModal from "./TooFastModal";

/**
 * "Use It Right": one word, four sentences, pick every sentence that uses
 * the word correctly (the number of right ones varies 1–3). After checking,
 * each sentence is marked, and misused ones show a one-line reason. A word
 * counts as correct only if the picked set matches exactly.
 */
export default function UsageCheckStage({
  checks,
  words,
  onComplete,
}: {
  checks: UsageCheck[];
  words: WordItem[];
  onComplete: (correct: number, total: number, wrongIds: string[]) => void;
}) {
  const wordById = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);
  const order = useMemo(
    () => shuffle(checks).map((c) => ({ ...c, sentences: shuffle(c.sentences) })),
    [checks],
  );

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [tooFast, setTooFast] = useState(false);
  const startRef = useRef(Date.now());

  const item = order[index];
  const word = item ? wordById.get(item.wordId) : undefined;
  const minTimeMs = useMemo(
    () => (item ? computeMinTimeMs(item.sentences.map((s) => s.text).join(" ")) : 0),
    [item],
  );

  useEffect(() => {
    startRef.current = Date.now();
  }, [index]);

  if (!item || !word) return null;

  const isRight =
    item.sentences.every((s, i) => s.ok === picked.has(i));

  function toggle(i: number) {
    if (checked) return;
    setPicked((p) => {
      const next = new Set(p);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function check() {
    if (Date.now() - startRef.current < minTimeMs) {
      setTooFast(true);
      return;
    }
    if (!isRight) setWrongIds((w) => [...w, item.wordId]);
    setChecked(true);
  }

  function next() {
    if (index + 1 < order.length) {
      setIndex(index + 1);
      setPicked(new Set());
      setChecked(false);
      return;
    }
    onComplete(order.length - wrongIds.length, order.length, wrongIds);
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-4">
      <div className="text-xs text-slate-400">
        {index + 1} / {order.length}
      </div>

      <div className="flex items-baseline gap-2 flex-wrap">
        <h2 className="text-2xl font-bold text-[#e8722c]">{formatHeadword(word.word)}</h2>
        <span className="text-sm text-slate-400 italic">{word.pos}</span>
      </div>

      <p className="text-sm text-slate-600">
        Which sentences use this word correctly?{" "}
        <span className="font-semibold text-[#14274d]">Choose all that apply (1 or more).</span>
      </p>

      <div className="flex flex-col gap-2">
        {item.sentences.map((s, i) => {
          const on = picked.has(i);
          let style = on
            ? "border-[#14274d] bg-orange-50"
            : "border-slate-200 hover:border-[#14274d]";
          let mark: string | null = null;
          if (checked) {
            if (s.ok) {
              style = on ? "border-green-500 bg-green-50" : "border-green-500 border-dashed bg-white";
              mark = on ? "✓" : "✓ missed";
            } else {
              style = on ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50";
              mark = "✕";
            }
          }
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              disabled={checked}
              className={`text-left rounded-xl border-2 px-4 py-3 transition flex gap-3 ${style}`}
            >
              <span
                className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center text-xs font-bold ${
                  on ? "border-[#14274d] bg-[#14274d] text-white" : "border-slate-300"
                }`}
              >
                {on ? "✓" : ""}
              </span>
              <span className="flex-1">
                <span className="text-[15px] leading-relaxed text-slate-800">{s.text}</span>
                {checked && (
                  <span
                    className={`block mt-1 text-xs font-semibold ${
                      s.ok ? "text-green-700" : "text-red-500"
                    }`}
                  >
                    {mark}
                    {!s.ok && s.why && (
                      <span className="font-normal text-slate-600"> {s.why}</span>
                    )}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {checked && (
        <p className={`text-sm font-semibold ${isRight ? "text-green-600" : "text-red-500"}`}>
          {isRight ? "Nailed it!" : "Not quite — check the notes above."}
        </p>
      )}

      <button
        onClick={checked ? next : check}
        disabled={!checked && picked.size === 0}
        className={`rounded-xl font-medium py-3 transition ${
          !checked && picked.size === 0
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-[#14274d] text-white hover:opacity-90"
        }`}
      >
        {checked ? (index + 1 < order.length ? "Next Word" : "Finish") : "Check"}
      </button>

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
