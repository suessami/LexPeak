const KEY = "vocabapp_student_code";

export function getStudentCode(): string | null {
  return localStorage.getItem(KEY);
}

export function setStudentCode(code: string) {
  localStorage.setItem(KEY, code.trim());
}
