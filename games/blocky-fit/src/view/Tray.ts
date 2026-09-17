import Phaser from 'phaser';
import { CELL, DEPTH, DRAG_LIFT, GRID_X, GRID_Y, TRAY_SCALE, TRAY_SLOT_X, TRAY_Y } from '../layout';
import { TRAY_SIZE } from '../logic/generator';
import type { Shape } from '../logic/shapes';
import { createPieceView, pieceTopLeft } from './PieceView';

export interface TrayHandlers {
  /** Faux pendant une pub ou après le game over : le glissement est refusé. */
  canDrag(): boolean;
  onPick(): void;
  /** Appelé quand la case visée change ; la scène affiche le fantôme. */
  onGhost(shape: Shape, row: number, col: number): void;
  onGhostHide(): void;
  /** Tente la pose ; vrai si la pièce a été posée (elle quitte alors le plateau). */
  onDrop(shape: Shape, row: number, col: number): boolean;
  /** Après une pose réussie et le retrait de la pièce du plateau. */
  onPlaced(): void;
}

/** Plateau des trois pièces et gestion du glisser-déposer. */
export class Tray {
  private readonly shapes: (Shape | null)[] = [null, null, null];
  private readonly views: (Phaser.GameObjects.Container | null)[] = [null, null, null];
  private dragging = -1;
  private lastRow = Number.NaN;
  private lastCol = Number.NaN;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly handlers: TrayHandlers,
  ) {
    scene.input.on('pointermove', this.onMove, this);
    scene.input.on('pointerup', this.onUp, this);
    scene.input.on('pointerupoutside', this.onUp, this);
  }

  get current(): readonly (Shape | null)[] {
    return this.shapes;
  }

  isEmpty(): boolean {
    return this.shapes.every((s) => s === null);
  }

  /** Remplace le contenu du plateau avec une petite animation d'apparition. */
  setShapes(shapes: readonly Shape[]): void {
    this.clear();
    for (let i = 0; i < TRAY_SIZE; i++) {
      const shape = shapes[i];
      const x = TRAY_SLOT_X[i];
      if (!shape || x === undefined) continue;
      const view = createPieceView(this.scene, shape, x, this.slotY()).setDepth(DEPTH.tray).setScale(0);
      view.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.pick(i, pointer));
      this.scene.tweens.add({ targets: view, scale: TRAY_SCALE, duration: 220, delay: i * 60, ease: 'Back.easeOut' });
      this.shapes[i] = shape;
      this.views[i] = view;
    }
  }

  clear(): void {
    this.dragging = -1;
    for (let i = 0; i < TRAY_SIZE; i++) {
      this.views[i]?.destroy();
      this.views[i] = null;
      this.shapes[i] = null;
    }
  }

  private slotY(): number {
    return TRAY_Y;
  }

  private pick(index: number, pointer: Phaser.Input.Pointer): void {
    const view = this.views[index];
    const shape = this.shapes[index];
    if (!view || !shape || this.dragging >= 0 || !this.handlers.canDrag()) return;
    this.dragging = index;
    this.lastRow = Number.NaN;
    this.lastCol = Number.NaN;
    this.scene.tweens.killTweensOf(view);
    view.setDepth(DEPTH.drag);
    this.scene.tweens.add({ targets: view, scale: 1, duration: 90 });
    this.handlers.onPick();
    this.follow(view, shape, pointer);
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    const view = this.views[this.dragging];
    const shape = this.shapes[this.dragging];
    if (this.dragging < 0 || !view || !shape) return;
    this.follow(view, shape, pointer);
  }

  private follow(view: Phaser.GameObjects.Container, shape: Shape, pointer: Phaser.Input.Pointer): void {
    view.setPosition(pointer.x, pointer.y - DRAG_LIFT);
    const { x, y } = pieceTopLeft(view, shape);
    const col = Math.round((x - GRID_X) / CELL);
    const row = Math.round((y - GRID_Y) / CELL);
    if (row === this.lastRow && col === this.lastCol) return;
    this.lastRow = row;
    this.lastCol = col;
    this.handlers.onGhost(shape, row, col);
  }

  private onUp(): void {
    const index = this.dragging;
    const view = this.views[index];
    const shape = this.shapes[index];
    if (index < 0 || !view || !shape) return;
    this.dragging = -1;
    this.handlers.onGhostHide();

    const { x, y } = pieceTopLeft(view, shape);
    const col = Math.round((x - GRID_X) / CELL);
    const row = Math.round((y - GRID_Y) / CELL);
    if (this.handlers.onDrop(shape, row, col)) {
      view.destroy();
      this.views[index] = null;
      this.shapes[index] = null;
      this.handlers.onPlaced();
      return;
    }
    view.setDepth(DEPTH.tray);
    this.scene.tweens.killTweensOf(view);
    this.scene.tweens.add({
      targets: view,
      x: TRAY_SLOT_X[index] ?? 360,
      y: this.slotY(),
      scale: TRAY_SCALE,
      duration: 180,
      ease: 'Cubic.easeOut',
    });
  }
}
