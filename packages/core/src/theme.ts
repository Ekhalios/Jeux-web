/** Résolution logique portrait commune à tous les jeux. */
export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

/** Pile de polices système : aucune police téléchargée, rendu identique sur les portails. */
export const FONT_FAMILY = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

/** Palette d'un jeu ; chaque jeu fournit la sienne, les helpers UI la consomment. */
export interface Theme {
  background: number;
  surface: number;
  primary: number;
  primaryText: string;
  text: string;
  textMuted: string;
  accent: number;
  danger: number;
}

/** Convertit une couleur numérique Phaser (0xRRGGBB) en chaîne CSS. */
export function hex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
