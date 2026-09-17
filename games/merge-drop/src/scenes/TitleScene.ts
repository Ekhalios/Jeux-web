import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, ctx, makeText } from '@webetnes/core';
import { LEVELS } from '../logic/levels';
import { ballTextureKey, ensureBallTextures } from './textures';

/** Écran titre : nom du jeu, « Tap to play », meilleur score, crédit. */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    const { sdk, storage, theme } = ctx(this);
    ensureBallTextures(this);

    const cx = GAME_WIDTH / 2;

    // Rangée décorative de boules qui flottent doucement.
    const shown = [3, 5, 7, 5, 3];
    shown.forEach((level, i) => {
      const x = cx + (i - 2) * 130;
      const ball = this.add.image(x, 300, ballTextureKey(level)).setScale(Math.min(1, 56 / LEVELS[level - 1]!.radius));
      this.tweens.add({ targets: ball, y: 300 + (i % 2 ? 18 : -18), duration: 1400 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    makeText(this, cx, 480, 'Merge Drop', 96, theme.text);
    makeText(this, cx, 560, 'drop · touch · merge', 30, theme.textMuted, false);

    const tap = makeText(this, cx, 760, 'Tap to play', 48, '#ffd166');
    this.tweens.add({ targets: tap, alpha: 0.35, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const best = storage.getNumber('best', 0);
    if (best > 0) makeText(this, cx, 860, `Best  ${best}`, 34, theme.textMuted);

    makeText(this, cx, GAME_HEIGHT - 60, 'Webetnes', 24, theme.textMuted, false);

    this.input.once('pointerdown', () => {
      if (ctx(this).adInProgress) return;
      ctx(this).sfx.play('tap');
      this.scene.start('Game');
    });
    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('Game'));

    sdk.loadingFinished();
  }
}
