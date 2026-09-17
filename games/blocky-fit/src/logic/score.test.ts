import { describe, expect, it } from 'vitest';
import { comboMultiplier, nextStreak, scorePlacement } from './score';

describe('scorePlacement', () => {
  it('donne 1 point par case sans ligne', () => {
    expect(scorePlacement({ cells: 4, linesCleared: 0, streak: 0 })).toBe(4);
    // une série passée ne compte pas si rien n’est effacé
    expect(scorePlacement({ cells: 1, linesCleared: 0, streak: 5 })).toBe(1);
  });

  it('une ligne : cases + 80 + série', () => {
    expect(scorePlacement({ cells: 3, linesCleared: 1, streak: 1 })).toBe(3 + 80 + 20);
  });

  it('combo : ×2 pour deux lignes, ×3 pour trois', () => {
    expect(scorePlacement({ cells: 5, linesCleared: 2, streak: 1 })).toBe(5 + 80 * 2 * 2 + 20);
    expect(scorePlacement({ cells: 9, linesCleared: 3, streak: 1 })).toBe(9 + 80 * 3 * 3 + 20);
  });

  it('la série ajoute 20 par niveau', () => {
    expect(scorePlacement({ cells: 2, linesCleared: 1, streak: 4 })).toBe(2 + 80 + 80);
  });
});

describe('comboMultiplier / nextStreak', () => {
  it('multiplicateur au moins 1', () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(1)).toBe(1);
    expect(comboMultiplier(4)).toBe(4);
  });

  it('la série monte quand une ligne tombe et retombe à zéro sinon', () => {
    expect(nextStreak(0, 1)).toBe(1);
    expect(nextStreak(3, 2)).toBe(4);
    expect(nextStreak(3, 0)).toBe(0);
  });
});
