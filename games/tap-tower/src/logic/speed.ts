export const BASE_SPEED = 4;
export const SPEED_PER_LEVEL = 0.15;
export const MAX_SPEED = 11;

/**
 * Vitesse horizontale du bloc mobile en pixels par image (référence 60 fps),
 * pour l'étage `level` (0 = premier bloc posé sur la base). Plafonnée.
 */
export function speedForLevel(
  level: number,
  base = BASE_SPEED,
  perLevel = SPEED_PER_LEVEL,
  max = MAX_SPEED,
): number {
  const safeLevel = Math.max(0, level);
  return Math.min(max, base + perLevel * safeLevel);
}
