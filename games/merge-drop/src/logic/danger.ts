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

/**
 * Seuil de vitesse : dans un bac plein, les boules posées tremblent de 1 à 3 px par pas sous
 * les collisions voisines ; elles doivent compter comme immobiles. Une boule en chute dépasse 6.
 */
export const DEFAULT_DANGER_OPTIONS: DangerOptions = { speedThreshold: 4, nearMargin: 90 };

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

/** Vitesse à laquelle le compteur de danger redescend hors danger (ms perdues par ms écoulée). */
export const DANGER_DECAY_RATE = 0.5;

/**
 * Accumulateur de danger : ajoute `deltaMs` si `inDanger`, sinon décroît lentement.
 * Une remise à zéro brutale rendait la défaite presque impossible : il suffisait qu'une boule
 * au-dessus de la ligne bouge un instant pour effacer tout le temps accumulé.
 */
export function accumulateDanger(elapsed: number, inDanger: boolean, deltaMs: number): number {
  return inDanger ? elapsed + deltaMs : Math.max(0, elapsed - deltaMs * DANGER_DECAY_RATE);
}
