import { useMemo, useState } from "react";
import { TOTAL_UNITS, REVIEWS, getUnitWords } from "../data/course";
import { getNextUnit, loadProgress } from "../data/progress";
import { getStudentCode, isMasterCode } from "../data/studentCode";
import { getReviewPassage } from "../data/reviewPassages";
import { LogoMark } from "../components/Brand";
import type { Stage } from "./SessionPage";
import type { ReviewSchedule } from "../data/types";
import duoWave from "../assets/mascot/duo-wave-both.webp";
import duoCelebrate from "../assets/mascot/duo-celebrate.webp";

type RoadmapStep =
  | { kind: "unit"; unitNo: number }
  | { kind: "review"; review: ReviewSchedule };

/** The real sequence a student walks through: units 1..N, with a review
 *  slotted in right after any unit that triggers one — one review per
 *  clean 3-unit block (after Unit 3, 6, 9, ...), per REVIEWS. */
function buildRoadmap(): RoadmapStep[] {
  const reviewByAfterUnit = new Map(REVIEWS.map((r) => [r.afterUnit, r]));
  const steps: RoadmapStep[] = [];
  for (let u = 1; u <= TOTAL_UNITS; u++) {
    steps.push({ kind: "unit", unitNo: u });
    const review = reviewByAfterUnit.get(u);
    if (review) steps.push({ kind: "review", review });
  }
  return steps;
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
  const roadmap = useMemo(() => buildRoadmap(), []);

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
            <div className="w-full rounded-2xl bg-white shadow-md border border-slate-200 p-4 flex items-center gap-3">
              <img
                src={duoWave}
                alt=""
                className="w-16 h-auto object-contain shrink-0"
              />
              <div>
                <p className="text-base font-bold text-[#14274d]">Hey there!</p>
                <p className="text-sm text-slate-500">
                  Same study crew, brighter you.
                </p>
              </div>
            </div>

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

            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wide font-medium text-slate-400">
                Course Roadmap
              </p>
              <div className="w-full rounded-2xl bg-white shadow-md border border-slate-200 p-4">
                <div className="grid grid-cols-6 gap-2 max-h-80 overflow-y-auto">
                  {roadmap.map((step) => {
                    if (step.kind === "unit") {
                      const u = step.unitNo;
                      const done = !!progress.completedUnits[u];
                      const isToday = u === nextUnit;
                      const locked = !done && !isToday;
                      return (
                        <button
                          key={`u${u}`}
                          onClick={() => onStartUnit(u)}
                          disabled={locked}
                          title={`Unit ${u}`}
                          className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                            done
                              ? "border-green-500 bg-green-50 text-green-700"
                              : isToday
                                ? "border-[#e8722c] bg-orange-50 text-[#14274d]"
                                : "border-slate-200 bg-slate-50 text-slate-300"
                          }`}
                        >
                          {u}
                        </button>
                      );
                    }

                    const r = step.review;
                    const done = !!progress.completedReviews[r.reviewNo];
                    const ready = !done && !!progress.completedUnits[r.afterUnit];
                    const locked = !done && !ready;
                    return (
                      <button
                        key={`r${r.reviewNo}`}
                        onClick={() => onStartUnit(r.afterUnit, "reviewIntro")}
                        disabled={locked}
                        title={`Review ${r.reviewNo} · Units ${r.coversUnits[0]}–${r.coversUnits[2]}`}
                        className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                          done
                            ? "border-green-500 bg-green-100 text-green-700"
                            : ready
                              ? "border-purple-400 bg-purple-100 text-purple-700"
                              : "border-purple-200 bg-purple-50 text-purple-300"
                        }`}
                      >
                        R{r.reviewNo}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
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
      <img src={duoCelebrate} alt="" className="w-36 h-auto object-contain" />
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
