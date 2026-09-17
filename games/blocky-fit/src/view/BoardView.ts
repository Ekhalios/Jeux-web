import Phaser from 'phaser';
import { CELL, CELL_GAP, DEPTH, GRID_PX, GRID_X, GRID_Y, cellCenter } from '../layout';
import { GRID_SIZE, type Grid } from '../logic/grid';
import type { Cell, Shape } from '../logic/shapes';
import { theme } from '../theme';
import { FLASH_KEY, GHOST_BAD_KEY, GHOST_OK_KEY, cellKey } from './textures';

const MAX_SHAPE_CELLS = 9;
const FX_POOL = GRID_SIZE * GRID_SIZE;
const SLOT_COLOR = 0x222c42;

/** Grille visuelle : fond, blocs posés, fantôme de placement et effets de disparition. */
export class BoardView {
  private readonly cells: Phaser.GameObjects.Image[] = [];
  private readonly ghost: Phaser.GameObjects.Image[] = [];
  private readonly fx: Phaser.GameObjects.Image[] = [];
  private fxIndex = 0;

  constructor(private readonly scene: Phaser.Scene) {
    this.drawBackground();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const { x, y } = cellCenter(r, c);
        this.cells.push(scene.add.image(x, y, cellKey(0)).setDepth(DEPTH.cells).setVisible(false));
      }
    }
    for (let i = 0; i < MAX_SHAPE_CELLS; i++) {
      this.ghost.push(scene.add.image(0, 0, GHOST_OK_KEY).setDepth(DEPTH.ghost).setVisible(false));
    }
    for (let i = 0; i < FX_POOL; i++) {
      this.fx.push(scene.add.image(0, 0, FLASH_KEY).setDepth(DEPTH.fx).setVisible(false));
    }
  }

  /** Synchronise les blocs affichés avec la grille logique. */
  render(grid: Grid): void {
    for (let r = 0; r < GRID_SIZE; r++) {
      const line = grid[r];
      for (let c = 0; c < GRID_SIZE; c++) {
        const value = line?.[c] ?? 0;
        const img = this.cells[r * GRID_SIZE + c];
        if (!img) continue;
        if (value === 0) {
          img.setVisible(false);
        } else {
          img.setTexture(cellKey(value - 1)).setVisible(true);
        }
      }
    }
  }

  showGhost(shape: Shape, row: number, col: number, ok: boolean): void {
    const key = ok ? GHOST_OK_KEY : GHOST_BAD_KEY;
    this.ghost.forEach((img, i) => {
      const cell = shape.cells[i];
      if (!cell) {
        img.setVisible(false);
        return;
      }
      const { x, y } = cellCenter(row + cell.r, col + cell.c);
      img.setPosition(x, y).setTexture(key).setVisible(true);
    });
  }

  hideGhost(): void {
    for (const img of this.ghost) img.setVisible(false);
  }

  /** Flash blanc puis rétrécissement des cases effacées. */
  flashCells(cells: readonly Cell[]): void {
    for (const cell of cells) {
      const img = this.fx[this.fxIndex];
      this.fxIndex = (this.fxIndex + 1) % FX_POOL;
      if (!img) continue;
      const { x, y } = cellCenter(cell.r, cell.c);
      this.scene.tweens.killTweensOf(img);
      img.setPosition(x, y).setScale(1).setAlpha(1).setVisible(true);
      this.scene.tweens.add({
        targets: img,
        scale: 0,
        alpha: 0,
        angle: 90,
        duration: 320,
        delay: 60,
        ease: 'Cubic.easeIn',
        onComplete: () => img.setVisible(false).setAngle(0),
      });
    }
  }

  private drawBackground(): void {
    const g = this.scene.add.graphics().setDepth(DEPTH.board);
    const pad = 14;
    g.fillStyle(theme.surface, 1);
    g.fillRoundedRect(GRID_X - pad, GRID_Y - pad, GRID_PX + pad * 2, GRID_PX + pad * 2, 22);
    g.fillStyle(SLOT_COLOR, 1);
    const size = CELL - CELL_GAP * 2;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        g.fillRoundedRect(GRID_X + c * CELL + CELL_GAP, GRID_Y + r * CELL + CELL_GAP, size, size, 10);
      }
    }
  }
}
