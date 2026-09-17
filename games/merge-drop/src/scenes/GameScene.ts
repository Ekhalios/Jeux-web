import Phaser from 'phaser';
import { GAME_WIDTH, Rng, ctx, makeButton } from '@webetnes/core';
import { GAME_OVER_DANGER_MS, REWARD_DANGER_MS, accumulateDanger, isInDanger, isNearDanger } from '../logic/danger';
import { levelInfo } from '../logic/levels';
import { mergeResult } from '../logic/merge';
import { initialScore, isCombo, registerMerge, type ScoreState } from '../logic/score';
import { nextLevel } from '../logic/spawn';
import { BIN_COLOR, LINE_COLOR } from '../theme';
import { Ball, isBall } from './Ball';
import { floatingText, mergeRing, popIn, shrinkOut } from './effects';
import { GameOverPanel } from './GameOverPanel';
import { Hud } from './Hud';
import { BIN_LEFT, BIN_RIGHT, DANGER_LINE_Y, DEPTH, DROP_COOLDOWN_MS, FLOOR_Y, HOLD_Y, WALL_THICKNESS } from './layout';
import { ballTextureKey, ensureBallTextures } from './textures';

/** Niveau à partir duquel une fusion secoue la caméra. */
const BIG_MERGE_LEVEL = 8;
/** Niveaux retirés par la récompense. */
const SMALL_BALL_MAX_LEVEL = 2;

export class GameScene extends Phaser.Scene {
  private rng!: Rng;
  private hud!: Hud;
  private dangerLine!: Phaser.GameObjects.Graphics;
  private balls: Ball[] = [];
  private readonly pendingMerges: Array<[Ball, Ball]> = [];
  private held: Phaser.GameObjects.Image | null = null;
  private heldLevel = 1;
  private nextLvl = 1;
  private holdX = GAME_WIDTH / 2;
  private canDrop = false;
  private aiming = false;
  private scoreState: ScoreState = initialScore();
  private best = 0;
  private dangerMs = 0;
  private lineFlash: Phaser.Tweens.Tween | null = null;
  private rewardButton: Phaser.GameObjects.Container | null = null;
  private rewardOffered = false;
  private rewardUsed = false;
  private rewardPending = false;
  private gameOver = false;
  private restarting = false;
  private panel: GameOverPanel | null = null;

  constructor() {
    super('Game');
  }

  create(): void {
    this.resetState();
    ensureBallTextures(this);
    const { sdk, storage } = ctx(this);
    this.best = storage.getNumber('best', 0);

    this.buildBin();
    this.dangerLine = this.add.graphics().setDepth(DEPTH.line);
    this.drawDangerLine(LINE_COLOR);
    this.hud = new Hud(this, this.best);

    this.matter.world.on(Phaser.Physics.Matter.Events.COLLISION_START, this.onCollisionStart, this);
    this.bindInput();

    this.heldLevel = nextLevel(this.rng);
    this.nextLvl = nextLevel(this.rng);
    this.hud.setNext(this.nextLvl);
    this.createHeld();

    sdk.gameplayStart();
  }

  override update(time: number, delta: number): void {
    if (this.gameOver) return;
    this.processMerges(time);
    if (!this.rewardPending) this.checkDanger(delta);
  }

  // ----- Mise en place -----

  /** Les instances de scène sont réutilisées par restart() : tout l'état vit ici. */
  private resetState(): void {
    this.rng = new Rng();
    this.balls = [];
    this.pendingMerges.length = 0;
    this.held = null;
    this.holdX = GAME_WIDTH / 2;
    this.canDrop = false;
    this.aiming = false;
    this.scoreState = initialScore();
    this.dangerMs = 0;
    this.lineFlash = null;
    this.rewardButton = null;
    this.rewardOffered = false;
    this.rewardUsed = false;
    this.rewardPending = false;
    this.gameOver = false;
    this.restarting = false;
    this.panel = null;
  }

  private buildBin(): void {
    const g = this.add.graphics().setDepth(DEPTH.bin);
    const top = DANGER_LINE_Y - 30;
    g.fillStyle(BIN_COLOR, 1);
    g.fillRoundedRect(BIN_LEFT - WALL_THICKNESS, top, WALL_THICKNESS, FLOOR_Y - top + WALL_THICKNESS, { tl: 10, tr: 10, bl: 24, br: 0 });
    g.fillRoundedRect(BIN_RIGHT, top, WALL_THICKNESS, FLOOR_Y - top + WALL_THICKNESS, { tl: 10, tr: 10, bl: 0, br: 24 });
    g.fillRect(BIN_LEFT, FLOOR_Y, BIN_RIGHT - BIN_LEFT, WALL_THICKNESS);
    g.fillStyle(0x000000, 0.18);
    g.fillRect(BIN_LEFT, top, BIN_RIGHT - BIN_LEFT, FLOOR_Y - top);

    const wallOptions = { isStatic: true, friction: 0.4, restitution: 0.1, label: 'wall' };
    this.matter.add.rectangle(BIN_LEFT - WALL_THICKNESS / 2, FLOOR_Y / 2, WALL_THICKNESS, FLOOR_Y, wallOptions);
    this.matter.add.rectangle(BIN_RIGHT + WALL_THICKNESS / 2, FLOOR_Y / 2, WALL_THICKNESS, FLOOR_Y, wallOptions);
    this.matter.add.rectangle(GAME_WIDTH / 2, FLOOR_Y + WALL_THICKNESS / 2, GAME_WIDTH, WALL_THICKNESS, wallOptions);
  }

  private drawDangerLine(color: number): void {
    const g = this.dangerLine;
    g.clear();
    g.fillStyle(color, 1);
    for (let x = BIN_LEFT; x < BIN_RIGHT; x += 30) g.fillRect(x, DANGER_LINE_Y - 2, 16, 4);
  }

  private bindInput(): void {
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer, over: unknown[]) => {
      if (this.inputBlocked() || over.length > 0) return;
      this.aiming = true;
      this.moveHeld(p.x);
    });
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (p: Phaser.Input.Pointer) => {
      if (!this.inputBlocked()) this.moveHeld(p.x);
    });
    this.input.on(Phaser.Input.Events.POINTER_UP, (p: Phaser.Input.Pointer, over: unknown[]) => {
      if (!this.aiming) return;
      this.aiming = false;
      if (this.inputBlocked() || over.length > 0) return;
      this.moveHeld(p.x);
      this.drop();
    });
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.inputBlocked()) this.drop();
    });
  }

  private inputBlocked(): boolean {
    return ctx(this).adInProgress || this.gameOver || this.rewardPending || this.panel !== null;
  }

  // ----- Boule tenue -----

  private createHeld(): void {
    if (this.gameOver || this.held) return;
    this.moveHeld(this.holdX);
    this.held = this.add.image(this.holdX, HOLD_Y, ballTextureKey(this.heldLevel)).setDepth(DEPTH.held);
    popIn(this, this.held);
    this.canDrop = true;
  }

  private moveHeld(x: number): void {
    const r = levelInfo(this.heldLevel).radius;
    this.holdX = Phaser.Math.Clamp(x, BIN_LEFT + r, BIN_RIGHT - r);
    this.held?.setX(this.holdX);
  }

  private drop(): void {
    if (!this.held || !this.canDrop) return;
    this.canDrop = false;
    const ball = new Ball(this, this.holdX, HOLD_Y, this.heldLevel);
    ball.setVelocityY(2);
    this.balls.push(ball);
    this.held.destroy();
    this.held = null;
    ctx(this).sfx.play('tap');

    this.heldLevel = this.nextLvl;
    this.nextLvl = nextLevel(this.rng);
    this.hud.setNext(this.nextLvl);
    this.time.delayedCall(DROP_COOLDOWN_MS, () => this.createHeld());
  }

  // ----- Fusion -----

  private onCollisionStart(event: Phaser.Physics.Matter.Events.CollisionStartEvent): void {
    for (const pair of event.pairs) {
      const a = pair.bodyA.parent ?? pair.bodyA;
      const b = pair.bodyB.parent ?? pair.bodyB;
      if (!isBall(a) || !isBall(b)) continue;
      const ba = a.gameObject;
      const bb = b.gameObject;
      if (ba.merged || bb.merged || ba.level !== bb.level) continue;
      ba.merged = true;
      bb.merged = true;
      this.pendingMerges.push([ba, bb]);
    }
  }

  /** Applique les fusions collectées pendant le pas physique, hors du callback de collision. */
  private processMerges(now: number): void {
    if (this.pendingMerges.length === 0) return;
    const { sfx, theme } = ctx(this);
    for (const [a, b] of this.pendingMerges) {
      const result = a.active && b.active ? mergeResult(a.level, b.level) : null;
      if (!result) {
        // Paire invalidée : la survivante redevient fusionnable.
        a.merged = false;
        b.merged = false;
        continue;
      }
      const x = (a.x + b.x) / 2;
      const y = (a.y + b.y) / 2;
      this.removeBall(a);
      this.removeBall(b);
      a.destroy();
      b.destroy();

      const color = result.level ? levelInfo(result.level).color : theme.primary;
      const radius = result.level ? levelInfo(result.level).radius : levelInfo(a.level).radius;
      if (result.level) {
        const merged = new Ball(this, x, y, result.level);
        this.balls.push(merged);
        popIn(this, merged);
        if (result.level >= BIG_MERGE_LEVEL) this.cameras.main.shake(160, 0.008);
      } else {
        this.cameras.main.shake(220, 0.012);
      }
      mergeRing(this, x, y, radius, color);

      this.scoreState = registerMerge(this.scoreState, result.score, now);
      floatingText(this, x, y - radius * 0.4, `+${result.score}`, '#fbf5ff');
      if (isCombo(this.scoreState)) {
        floatingText(this, x, y - radius * 0.4 - 46, `COMBO x${this.scoreState.chain}`, '#ffd166', 32);
        sfx.play('combo');
      } else {
        sfx.play('merge');
      }
      this.hud.setScore(this.scoreState.score);
      if (this.scoreState.score > this.best) {
        this.best = this.scoreState.score;
        this.hud.setBest(this.best);
      }
    }
    this.pendingMerges.length = 0;
  }

  private removeBall(ball: Ball): void {
    const i = this.balls.indexOf(ball);
    if (i >= 0) this.balls.splice(i, 1);
  }

  // ----- Danger et récompense -----

  private checkDanger(delta: number): void {
    const danger = isInDanger(this.balls, DANGER_LINE_Y);
    this.dangerMs = accumulateDanger(this.dangerMs, danger, delta);
    this.setLineFlashing(danger || isNearDanger(this.balls, DANGER_LINE_Y));

    if (this.dangerMs >= REWARD_DANGER_MS && !this.rewardOffered && !this.rewardUsed && this.hasSmallBalls()) {
      this.showRewardButton();
    }
    if (this.dangerMs >= GAME_OVER_DANGER_MS) this.endGame();
  }

  private setLineFlashing(on: boolean): void {
    if (on && !this.lineFlash) {
      this.drawDangerLine(ctx(this).theme.danger);
      this.lineFlash = this.tweens.add({ targets: this.dangerLine, alpha: 0.2, duration: 260, yoyo: true, repeat: -1 });
    } else if (!on && this.lineFlash) {
      this.lineFlash.stop();
      this.lineFlash = null;
      this.dangerLine.setAlpha(1);
      this.drawDangerLine(LINE_COLOR);
    }
  }

  private hasSmallBalls(): boolean {
    return this.balls.some((b) => b.level <= SMALL_BALL_MAX_LEVEL);
  }

  private showRewardButton(): void {
    this.rewardOffered = true;
    const { theme } = ctx(this);
    this.rewardButton = makeButton(this, GAME_WIDTH / 2, DANGER_LINE_Y + 90, 'Clear small balls (watch ad)', theme, () => void this.claimReward(), {
      width: 480,
      height: 76,
      fontSize: 28,
      fill: theme.accent,
    }).setDepth(DEPTH.hud);
    popIn(this, this.rewardButton);
  }

  private hideRewardButton(): void {
    this.rewardButton?.destroy();
    this.rewardButton = null;
  }

  /** Pub récompensée : retire les petites boules si la pub a été vue. Reprend la partie si elle était perdue. */
  private async claimReward(): Promise<void> {
    if (this.rewardPending || this.rewardUsed || ctx(this).adInProgress) return;
    this.rewardPending = true;
    this.hideRewardButton();
    const ok = await ctx(this).sdk.rewardedBreak();
    this.rewardPending = false;
    if (!ok) return;
    this.rewardUsed = true;
    this.clearSmallBalls();
    if (this.gameOver) this.resumeAfterGameOver();
  }

  private clearSmallBalls(): void {
    const { sfx, theme } = ctx(this);
    let delay = 0;
    for (const ball of this.balls.filter((b) => b.level <= SMALL_BALL_MAX_LEVEL)) {
      this.removeBall(ball);
      ball.merged = true;
      this.matter.world.remove(ball.body as MatterJS.BodyType);
      mergeRing(this, ball.x, ball.y, ball.radius, theme.accent);
      shrinkOut(this, ball, delay);
      delay += 25;
    }
    this.dangerMs = 0;
    sfx.play('reward');
    floatingText(this, GAME_WIDTH / 2, DANGER_LINE_Y + 200, 'Cleared!', '#8be04b', 56);
  }

  // ----- Fin de partie -----

  private endGame(): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.aiming = false;
    this.hideRewardButton();
    this.matter.world.pause();
    this.held?.setVisible(false);

    const { sdk, sfx, storage } = ctx(this);
    sfx.play('fail');
    sdk.gameplayStop();
    this.cameras.main.shake(250, 0.01);

    const score = this.scoreState.score;
    const previousBest = storage.getNumber('best', 0);
    const isNewBest = score > previousBest;
    if (isNewBest) storage.setNumber('best', score);
    this.best = Math.max(previousBest, score);

    const canReward = !this.rewardUsed && this.hasSmallBalls();
    this.panel = new GameOverPanel(this, score, this.best, isNewBest, {
      onPlayAgain: () => void this.playAgain(),
      onReward: canReward ? () => void this.claimReward() : undefined,
    });
  }

  private resumeAfterGameOver(): void {
    this.panel?.destroy();
    this.panel = null;
    this.gameOver = false;
    this.dangerMs = 0;
    this.matter.world.resume();
    if (this.held) this.held.setVisible(true);
    else this.createHeld();
    ctx(this).sdk.gameplayStart();
  }

  private async playAgain(): Promise<void> {
    if (this.restarting || ctx(this).adInProgress) return;
    this.restarting = true;
    await ctx(this).sdk.commercialBreak();
    this.scene.restart();
  }
}
