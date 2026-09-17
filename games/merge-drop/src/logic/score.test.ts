import { describe, expect, it } from 'vitest';
import { initialScore, isCombo, registerMerge } from './score';

describe('score', () => {
  it('démarre à zéro sans combo', () => {
    const s = initialScore();
    expect(s.score).toBe(0);
    expect(isCombo(s)).toBe(false);
  });

  it('additionne les points et enchaîne les fusions rapprochées', () => {
    let s = initialScore();
    s = registerMerge(s, 3, 1000);
    expect(s.score).toBe(3);
    expect(s.chain).toBe(1);
    expect(isCombo(s)).toBe(false);
    s = registerMerge(s, 6, 1500);
    expect(s.score).toBe(9);
    expect(s.chain).toBe(2);
    expect(isCombo(s)).toBe(true);
  });

  it('remet la chaîne à un après la fenêtre de combo', () => {
    let s = registerMerge(initialScore(), 1, 0);
    s = registerMerge(s, 1, 500);
    s = registerMerge(s, 1, 1600);
    expect(s.chain).toBe(1);
    expect(s.score).toBe(3);
  });

  it('ne modifie pas l état précédent', () => {
    const a = initialScore();
    registerMerge(a, 10, 0);
    expect(a.score).toBe(0);
  });
});
