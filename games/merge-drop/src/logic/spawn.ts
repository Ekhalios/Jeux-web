/** Interface minimale du générateur aléatoire (compatible avec `Rng` du socle). */
export interface RandomSource {
  next(): number;
}

export const SPAWN_MIN_LEVEL = 1;
export const SPAWN_MAX_LEVEL = 5;

/**
 * Poids de tirage des niveaux 1 à 5. Distribution volontairement assez plate :
 * trop de petites boules fusionnent vite et n'occupent pas de place, la partie ne finit jamais.
 */
export const SPAWN_WEIGHTS: readonly number[] = [26, 24, 20, 17, 13];

/** Tire le niveau de la prochaine boule, toujours entre 1 et 5. */
export function nextLevel(rng: RandomSource): number {
  const total = SPAWN_WEIGHTS.reduce((sum, w) => sum + w, 0);
  let roll = rng.next() * total;
  for (let i = 0; i < SPAWN_WEIGHTS.length; i++) {
    roll -= SPAWN_WEIGHTS[i]!;
    if (roll < 0) return SPAWN_MIN_LEVEL + i;
  }
  return SPAWN_MAX_LEVEL;
}
