/** Description d'un niveau de boule : rayon en pixels logiques, score gagné quand une fusion l'atteint, couleur. */
export interface Level {
  level: number;
  radius: number;
  score: number;
  color: number;
}

export const MAX_LEVEL = 11;

/** Score bonus quand deux boules de niveau maximal fusionnent et disparaissent. */
export const MAX_MERGE_BONUS = 100;

/** Table des 11 niveaux, indexée par `level - 1`. Le niveau 11 (diamètre 388) tient dans le bac de 560. */
export const LEVELS: readonly Level[] = [
  { level: 1, radius: 24, score: 1, color: 0xff5d73 },
  { level: 2, radius: 32, score: 3, color: 0xff8f3f },
  { level: 3, radius: 42, score: 6, color: 0xffb703 },
  { level: 4, radius: 54, score: 10, color: 0xf9e04b },
  { level: 5, radius: 68, score: 15, color: 0x8be04b },
  { level: 6, radius: 84, score: 21, color: 0x3ddc97 },
  { level: 7, radius: 102, score: 28, color: 0x4cc9f0 },
  { level: 8, radius: 122, score: 36, color: 0x4f7cff },
  { level: 9, radius: 144, score: 45, color: 0xb388ff },
  { level: 10, radius: 168, score: 55, color: 0xff6ad5 },
  { level: 11, radius: 194, score: 66, color: 0xffd166 },
];

export function levelInfo(level: number): Level {
  const info = LEVELS[level - 1];
  if (!info) throw new RangeError(`Niveau inconnu : ${level}`);
  return info;
}
