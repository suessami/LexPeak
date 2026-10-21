import { supabase } from "../lib/supabase";
import { getStudentCode } from "./studentCode";

// Cache the student's row id (uuid) per code so we don't look it up on every
// single write. Cleared whenever the code changes (new session/device).
let cachedStudentId: string | null = null;
let cachedForCode: string | null = null;

export async function verifyStudentCode(code: string): Promise<boolean> {
  if (!supabase) return true; // no backend configured — don't block local use
  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("code", code.trim())
    .maybeSingle();
  if (error || !data) return false;
  cachedStudentId = data.id;
  cachedForCode = code.trim();
  return true;
}

async function getStudentId(): Promise<string | null> {
  const code = getStudentCode();
  if (!code) return null;
  if (cachedForCode === code && cachedStudentId) return cachedStudentId;

  if (!supabase) return null;
  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("code", code)
    .maybeSingle();
  if (error || !data) return null;
  cachedStudentId = data.id;
  cachedForCode = code;
  return data.id;
}

export async function logProgress(
  kind: "unit" | "review",
  refNo: number,
  correct: number,
  total: number,
) {
  if (!supabase) return; // offline / no backend configured — silently skip
  try {
    const studentId = await getStudentId();
    if (!studentId) return;
    await supabase.from("progress_events").insert({
      student_id: studentId,
      kind,
      ref_no: refNo,
      correct,
      total,
    });
  } catch {
    // Never let a sync failure interrupt the learning flow.
  }
}

const RESET_SEEN_KEY = "vocabapp_reset_seen";

/**
 * Teacher-triggered reset: if the student's row has a `progress_reset_at`
 * newer than the last reset this device applied, wipe this device's local
 * progress (completed units/reviews, scores, missed words). Lets 쑤샘 reset
 * a student from the server without touching their device. Returns true if
 * a reset was applied (caller should reload so screens re-read progress).
 */
export async function applyRemoteReset(): Promise<boolean> {
  const code = getStudentCode();
  if (!supabase || !code) return false;
  try {
    const { data, error } = await supabase
      .from("students")
      .select("progress_reset_at")
      .eq("code", code)
      .maybeSingle();
    const resetAt = data?.progress_reset_at as string | null | undefined;
    if (error || !resetAt) return false;
    const seen = localStorage.getItem(RESET_SEEN_KEY);
    if (seen && new Date(seen) >= new Date(resetAt)) return false;
    localStorage.removeItem("vocabapp_progress_v1");
    localStorage.setItem(RESET_SEEN_KEY, resetAt);
    return true;
  } catch {
    return false;
  }
}
