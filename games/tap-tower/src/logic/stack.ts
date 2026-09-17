/** Segment horizontal : bord gauche et largeur, en pixels du monde. */
export interface Span {
  x: number;
  width: number;
}

export interface Cut {
  x: number;
  width: number;
  side: 'left' | 'right';
}

export type Landing =
  | { kind: 'miss' }
  | { kind: 'perfect'; x: number; width: number }
  | { kind: 'cut'; x: number; width: number; cut: Cut };

/**
 * Calcule le résultat de la pose d'un bloc mobile sur le bloc du dessous.
 * - décalage des bords gauches dans le seuil : placement parfait, aligné sur `prev` ;
 * - chevauchement positif : le bloc est réduit au chevauchement, le reste est découpé ;
 * - aucun chevauchement : raté.
 */
export function computeLanding(prev: Span, moving: Span, perfectThreshold: number): Landing {
  const offset = moving.x - prev.x;
  if (Math.abs(offset) <= perfectThreshold) {
    return { kind: 'perfect', x: prev.x, width: moving.width };
  }

  const left = Math.max(prev.x, moving.x);
  const right = Math.min(prev.x + prev.width, moving.x + moving.width);
  const overlap = right - left;
  if (overlap <= 0) return { kind: 'miss' };

  const cut: Cut =
    offset > 0
      ? { x: right, width: moving.x + moving.width - right, side: 'right' }
      : { x: moving.x, width: left - moving.x, side: 'left' };

  return { kind: 'cut', x: left, width: overlap, cut };
}
