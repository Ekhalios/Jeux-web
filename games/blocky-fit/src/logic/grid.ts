import type { Cell, Shape } from './shapes';

export const GRID_SIZE = 8;

/** Grille carrée : 0 = vide, sinon `colorId + 1`. Traitée comme immuable : chaque opération renvoie une copie. */
export type Grid = number[][];

export interface Lines {
  rows: number[];
  cols: number[];
}

export function createGrid(size = GRID_SIZE): Grid {
  return Array.from({ length: size }, () => new Array<number>(size).fill(0));
}

/** Valeur d'une case, ou -1 hors de la grille. */
export function cellAt(grid: Grid, r: number, c: number): number {
  return grid[r]?.[c] ?? -1;
}

export function canPlace(grid: Grid, shape: Shape, row: number, col: number): boolean {
  for (const cell of shape.cells) {
    if (cellAt(grid, row + cell.r, col + cell.c) !== 0) return false;
  }
  return true;
}

/** Pose la forme et renvoie une nouvelle grille ; la grille source n'est pas modifiée. */
export function place(grid: Grid, shape: Shape, row: number, col: number, colorId: number): Grid {
  const next = grid.map((line) => line.slice());
  for (const cell of shape.cells) {
    const line = next[row + cell.r];
    if (line && col + cell.c >= 0 && col + cell.c < line.length) line[col + cell.c] = colorId + 1;
  }
  return next;
}

export function findFullLines(grid: Grid): Lines {
  const size = grid.length;
  const rows: number[] = [];
  const cols: number[] = [];
  for (let r = 0; r < size; r++) {
    if (grid[r]?.every((v) => v !== 0)) rows.push(r);
  }
  for (let c = 0; c < size; c++) {
    let full = true;
    for (let r = 0; r < size && full; r++) full = cellAt(grid, r, c) !== 0;
    if (full) cols.push(c);
  }
  return { rows, cols };
}

export function countLines(lines: Lines): number {
  return lines.rows.length + lines.cols.length;
}

/** Cases couvertes par les lignes données, sans doublon aux intersections. */
export function linesCells(lines: Lines, size = GRID_SIZE): Cell[] {
  const seen = new Set<number>();
  const out: Cell[] = [];
  const push = (r: number, c: number) => {
    const key = r * size + c;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ r, c });
  };
  for (const r of lines.rows) for (let c = 0; c < size; c++) push(r, c);
  for (const c of lines.cols) for (let r = 0; r < size; r++) push(r, c);
  return out;
}

/** Vide les lignes et colonnes données ; renvoie une nouvelle grille. */
export function clearLines(grid: Grid, lines: Lines): Grid {
  const next = grid.map((line) => line.slice());
  for (const { r, c } of linesCells(lines, grid.length)) {
    const line = next[r];
    if (line) line[c] = 0;
  }
  return next;
}

export function canPlaceAnywhere(grid: Grid, shape: Shape): boolean {
  const size = grid.length;
  for (let r = 0; r <= size - shape.rows; r++) {
    for (let c = 0; c <= size - shape.cols; c++) {
      if (canPlace(grid, shape, r, c)) return true;
    }
  }
  return false;
}

/** Vrai si au moins une des formes (les `null` sont ignorés) peut être posée quelque part. */
export function hasAnyMove(grid: Grid, shapes: readonly (Shape | null)[]): boolean {
  return shapes.some((shape) => shape !== null && canPlaceAnywhere(grid, shape));
}
