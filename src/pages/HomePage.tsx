import { useMemo, useState } from "react";
import { TOTAL_UNITS, REVIEWS, getUnitWords, getReviewByAfterUnit } from "../data/course";
import { getNextUnit, loadProgress } from "../data/progress";
import { getStudentCode, isMasterCode } from "../data/studentCode";
import { getReviewPassage } from "../data/reviewPassages";
import { LogoMark, LexFox } from "../components/Brand";
import type { Stage } from "./SessionPage";

/** 1–3 stars from a unit's last quiz score, same rough bands as 문단속. */
function starsFor(score: { correct: number; total: number } | undefined): number {
  if (!score || score.total === 0) return 0;
  const pct = score.correct / score.total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  return 1;
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-xs tracking-wide">
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= count ? "text-[#e8722c]" : "text-slate-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function HomePage({
  onStartUnit,
  onLogout,
}: {
  onStartUnit: (unitNo: number, startAt?: Stage) => void;
  onLogout: () => void;
}) {
  const [progress] = useState(loadProgress());
  const nextUnit = useMemo(() => getNextUnit(TOTAL_UNITS), []);
  const completedCount = Object.keys(progress.completedUnits).length;
  const isMaster = isMasterCode(getStudentCode());

  // Recently completed units, most recent first — a short "where I've been"
  // strip rather than a growing list of every unit ever finished.
  const recentDone = useMemo(() => {
    const done = Object.keys(progress.completedUnits)
      .map(Number)
      .sort((a, b) => a - b);
    return done.slice(-6).reverse();
  }, [progress]);

  // The review due right after the unit that's now "next" — if the student
  // is about to hit a review checkpoint, that's worth flagging as what
  // comes right after today's unit, in the "upcoming" strip.
  const upcomingReview = useMemo(
    () => (nextUnit ? getReviewByAfterUnit(nextUnit) : undefined),
    [nextUnit],
  );
  const upcomingUnits = useMemo(() => {
    if (!nextUnit) return [];
    const units = [nextUnit + 1, nextUnit + 2].filter((u) => u <= TOTAL_UNITS);
    return units;
  }, [nextUnit]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-5 text-left">
        <div className="flex items-center gap-3">
          <LogoMark size={40} />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#14274d]">
              LexPeak
            </h1>
            <p className="text-xs text-slate-400 tracking-wide">
              One word higher.
            </p>
          </div>
        </div>

        {!nextUnit && !isMaster ? (
          <CourseCompleteCard total={TOTAL_UNITS} />
        ) : (
          <>
            <div className="w-full rounded-2xl bg-white shadow-md border border-slate-200 p-5 flex flex-col gap-3">
              <p className="text-xs uppercase tracking-wide font-medium text-slate-400">
                Course Progress
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {completedCount} / {TOTAL_UNITS} units learned
              </p>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#e8722c]"
                  style={{ width: `${(completedCount / TOTAL_UNITS) * 100}%` }}
                />
              </div>
            </div>

            {recentDone.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-wide font-medium text-slate-400">
                  Where You've Been
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {recentDone.map((u) => {
                    const wordCount = getUnitWords(u).length;
                    return (
                      <button
                        key={u}
                        onClick={() => onStartUnit(u)}
                        className="shrink-0 w-32 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left hover:border-[#14274d] hover:bg-orange-50 transition"
                      >
                        <p className="text-sm font-semibold text-slate-800">
                          Unit {u}
                        </p>
                        <p className="text-xs text-slate-400 mb-1">
                          {wordCount} words
                        </p>
                        <Stars count={starsFor(progress.unitScores[u])} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {nextUnit && (
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-wide font-medium text-slate-400">
                  Today
                </p>
                <button
                  onClick={() => onStartUnit(nextUnit)}
                  className="w-full text-left rounded-2xl border-2 border-[#e8722c] bg-orange-50 p-5 flex flex-col gap-2 hover:opacity-90 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#e8722c]">
                      Unit {nextUnit}
                    </span>
                    <span className="text-xs font-semibold bg-[#e8722c] text-white rounded-full px-2 py-0.5">
                      Start here
                    </span>
                  </div>
                  <p className="text-lg font-bold text-[#14274d]">
                    {getUnitWords(nextUnit).length} new words to learn
                  </p>
                  <p className="text-sm text-slate-600">
                    Warm up, build, practice, and finish with a passage.
                  </p>
                  <span className="text-sm font-semibold text-[#14274d]">
                    Start today's session →
                  </span>
                </button>
              </div>
            )}

            {(upcomingUnits.length > 0 || upcomingReview) && (
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-wide font-medium text-slate-400">
                  Coming Up
                </p>
                <div className="flex flex-col gap-2">
                  {upcomingReview && (
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between opacity-60">
                      <span className="text-sm font-medium text-slate-500">
                        Review {upcomingReview.reviewNo} · Units{" "}
                        {upcomingReview.coversUnits[0]}–
                        {upcomingReview.coversUnits[2]}
                      </span>
                      <span className="text-xs text-slate-400">🔒 Locked</span>
                    </div>
                  )}
                  {upcomingUnits.map((u) => (
                    <div
                      key={u}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between opacity-60"
                    >
                      <span className="text-sm font-medium text-slate-500">
                        Unit {u}
                      </span>
                      <span className="text-xs text-slate-400">🔒 Locked</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {isMaster && (
          <div className="w-full rounded-2xl bg-white shadow-md border border-slate-200 p-4 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-wide font-medium text-[#e8722c]">
              Master — jump to any unit
            </p>
            <div className="grid grid-cols-6 gap-2 max-h-72 overflow-y-auto">
              {Array.from({ length: TOTAL_UNITS }, (_, i) => i + 1).map((u) => (
                <button
                  key={u}
                  onClick={() => onStartUnit(u)}
                  className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                    progress.completedUnits[u]
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-slate-200 text-slate-700 hover:border-[#14274d] hover:bg-orange-50"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}

        {isMaster && (
          <div className="w-full rounded-2xl bg-white shadow-md border border-slate-200 p-4 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-wide font-medium text-[#e8722c]">
              Master — jump to a review
            </p>
            <div className="grid grid-cols-6 gap-2 max-h-72 overflow-y-auto">
              {REVIEWS.map((r) => {
                const hasPassage = !!getReviewPassage(r.reviewNo);
                return (
                  <button
                    key={r.reviewNo}
                    onClick={() => onStartUnit(r.afterUnit, "reviewIntro")}
                    title={`Review ${r.reviewNo} (after Unit ${r.afterUnit})${
                      hasPassage ? " · has passage" : ""
                    }`}
                    className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                      progress.completedReviews[r.reviewNo]
                        ? "border-green-500 bg-green-50 text-green-700"
                        : hasPassage
                          ? "border-[#e8722c] bg-orange-50 text-[#14274d]"
                          : "border-slate-200 text-slate-700 hover:border-[#14274d] hover:bg-orange-50"
                    }`}
                  >
                    {r.reviewNo}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="self-center text-sm text-slate-400 hover:text-slate-600 underline"
        >
          Log out / switch code
        </button>
      </div>
    </div>
  );
}

function CourseCompleteCard({ total }: { total: number }) {
  return (
    <div className="w-full rounded-2xl bg-white shadow-md border border-slate-200 p-8 flex flex-col items-center gap-4 overflow-hidden relative">
      <Confetti />
      <LexFox size={130} />
      <h2 className="text-xl font-bold text-slate-900">Big win! 🎉</h2>
      <p className="text-slate-600 leading-relaxed">
        You completed all {total} units.
        <br />
        Better words. Better you.
      </p>
      <div className="w-full rounded-xl bg-[#eef1f7] text-[#14274d] text-sm font-medium py-3">
        One word higher — there's always more to learn 🚀
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 18 });
  const colors = ["#e8722c", "#14274d", "#ff9a4d", "#7fc8f8"];
  return (
    <div className="pointer-events-none absolute inset-0">
      {pieces.map((_, i) => {
        const left = (i * 53) % 100;
        const top = (i * 31) % 100;
        const color = colors[i % colors.length];
        const size = 4 + (i % 3) * 2;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: color,
              borderRadius: i % 2 === 0 ? "9999px" : "2px",
              opacity: 0.7,
            }}
          />
        );
      })}
    </div>
  );
}
