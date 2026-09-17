import { describe, expect, it } from 'vitest';
import { accumulateDanger, isInDanger, isNearDanger } from './danger';

const LINE = 330;

describe('isInDanger', () => {
  it('ignore une boule rapide au-dessus de la ligne (elle tombe encore)', () => {
    expect(isInDanger([{ y: 200, radius: 30, speed: 8 }], LINE)).toBe(false);
  });

  it('détecte une boule lente dont le centre est au-dessus de la ligne', () => {
    expect(isInDanger([{ y: 300, radius: 30, speed: 0.2 }], LINE)).toBe(true);
  });

  it('ignore une boule lente sous la ligne, même si son sommet la dépasse', () => {
    expect(isInDanger([{ y: 340, radius: 30, speed: 0 }], LINE)).toBe(false);
  });

  it('renvoie faux sans boule', () => {
    expect(isInDanger([], LINE)).toBe(false);
  });

  it('respecte le seuil de vitesse fourni', () => {
    const balls = [{ y: 300, radius: 30, speed: 1 }];
    expect(isInDanger(balls, LINE, { speedThreshold: 0.5, nearMargin: 0 })).toBe(false);
    expect(isInDanger(balls, LINE, { speedThreshold: 2, nearMargin: 0 })).toBe(true);
  });
});

describe('isNearDanger', () => {
  it('détecte une boule lente dont le sommet approche la ligne', () => {
    expect(isNearDanger([{ y: 400, radius: 30, speed: 0 }], LINE)).toBe(true);
  });

  it('ignore une boule lente bien plus bas et une boule rapide proche', () => {
    expect(isNearDanger([{ y: 900, radius: 30, speed: 0 }], LINE)).toBe(false);
    expect(isNearDanger([{ y: 400, radius: 30, speed: 10 }], LINE)).toBe(false);
  });
});

describe('accumulateDanger', () => {
  it('cumule le temps en danger et repart de zéro sinon', () => {
    let t = 0;
    t = accumulateDanger(t, true, 500);
    t = accumulateDanger(t, true, 700);
    expect(t).toBe(1200);
    t = accumulateDanger(t, false, 16);
    expect(t).toBe(0);
  });
});
