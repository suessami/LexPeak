import { useState } from "react";
import type { WordItem } from "../data/types";
import { getDistractorPool, shuffle } from "../data/course";
import QuizQuestion from "./QuizQuestion";
import Feedback from "./Feedback";

const MAX_ROUNDS = 3;

/**
 * Round-based wrong-answer requeue, ported from 문단속's WordCheckStep:
 * a wrong answer does NOT retry in place. It's set aside, and once the
 * current pass through the queue finishes, every missed word comes back
 * as a fresh round (reshuffled options) — up to MAX_ROUNDS total. The
 * score reported to onComplete only reflects round-1 performance, exactly
 * like 문단속's `firstScore`.
 */
export default function QuizFlow({
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
      <QuizQuestion
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
