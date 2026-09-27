import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { TOTAL_UNITS } from "../data/course";
import { LogoMark } from "../components/Brand";

type ReportData = {
  displayName: string | null;
  completedUnits: number;
  completedReviews: number;
  totalCorrect: number;
  totalAnswered: number;
  lastActivity: string | null;
};

export default function ReportPage({ code }: { code: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "notfound" | "error">(
    "loading",
  );
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase) {
        setStatus("error");
        return;
      }
      const { data: student, error: studentErr } = await supabase
        .from("students")
        .select("id, display_name")
        .eq("code", code)
        .maybeSingle();

      if (cancelled) return;
      if (studentErr || !student) {
        setStatus("notfound");
        return;
      }

      const { data: events, error: eventsErr } = await supabase
        .from("progress_events")
        .select("kind, ref_no, correct, total, completed_at")
        .eq("student_id", student.id)
        .order("completed_at", { ascending: false });

      if (cancelled) return;
      if (eventsErr || !events) {
        setStatus("error");
        return;
      }

      const unitNumbers = new Set<number>();
      const reviewNumbers = new Set<number>();
      let totalCorrect = 0;
      let totalAnswered = 0;
      for (const e of events) {
        if (e.kind === "unit") unitNumbers.add(e.ref_no);
        else reviewNumbers.add(e.ref_no);
        totalCorrect += e.correct;
        totalAnswered += e.total;
      }

      setReport({
        displayName: student.display_name,
        completedUnits: unitNumbers.size,
        completedReviews: reviewNumbers.size,
        totalCorrect,
        totalAnswered,
        lastActivity: events[0]?.completed_at ?? null,
      });
      setStatus("ok");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <LogoMark size={40} />
          <h1 className="text-2xl font-bold text-[#14274d]">LexPeak</h1>
          <p className="text-xs text-slate-400">Parent Progress Report</p>
        </div>

        {status === "loading" && (
          <p className="text-slate-500">Loading report…</p>
        )}

        {status === "notfound" && (
          <div className="w-full rounded-2xl bg-white shadow-md border border-slate-200 p-6 text-center text-slate-600">
            학생 코드를 찾을 수 없어요. 링크를 다시 확인해주세요.
          </div>
        )}

        {status === "error" && (
          <div className="w-full rounded-2xl bg-white shadow-md border border-slate-200 p-6 text-center text-slate-600">
            리포트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </div>
        )}

        {status === "ok" && report && (
          <>
            <div className="w-full rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-3">
              <p className="text-slate-500 text-sm">
                {report.displayName ?? "학생"}의 진행 상황
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {report.completedUnits} / {TOTAL_UNITS} 유닛 완료
              </p>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#e8722c]"
                  style={{
                    width: `${(report.completedUnits / TOTAL_UNITS) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white shadow-md border border-slate-200 p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">복습 완료</p>
                <p className="text-xl font-bold text-[#14274d]">
                  {report.completedReviews}회
                </p>
              </div>
              <div className="rounded-2xl bg-white shadow-md border border-slate-200 p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">전체 정답률</p>
                <p className="text-xl font-bold text-[#14274d]">
                  {report.totalAnswered > 0
                    ? Math.round(
                        (report.totalCorrect / report.totalAnswered) * 100,
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>

            <div className="w-full rounded-2xl bg-[#eef1f7] text-[#14274d] text-sm text-center py-3">
              {report.lastActivity
                ? `마지막 학습: ${new Date(report.lastActivity).toLocaleDateString(
                    "ko-KR",
                  )}`
                : "아직 학습 기록이 없어요"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
