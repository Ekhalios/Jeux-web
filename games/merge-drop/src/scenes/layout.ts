import { GAME_HEIGHT, GAME_WIDTH } from '@webetnes/core';

/**
 * Géométrie partagée du bac et des zones de jeu (unités logiques 720×1280).
 * Bac volontairement étroit : deux boules de niveau 10 (diamètre 336) ne tiennent pas côte à côte,
 * ce qui force l'empilement et crée la pression de fin de partie, comme dans le jeu de référence.
 */
export const BIN_INNER_WIDTH = 560;
export const WALL_THICKNESS = 24;
export const BIN_LEFT = (GAME_WIDTH - BIN_INNER_WIDTH) / 2; // 80
export const BIN_RIGHT = BIN_LEFT + BIN_INNER_WIDTH; // 640
export const FLOOR_Y = GAME_HEIGHT - 50; // sommet du sol
export const DANGER_LINE_Y = 380;
/** Hauteur à laquelle la boule tenue attend au-dessus du bac. */
export const HOLD_Y = 235;
/** Délai avant que la boule suivante soit disponible après un lâcher. */
export const DROP_COOLDOWN_MS = 500;

/** Profondeurs d'affichage. */
export const DEPTH = { bin: 0, balls: 10, line: 20, held: 30, fx: 40, hud: 50, overlay: 100 } as const;
