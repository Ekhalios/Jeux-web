import { describe, expect, it } from 'vitest';
import { LEVELS, MAX_LEVEL, MAX_MERGE_BONUS } from './levels';
import { mergeResult } from './merge';

describe('mergeResult', () => {
  it('renvoie null pour deux niveaux différents', () => {
    expect(mergeResult(1, 2)).toBeNull();
    expect(mergeResult(7, 3)).toBeNull();
  });

  it('monte d un niveau et rapporte le score du niveau atteint', () => {
    expect(mergeResult(1, 1)).toEqual({ level: 2, score: LEVELS[1]!.score });
    expect(mergeResult(5, 5)).toEqual({ level: 6, score: 21 });
    expect(mergeResult(10, 10)).toEqual({ level: 11, score: 66 });
  });

  it('fait disparaître deux boules de niveau maximal avec un bonus', () => {
    expect(mergeResult(MAX_LEVEL, MAX_LEVEL)).toEqual({ level: null, score: MAX_MERGE_BONUS });
  });
});
