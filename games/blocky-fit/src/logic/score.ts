/** Points par ligne effacée : 10 par case × 8 cases. */
export const LINE_SCORE = 80;
/** Bonus par niveau de série. */
export const STREAK_BONUS = 20;

export interface PlacementScore {
  /** Nombre de cases de la pièce posée. */
  cells: number;
  /** Lignes et colonnes effacées par ce placement. */
  linesCleared: number;
  /** Série courante, ce placement inclus (1 = premier placement qui efface). */
  streak: number;
}

/** Multiplicateur de combo : ×1 pour une ligne, ×2 pour deux, ×3 pour trois… */
export function comboMultiplier(linesCleared: number): number {
  return Math.max(1, linesCleared);
}

/**
 * Score d'un placement : +1 par case, +80 par ligne × multiplicateur de combo,
 * puis +streak × 20 si au moins une ligne a été effacée.
 */
export function scorePlacement({ cells, linesCleared, streak }: PlacementScore): number {
  let total = cells;
  if (linesCleared > 0) {
    total += LINE_SCORE * linesCleared * comboMultiplier(linesCleared);
    total += Math.max(0, streak) * STREAK_BONUS;
  }
  return total;
}

/** Série après un placement : incrémentée si une ligne tombe, remise à zéro sinon. */
export function nextStreak(streak: number, linesCleared: number): number {
  return linesCleared > 0 ? streak + 1 : 0;
}
