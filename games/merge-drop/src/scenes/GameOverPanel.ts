import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, ctx, makeButton, makeOverlay, makeText } from '@webetnes/core';
import { DEPTH } from './layout';

export interface GameOverActions {
  onPlayAgain(): void;
  /** Absent quand la récompense n'est plus disponible. */
  onReward?: () => void;
}

/** Panneau de fin de partie : score, meilleur score, rejouer et récompense éventuelle. */
export class GameOverPanel {
  private readonly objects: Array<Phaser.GameObjects.GameObject & { setAlpha(alpha: number): unknown }> = [];

  constructor(scene: Phaser.Scene, score: number, best: number, isNewBest: boolean, actions: GameOverActions) {
    const { theme } = ctx(scene);
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const overlay = makeOverlay(scene, 0.72).setDepth(DEPTH.overlay);
    const panel = scene.add.graphics().setDepth(DEPTH.overlay);
    panel.fillStyle(theme.surface, 1);
    panel.fillRoundedRect(cx - 290, cy - 300, 580, 600, 36);
    this.objects.push(overlay, panel);

    this.objects.push(
      makeText(scene, cx, cy - 220, 'Game Over', 64, theme.text).setDepth(DEPTH.overlay),
      makeText(scene, cx, cy - 120, 'SCORE', 26, theme.textMuted).setDepth(DEPTH.overlay),
      makeText(scene, cx, cy - 70, String(score), 72, theme.text).setDepth(DEPTH.overlay),
      makeText(scene, cx, cy + 20, isNewBest ? 'NEW BEST!' : `BEST  ${best}`, 32, isNewBest ? '#ffd166' : theme.textMuted).setDepth(DEPTH.overlay),
      makeButton(scene, cx, cy + 120, 'Play again', theme, actions.onPlayAgain).setDepth(DEPTH.overlay),
    );

    if (actions.onReward) {
      this.objects.push(
        makeButton(scene, cx, cy + 230, 'Clear small balls (watch ad)', theme, actions.onReward, {
          width: 480,
          height: 76,
          fontSize: 28,
          fill: theme.accent,
        }).setDepth(DEPTH.overlay),
      );
    }

    // Entrée animée du panneau.
    for (const o of this.objects) {
      if (o === overlay) continue;
      o.setAlpha(0);
      scene.tweens.add({ targets: o, alpha: 1, duration: 250, delay: 80 });
    }
  }

  destroy(): void {
    for (const o of this.objects) o.destroy();
    this.objects.length = 0;
  }
}
