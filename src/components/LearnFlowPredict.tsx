import { useState } from "react";
import type { WordItem } from "../data/types";
import WordCardPredict from "./WordCardPredict";

/** Same role as LearnFlow, but walks through the "predict" card variant. */
export default function LearnFlowPredict({
  words,
  pool,
  onDone,
}: {
  words: WordItem[];
  pool: WordItem[];
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const isLast = index === words.length - 1;

  return (
    <WordCardPredict
      item={words[index]}
      pool={pool}
      index={index}
      total={words.length}
      onNext={() => (isLast ? onDone() : setIndex((i) => i + 1))}
    />
  );
}
