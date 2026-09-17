import Phaser from 'phaser';
import { CELL } from '../layout';
import type { Shape } from '../logic/shapes';
import { cellKey } from './textures';

/** Zone tactile minimale d'une pièce (en unités locales, avant échelle) pour les petites formes. */
const MIN_HIT = CELL * 3;

/**
 * Conteneur d'une pièce : un bloc par case, centré sur (0, 0).
 * Le coin haut-gauche de la forme est donc à (-cols*CELL/2, -rows*CELL/2).
 */
export function createPieceView(scene: Phaser.Scene, shape: Shape, x: number, y: number): Phaser.GameObjects.Container {
  const offsetX = -(shape.cols * CELL) / 2 + CELL / 2;
  const offsetY = -(shape.rows * CELL) / 2 + CELL / 2;
  const blocks = shape.cells.map((cell) => scene.add.image(offsetX + cell.c * CELL, offsetY + cell.r * CELL, cellKey(shape.colorId)));
  const container = scene.add.container(x, y, blocks);
  const w = Math.max(MIN_HIT, shape.cols * CELL);
  const h = Math.max(MIN_HIT, shape.rows * CELL);
  container.setSize(w, h);
  container.setInteractive({ useHandCursor: true });
  return container;
}

/** Coin haut-gauche (monde) de la forme portée par un conteneur à l'échelle 1. */
export function pieceTopLeft(view: Phaser.GameObjects.Container, shape: Shape): { x: number; y: number } {
  return { x: view.x - (shape.cols * CELL) / 2, y: view.y - (shape.rows * CELL) / 2 };
}
