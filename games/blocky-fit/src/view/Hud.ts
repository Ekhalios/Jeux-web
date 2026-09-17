import Phaser from 'phaser';
import { GAME_WIDTH, makeIconButton, makeText } from '@webetnes/core';
import { DEPTH } from '../layout';
import { theme } from '../theme';

const MUTE_ON = '♪';
const MUTE_OFF = '✕';

/** Score, meilleur score et bouton de son. */
export class Hud {
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly bestText: Phaser.GameObjects.Text;
  private readonly muteGlyph: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, muted: boolean, onToggleMute: () => void) {
    makeText(scene, GAME_WIDTH / 2, 62, 'SCORE', 26, theme.textMuted).setDepth(DEPTH.hud);
    this.scoreText = makeText(scene, GAME_WIDTH / 2, 122, '0', 76, theme.text).setDepth(DEPTH.hud);
    this.bestText = makeText(scene, GAME_WIDTH / 2, 190, 'BEST 0', 28, theme.textMuted).setDepth(DEPTH.hud);

    const button = makeIconButton(scene, GAME_WIDTH - 64, 64, MUTE_ON, theme, onToggleMute).setDepth(DEPTH.hud);
    this.muteGlyph = button.getAt(1) as Phaser.GameObjects.Text;
    this.setMuted(muted);
  }

  setScore(score: number, pop = false): void {
    this.scoreText.setText(String(score));
    if (pop) {
      this.scoreText.scene.tweens.killTweensOf(this.scoreText);
      this.scoreText.setScale(1.18);
      this.scoreText.scene.tweens.add({ targets: this.scoreText, scale: 1, duration: 180, ease: 'Back.easeOut' });
    }
  }

  setBest(best: number): void {
    this.bestText.setText(`BEST ${best}`);
  }

  setMuted(muted: boolean): void {
    this.muteGlyph.setText(muted ? MUTE_OFF : MUTE_ON);
    this.muteGlyph.setColor(muted ? theme.textMuted : theme.text);
  }
}
