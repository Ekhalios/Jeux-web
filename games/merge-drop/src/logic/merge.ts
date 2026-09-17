import { MAX_LEVEL, MAX_MERGE_BONUS, levelInfo } from './levels';

/** Résultat d'une fusion : `level` vaut `null` quand les deux boules disparaissent sans successeur. */
export interface MergeResult {
  level: number | null;
  score: number;
}

/**
 * Règle de fusion : deux boules de même niveau donnent une boule du niveau supérieur.
 * Deux boules de niveau maximal s'annihilent avec un bonus.
 */
export function mergeResult(a: number, b: number): MergeResult | null {
  if (a !== b) return null;
  if (a >= MAX_LEVEL) return { level: null, score: MAX_MERGE_BONUS };
  const next = a + 1;
  return { level: next, score: levelInfo(next).score };
}
