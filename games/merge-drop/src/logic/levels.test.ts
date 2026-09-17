import { describe, expect, it } from 'vitest';
import { LEVELS, MAX_LEVEL, levelInfo } from './levels';

describe('levels', () => {
  it('contient exactement 11 niveaux numérotés de 1 à 11', () => {
    expect(LEVELS).toHaveLength(MAX_LEVEL);
    LEVELS.forEach((l, i) => expect(l.level).toBe(i + 1));
  });

  it('a des rayons strictement croissants et un niveau 11 qui tient dans le bac', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i]!.radius).toBeGreaterThan(LEVELS[i - 1]!.radius);
    }
    expect(LEVELS[MAX_LEVEL - 1]!.radius * 2).toBeLessThan(560);
  });

  it('a des scores strictement croissants et des couleurs distinctes', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i]!.score).toBeGreaterThan(LEVELS[i - 1]!.score);
    }
    expect(new Set(LEVELS.map((l) => l.color)).size).toBe(MAX_LEVEL);
  });

  it('levelInfo renvoie la bonne entrée et rejette les niveaux hors table', () => {
    expect(levelInfo(3).radius).toBe(42);
    expect(() => levelInfo(0)).toThrow(RangeError);
    expect(() => levelInfo(12)).toThrow(RangeError);
  });
});
