import { useMemo, useState } from "react";
import { TOTAL_UNITS } from "../data/course";
import { getNextUnit, loadProgress } from "../data/progress";
import { LogoMark, LexFox } from "../components/Brand";

export default function HomePage({
  onStartUnit,
}: {
  onStartUnit: (unitNo: number) => void;
}) {
  const [progress] = useState(loadProgress());
  const nextUnit = useMemo(() => getNextUnit(TOTAL_UNITS), []);
  const completedCount = Object.keys(progress.completedUnits).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
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

        {!nextUnit ? (
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

            <button
              onClick={() => onStartUnit(nextUnit)}
              className="w-full rounded-xl bg-[#14274d] text-white font-semibold py-4 text-lg hover:opacity-90 transition"
            >
              Start Unit {nextUnit}
            </button>
          </>
        )}
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
