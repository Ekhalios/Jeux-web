import Phaser from 'phaser';
import { LEVELS, type Level } from '../logic/levels';

export function ballTextureKey(level: number): string {
  return `ball-${level}`;
}

/** Génère une fois par niveau la texture d'une boule : disque, reflet, yeux et bouche dessinés par code. */
export function ensureBallTextures(scene: Phaser.Scene): void {
  for (const level of LEVELS) {
    const key = ballTextureKey(level.level);
    if (scene.textures.exists(key)) continue;
    drawBall(scene, key, level);
  }
}

function drawBall(scene: Phaser.Scene, key: string, level: Level): void {
  const r = level.radius;
  const size = r * 2 + 4;
  const c = size / 2;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const base = Phaser.Display.Color.ValueToColor(level.color);
  const dark = base.clone().darken(22).color;
  const light = base.clone().lighten(28).color;

  // Contour sombre puis disque.
  g.fillStyle(dark, 1);
  g.fillCircle(c, c, r);
  g.fillStyle(level.color, 1);
  g.fillCircle(c, c, r - Math.max(2, r * 0.07));

  // Reflet en haut à gauche.
  g.fillStyle(light, 0.55);
  g.fillEllipse(c - r * 0.32, c - r * 0.38, r * 0.5, r * 0.32);

  // Visage : deux yeux et une bouche souriante.
  const eyeOffset = r * 0.3;
  const eyeY = c - r * 0.05;
  const eyeR = Math.max(2.5, r * 0.13);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(c - eyeOffset, eyeY, eyeR);
  g.fillCircle(c + eyeOffset, eyeY, eyeR);
  g.fillStyle(0x2b1d3a, 1);
  g.fillCircle(c - eyeOffset + eyeR * 0.25, eyeY + eyeR * 0.1, eyeR * 0.55);
  g.fillCircle(c + eyeOffset + eyeR * 0.25, eyeY + eyeR * 0.1, eyeR * 0.55);

  g.lineStyle(Math.max(2, r * 0.07), 0x2b1d3a, 0.85);
  g.beginPath();
  g.arc(c, c + r * 0.18, r * 0.3, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false);
  g.strokePath();

  g.generateTexture(key, size, size);
  g.destroy();
}
