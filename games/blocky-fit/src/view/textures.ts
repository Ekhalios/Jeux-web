import Phaser from 'phaser';
import { CELL, CELL_GAP } from '../layout';
import { PIECE_COLORS, theme } from '../theme';

export const GHOST_OK_KEY = 'ghost-ok';
export const GHOST_BAD_KEY = 'ghost-bad';
export const FLASH_KEY = 'cell-flash';

export function cellKey(colorId: number): string {
  return `cell-${colorId}`;
}

/** Génère une fois les textures de bloc (une par couleur, fantômes, flash). Idempotent. */
export function ensureTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(cellKey(0))) return;
  PIECE_COLORS.forEach((color, i) => makeCell(scene, cellKey(i), color, 1, true));
  makeCell(scene, GHOST_OK_KEY, theme.accent, 0.55, false);
  makeCell(scene, GHOST_BAD_KEY, theme.danger, 0.55, false);
  makeCell(scene, FLASH_KEY, 0xffffff, 1, false);
}

function makeCell(scene: Phaser.Scene, key: string, color: number, alpha: number, shaded: boolean): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const size = CELL - CELL_GAP * 2;
  g.fillStyle(color, alpha);
  g.fillRoundedRect(CELL_GAP, CELL_GAP, size, size, 12);
  if (shaded) {
    const light = Phaser.Display.Color.ValueToColor(color).lighten(30).color;
    const dark = Phaser.Display.Color.ValueToColor(color).darken(25).color;
    g.fillStyle(dark, 0.5);
    g.fillRoundedRect(CELL_GAP, CELL_GAP + size * 0.55, size, size * 0.45, { tl: 0, tr: 0, bl: 12, br: 12 });
    g.fillStyle(light, 0.45);
    g.fillRoundedRect(CELL_GAP + 8, CELL_GAP + 7, size - 16, size * 0.28, 8);
  }
  g.generateTexture(key, CELL, CELL);
  g.destroy();
}
