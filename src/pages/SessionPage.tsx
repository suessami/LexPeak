import { useMemo, useState } from "react";
import {
  getUnitWords,
  getReviewByAfterUnit,
  getReviewWords,
  getDistractorPool,
} from "../data/course";
import { markUnitComplete, markReviewComplete } from "../data/progress";
import { getMilestone } from "../data/milestones";
import { logProgress } from "../data/cloudSync";
import LearnFlow from "../components/LearnFlow";
import LearnFlowPredict, { type WarmupResult } from "../components/LearnFlowPredict";
import QuizFlow from "../components/QuizFlow";
import WordFinder from "../components/WordFinder";
import DefinitionQuizFlow from "../components/DefinitionQuizFlow";
import PassageStage from "../components/PassageStage";
import ReviewPassageStage from "../components/ReviewPassageStage";
import { getReviewPassage } from "../data/reviewPassages";
import StageIntro from "../components/StageIntro";
import { formatHeadword } from "../data/idiom";
import type { WordItem } from "../data/types";
import duoCelebrate from "../assets/mascot/duo-celebrate.webp";
import duoThumbsup from "../assets/mascot/duo-thumbsup.webp";

export type Stage =
  | "learn"
  | "warmupSummary"
  | "buildIntro"
  | "quiz"
  | "practiceIntro"
  | "wordFinder"
  | "challengeIntro"
  | "defineQuiz"
  | "winIntro"
  | "passage"
  | "recapIntro"
  | "recap"
  | "unitResult"
  | "milestone"
  | "reviewIntro"
  | "review"
  | "reviewPassageIntro"
  | "reviewPassage"
  | "reviewResult";

export default function SessionPage({
  unitNo,
  startAt,
  onExit,
}: {
  unitNo: number;
  startAt?: Stage;
  onExit: () => void;
}) {
  const [stage, setStage] = useState<Stage>(startAt ?? "learn");
  // "Predict the meaning" is now the default Warm-up card. ?warmup=classic
  // keeps the old reveal-it-all card reachable in case it's ever needed for
  // comparison again.
  const usePredictWarmup =
    new URLSearchParams(window.location.search).get("warmup") !== "classic";
  const [clozeScore, setClozeScore] = useState({ correct: 0, total: 0 });
  const [defineScore, setDefineScore] = useState({ correct: 0, total: 0 });
  const [unitScore, setUnitScore] = useState({ correct: 0, total: 0 });
  const [reviewQuizScore, setReviewQuizScore] = useState({ correct: 0, total: 0 });
  const [reviewScore, setReviewScore] = useState({ correct: 0, total: 0 });
  // Any word missed (not right on the first try) in Build, Practice,
  // Challenge, or Win — collected across the whole unit so a short recap
  // can retest exactly those words before moving on, instead of only
  // catching up on them at the next multi-unit Review checkpoint.
  const [missedIds, setMissedIds] = useState<Set<string>>(new Set());
  // Warm-up is a guess, not a graded quiz, so a wrong guess there doesn't
  // join missedIds/Quick Recap — it's just shown back on a right/wrong
  // summary table before Build, so the guess gets corrected once, then
  // the unit moves on.
  const [warmupResults, setWarmupResults] = useState<WarmupResult[]>([]);

  const unitWords = useMemo(() => getUnitWords(unitNo), [unitNo]);
  const distractorPool = useMemo(() => getDistractorPool(unitNo), [unitNo]);
  const review = useMemo(() => getReviewByAfterUnit(unitNo), [unitNo]);
  const reviewWords = useMemo(
    () => (review ? getReviewWords(review) : []),
    [review],
  );
  const reviewPassage = useMemo(
    () => (review ? getReviewPassage(review.reviewNo) : undefined),
    [review],
  );
  const milestone = useMemo(() => getMilestone(unitNo), [unitNo]);
  const recapWords = useMemo(
    () => unitWords.filter((w) => missedIds.has(w.id)),
    [unitWords, missedIds],
  );

  function addMissed(ids: string[]) {
    if (ids.length === 0) return;
    setMissedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }

  function goPastUnitResult() {
    if (milestone) {
      setStage("milestone");
    } else if (review) {
      setStage("reviewIntro");
    } else {
      onExit();
    }
  }

  function goPastMilestone() {
    if (review) {
      setStage("reviewIntro");
    } else {
      onExit();
    }
  }

  function handleClozeQuizComplete(correct: number, total: number, wrongIds: string[]) {
    setClozeScore({ correct, total });
    addMissed(wrongIds);
    setStage("practiceIntro");
  }

  function handleDefineQuizComplete(correct: number, total: number, wrongIds: string[]) {
    setDefineScore({ correct, total });
    addMissed(wrongIds);
    setStage("winIntro");
  }

  function handlePassageComplete(correct: number, total: number, wrongIds: string[]) {
    const combined = {
      correct: clozeScore.correct + defineScore.correct + correct,
      total: clozeScore.total + defineScore.total + total,
    };
    markUnitComplete(unitNo, combined.correct, combined.total);
    logProgress("unit", unitNo, combined.correct, combined.total);
    setUnitScore(combined);

    const finalMissed = new Set(missedIds);
    wrongIds.forEach((id) => finalMissed.add(id));
    setMissedIds(finalMissed);
    setStage(finalMissed.size > 0 ? "recapIntro" : "unitResult");
  }

  function handleReviewQuizComplete(correct: number, total: number) {
    if (reviewPassage) {
      setReviewQuizScore({ correct, total });
      setStage("reviewPassageIntro");
      return;
    }
    if (review) {
      markReviewComplete(review.reviewNo, correct, total);
      logProgress("review", review.reviewNo, correct, total);
    }
    setReviewScore({ correct, total });
    setStage("reviewResult");
  }

  function handleReviewPassageComplete(correct: number, total: number) {
    const combined = {
      correct: reviewQuizScore.correct + correct,
      total: reviewQuizScore.total + total,
    };
    if (review) {
      markReviewComplete(review.reviewNo, combined.correct, combined.total);
      logProgress("review", review.reviewNo, combined.correct, combined.total);
    }
    setReviewScore(combined);
    setStage("reviewResult");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <button
          onClick={onExit}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          ← Home
        </button>
        <span className="text-sm text-slate-500">Unit {unitNo}</span>
      </div>

      {stage === "learn" && usePredictWarmup && (
        <LearnFlowPredict
          words={unitWords}
          pool={distractorPool}
          onDone={(results) => {
            setWarmupResults(results);
            setStage("warmupSummary");
          }}
        />
      )}

      {stage === "learn" && !usePredictWarmup && (
        <LearnFlow words={unitWords} onDone={() => setStage("buildIntro")} />
      )}

      {stage === "warmupSummary" && (
        <WarmupSummary
          words={unitWords}
          results={warmupResults}
          onContinue={() => setStage("quiz")}
        />
      )}

      {stage === "buildIntro" && (
        <StageIntro
          eyebrow="Up Next"
          title="Build"
          body="Quick multiple choice — let's build these words into memory."
          buttonLabel="Start Build"
          onContinue={() => setStage("quiz")}
        />
      )}

      {stage === "quiz" && (
        <QuizFlow words={unitWords} onComplete={handleClozeQuizComplete} />
      )}

      {stage === "practiceIntro" && (
        <StageIntro
          eyebrow="Up Next"
          title="Practice"
          body="Find the matching word for each clue."
          buttonLabel="Start Practice"
          onContinue={() => setStage("wordFinder")}
        />
      )}

      {stage === "wordFinder" && (
        <WordFinder
          words={unitWords}
          pool={distractorPool}
          onDone={(wrongIds) => {
            addMissed(wrongIds);
            setStage("challengeIntro");
          }}
        />
      )}

      {stage === "challengeIntro" && (
        <StageIntro
          eyebrow="Up Next"
          title="Challenge"
          body="Flip it around — pick the word that matches the definition."
          buttonLabel="Start Challenge"
          onContinue={() => setStage("defineQuiz")}
        />
      )}

      {stage === "defineQuiz" && (
        <DefinitionQuizFlow
          words={unitWords}
          onComplete={handleDefineQuizComplete}
        />
      )}

      {stage === "winIntro" && (
        <StageIntro
          eyebrow="Last Stretch"
          title="Win"
          body="One short passage — fill in the blanks to finish the unit."
          buttonLabel="Start Win"
          onContinue={() => setStage("passage")}
        />
      )}

      {stage === "passage" && (
        <PassageStage
          words={unitWords}
          pool={distractorPool}
          onComplete={handlePassageComplete}
        />
      )}

      {stage === "recapIntro" && (
        <StageIntro
          eyebrow="Before You Go"
          title="Quick Recap"
          body={`Let's make sure ${recapWords.length} tricky ${
            recapWords.length === 1 ? "word" : "words"
          } stuck before moving on.`}
          buttonLabel="Start Recap"
          onContinue={() => setStage("recap")}
        />
      )}

      {stage === "recap" && (
        <QuizFlow words={recapWords} onComplete={() => setStage("unitResult")} />
      )}

      {stage === "unitResult" && (
        <ResultCard
          title="Solid work!"
          correct={unitScore.correct}
          total={unitScore.total}
          image={duoThumbsup}
          buttonLabel={
            milestone ? "Continue" : review ? "Continue to Review" : "Home"
          }
          onNext={goPastUnitResult}
        />
      )}

      {stage === "milestone" && milestone && (
        <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-8 flex flex-col items-center gap-4 text-center">
          {milestone.showFox ? (
            <img src={duoCelebrate} alt="" className="w-28 h-auto object-contain" />
          ) : (
            <span className="text-5xl">{milestone.emoji}</span>
          )}
          <h2 className="text-xl font-bold text-slate-900">
            {milestone.headline}
          </h2>
          <p className="text-slate-600 leading-relaxed">{milestone.body}</p>
          <button
            onClick={goPastMilestone}
            className="w-full rounded-xl bg-[#14274d] text-white font-medium py-3 hover:opacity-90 transition"
          >
            {review ? "Continue to Review" : "Home"}
          </button>
        </div>
      )}

      {stage === "reviewIntro" && review && (
        <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-4 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Quick Review
          </h2>
          <p className="text-slate-600">
            Let's review the words from Units {review.coversUnits[0]}–
            {review.coversUnits[2]}. ({reviewWords.length} questions)
          </p>
          <button
            onClick={() => setStage("review")}
            className="rounded-xl bg-[#14274d] text-white font-medium py-3 hover:opacity-90 transition"
          >
            Start Review
          </button>
        </div>
      )}

      {stage === "review" && (
        <QuizFlow words={reviewWords} onComplete={handleReviewQuizComplete} />
      )}

      {stage === "reviewPassageIntro" && review && (
        <StageIntro
          eyebrow="Review Challenge"
          title="Cloze Test"
          body="One more passage — read along and fill in the blanks that fit."
          buttonLabel="Start Cloze Test"
          onContinue={() => setStage("reviewPassage")}
        />
      )}

      {stage === "reviewPassage" && reviewPassage && (
        <ReviewPassageStage
          passage={reviewPassage}
          reviewWords={reviewWords}
          onComplete={handleReviewPassageComplete}
        />
      )}

      {stage === "reviewResult" && (
        <ResultCard
          title="Nice session!"
          correct={reviewScore.correct}
          total={reviewScore.total}
          image={duoThumbsup}
          buttonLabel="Home"
          onNext={onExit}
        />
      )}
    </div>
  );
}

function WarmupSummary({
  words,
  results,
  onContinue,
}: {
  words: WordItem[];
  results: WarmupResult[];
  onContinue: () => void;
}) {
  const correctById = new Map(results.map((r) => [r.wordId, r.correct]));

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Warm-up Recap</span>
        <span className="uppercase tracking-wide font-medium text-[#14274d]">
          How'd You Guess?
        </span>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
            <th className="py-2 pr-2 font-medium w-8">#</th>
            <th className="py-2 pr-2 font-medium">Word</th>
            <th className="py-2 pr-2 font-medium">Meaning</th>
            <th className="py-2 font-medium text-center w-10">O/X</th>
          </tr>
        </thead>
        <tbody>
          {words.map((w, i) => {
            const correct = correctById.get(w.id);
            return (
              <tr key={w.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-2 text-slate-400">{i + 1}</td>
                <td className="py-2 pr-2 font-semibold text-[#14274d]">
                  {formatHeadword(w.word)}
                </td>
                <td className="py-2 pr-2 text-slate-600">{w.definitionEn}</td>
                <td className="py-2 text-center font-bold">
                  {correct ? (
                    <span className="text-green-600">O</span>
                  ) : (
                    <span className="text-red-500">X</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        onClick={onContinue}
        className="rounded-xl bg-[#14274d] text-white font-medium py-3 hover:opacity-90 transition mt-2"
      >
        Continue to Build
      </button>
    </div>
  );
}

function ResultCard({
  title,
  correct,
  total,
  buttonLabel,
  onNext,
  image,
}: {
  title: string;
  correct: number;
  total: number;
  buttonLabel: string;
  onNext: () => void;
  image?: string;
}) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-4 text-center">
      {image && (
        <img src={image} alt="" className="w-20 h-auto object-contain mx-auto" />
      )}
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="text-3xl font-bold text-[#14274d]">
        {correct} / {total}
      </p>
      <button
        onClick={onNext}
        className="rounded-xl bg-[#14274d] text-white font-medium py-3 hover:opacity-90 transition"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
