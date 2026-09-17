import { describe, expect, it } from 'vitest';
// Import direct du fichier : l'index de @webetnes/core charge Phaser, qui exige `window`.
import { Rng } from '../../../../packages/core/src/rng';
import { PieceGenerator, TRAY_SIZE } from './generator';
import { createGrid, hasAnyMove, type Grid } from './grid';
import { SHAPES } from './shapes';

function fullExcept(holes: [number, number][]): Grid {
  const g = createGrid();
  for (const line of g) line.fill(1);
  for (const [r, c] of holes) g[r]![c] = 0;
  return g;
}

describe('PieceGenerator', () => {
  it('tire 3 pièces parmi les formes connues', () => {
    const tray = new PieceGenerator(new Rng(1)).nextTray(createGrid());
    expect(tray).toHaveLength(TRAY_SIZE);
    for (const s of tray) expect(SHAPES[s.id]).toBe(s);
  });

  it('est déterministe pour une même graine', () => {
    const a = new PieceGenerator(new Rng(42)).nextTray(createGrid());
    const b = new PieceGenerator(new Rng(42)).nextTray(createGrid());
    expect(a.map((s) => s.id)).toEqual(b.map((s) => s.id));
  });

  it('grille presque pleine : au moins une pièce plaçable, pour toute graine', () => {
    const grid = fullExcept([[5, 5]]);
    for (let seed = 0; seed < 200; seed++) {
      const tray = new PieceGenerator(new Rng(seed)).nextTray(grid);
      expect(hasAnyMove(grid, tray)).toBe(true);
    }
  });

  it('un trou de 2 cases : la pièce garantie rentre dans le trou', () => {
    const grid = fullExcept([
      [2, 0],
      [3, 0],
    ]);
    for (let seed = 0; seed < 100; seed++) {
      const tray = new PieceGenerator(new Rng(seed)).nextTray(grid);
      expect(hasAnyMove(grid, tray)).toBe(true);
      expect(tray.some((s) => s.cells.length <= 2)).toBe(true);
    }
  });

  it('grille pleine : rend quand même 3 pièces sans planter', () => {
    const tray = new PieceGenerator(new Rng(7)).nextTray(fullExcept([]));
    expect(tray).toHaveLength(TRAY_SIZE);
  });

  it('le plateau de secours est un 1×1 et deux pièces de 2 cases, toujours plaçable s’il reste une case', () => {
    const gen = new PieceGenerator(new Rng(3));
    const tray = gen.rescueTray();
    expect(tray.map((s) => s.cells.length)).toEqual([1, 2, 2]);
    expect(hasAnyMove(fullExcept([[0, 7]]), tray)).toBe(true);
  });
});
