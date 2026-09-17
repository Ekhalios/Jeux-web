import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, ctx, makeText } from '@webetnes/core';
import { CELL } from '../layout';
import { theme } from '../theme';
import { cellKey, ensureTextures } from '../view/textures';

let loadingReported = false;

/** Petit logo : quelques blocs colorés dessinés avec les textures du jeu. */
const LOGO_BLOCKS: readonly [number, number, number][] = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 1],
  [0, 2, 2],
  [1, 2, 2],
  [1, 3, 5],
  [0, 4, 3],
  [1, 4, 3],
];

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    const { sdk, sfx, storage } = ctx(this);
    ensureTextures(this);
    const cx = GAME_WIDTH / 2;

    for (const [r, c, color] of LOGO_BLOCKS) {
      const img = this.add.image(cx + (c - 2) * CELL, 330 + (r - 0.5) * CELL, cellKey(color)).setScale(0);
      this.tweens.add({ targets: img, scale: 1, duration: 300, delay: 80 + (r * 5 + c) * 40, ease: 'Back.easeOut' });
    }

    makeText(this, cx, 520, 'BLOCKY FIT', 92, theme.text);
    makeText(this, cx, 600, 'Fit the blocks, clear the lines', 30, theme.textMuted, false);

    const tap = makeText(this, cx, 800, 'Tap to play', 44, '#ffb703');
    this.tweens.add({ targets: tap, alpha: 0.35, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    makeText(this, cx, 900, `BEST ${storage.getNumber('best')}`, 32, theme.textMuted);
    makeText(this, cx, GAME_HEIGHT - 50, 'Webetnes', 24, theme.textMuted, false);

    if (!loadingReported) {
      loadingReported = true;
      sdk.loadingFinished();
    }

    this.input.on('pointerup', () => {
      if (ctx(this).adInProgress) return;
      sfx.play('tap');
      this.scene.start('game');
    });
  }
}
