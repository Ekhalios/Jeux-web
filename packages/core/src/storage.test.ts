import { afterEach, describe, expect, it, vi } from 'vitest';
import { SafeStorage } from './storage';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SafeStorage', () => {
  it('sans localStorage, garde les valeurs en mémoire', () => {
    vi.stubGlobal('localStorage', undefined);
    const s = new SafeStorage('t');
    expect(s.getNumber('best', 5)).toBe(5);
    s.setNumber('best', 42);
    expect(s.getNumber('best')).toBe(42);
    s.setBoolean('muted', true);
    expect(s.getBoolean('muted')).toBe(true);
  });

  it('avec un localStorage qui lève, ne plante pas', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('denied');
      },
      setItem() {
        throw new Error('denied');
      },
    });
    const s = new SafeStorage('t');
    expect(() => s.setNumber('x', 1)).not.toThrow();
    expect(s.getNumber('x')).toBe(1);
  });

  it('préfixe les clés et ignore les valeurs non numériques', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    });
    const s = new SafeStorage('jeu');
    s.setNumber('best', 7);
    expect(store.get('jeu:best')).toBe('7');
    store.set('jeu:best', 'abc');
    expect(s.getNumber('best', 0)).toBe(0);
  });
});
