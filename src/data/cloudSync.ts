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
