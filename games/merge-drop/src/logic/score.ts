/** Fenêtre (ms) pendant laquelle des fusions successives comptent comme un combo. */
export const COMBO_WINDOW_MS = 1000;

export interface ScoreState {
  score: number;
  /** Nombre de fusions enchaînées dans la fenêtre de combo. */
  chain: number;
  /** Horodatage (ms) de la dernière fusion, ou null. */
  lastMergeAt: number | null;
}

export function initialScore(): ScoreState {
  return { score: 0, chain: 0, lastMergeAt: null };
}

/**
 * Enregistre une fusion : ajoute `points` et met à jour la chaîne de combo.
 * Renvoie un nouvel état (l'ancien n'est pas modifié).
 */
export function registerMerge(state: ScoreState, points: number, now: number, windowMs = COMBO_WINDOW_MS): ScoreState {
  const chained = state.lastMergeAt !== null && now - state.lastMergeAt <= windowMs;
  return { score: state.score + points, chain: chained ? state.chain + 1 : 1, lastMergeAt: now };
}

/** Vrai quand la fusion courante fait partie d'un enchaînement (au moins la deuxième). */
export function isCombo(state: ScoreState): boolean {
  return state.chain >= 2;
}
