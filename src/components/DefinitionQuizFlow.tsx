import { useState } from "react";
import type { WordItem } from "../data/types";
import { getDistractorPool } from "../data/course";
import DefinitionQuestion from "./DefinitionQuestion";
import Feedback from "./Feedback";

export default function DefinitionQuizFlow({
  words,
  onComplete,
}: {
  words: WordItem[];
  onComplete: (correct: number, total: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"question" | "feedback">("question");
  const [lastCorrect, setLastCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const current = words[index];
  const isLast = index === words.length - 1;

  function handleAnswered(correct: boolean) {
    if (correct) setCorrectCount((c) => c + 1);
    setLastCorrect(correct);
    setPhase("feedback");
  }

  function handleNext() {
    if (isLast) {
      onComplete(correctCount, words.length);
      return;
    }
    setIndex((i) => i + 1);
    setPhase("question");
  }

  if (phase === "question") {
    return (
      <DefinitionQuestion
        answer={current}
        pool={getDistractorPool(current.unitNo)}
        index={index}
        total={words.length}
        onAnswered={handleAnswered}
      />
    );
  }

  return (
    <Feedback
      item={current}
      wasCorrect={lastCorrect}
      onNext={handleNext}
      isLast={isLast}
    />
  );
}
