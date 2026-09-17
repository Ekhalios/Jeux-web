import type { Theme } from '@webetnes/core';

/** Palette Tap Tower : nuit indigo, accents chauds ; les blocs eux-mêmes tournent en teinte HSL. */
export const theme: Theme = {
  background: 0x141a2e,
  surface: 0x232c4a,
  primary: 0xffc857,
  primaryText: '#141a2e',
  text: '#f6f7fb',
  textMuted: '#98a3c4',
  accent: 0x5ee6c1,
  danger: 0xff5a7a,
};

/** Couleur de fond de la caméra la plus sombre, atteinte tout en haut de la tour. */
export const BACKGROUND_DARKEST = 0x05070f;
/** Nombre d'étages sur lesquels le fond passe de la couleur du thème à la plus sombre. */
export const BACKGROUND_DARKEN_LEVELS = 90;
