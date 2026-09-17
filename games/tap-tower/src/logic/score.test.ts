import { describe, expect, it } from 'vitest';
import { scoreForLanding, widthAfterPerfect } from './score';

describe('scoreForLanding', () => {
  it('donne 1 point pour une pose normale', () => {
    expect(scoreForLanding('cut', 0)).toBe(1);
    expect(scoreForLanding('cut', 7)).toBe(1);
  });

  it('donne 0 point pour un raté', () => {
    expect(scoreForLanding('miss', 0)).toBe(0);
    expect(scoreForLanding('miss', 3)).toBe(0);
  });

  it('ajoute un bonus par perfect consécutif au-delà du premier', () => {
    expect(scoreForLanding('perfect', 1)).toBe(1);
    expect(scoreForLanding('perfect', 2)).toBe(2);
    expect(scoreForLanding('perfect', 3)).toBe(3);
    expect(scoreForLanding('perfect', 10)).toBe(10);
  });

  it('tolère une série nulle passée par erreur', () => {
    expect(scoreForLanding('perfect', 0)).toBe(1);
  });
});

describe('widthAfterPerfect', () => {
  const BASE = 360;

  it('ne regagne rien avant 3 perfects consécutifs', () => {
    expect(widthAfterPerfect(200, 1, BASE)).toBe(200);
    expect(widthAfterPerfect(200, 2, BASE)).toBe(200);
  });

  it('regagne 12 px à partir du 3e perfect consécutif', () => {
    expect(widthAfterPerfect(200, 3, BASE)).toBe(212);
    expect(widthAfterPerfect(212, 4, BASE)).toBe(224);
    expect(widthAfterPerfect(300, 9, BASE)).toBe(312);
  });

  it('ne dépasse jamais la largeur de base', () => {
    expect(widthAfterPerfect(350, 3, BASE)).toBe(360);
    expect(widthAfterPerfect(360, 5, BASE)).toBe(360);
    expect(widthAfterPerfect(359, 8, BASE)).toBe(360);
  });

  it('ramène à la base une largeur déjà supérieure', () => {
    expect(widthAfterPerfect(400, 1, BASE)).toBe(360);
    expect(widthAfterPerfect(400, 3, BASE)).toBe(360);
  });

  it('accepte des paramètres personnalisés', () => {
    expect(widthAfterPerfect(100, 2, 150, 2, 20)).toBe(120);
    expect(widthAfterPerfect(140, 2, 150, 2, 20)).toBe(150);
  });
});
