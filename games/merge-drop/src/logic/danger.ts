/** Position et vitesse d'une boule posée dans le bac (y vers le bas, comme Phaser). */
export interface DangerBall {
  y: number;
  radius: number;
  speed: number;
}

export interface DangerOptions {
  /** Vitesse (px par pas) sous laquelle une boule est considérée immobile. */
  speedThreshold: number;
  /** Marge sous la ligne à partir de laquelle une boule est « proche » (pour le clignotement). */
  nearMargin: number;
}

export const DEFAULT_DANGER_OPTIONS: DangerOptions = { speedThreshold: 1.5, nearMargin: 90 };

/** Vrai si une boule lente a son centre au-dessus de la ligne de danger. */
export function isInDanger(balls: readonly DangerBall[], lineY: number, options = DEFAULT_DANGER_OPTIONS): boolean {
  return balls.some((b) => b.speed < options.speedThreshold && b.y < lineY);
}

/** Vrai si une boule lente a son sommet proche de la ligne (sans forcément la dépasser). */
export function isNearDanger(balls: readonly DangerBall[], lineY: number, options = DEFAULT_DANGER_OPTIONS): boolean {
  return balls.some((b) => b.speed < options.speedThreshold && b.y - b.radius < lineY + options.nearMargin);
}

/** Durée (ms) au bout de laquelle un danger continu fait perdre la partie. */
export const GAME_OVER_DANGER_MS = 2000;
/** Durée (ms) de danger continu après laquelle le bouton de récompense est proposé. */
export const REWARD_DANGER_MS = 1000;

/**
 * Accumulateur de danger continu : ajoute `deltaMs` si `inDanger`, sinon repart de zéro.
 * Renvoie la nouvelle durée accumulée.
 */
export function accumulateDanger(elapsed: number, inDanger: boolean, deltaMs: number): number {
  return inDanger ? elapsed + deltaMs : 0;
}
