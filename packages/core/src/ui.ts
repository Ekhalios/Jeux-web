import Phaser from 'phaser';
import { FONT_FAMILY, hex, type Theme } from './theme';

export interface ButtonOptions {
  width?: number;
  height?: number;
  fontSize?: number;
  fill?: number;
  textColor?: string;
  radius?: number;
}

/** Bouton rectangulaire arrondi, dessiné par code, avec retour visuel au clic. */
export function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  theme: Theme,
  onClick: () => void,
  options: ButtonOptions = {},
): Phaser.GameObjects.Container {
  const width = options.width ?? 360;
  const height = options.height ?? 96;
  const radius = options.radius ?? 24;
  const fill = options.fill ?? theme.primary;
  const textColor = options.textColor ?? theme.primaryText;

  const bg = scene.add.graphics();
  const draw = (color: number) => {
    bg.clear();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  };
  draw(fill);

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: FONT_FAMILY,
      fontSize: `${options.fontSize ?? 40}px`,
      fontStyle: 'bold',
      color: textColor,
    })
    .setOrigin(0.5);

  const container = scene.add.container(x, y, [bg, text]);
  container.setSize(width, height);
  container.setInteractive({ useHandCursor: true });

  container.on('pointerdown', () => {
    container.setScale(0.96);
    draw(Phaser.Display.Color.ValueToColor(fill).darken(10).color);
  });
  const release = () => {
    container.setScale(1);
    draw(fill);
  };
  container.on('pointerout', release);
  container.on('pointerup', () => {
    release();
    onClick();
  });
  return container;
}

/** Voile semi-transparent plein écran qui bloque les entrées sous lui. */
export function makeOverlay(scene: Phaser.Scene, alpha = 0.7): Phaser.GameObjects.Rectangle {
  const { width, height } = scene.scale;
  const rect = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, alpha);
  rect.setInteractive();
  return rect;
}

/** Texte de titre ou de score avec le style commun. */
export function makeText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  content: string,
  size: number,
  color: string,
  bold = true,
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, content, {
      fontFamily: FONT_FAMILY,
      fontSize: `${size}px`,
      fontStyle: bold ? 'bold' : 'normal',
      color,
      align: 'center',
    })
    .setOrigin(0.5);
}

/** Petit bouton rond d'icône (son, pause) dessiné par code. */
export function makeIconButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  glyph: string,
  theme: Theme,
  onClick: () => void,
): Phaser.GameObjects.Container {
  const r = 34;
  const bg = scene.add.circle(0, 0, r, theme.surface, 1);
  const text = scene.add
    .text(0, 0, glyph, { fontFamily: FONT_FAMILY, fontSize: '34px', color: theme.text })
    .setOrigin(0.5);
  const c = scene.add.container(x, y, [bg, text]);
  c.setSize(r * 2, r * 2);
  c.setInteractive({ useHandCursor: true });
  c.on('pointerup', onClick);
  return c;
}

/** Couleur CSS du thème, utile pour le style de la page hôte. */
export function themeCss(theme: Theme): { background: string } {
  return { background: hex(theme.background) };
}
