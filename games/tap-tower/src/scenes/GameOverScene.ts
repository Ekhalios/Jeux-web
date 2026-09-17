import Phaser from 'phaser';
import { ctx, GAME_HEIGHT, GAME_WIDTH, hex, makeButton, makeOverlay, makeText } from '@webetnes/core';
import type { GameScene } from './GameScene';

export interface GameOverData {
  score: number;
  best: number;
  isNewBest: boolean;
  canContinue: boolean;
}

/** Panneau de fin de partie, lancé par-dessus la scène de jeu figée. */
export class GameOverScene extends Phaser.Scene {
  private busy = false;

  constructor() {
    super('GameOver');
  }

  create(data: GameOverData): void {
    const { sdk, sfx, theme } = ctx(this);
    this.busy = false;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    makeOverlay(this, 0.65);

    const panel = this.add.container(cx, cy);
    const bg = this.add.graphics();
    bg.fillStyle(theme.surface, 1);
    bg.fillRoundedRect(-300, -330, 600, 660, 32);
    panel.add(bg);

    panel.add(makeText(this, 0, -250, 'GAME OVER', 64, theme.text));
    panel.add(makeText(this, 0, -150, 'SCORE', 28, theme.textMuted));
    panel.add(makeText(this, 0, -90, String(data.score), 88, theme.text));
    panel.add(
      makeText(this, 0, 0, data.isNewBest ? 'NEW BEST!' : `BEST ${data.best}`, 34, data.isNewBest ? hex(theme.accent) : theme.textMuted),
    );

    const game = this.scene.get('Game') as GameScene;

    const playAgain = makeButton(
      this,
      0,
      110,
      'Play again',
      theme,
      () => {
        void this.guarded(async () => {
          sfx.play('tap');
          await sdk.commercialBreak();
          this.scene.stop();
          game.restartGame();
        });
      },
      { width: 440, height: 92 },
    );
    panel.add(playAgain);

    if (data.canContinue) {
      const cont = makeButton(
        this,
        0,
        230,
        'Continue (watch ad)',
        theme,
        () => {
          void this.guarded(async () => {
            sfx.play('tap');
            const ok = await sdk.rewardedBreak();
            if (ok) {
              sfx.play('reward');
              this.scene.stop();
              game.continueAfterReward();
            } else {
              this.busy = false;
            }
          });
        },
        { width: 440, height: 92, fill: theme.accent, fontSize: 34 },
      );
      panel.add(cont);
    }

    panel.setScale(0.8).setAlpha(0);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 260, ease: 'Back.easeOut' });
  }

  /** Empêche les doubles clics et toute action pendant une publicité. */
  private async guarded(action: () => Promise<void>): Promise<void> {
    if (this.busy || ctx(this).adInProgress) return;
    this.busy = true;
    await action();
  }
}
