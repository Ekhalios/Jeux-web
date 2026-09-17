import Phaser from 'phaser';
import { ctx, GAME_HEIGHT, GAME_WIDTH, hex, makeIconButton, makeText } from '@webetnes/core';
import {
  BASE_WIDTH,
  BLOCK_HEIGHT,
  COMBO_EVERY,
  CONTINUE_MIN_WIDTH,
  PERFECT_THRESHOLD,
  SIDE_MARGIN,
  TOP_TARGET_Y,
} from '../logic/constants';
import { colorForLevel, lerpColor } from '../logic/hue';
import { scoreForLanding, widthAfterPerfect } from '../logic/score';
import { speedForLevel } from '../logic/speed';
import { computeLanding, type Cut } from '../logic/stack';
import { BACKGROUND_DARKEN_LEVELS, BACKGROUND_DARKEST } from '../theme';
import type { GameOverData } from './GameOverScene';

/** Bloc de la tour : rectangle Phaser + géométrie logique (bord gauche, largeur, haut). */
interface Block {
  rect: Phaser.GameObjects.Rectangle;
  x: number;
  width: number;
  top: number;
}

const BASE_TOP_Y = GAME_HEIGHT - 80 - BLOCK_HEIGHT;
const FRAME_MS = 1000 / 60;
const MAX_KEPT_BLOCKS = 22;
const GLYPH_SOUND_ON = '♪';
const GLYPH_SOUND_OFF = '✕';

export class GameScene extends Phaser.Scene {
  private blocks: Block[] = [];
  private moving: Block | null = null;
  private movingDir = 1;
  private speed = 0;
  private score = 0;
  private best = 0;
  private streak = 0;
  private rewardUsed = false;
  private playing = false;

  private scoreText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;

  constructor() {
    super('Game');
  }

  create(): void {
    const { sdk, storage, theme } = ctx(this);
    // La scène est réutilisée par scene.restart() : tout l'état se remet ici, pas dans les champs.
    this.blocks = [];
    this.moving = null;
    this.score = 0;
    this.streak = 0;
    this.rewardUsed = false;
    this.best = storage.getNumber('best', 0);
    this.cameras.main.setBackgroundColor(theme.background);

    this.drawBackground();
    this.blocks.push(this.createBlock((GAME_WIDTH - BASE_WIDTH) / 2, BASE_WIDTH, BASE_TOP_Y, 0));
    this.buildHud();
    this.bindInput();

    this.spawnMoving();
    this.playing = true;
    sdk.gameplayStart();
  }

  override update(_time: number, delta: number): void {
    const m = this.moving;
    if (!this.playing || !m) return;
    const step = (this.speed * Math.min(delta, 50)) / FRAME_MS;
    const minX = SIDE_MARGIN;
    const maxX = GAME_WIDTH - SIDE_MARGIN - m.width;
    let x = m.x + this.movingDir * step;
    if (x <= minX) {
      x = minX;
      this.movingDir = 1;
    } else if (x >= maxX) {
      x = maxX;
      this.movingDir = -1;
    }
    m.x = x;
    m.rect.x = x + m.width / 2;
  }

  /** Relance une partie complète (appelé par le panneau de fin après la pause commerciale). */
  restartGame(): void {
    this.scene.restart();
  }

  /** Reprise après pub récompensée : score conservé, bloc mobile à la largeur du sommet (200 minimum). */
  continueAfterReward(): void {
    const top = this.topBlock();
    this.rewardUsed = true;
    this.streak = 0;

    const width = Math.max(top.width, CONTINUE_MIN_WIDTH);
    if (width > top.width) {
      const x = Phaser.Math.Clamp(top.x - (width - top.width) / 2, SIDE_MARGIN, GAME_WIDTH - SIDE_MARGIN - width);
      const level = this.blocks.length - 1;
      top.rect.destroy();
      const widened = this.createBlock(x, width, top.top, level);
      widened.rect.setScale(top.width / width, 1);
      this.tweens.add({ targets: widened.rect, scaleX: 1, duration: 220, ease: 'Back.easeOut' });
      this.blocks[this.blocks.length - 1] = widened;
    }

    this.spawnMoving();
    this.playing = true;
    ctx(this).sdk.gameplayStart();
  }

  // ---------------------------------------------------------------- gameplay

  private drop(): void {
    const m = this.moving;
    if (!this.playing || !m || ctx(this).adInProgress) return;
    this.moving = null;

    const prev = this.topBlock();
    const landing = computeLanding({ x: prev.x, width: prev.width }, { x: m.x, width: m.width }, PERFECT_THRESHOLD);

    if (landing.kind === 'miss') {
      this.fall(m.rect, m.x < prev.x ? -1 : 1, 640);
      this.gameOver();
      return;
    }

    const { sfx } = ctx(this);
    let x = landing.x;
    let width = landing.width;
    if (landing.kind === 'perfect') {
      this.streak += 1;
      width = widthAfterPerfect(landing.width, this.streak, BASE_WIDTH);
      x = landing.x - (width - landing.width) / 2;
      sfx.play(this.streak % COMBO_EVERY === 0 ? 'combo' : 'perfect');
    } else {
      this.streak = 0;
      this.spawnDebris(landing.cut, m.top, this.blocks.length);
      sfx.play('place');
    }

    const gained = scoreForLanding(landing.kind, this.streak);
    this.score += gained;

    m.rect.destroy();
    const placed = this.createBlock(x, width, m.top, this.blocks.length);
    this.blocks.push(placed);
    placed.rect.setScale(1, 0.78);
    this.tweens.add({ targets: placed.rect, scaleY: 1, duration: 140, ease: 'Back.easeOut' });

    if (landing.kind === 'perfect') this.perfectEffects(placed);
    this.floatText(placed.rect.x, placed.top - 24, `+${gained}`, 34, ctx(this).theme.text, 80);

    this.refreshHud();
    this.followTower(placed);
    this.pruneBlocks();
    this.spawnMoving();
  }

  private spawnMoving(): void {
    const top = this.topBlock();
    const level = this.blocks.length;
    const width = top.width;
    this.movingDir = level % 2 === 1 ? 1 : -1;
    const x = this.movingDir === 1 ? SIDE_MARGIN : GAME_WIDTH - SIDE_MARGIN - width;
    this.moving = this.createBlock(x, width, BASE_TOP_Y - level * BLOCK_HEIGHT, level);
    this.speed = speedForLevel(level - 1);
  }

  private gameOver(): void {
    const { sdk, sfx, storage } = ctx(this);
    this.playing = false;
    sfx.play('fail');
    this.cameras.main.shake(320, 0.012);
    sdk.gameplayStop();

    const isNewBest = this.score > this.best;
    if (isNewBest) {
      this.best = this.score;
      storage.setNumber('best', this.best);
      this.refreshHud();
    }

    const data: GameOverData = {
      score: this.score,
      best: this.best,
      isNewBest,
      canContinue: !this.rewardUsed,
    };
    this.time.delayedCall(550, () => this.scene.launch('GameOver', data));
  }

  private topBlock(): Block {
    const top = this.blocks[this.blocks.length - 1];
    if (!top) throw new Error('tower is empty');
    return top;
  }

  /** Détruit les blocs très bas, hors écran depuis longtemps. */
  private pruneBlocks(): void {
    while (this.blocks.length > MAX_KEPT_BLOCKS) {
      this.blocks.shift()?.rect.destroy();
    }
  }

  // ---------------------------------------------------------------- rendering

  private createBlock(x: number, width: number, top: number, level: number): Block {
    const rect = this.add
      .rectangle(x + width / 2, top + BLOCK_HEIGHT, width, BLOCK_HEIGHT, colorForLevel(level))
      .setOrigin(0.5, 1)
      .setStrokeStyle(3, colorForLevel(level, 0.36));
    return { rect, x, width, top };
  }

  private spawnDebris(cut: Cut, top: number, level: number): void {
    if (cut.width <= 0) return;
    const dir = cut.side === 'left' ? -1 : 1;
    const rect = this.add
      .rectangle(cut.x + cut.width / 2, top + BLOCK_HEIGHT, cut.width, BLOCK_HEIGHT, colorForLevel(level))
      .setOrigin(0.5, 1)
      .setStrokeStyle(3, colorForLevel(level, 0.36));
    this.fall(rect, dir, 520);
  }

  private fall(rect: Phaser.GameObjects.Rectangle, dir: number, distance: number): void {
    this.tweens.add({
      targets: rect,
      y: rect.y + distance,
      x: rect.x + dir * 60,
      angle: dir * 32,
      alpha: 0,
      duration: 720,
      ease: 'Quad.easeIn',
      onComplete: () => rect.destroy(),
    });
  }

  private perfectEffects(block: Block): void {
    const { theme } = ctx(this);
    const ring = this.add
      .rectangle(block.rect.x, block.top + BLOCK_HEIGHT / 2, block.width + 10, BLOCK_HEIGHT + 10)
      .setStrokeStyle(5, 0xffffff, 0.9);
    this.tweens.add({
      targets: ring,
      scaleX: 1.35,
      scaleY: 1.9,
      alpha: 0,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
    this.floatText(block.rect.x, block.top - 70, 'PERFECT', 42, hex(theme.accent), 0);
  }

  private floatText(x: number, y: number, content: string, size: number, color: string, delay: number): void {
    const t = makeText(this, x, y, content, size, color).setAlpha(0);
    this.tweens.add({
      targets: t,
      y: y - 70,
      alpha: { from: 1, to: 0 },
      delay,
      duration: 720,
      ease: 'Quad.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  /** Fait défiler la caméra pour que le sommet reste vers TOP_TARGET_Y et assombrit le fond avec la hauteur. */
  private followTower(top: Block): void {
    const cam = this.cameras.main;
    const targetScroll = Math.min(0, top.top - TOP_TARGET_Y);
    if (targetScroll !== cam.scrollY) {
      this.tweens.add({ targets: cam, scrollY: targetScroll, duration: 240, ease: 'Sine.easeOut' });
    }
    const level = this.blocks.length - 1;
    cam.setBackgroundColor(lerpColor(ctx(this).theme.background, BACKGROUND_DARKEST, level / BACKGROUND_DARKEN_LEVELS));
  }

  /** Dégradé vertical dessiné une fois, fixé à l'écran : léger halo en haut, ombre en bas. */
  private drawBackground(): void {
    const g = this.add.graphics().setScrollFactor(0);
    const strips = 32;
    const h = GAME_HEIGHT / strips;
    for (let i = 0; i < strips; i++) {
      const t = i / (strips - 1);
      const shadow = 0.42 * t * t;
      const glow = 0.08 * (1 - t) * (1 - t);
      g.fillStyle(0x000000, shadow);
      g.fillRect(0, i * h, GAME_WIDTH, h + 1);
      g.fillStyle(0xffffff, glow);
      g.fillRect(0, i * h, GAME_WIDTH, h + 1);
    }
  }

  // ---------------------------------------------------------------- HUD & input

  private buildHud(): void {
    const { sfx, storage, theme } = ctx(this);
    const cx = GAME_WIDTH / 2;
    this.scoreText = makeText(this, cx, 120, '0', 104, theme.text).setScrollFactor(0).setDepth(10);
    this.bestText = makeText(this, cx, 200, `BEST ${this.best}`, 30, theme.textMuted).setScrollFactor(0).setDepth(10);

    const glyph = () => (sfx.isMuted ? GLYPH_SOUND_OFF : GLYPH_SOUND_ON);
    const button = makeIconButton(this, GAME_WIDTH - 60, 60, glyph(), theme, () => {
      if (ctx(this).adInProgress) return;
      const muted = !sfx.isMuted;
      sfx.setMuted(muted);
      storage.setBoolean('muted', muted);
      label.setText(glyph());
      if (!muted) sfx.play('tap');
    });
    button.setScrollFactor(0, 0, true).setDepth(10);
    const label = button.getAt(1) as Phaser.GameObjects.Text;
  }

  private refreshHud(): void {
    this.scoreText.setText(String(this.score));
    this.bestText.setText(`BEST ${this.best}`);
  }

  private bindInput(): void {
    this.input.on(
      Phaser.Input.Events.POINTER_DOWN,
      (_pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
        if (currentlyOver.length > 0) return;
        this.drop();
      },
    );
    this.input.keyboard?.on('keydown-SPACE', () => this.drop());
  }
}
