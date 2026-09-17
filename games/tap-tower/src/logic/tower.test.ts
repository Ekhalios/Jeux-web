import { describe, expect, it } from 'vitest';
import { blockTopForLevel, movingDirectionForLevel, movingStartX } from './tower';

describe('blockTopForLevel', () => {
  it('monte d’un bloc par étage, y compris au-delà des 22 blocs conservés à l’écran', () => {
    const baseTop = 1136;
    const h = 64;
    for (let level = 1; level < 60; level++) {
      expect(blockTopForLevel(level, baseTop, h)).toBe(blockTopForLevel(level - 1, baseTop, h) - h);
    }
    expect(blockTopForLevel(22, baseTop, h)).toBe(baseTop - 22 * h);
    expect(blockTopForLevel(23, baseTop, h)).toBe(baseTop - 23 * h);
  });
});

describe('movingStartX', () => {
  it('part de la marge gauche vers la droite, du bord droit vers la gauche', () => {
    expect(movingStartX(1, 360, 720, 16)).toBe(16);
    expect(movingStartX(-1, 360, 720, 16)).toBe(720 - 16 - 360);
  });
});

describe('movingDirectionForLevel', () => {
  it('alterne à chaque étage', () => {
    expect(movingDirectionForLevel(1)).toBe(1);
    expect(movingDirectionForLevel(2)).toBe(-1);
    expect(movingDirectionForLevel(23)).toBe(1);
  });
});
