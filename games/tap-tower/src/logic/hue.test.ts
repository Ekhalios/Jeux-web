import { describe, expect, it } from 'vitest';
import { colorForLevel, HUE_PER_LEVEL, hslToRgb, lerpColor } from './hue';

describe('hslToRgb', () => {
  it('reproduit les couleurs primaires et secondaires', () => {
    expect(hslToRgb(0, 1, 0.5)).toBe(0xff0000);
    expect(hslToRgb(60, 1, 0.5)).toBe(0xffff00);
    expect(hslToRgb(120, 1, 0.5)).toBe(0x00ff00);
    expect(hslToRgb(180, 1, 0.5)).toBe(0x00ffff);
    expect(hslToRgb(240, 1, 0.5)).toBe(0x0000ff);
    expect(hslToRgb(300, 1, 0.5)).toBe(0xff00ff);
  });

  it('gère les gris, le noir et le blanc', () => {
    expect(hslToRgb(0, 0, 0)).toBe(0x000000);
    expect(hslToRgb(0, 0, 1)).toBe(0xffffff);
    expect(hslToRgb(123, 0, 0.5)).toBe(0x808080);
  });

  it('ramène la teinte dans [0, 360)', () => {
    expect(hslToRgb(360, 1, 0.5)).toBe(0xff0000);
    expect(hslToRgb(480, 1, 0.5)).toBe(hslToRgb(120, 1, 0.5));
    expect(hslToRgb(-120, 1, 0.5)).toBe(hslToRgb(240, 1, 0.5));
  });

  it('reproduit une valeur connue non triviale', () => {
    // hsl(210, 50%, 40%) = #336699
    expect(hslToRgb(210, 0.5, 0.4)).toBe(0x336699);
  });
});

describe('colorForLevel', () => {
  it('renvoie un entier 0xRRGGBB', () => {
    for (let level = 0; level < 40; level++) {
      const c = colorForLevel(level);
      expect(Number.isInteger(c)).toBe(true);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(0xffffff);
    }
  });

  it('fait un tour complet de teinte en 360 / HUE_PER_LEVEL étages', () => {
    const period = 360 / HUE_PER_LEVEL;
    expect(colorForLevel(0)).toBe(colorForLevel(period));
    expect(colorForLevel(5)).toBe(colorForLevel(5 + period));
  });

  it('change de couleur d\'un étage au suivant', () => {
    expect(colorForLevel(0)).not.toBe(colorForLevel(1));
  });

  it('est plus sombre avec une luminosité plus faible', () => {
    const light = colorForLevel(3, 0.6);
    const dark = colorForLevel(3, 0.3);
    const sum = (c: number) => ((c >> 16) & 0xff) + ((c >> 8) & 0xff) + (c & 0xff);
    expect(sum(dark)).toBeLessThan(sum(light));
  });
});

describe('lerpColor', () => {
  it('renvoie les extrémités pour t = 0 et t = 1', () => {
    expect(lerpColor(0x102030, 0xa0b0c0, 0)).toBe(0x102030);
    expect(lerpColor(0x102030, 0xa0b0c0, 1)).toBe(0xa0b0c0);
  });

  it('interpole chaque canal', () => {
    expect(lerpColor(0x000000, 0xffffff, 0.5)).toBe(0x808080);
    expect(lerpColor(0x200000, 0x000040, 0.5)).toBe(0x100020);
  });

  it('borne t dans [0, 1]', () => {
    expect(lerpColor(0x000000, 0xffffff, -1)).toBe(0x000000);
    expect(lerpColor(0x000000, 0xffffff, 2)).toBe(0xffffff);
  });
});
