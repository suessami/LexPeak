const KEY = "vocabapp_student_code";

/**
 * A special code for 쑤샘's own testing — logs in without a Supabase lookup
 * and unlocks a full unit picker on Home (jump to any unit directly,
 * instead of only ever "continue where progress left off").
 */
export const MASTER_CODE = "LEXMASTER";

export function isMasterCode(code: string | null): boolean {
  return !!code && code.trim().toUpperCase() === MASTER_CODE;
}

export function getStudentCode(): string | null {
  return localStorage.getItem(KEY);
}

export function setStudentCode(code: string) {
  localStorage.setItem(KEY, code.trim());
}

export function clearStudentCode() {
  localStorage.removeItem(KEY);
}
