const STORAGE_KEY = "vocabapp_progress_v1";

export interface ProgressState {
  /** unitNo -> true once the learn+quiz for that unit is finished */
  completedUnits: Record<number, boolean>;
  /** reviewNo -> true once that review is finished */
  completedReviews: Record<number, boolean>;
  /** unitNo -> { correct, total } last quiz result */
  unitScores: Record<number, { correct: number; total: number }>;
  reviewScores: Record<number, { correct: number; total: number }>;
}

function emptyState(): ProgressState {
  return {
    completedUnits: {},
    completedReviews: {},
    unitScores: {},
    reviewScores: {},
  };
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

export function saveProgress(state: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best-effort; ignore quota/availability errors
  }
}

export function markUnitComplete(unitNo: number, correct: number, total: number) {
  const state = loadProgress();
  state.completedUnits[unitNo] = true;
  state.unitScores[unitNo] = { correct, total };
  saveProgress(state);
}

export function markReviewComplete(reviewNo: number, correct: number, total: number) {
  const state = loadProgress();
  state.completedReviews[reviewNo] = true;
  state.reviewScores[reviewNo] = { correct, total };
  saveProgress(state);
}

/** Next unit the student hasn't finished yet (1-indexed), or null if all done. */
export function getNextUnit(totalUnits: number): number | null {
  const state = loadProgress();
  for (let u = 1; u <= totalUnits; u++) {
    if (!state.completedUnits[u]) return u;
  }
  return null;
}
