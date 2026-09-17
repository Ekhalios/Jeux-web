import { describe, expect, it } from 'vitest';
import { computeLanding } from './stack';

const prev = { x: 180, width: 360 };
const T = 8;

describe('computeLanding', () => {
  it('découpe la partie qui déborde à droite', () => {
    const r = computeLanding(prev, { x: 240, width: 360 }, T);
    expect(r).toEqual({
      kind: 'cut',
      x: 240,
      width: 300,
      cut: { x: 540, width: 60, side: 'right' },
    });
  });

  it('découpe la partie qui déborde à gauche', () => {
    const r = computeLanding(prev, { x: 100, width: 360 }, T);
    expect(r).toEqual({
      kind: 'cut',
      x: 180,
      width: 280,
      cut: { x: 100, width: 80, side: 'left' },
    });
  });

  it('est parfait quand le décalage est dans le seuil', () => {
    expect(computeLanding(prev, { x: 183, width: 360 }, T)).toEqual({ kind: 'perfect', x: 180, width: 360 });
    expect(computeLanding(prev, { x: 176, width: 360 }, T)).toEqual({ kind: 'perfect', x: 180, width: 360 });
  });

  it('est parfait exactement à la limite du seuil, des deux côtés', () => {
    expect(computeLanding(prev, { x: 188, width: 360 }, T).kind).toBe('perfect');
    expect(computeLanding(prev, { x: 172, width: 360 }, T).kind).toBe('perfect');
  });

  it('découpe juste au-delà du seuil', () => {
    const right = computeLanding(prev, { x: 189, width: 360 }, T);
    expect(right.kind).toBe('cut');
    if (right.kind === 'cut') {
      expect(right.width).toBe(351);
      expect(right.cut).toEqual({ x: 540, width: 9, side: 'right' });
    }
    const left = computeLanding(prev, { x: 171, width: 360 }, T);
    expect(left.kind).toBe('cut');
    if (left.kind === 'cut') {
      expect(left.x).toBe(180);
      expect(left.width).toBe(351);
      expect(left.cut).toEqual({ x: 171, width: 9, side: 'left' });
    }
  });

  it('rate quand il n\'y a aucun chevauchement', () => {
    expect(computeLanding(prev, { x: 540, width: 360 }, T)).toEqual({ kind: 'miss' });
    expect(computeLanding(prev, { x: 600, width: 360 }, T)).toEqual({ kind: 'miss' });
    expect(computeLanding(prev, { x: -180, width: 360 }, T)).toEqual({ kind: 'miss' });
    expect(computeLanding(prev, { x: -300, width: 360 }, T)).toEqual({ kind: 'miss' });
  });

  it('fonctionne avec des blocs étroits', () => {
    const narrow = { x: 300, width: 40 };
    const r = computeLanding(narrow, { x: 330, width: 40 }, T);
    expect(r).toEqual({ kind: 'cut', x: 330, width: 10, cut: { x: 340, width: 30, side: 'right' } });
    expect(computeLanding(narrow, { x: 341, width: 40 }, T)).toEqual({ kind: 'miss' });
  });

  it('accepte un seuil de zéro (seul l\'alignement exact est parfait)', () => {
    expect(computeLanding(prev, { x: 180, width: 360 }, 0).kind).toBe('perfect');
    expect(computeLanding(prev, { x: 181, width: 360 }, 0).kind).toBe('cut');
  });
});
