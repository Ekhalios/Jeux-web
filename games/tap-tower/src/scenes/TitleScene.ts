import Phaser from 'phaser';
import { ctx, GAME_HEIGHT, GAME_WIDTH, hex, makeText } from '@webetnes/core';
import { BASE_WIDTH, BLOCK_HEIGHT } from '../logic/constants';
import { colorForLevel } from '../logic/hue';

/** Écran titre : nom, invitation, meilleur score, petite tour décorative. */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    const { sdk, sfx, storage, theme } = ctx(this);
    const cx = GAME_WIDTH / 2;

    this.drawDecorTower(cx, GAME_HEIGHT - 60);

    makeText(this, cx, 300, 'TAP TOWER', 104, theme.text);
    makeText(this, cx, 380, 'stack it. perfect it.', 30, theme.textMuted, false);

    const prompt = makeText(this, cx, 560, 'Tap to play', 48, hex(theme.primary));
    this.tweens.add({ targets: prompt, alpha: 0.35, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const best = storage.getNumber('best', 0);
    makeText(this, cx, 640, `BEST ${best}`, 34, theme.textMuted);

    makeText(this, cx, GAME_HEIGHT - 26, 'Webetnes', 22, theme.textMuted, false).setAlpha(0.7);

    const start = () => {
      if (ctx(this).adInProgress) return;
      this.input.off(Phaser.Input.Events.POINTER_DOWN, start);
      sfx.play('tap');
      this.scene.start('Game');
    };
    this.input.once(Phaser.Input.Events.POINTER_DOWN, start);
    this.input.keyboard?.once('keydown-SPACE', start);

    sdk.loadingFinished();
  }

  /** Petite tour de blocs colorés, purement décorative, alignée au centre bas. */
  private drawDecorTower(cx: number, bottomY: number): void {
    const widths = [BASE_WIDTH, 330, 300, 300, 270, 250, 250, 230];
    widths.forEach((w, i) => {
      const y = bottomY - i * BLOCK_HEIGHT;
      const jitter = ((i * 37) % 21) - 10;
      this.add
        .rectangle(cx + jitter, y, w, BLOCK_HEIGHT - 4, colorForLevel(i))
        .setOrigin(0.5, 1)
        .setStrokeStyle(3, colorForLevel(i, 0.36));
    });
  }
}
