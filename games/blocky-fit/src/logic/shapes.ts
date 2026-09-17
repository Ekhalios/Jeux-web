/** Case relative d'une forme : ligne `r`, colonne `c`, origine en haut à gauche. */
export interface Cell {
  r: number;
  c: number;
}

/** Forme de pièce : cases relatives, encombrement et couleur (index dans PIECE_COLORS). */
export interface Shape {
  id: number;
  name: string;
  colorId: number;
  cells: readonly Cell[];
  rows: number;
  cols: number;
}

let nextId = 0;

/** Construit une forme à partir d'un motif ASCII (`#` = case pleine). */
function shape(name: string, colorId: number, pattern: readonly string[]): Shape {
  const cells: Cell[] = [];
  pattern.forEach((line, r) => {
    for (let c = 0; c < line.length; c++) if (line[c] === '#') cells.push({ r, c });
  });
  const rows = pattern.length;
  const cols = Math.max(...pattern.map((line) => line.length));
  return { id: nextId++, name, colorId, cells, rows, cols };
}

/** Quatre orientations d'un motif (rotations de 90°). */
function rotations(name: string, colorId: number, pattern: readonly string[]): Shape[] {
  const out: Shape[] = [];
  let current = pattern;
  for (let i = 0; i < 4; i++) {
    out.push(shape(`${name}-${i}`, colorId, current));
    current = rotate(current);
  }
  return out;
}

/** Rotation horaire d'un motif ASCII. */
function rotate(pattern: readonly string[]): string[] {
  const rows = pattern.length;
  const cols = Math.max(...pattern.map((l) => l.length));
  const out: string[] = [];
  for (let c = 0; c < cols; c++) {
    let line = '';
    for (let r = rows - 1; r >= 0; r--) line += pattern[r]?.[c] === '#' ? '#' : '.';
    out.push(line);
  }
  return out;
}

const single = shape('single', 0, ['#']);
const lineH2 = shape('line-h2', 1, ['##']);
const lineV2 = shape('line-v2', 1, ['#', '#']);
const lineH3 = shape('line-h3', 2, ['###']);
const lineV3 = shape('line-v3', 2, ['#', '#', '#']);
const lineH4 = shape('line-h4', 3, ['####']);
const lineV4 = shape('line-v4', 3, ['#', '#', '#', '#']);
const lineH5 = shape('line-h5', 4, ['#####']);
const lineV5 = shape('line-v5', 4, ['#', '#', '#', '#', '#']);
const square2 = shape('square-2', 5, ['##', '##']);
const square3 = shape('square-3', 6, ['###', '###', '###']);
const smallL = rotations('l3', 7, ['#.', '##']);
const bigL = rotations('l5', 5, ['#..', '#..', '###']);
const tee = rotations('t4', 3, ['###', '.#.']);

/** Toutes les formes du jeu (23), l'identifiant est l'index dans ce tableau. */
export const SHAPES: readonly Shape[] = [
  single,
  lineH2,
  lineV2,
  lineH3,
  lineV3,
  lineH4,
  lineV4,
  lineH5,
  lineV5,
  square2,
  square3,
  ...smallL,
  ...bigL,
  ...tee,
];

/** Plateau de secours accordé par la pub récompensée : un 1×1 et deux pièces de 2 cases. */
export const RESCUE_SHAPES: readonly Shape[] = [single, lineH2, lineV2];
