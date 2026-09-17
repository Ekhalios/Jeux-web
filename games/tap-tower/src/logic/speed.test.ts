import { describe, expect, it } from 'vitest';
import { MAX_SPEED, speedForLevel } from './speed';

describe('speedForLevel', () => {
  it('commence à 4 px/frame', () => {
    expect(speedForLevel(0)).toBe(4);
  });

  it('augmente de 0,15 par étage', () => {
    expect(speedForLevel(1)).toBeCloseTo(4.15);
    expect(speedForLevel(10)).toBeCloseTo(5.5);
    expect(speedForLevel(20)).toBeCloseTo(7);
  });

  it('est plafonnée à 11', () => {
    expect(speedForLevel(46)).toBeCloseTo(10.9);
    expect(speedForLevel(47)).toBe(MAX_SPEED);
    expect(speedForLevel(100)).toBe(MAX_SPEED);
    expect(speedForLevel(10_000)).toBe(MAX_SPEED);
  });

  it('ne descend jamais sous la base pour un étage négatif', () => {
    expect(speedForLevel(-5)).toBe(4);
  });

  it('accepte des paramètres personnalisés', () => {
    expect(speedForLevel(2, 1, 0.5, 1.5)).toBe(1.5);
    expect(speedForLevel(1, 1, 0.25, 10)).toBe(1.25);
  });
});
