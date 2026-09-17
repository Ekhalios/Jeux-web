import { GAME_WIDTH } from '@webetnes/core';
import { GRID_SIZE } from './logic/grid';

/** Taille d'une case de la grille, en pixels logiques. */
export const CELL = 76;
/** Marge intérieure d'une case (espace entre deux blocs). */
export const CELL_GAP = 3;
export const GRID_PX = CELL * GRID_SIZE;
export const GRID_X = (GAME_WIDTH - GRID_PX) / 2;
export const GRID_Y = 240;

/** Centre vertical du plateau de pièces et abscisses de ses trois emplacements. */
export const TRAY_Y = 1040;
export const TRAY_SLOT_X: readonly number[] = [130, 360, 590];
/** Échelle des pièces au repos dans le plateau. */
export const TRAY_SCALE = 0.5;
/** Décalage vertical de la pièce glissée au-dessus du doigt. */
export const DRAG_LIFT = 110;

export const DEPTH = {
  board: 0,
  cells: 1,
  ghost: 2,
  fx: 3,
  tray: 5,
  drag: 10,
  floating: 20,
  hud: 30,
  panel: 50,
} as const;

/** Centre d'une case de la grille en coordonnées monde. */
export function cellCenter(r: number, c: number): { x: number; y: number } {
  return { x: GRID_X + c * CELL + CELL / 2, y: GRID_Y + r * CELL + CELL / 2 };
}
