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
import QuizFlow from "../components/QuizFlow";
import WordFinder from "../components/WordFinder";
import DefinitionQuizFlow from "../components/DefinitionQuizFlow";
import PassageStage from "../components/PassageStage";
import ReviewPassageStage from "../components/ReviewPassageStage";
import { getReviewPassage } from "../data/reviewPassages";
import { LexFox } from "../components/Brand";

type Stage =
  | "learn"
  | "quiz"
  | "wordFinder"
  | "defineQuiz"
  | "passage"
  | "unitResult"
  | "milestone"
  | "reviewIntro"
  | "review"
  | "reviewPassageIntro"
  | "reviewPassage"
  | "reviewResult";

export default function SessionPage({
  unitNo,
  onExit,
}: {
  unitNo: number;
  onExit: () => void;
}) {
  const [stage, setStage] = useState<Stage>("learn");
  const [clozeScore, setClozeScore] = useState({ correct: 0, total: 0 });
  const [defineScore, setDefineScore] = useState({ correct: 0, total: 0 });
  const [unitScore, setUnitScore] = useState({ correct: 0, total: 0 });
  const [reviewQuizScore, setReviewQuizScore] = useState({ correct: 0, total: 0 });
  const [reviewScore, setReviewScore] = useState({ correct: 0, total: 0 });

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

  function handleClozeQuizComplete(correct: number, total: number) {
    setClozeScore({ correct, total });
    setStage("wordFinder");
  }

  function handleDefineQuizComplete(correct: number, total: number) {
    setDefineScore({ correct, total });
    setStage("passage");
  }

  function handlePassageComplete(correct: number, total: number) {
    const combined = {
      correct: clozeScore.correct + defineScore.correct + correct,
      total: clozeScore.total + defineScore.total + total,
    };
    markUnitComplete(unitNo, combined.correct, combined.total);
    logProgress("unit", unitNo, combined.correct, combined.total);
    setUnitScore(combined);
    setStage("unitResult");
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

      {stage === "learn" && (
        <LearnFlow words={unitWords} onDone={() => setStage("quiz")} />
      )}

      {stage === "quiz" && (
        <QuizFlow words={unitWords} onComplete={handleClozeQuizComplete} />
      )}

      {stage === "wordFinder" && (
        <WordFinder
          words={unitWords}
          pool={distractorPool}
          onDone={() => setStage("defineQuiz")}
        />
      )}

      {stage === "defineQuiz" && (
        <DefinitionQuizFlow
          words={unitWords}
          onComplete={handleDefineQuizComplete}
        />
      )}

      {stage === "passage" && (
        <PassageStage
          words={unitWords}
          pool={distractorPool}
          onComplete={handlePassageComplete}
        />
      )}

      {stage === "unitResult" && (
        <ResultCard
          title="Solid work!"
          correct={unitScore.correct}
          total={unitScore.total}
          buttonLabel={
            milestone ? "Continue" : review ? "Continue to Review" : "Home"
          }
          onNext={goPastUnitResult}
        />
      )}

      {stage === "milestone" && milestone && (
        <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-8 flex flex-col items-center gap-4 text-center">
          {milestone.showFox ? (
            <LexFox size={110} />
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
        <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-4 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            One More Thing
          </h2>
          <p className="text-slate-600">
            Now let's see those words used in a brand-new passage. Read
            along and fill in the blanks that fit.
          </p>
          <button
            onClick={() => setStage("reviewPassage")}
            className="rounded-xl bg-[#14274d] text-white font-medium py-3 hover:opacity-90 transition"
          >
            Continue
          </button>
        </div>
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
          buttonLabel="Home"
          onNext={onExit}
        />
      )}
    </div>
  );
}

function ResultCard({
  title,
  correct,
  total,
  buttonLabel,
  onNext,
}: {
  title: string;
  correct: number;
  total: number;
  buttonLabel: string;
  onNext: () => void;
}) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-4 text-center">
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
