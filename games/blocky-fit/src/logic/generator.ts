import type { Rng } from '@webetnes/core';
import { canPlaceAnywhere, hasAnyMove, type Grid } from './grid';
import { RESCUE_SHAPES, SHAPES, type Shape } from './shapes';

export const TRAY_SIZE = 3;
export const MAX_RETRIES = 20;

/** Tire les pièces du plateau avec un Rng déterministe. */
export class PieceGenerator {
  constructor(
    private readonly rng: Rng,
    private readonly shapes: readonly Shape[] = SHAPES,
  ) {}

  /**
   * Trois pièces au hasard. Si aucune n'est plaçable, on rejoue le tirage (jusqu'à 20 fois) ;
   * si le hasard n'a toujours rien donné alors qu'une forme plaçable existe, une des trois
   * pièces est remplacée par une forme plaçable : la garantie est donc absolue.
   */
  nextTray(grid: Grid): Shape[] {
    let tray = this.draw();
    for (let i = 0; i < MAX_RETRIES && !hasAnyMove(grid, tray); i++) tray = this.draw();
    if (!hasAnyMove(grid, tray)) {
      const placeable = this.shapes.filter((s) => canPlaceAnywhere(grid, s));
      if (placeable.length > 0) tray[this.rng.int(0, TRAY_SIZE - 1)] = this.rng.pick(placeable);
    }
    return tray;
  }

  /** Plateau accordé par la pub récompensée. */
  rescueTray(): Shape[] {
    return RESCUE_SHAPES.slice();
  }

  private draw(): Shape[] {
    const tray: Shape[] = [];
    for (let i = 0; i < TRAY_SIZE; i++) tray.push(this.rng.pick(this.shapes));
    return tray;
  }
}
