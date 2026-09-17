// Import direct du fichier : l'index du socle charge Phaser, inutile ici (tests Node).
import { Rng } from '../../../../packages/core/src/rng';
import { describe, expect, it } from 'vitest';
import { SPAWN_MAX_LEVEL, SPAWN_MIN_LEVEL, nextLevel } from './spawn';

describe('nextLevel', () => {
  it('reste entre 1 et 5 sur 1000 tirages', () => {
    const rng = new Rng(42);
    for (let i = 0; i < 1000; i++) {
      const level = nextLevel(rng);
      expect(level).toBeGreaterThanOrEqual(SPAWN_MIN_LEVEL);
      expect(level).toBeLessThanOrEqual(SPAWN_MAX_LEVEL);
    }
  });

  it('est pondéré vers les petites boules et couvre les cinq niveaux', () => {
    const rng = new Rng(7);
    const counts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 5000; i++) counts[nextLevel(rng)]!++;
    expect(counts[1]).toBeGreaterThan(counts[3]!);
    expect(counts[2]).toBeGreaterThan(counts[4]!);
    expect(counts[3]).toBeGreaterThan(counts[5]!);
    for (let level = 1; level <= 5; level++) expect(counts[level]).toBeGreaterThan(0);
  });

  it('est déterministe pour une même graine', () => {
    const a = new Rng(123);
    const b = new Rng(123);
    const seqA = Array.from({ length: 50 }, () => nextLevel(a));
    const seqB = Array.from({ length: 50 }, () => nextLevel(b));
    expect(seqA).toEqual(seqB);
  });

  it('couvre les bornes du tirage', () => {
    expect(nextLevel({ next: () => 0 })).toBe(1);
    expect(nextLevel({ next: () => 0.999999 })).toBe(5);
  });
});
