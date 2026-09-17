import Phaser from 'phaser';
import { GAME_WIDTH, makeText } from '@webetnes/core';
import { DEPTH, GRID_PX, GRID_Y } from '../layout';
import { theme } from '../theme';

/** Texte qui monte et s'efface (points gagnés). */
export function floatText(scene: Phaser.Scene, x: number, y: number, content: string, color = theme.text, size = 40): void {
  const text = makeText(scene, x, y, content, size, color).setDepth(DEPTH.floating);
  scene.tweens.add({
    targets: text,
    y: y - 90,
    alpha: 0,
    duration: 800,
    ease: 'Cubic.easeOut',
    onComplete: () => text.destroy(),
  });
}

/** Annonce « COMBO ×N » au centre de la grille. */
export function comboText(scene: Phaser.Scene, multiplier: number): void {
  const text = makeText(scene, GAME_WIDTH / 2, GRID_Y + GRID_PX / 2, `COMBO ×${multiplier}`, 72, '#ffb703')
    .setDepth(DEPTH.floating)
    .setScale(0.4)
    .setAlpha(0);
  text.setStroke('#1b2436', 10);
  scene.tweens.chain({
    targets: text,
    tweens: [
      { scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' },
      { y: text.y - 60, alpha: 0, duration: 500, delay: 250, ease: 'Cubic.easeIn' },
    ],
    onComplete: () => text.destroy(),
  });
}
