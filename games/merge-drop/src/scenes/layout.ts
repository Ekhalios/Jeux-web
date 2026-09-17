import { GAME_HEIGHT, GAME_WIDTH } from '@webetnes/core';

/** Géométrie partagée du bac et des zones de jeu (unités logiques 720×1280). */
export const BIN_INNER_WIDTH = 620;
export const WALL_THICKNESS = 24;
export const BIN_LEFT = (GAME_WIDTH - BIN_INNER_WIDTH) / 2; // 50
export const BIN_RIGHT = BIN_LEFT + BIN_INNER_WIDTH; // 670
export const FLOOR_Y = GAME_HEIGHT - 50; // sommet du sol
export const DANGER_LINE_Y = 330;
/** Hauteur à laquelle la boule tenue attend au-dessus du bac. */
export const HOLD_Y = 235;
/** Délai avant que la boule suivante soit disponible après un lâcher. */
export const DROP_COOLDOWN_MS = 500;

/** Profondeurs d'affichage. */
export const DEPTH = { bin: 0, balls: 10, line: 20, held: 30, fx: 40, hud: 50, overlay: 100 } as const;
