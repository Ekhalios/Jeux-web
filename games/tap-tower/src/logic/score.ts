export type LandingKind = 'perfect' | 'cut' | 'miss';

/** Nombre de perfects consécutifs à partir duquel la largeur regagne. */
export const REGAIN_FROM_STREAK = 3;
/** Largeur regagnée par perfect une fois la série engagée. */
export const REGAIN_PER_PERFECT = 12;

/**
 * Points rapportés par une pose.
 * +1 par bloc posé, +1 supplémentaire par perfect consécutif au-delà du premier
 * (`perfectStreak` est la série APRÈS cette pose : 1 = premier perfect).
 */
export function scoreForLanding(kind: LandingKind, perfectStreak: number): number {
  if (kind === 'miss') return 0;
  if (kind === 'cut') return 1;
  return 1 + Math.max(0, perfectStreak - 1);
}

/**
 * Largeur du bloc après un placement parfait : à partir de `regainFrom` perfects
 * consécutifs, +`regain` px par perfect, sans jamais dépasser `base`.
 */
export function widthAfterPerfect(
  width: number,
  streak: number,
  base: number,
  regainFrom = REGAIN_FROM_STREAK,
  regain = REGAIN_PER_PERFECT,
): number {
  if (streak < regainFrom) return Math.min(width, base);
  return Math.min(base, width + regain);
}
