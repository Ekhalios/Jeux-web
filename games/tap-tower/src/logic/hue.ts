/** Rotation de teinte par étage, en degrés. */
export const HUE_PER_LEVEL = 12;
export const BLOCK_SATURATION = 0.62;
export const BLOCK_LIGHTNESS = 0.56;

function channel(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 255);
}

/**
 * Conversion HSL → 0xRRGGBB écrite à la main.
 * `h` en degrés (toute valeur, ramenée dans [0, 360)), `s` et `l` dans [0, 1].
 */
export function hslToRgb(h: number, s: number, l: number): number {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = hue / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));

  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const m = l - c / 2;
  return (channel(r + m) << 16) | (channel(g + m) << 8) | channel(b + m);
}

/** Couleur d'un bloc à l'étage `level` : la teinte tourne lentement, saturation et luminosité fixes. */
export function colorForLevel(level: number, lightness = BLOCK_LIGHTNESS, startHue = 200): number {
  return hslToRgb(startHue + level * HUE_PER_LEVEL, BLOCK_SATURATION, lightness);
}

/** Interpolation linéaire entre deux couleurs 0xRRGGBB, `t` dans [0, 1]. */
export function lerpColor(from: number, to: number, t: number): number {
  const k = Math.min(1, Math.max(0, t));
  const mix = (shift: number) => {
    const a = (from >> shift) & 0xff;
    const b = (to >> shift) & 0xff;
    return Math.round(a + (b - a) * k) << shift;
  };
  return mix(16) | mix(8) | mix(0);
}
