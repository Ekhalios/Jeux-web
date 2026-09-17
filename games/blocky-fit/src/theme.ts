import type { Theme } from '@webetnes/core';

/** Palette Blocky Fit : nuit bleue, pièces vives. */
export const theme: Theme = {
  background: 0x1b2436,
  surface: 0x2a3650,
  primary: 0xffb703,
  primaryText: '#1b2436',
  text: '#f4f6fb',
  textMuted: '#9aa6c0',
  accent: 0x3ddc97,
  danger: 0xff5d73,
};

/** Couleurs des pièces, indexées par l'identifiant de forme. */
export const PIECE_COLORS: readonly number[] = [
  0xff5d73, 0xffb703, 0x3ddc97, 0x4cc9f0, 0xb388ff, 0xff8f3f, 0x64dfdf, 0xf9c74f,
];
