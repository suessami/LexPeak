import { useState } from "react";
import type { WordItem } from "../data/types";
import { getDistractorPool } from "../data/course";
import QuizQuestion from "./QuizQuestion";
import Feedback from "./Feedback";

export default function QuizFlow({
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
      <QuizQuestion
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
