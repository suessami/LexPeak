import { useState } from "react";
import type { WordItem } from "../data/types";
import WordCardPredict from "./WordCardPredict";

export interface WarmupResult {
  wordId: string;
  correct: boolean;
}

/**
 * Same role as LearnFlow, but walks through the "predict" card variant.
 * This is a guess, not a graded quiz — so a wrong guess doesn't get
 * requeued here or folded into the unit's missed-word pool. Instead every
 * word's result (right or wrong) is reported at the end, so the session
 * can show a quick right/wrong summary before Build.
 */
export default function LearnFlowPredict({
  words,
  pool,
  onDone,
}: {
  words: WordItem[];
  pool: WordItem[];
  onDone: (results: WarmupResult[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<WarmupResult[]>([]);
  const isLast = index === words.length - 1;

  function handleNext(correct: boolean) {
    const nextResults = [...results, { wordId: words[index].id, correct }];
    if (isLast) {
      onDone(nextResults);
      return;
    }
    setResults(nextResults);
    setIndex((i) => i + 1);
  }

  return (
    <WordCardPredict
      item={words[index]}
      pool={pool}
      index={index}
      total={words.length}
      onNext={handleNext}
    />
  );
}
