import { useState } from "react";
import type { WordItem } from "../data/types";
import { getDistractorPool, shuffle } from "../data/course";
import DefinitionQuestion from "./DefinitionQuestion";
import Feedback from "./Feedback";

const MAX_ROUNDS = 3;

/**
 * Same round-based requeue mechanic as QuizFlow — see that file's comment.
 */
export default function DefinitionQuizFlow({
  words,
  onComplete,
}: {
  words: WordItem[];
  onComplete: (correct: number, total: number, wrongIds: string[]) => void;
}) {
  const [roundQueue, setRoundQueue] = useState<WordItem[]>(() => shuffle(words));
  const [roundNum, setRoundNum] = useState(1);
  const [roundWrongs, setRoundWrongs] = useState<WordItem[]>([]);
  const [firstAttemptWrongIds, setFirstAttemptWrongIds] = useState<Set<string>>(
    new Set(),
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"question" | "feedback">("question");
  const [lastCorrect, setLastCorrect] = useState(false);

  const current = roundQueue[index];
  const isLastInRound = index === roundQueue.length - 1;
  const roundLabel =
    roundNum > 1 ? `Round ${roundNum} · Retry missed words` : undefined;

  function handleAnswered(correct: boolean) {
    if (!correct) {
      setRoundWrongs((w) => [...w, current]);
      if (roundNum === 1) {
        setFirstAttemptWrongIds((s) => new Set(s).add(current.id));
      }
    }
    setLastCorrect(correct);
    setPhase("feedback");
  }

  function handleNext() {
    if (!isLastInRound) {
      setIndex((i) => i + 1);
      setPhase("question");
      return;
    }

    if (roundWrongs.length > 0 && roundNum < MAX_ROUNDS) {
      setRoundQueue(shuffle(roundWrongs));
      setRoundWrongs([]);
      setIndex(0);
      setRoundNum((n) => n + 1);
      setPhase("question");
      return;
    }

    const correctCount = words.length - firstAttemptWrongIds.size;
    onComplete(correctCount, words.length, Array.from(firstAttemptWrongIds));
  }

  const isLastOverall = isLastInRound && !(roundWrongs.length > 0 && roundNum < MAX_ROUNDS);

  if (phase === "question") {
    return (
      <DefinitionQuestion
        answer={current}
        pool={getDistractorPool(current.unitNo)}
        index={index}
        total={roundQueue.length}
        roundLabel={roundLabel}
        onAnswered={handleAnswered}
      />
    );
  }

  return (
    <Feedback
      item={current}
      wasCorrect={lastCorrect}
      onNext={handleNext}
      isLast={isLastOverall}
    />
  );
}
