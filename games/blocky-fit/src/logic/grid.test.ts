import { describe, expect, it } from 'vitest';
import {
  canPlace,
  canPlaceAnywhere,
  clearLines,
  countLines,
  createGrid,
  findFullLines,
  hasAnyMove,
  linesCells,
  place,
  type Grid,
} from './grid';
import { SHAPES, type Shape } from './shapes';

const byName = (name: string): Shape => {
  const s = SHAPES.find((x) => x.name === name);
  if (!s) throw new Error(`forme inconnue ${name}`);
  return s;
};
const single = byName('single');
const lineH3 = byName('line-h3');
const lineV5 = byName('line-v5');
const square3 = byName('square-3');

/** Grille remplie partout sauf aux cases listées. */
function fullExcept(holes: [number, number][]): Grid {
  const g = createGrid();
  for (const line of g) line.fill(1);
  for (const [r, c] of holes) g[r]![c] = 0;
  return g;
}

describe('createGrid', () => {
  it('crée une grille 8×8 vide', () => {
    const g = createGrid();
    expect(g).toHaveLength(8);
    for (const line of g) expect(line).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe('canPlace', () => {
  it('accepte un placement dans une grille vide', () => {
    const g = createGrid();
    expect(canPlace(g, single, 0, 0)).toBe(true);
    expect(canPlace(g, lineH3, 7, 5)).toBe(true);
    expect(canPlace(g, square3, 5, 5)).toBe(true);
  });

  it('refuse un placement hors de la grille', () => {
    const g = createGrid();
    expect(canPlace(g, lineH3, 0, 6)).toBe(false);
    expect(canPlace(g, lineV5, 4, 0)).toBe(false);
    expect(canPlace(g, single, -1, 0)).toBe(false);
    expect(canPlace(g, single, 0, 8)).toBe(false);
  });

  it('refuse un chevauchement', () => {
    const g = place(createGrid(), lineH3, 2, 2, 0);
    expect(canPlace(g, single, 2, 3)).toBe(false);
    expect(canPlace(g, lineV5, 0, 4)).toBe(false);
    expect(canPlace(g, single, 3, 3)).toBe(true);
  });
});

describe('place', () => {
  it('écrit colorId + 1 dans les bonnes cases sans muter la source', () => {
    const g = createGrid();
    const next = place(g, lineH3, 1, 2, 4);
    expect(next[1]).toEqual([0, 0, 5, 5, 5, 0, 0, 0]);
    expect(g[1]).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe('findFullLines / clearLines', () => {
  it('ne trouve rien dans une grille vide', () => {
    expect(findFullLines(createGrid())).toEqual({ rows: [], cols: [] });
  });

  it('détecte une ligne complète', () => {
    const g = createGrid();
    g[3]!.fill(2);
    expect(findFullLines(g)).toEqual({ rows: [3], cols: [] });
  });

  it('détecte une colonne complète', () => {
    const g = createGrid();
    for (const line of g) line[6] = 1;
    expect(findFullLines(g)).toEqual({ rows: [], cols: [6] });
  });

  it('détecte lignes et colonnes en même temps et compte leur intersection une seule fois', () => {
    const g = createGrid();
    g[0]!.fill(1);
    g[7]!.fill(1);
    for (const line of g) line[2] = 1;
    const lines = findFullLines(g);
    expect(lines).toEqual({ rows: [0, 7], cols: [2] });
    expect(countLines(lines)).toBe(3);
    // 8 + 8 + 8 - 2 intersections
    expect(linesCells(lines)).toHaveLength(22);
  });

  it('efface les lignes et laisse le reste intact', () => {
    let g = createGrid();
    g = place(g, single, 4, 4, 0);
    g[0]!.fill(3);
    for (const line of g) line[2] = 3;
    const cleared = clearLines(g, findFullLines(g));
    expect(cleared[0]).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    for (const line of cleared) expect(line[2]).toBe(0);
    expect(cleared[4]![4]).toBe(1);
    expect(findFullLines(cleared)).toEqual({ rows: [], cols: [] });
    // source intacte
    expect(g[0]![0]).toBe(3);
  });
});

describe('canPlaceAnywhere / hasAnyMove', () => {
  it('vrai sur une grille vide', () => {
    expect(canPlaceAnywhere(createGrid(), square3)).toBe(true);
    expect(hasAnyMove(createGrid(), SHAPES)).toBe(true);
  });

  it('faux quand seul un trou 1×1 reste et que les pièces sont plus grandes', () => {
    const g = fullExcept([[3, 3]]);
    expect(hasAnyMove(g, [lineH3, square3, lineV5])).toBe(false);
    expect(hasAnyMove(g, [lineH3, single])).toBe(true);
  });

  it('faux sur une grille pleine et ignore les emplacements vides du plateau', () => {
    const g = fullExcept([]);
    expect(hasAnyMove(g, [single, null, null])).toBe(false);
    expect(hasAnyMove(createGrid(), [null, null, null])).toBe(false);
  });

  it('trouve un placement en bord de grille', () => {
    const g = fullExcept([
      [7, 5],
      [7, 6],
      [7, 7],
    ]);
    expect(canPlaceAnywhere(g, lineH3)).toBe(true);
    expect(canPlaceAnywhere(g, byName('line-h4'))).toBe(false);
  });
});
