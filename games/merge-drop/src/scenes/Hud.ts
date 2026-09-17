import Phaser from 'phaser';
import { GAME_WIDTH, ctx, makeIconButton, makeText } from '@webetnes/core';
import { levelInfo } from '../logic/levels';
import { DEPTH } from './layout';
import { ballTextureKey } from './textures';

/** Score, meilleur score, aperçu « Next » et bouton mute. */
export class Hud {
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly bestText: Phaser.GameObjects.Text;
  private readonly nextIcon: Phaser.GameObjects.Image;
  private readonly muteGlyph: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene, best: number) {
    const { theme, sfx, storage } = ctx(scene);

    makeText(scene, 120, 46, 'SCORE', 24, theme.textMuted).setDepth(DEPTH.hud);
    this.scoreText = makeText(scene, 120, 96, '0', 56, theme.text).setDepth(DEPTH.hud);

    makeText(scene, GAME_WIDTH / 2, 46, 'BEST', 24, theme.textMuted).setDepth(DEPTH.hud);
    this.bestText = makeText(scene, GAME_WIDTH / 2, 92, String(best), 40, theme.text).setDepth(DEPTH.hud);

    makeText(scene, 560, 46, 'NEXT', 24, theme.textMuted).setDepth(DEPTH.hud);
    scene.add.circle(560, 100, 40, theme.surface, 1).setDepth(DEPTH.hud);
    this.nextIcon = scene.add.image(560, 100, ballTextureKey(1)).setDepth(DEPTH.hud);

    const mute = makeIconButton(scene, GAME_WIDTH - 56, 56, '', theme, () => {
      const muted = !sfx.isMuted;
      sfx.setMuted(muted);
      storage.setBoolean('muted', muted);
      this.muteGlyph.setText(muted ? '🔇' : '🔊');
      if (!muted) sfx.play('tap');
    }).setDepth(DEPTH.hud);
    this.muteGlyph = mute.getAt(1) as Phaser.GameObjects.Text;
    this.muteGlyph.setText(sfx.isMuted ? '🔇' : '🔊');
  }

  setScore(score: number): void {
    this.scoreText.setText(String(score));
  }

  setBest(best: number): void {
    this.bestText.setText(String(best));
  }

  setNext(level: number): void {
    const r = levelInfo(level).radius;
    this.nextIcon.setTexture(ballTextureKey(level)).setScale(Math.min(1, 30 / r));
    this.scene.tweens.add({ targets: this.nextIcon, scale: { from: 0.2, to: Math.min(1, 30 / r) }, duration: 200, ease: 'Back.easeOut' });
  }
}
