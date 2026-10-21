import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { ALL_WORDS, TOTAL_UNITS } from "../data/course";
import { formatHeadword } from "../data/idiom";
import { LogoMark } from "../components/Brand";
import type { WordItem } from "../data/types";

type ReportEvent = {
  kind: "unit" | "review";
  ref_no: number;
  correct: number;
  total: number;
  completed_at: string;
  wrong_word_ids: string[];
};

type ReportData = { display_name: string | null; events: ReportEvent[] };

type Range = "all" | "7d" | "30d";
const RANGE_LABEL: Record<Range, string> = { all: "전체", "7d": "최근 7일", "30d": "최근 30일" };
const RANGE_DAYS: Record<Range, number | null> = { all: null, "7d": 7, "30d": 30 };

const wordById = new Map(ALL_WORDS.map((w) => [w.id, w]));

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

/**
 * Parent page, opened by a per-student secret link (?parent=<token>).
 * Data comes only through the get_parent_report RPC, so the link itself is
 * the key. Shows progress, recent sessions, and a printable 오답 노트 built
 * from the missed-word ids each finished unit/review saved.
 */
export default function ReportPage({ token }: { token: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "notfound" | "error">("loading");
  const [report, setReport] = useState<ReportData | null>(null);
  const [range, setRange] = useState<Range>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabase) return setStatus("error");
      const { data, error } = await supabase.rpc("get_parent_report", { p_token: token });
      if (cancelled) return;
      if (error) return setStatus("error");
      if (!data) return setStatus("notfound");
      setReport(data as ReportData);
      setStatus("ok");
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const summary = useMemo(() => {
    if (!report) return null;
    const units = new Set<number>();
    const reviews = new Set<number>();
    let correct = 0;
    let total = 0;
    for (const e of report.events) {
      (e.kind === "unit" ? units : reviews).add(e.ref_no);
      correct += e.correct;
      total += e.total;
    }
    return {
      units: units.size,
      reviews: reviews.size,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      last: report.events[0]?.completed_at ?? null,
    };
  }, [report]);

  const wrongWords = useMemo(() => {
    if (!report) return [];
    const days = RANGE_DAYS[range];
    const since = days ? Date.now() - days * 86400000 : 0;
    const agg = new Map<string, { word: WordItem; count: number; last: string }>();
    for (const e of report.events) {
      if (new Date(e.completed_at).getTime() < since) continue;
      for (const id of e.wrong_word_ids ?? []) {
        const word = wordById.get(id);
        if (!word) continue;
        const cur = agg.get(id);
        if (cur) {
          cur.count += 1;
          if (e.completed_at > cur.last) cur.last = e.completed_at;
        } else {
          agg.set(id, { word, count: 1, last: e.completed_at });
        }
      }
    }
    return [...agg.values()].sort(
      (a, b) => b.count - a.count || b.last.localeCompare(a.last),
    );
  }, [report, range]);

  const name = report?.display_name ?? "학생";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 print:bg-white print:py-0">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex items-center gap-3 print:hidden">
          <LogoMark size={36} />
          <div>
            <h1 className="text-xl font-bold text-[#14274d] leading-tight">LexPeak</h1>
            <p className="text-xs text-slate-400">학부모 리포트</p>
          </div>
        </div>

        {status === "loading" && <p className="text-slate-500">불러오는 중…</p>}
        {status === "notfound" && (
          <Card>링크가 올바르지 않아요. 학원에서 받은 링크를 다시 확인해주세요.</Card>
        )}
        {status === "error" && <Card>리포트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</Card>}

        {status === "ok" && report && summary && (
          <>
            <section className="print:hidden flex flex-col gap-3">
              <Card>
                <p className="text-sm text-slate-500">{name}의 진행 상황</p>
                <p className="text-2xl font-bold text-[#14274d] mt-1">
                  {summary.units} / {TOTAL_UNITS} 유닛 완료
                </p>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-3">
                  <div
                    className="h-full bg-[#e8722c]"
                    style={{ width: `${(summary.units / TOTAL_UNITS) * 100}%` }}
                  />
                </div>
              </Card>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="복습 완료" value={`${summary.reviews}회`} />
                <Stat label="전체 정답률" value={`${summary.accuracy}%`} />
                <Stat label="마지막 학습" value={summary.last ? fmtDate(summary.last) : "-"} />
              </div>
            </section>

            {report.events.length > 0 && (
              <section className="print:hidden">
                <h2 className="text-sm font-semibold text-slate-500 mb-2">최근 학습</h2>
                <Card>
                  <ul className="divide-y divide-slate-100">
                    {report.events.slice(0, 10).map((e, i) => (
                      <li key={i} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-[#14274d] font-medium">
                          {e.kind === "unit" ? `유닛 ${e.ref_no}` : `복습 ${e.ref_no}`}
                        </span>
                        <span className="text-slate-500">
                          {e.correct}/{e.total} · 오답 {e.wrong_word_ids?.length ?? 0}개 ·{" "}
                          {fmtDate(e.completed_at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </section>
            )}

            <section>
              <div className="flex items-end justify-between gap-3 mb-2 print:mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#14274d]">
                    오답 노트 <span className="hidden print:inline">— {name}</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    틀린 횟수가 많은 단어부터 보여요 · {RANGE_LABEL[range]} · {wrongWords.length}개
                  </p>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value as Range)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                  >
                    {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
                      <option key={r} value={r}>
                        {RANGE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => window.print()}
                    disabled={wrongWords.length === 0}
                    className="rounded-lg bg-[#14274d] text-white text-sm font-medium px-3 py-1.5 disabled:opacity-40"
                  >
                    인쇄 / PDF 저장
                  </button>
                </div>
              </div>

              {wrongWords.length === 0 ? (
                <Card>
                  <p className="text-sm text-slate-500 text-center">아직 모아둔 오답이 없어요.</p>
                </Card>
              ) : (
                <ol className="flex flex-col gap-2">
                  {wrongWords.map(({ word, count }, i) => (
                    <li
                      key={word.id}
                      className="break-inside-avoid rounded-xl bg-white border border-slate-200 px-4 py-3 print:rounded-none print:border-0 print:border-b print:px-0"
                    >
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs text-slate-400 w-5">{i + 1}</span>
                        <span className="text-lg font-bold text-[#14274d]">{formatHeadword(word.word)}</span>
                        <span className="text-xs italic text-slate-400">{word.pos}</span>
                        <span className="text-base font-semibold text-[#e8722c]">{word.meaningKo}</span>
                        {count > 1 && (
                          <span className="ml-auto text-xs font-semibold text-red-500">{count}번 틀림</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 mt-1 pl-7">{word.definitionEn}</p>
                      <p className="text-sm text-slate-500 italic mt-0.5 pl-7">{word.example}</p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-2xl bg-white shadow-sm border border-slate-200 p-5 text-slate-700">
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-3 text-center">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-base font-bold text-[#14274d]">{value}</p>
    </div>
  );
}
