import { describe, expect, it } from 'vitest';
import { RESCUE_SHAPES, SHAPES } from './shapes';

describe('SHAPES', () => {
  it('contient une vingtaine de formes avec des identifiants égaux à leur index', () => {
    expect(SHAPES.length).toBeGreaterThanOrEqual(20);
    SHAPES.forEach((s, i) => expect(s.id).toBe(i));
  });

  it('chaque forme a des cases dans son encombrement et une couleur valide', () => {
    for (const s of SHAPES) {
      expect(s.cells.length).toBeGreaterThan(0);
      expect(s.colorId).toBeGreaterThanOrEqual(0);
      for (const cell of s.cells) {
        expect(cell.r).toBeGreaterThanOrEqual(0);
        expect(cell.c).toBeGreaterThanOrEqual(0);
        expect(cell.r).toBeLessThan(s.rows);
        expect(cell.c).toBeLessThan(s.cols);
      }
    }
  });

  it('inclut les lignes 1 à 5, les carrés, les L et les T dans 4 orientations', () => {
    const byName = (prefix: string) => SHAPES.filter((s) => s.name.startsWith(prefix));
    expect(byName('line-h').map((s) => s.cells.length)).toEqual([2, 3, 4, 5]);
    expect(byName('line-v').map((s) => s.cells.length)).toEqual([2, 3, 4, 5]);
    expect(byName('square-2')[0]?.cells.length).toBe(4);
    expect(byName('square-3')[0]?.cells.length).toBe(9);
    expect(byName('l3')).toHaveLength(4);
    expect(byName('l5')).toHaveLength(4);
    expect(byName('t4')).toHaveLength(4);
    for (const s of [...byName('l3'), ...byName('l5'), ...byName('t4')]) {
      expect(s.rows + s.cols).toBeGreaterThan(2);
    }
  });

  it('les orientations d’une même famille sont distinctes', () => {
    const key = (cells: readonly { r: number; c: number }[]) =>
      cells
        .map((c) => `${c.r},${c.c}`)
        .sort()
        .join('|');
    const l5 = SHAPES.filter((s) => s.name.startsWith('l5')).map((s) => key(s.cells));
    expect(new Set(l5).size).toBe(4);
  });

  it('le plateau de secours est un 1×1 et deux pièces de 2 cases', () => {
    expect(RESCUE_SHAPES.map((s) => s.cells.length)).toEqual([1, 2, 2]);
  });
});
