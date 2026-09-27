import { useMemo, useState } from "react";
import { TOTAL_UNITS, REVIEWS } from "../data/course";
import { getNextUnit, loadProgress } from "../data/progress";
import { getStudentCode, isMasterCode } from "../data/studentCode";
import { getReviewPassage } from "../data/reviewPassages";
import { LogoMark, LexFox } from "../components/Brand";
import type { Stage } from "./SessionPage";

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-6 items-center text-center">
        <div className="flex flex-col items-center gap-2">
          <LogoMark size={48} />
          <h1 className="text-4xl font-extrabold tracking-tight text-[#14274d]">
            LexPeak
          </h1>
          <p className="text-sm text-slate-500 tracking-wide">
            Learn with your crew.
          </p>
          <p className="text-xs text-slate-400 tracking-wide">
            One word higher.
          </p>
        </div>

        {!nextUnit && !isMaster ? (
          <CourseCompleteCard total={TOTAL_UNITS} />
        ) : (
          <>
            <div className="w-full rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-3">
              <p className="text-slate-500 text-sm">Progress</p>
              <p className="text-2xl font-bold text-slate-900">
                {completedCount} / {TOTAL_UNITS} units
              </p>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#e8722c]"
                  style={{ width: `${(completedCount / TOTAL_UNITS) * 100}%` }}
                />
              </div>
            </div>

            {nextUnit && (
              <button
                onClick={() => onStartUnit(nextUnit)}
                className="w-full rounded-xl bg-[#14274d] text-white font-semibold py-4 text-lg hover:opacity-90 transition"
              >
                Start Unit {nextUnit}
              </button>
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
          className="text-sm text-slate-400 hover:text-slate-600 underline"
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
