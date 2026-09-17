import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, makeButton, makeOverlay, makeText } from '@webetnes/core';
import { DEPTH } from '../layout';
import { theme } from '../theme';

export interface GameOverOptions {
  score: number;
  best: number;
  isNewBest: boolean;
  canRescue: boolean;
  onPlayAgain: () => void;
  onRescue: () => void;
}

/** Panneau de fin de partie : score, record, rejouer et pièce de secours (pub récompensée). */
export class GameOverPanel {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, options: GameOverOptions) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 - 40;
    const overlay = makeOverlay(scene, 0.72).setDepth(DEPTH.panel);

    const width = 580;
    const height = options.canRescue ? 700 : 580;
    const panel = scene.add.graphics().setDepth(DEPTH.panel);
    panel.fillStyle(theme.surface, 1);
    panel.fillRoundedRect(-width / 2, -height / 2, width, height, 32);

    const title = makeText(scene, 0, -height / 2 + 80, 'GAME OVER', 64, theme.text);
    const scoreLabel = makeText(scene, 0, -height / 2 + 170, 'SCORE', 26, theme.textMuted);
    const score = makeText(scene, 0, -height / 2 + 230, String(options.score), 80, theme.text);
    const bestLabel = makeText(
      scene,
      0,
      -height / 2 + 320,
      options.isNewBest ? 'NEW BEST!' : `BEST ${options.best}`,
      32,
      options.isNewBest ? '#ffb703' : theme.textMuted,
    );

    const playAgain = makeButton(scene, 0, -height / 2 + 440, 'Play again', theme, options.onPlayAgain, { width: 400 });
    const items: Phaser.GameObjects.GameObject[] = [panel, title, scoreLabel, score, bestLabel, playAgain];

    if (options.canRescue) {
      const rescue = makeButton(scene, 0, -height / 2 + 570, 'Rescue block (watch ad)', theme, options.onRescue, {
        width: 460,
        height: 84,
        fontSize: 30,
        fill: theme.accent,
      });
      items.push(rescue);
    }

    const container = scene.add.container(cx, cy, items).setDepth(DEPTH.panel).setScale(0.85).setAlpha(0);
    scene.tweens.add({ targets: container, scale: 1, alpha: 1, duration: 260, ease: 'Back.easeOut' });

    this.objects.push(overlay, container);
  }

  destroy(): void {
    for (const obj of this.objects) obj.destroy();
    this.objects.length = 0;
  }
}
