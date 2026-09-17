import Phaser from 'phaser';
import { Rng, ctx } from '@webetnes/core';
import { cellCenter } from '../layout';
import { PieceGenerator } from '../logic/generator';
import { canPlace, clearLines, countLines, createGrid, findFullLines, hasAnyMove, linesCells, place, type Grid } from '../logic/grid';
import { comboMultiplier, nextStreak, scorePlacement } from '../logic/score';
import type { Shape } from '../logic/shapes';
import { theme } from '../theme';
import { BoardView } from '../view/BoardView';
import { GameOverPanel } from '../view/GameOverPanel';
import { Hud } from '../view/Hud';
import { Tray } from '../view/Tray';
import { comboText, floatText } from '../view/effects';
import { ensureTextures } from '../view/textures';

export class GameScene extends Phaser.Scene {
  private grid: Grid = createGrid();
  private score = 0;
  private best = 0;
  /** Record au début de la partie, pour détecter un nouveau record au game over. */
  private startBest = 0;
  private streak = 0;
  private rescueUsed = false;
  private over = false;
  private restarting = false;
  private generator!: PieceGenerator;
  private board!: BoardView;
  private hud!: Hud;
  private tray!: Tray;
  private panel: GameOverPanel | null = null;

  constructor() {
    super('game');
  }

  create(): void {
    const { sdk, sfx, storage } = ctx(this);
    ensureTextures(this);

    this.grid = createGrid();
    this.score = 0;
    this.streak = 0;
    this.rescueUsed = false;
    this.over = false;
    this.restarting = false;
    this.panel = null;
    this.best = storage.getNumber('best');
    this.startBest = this.best;
    this.generator = new PieceGenerator(new Rng());

    this.board = new BoardView(this);
    this.board.render(this.grid);
    this.hud = new Hud(this, sfx.isMuted, () => this.toggleMute());
    this.hud.setBest(this.best);

    this.tray = new Tray(this, {
      canDrag: () => !this.over && !ctx(this).adInProgress,
      onPick: () => sfx.play('tap'),
      onGhost: (shape, row, col) => this.board.showGhost(shape, row, col, canPlace(this.grid, shape, row, col)),
      onGhostHide: () => this.board.hideGhost(),
      onDrop: (shape, row, col) => this.tryPlace(shape, row, col),
      onPlaced: () => this.afterPlacement(),
    });

    this.tray.setShapes(this.generator.nextTray(this.grid));
    sdk.gameplayStart();
  }

  private toggleMute(): void {
    const { sfx, storage, adInProgress } = ctx(this);
    if (adInProgress) return;
    const muted = !sfx.isMuted;
    sfx.setMuted(muted);
    storage.setBoolean('muted', muted);
    this.hud.setMuted(muted);
    sfx.play('tap');
  }

  /** Pose la pièce si possible, applique les effacements et le score. */
  private tryPlace(shape: Shape, row: number, col: number): boolean {
    if (this.over || !canPlace(this.grid, shape, row, col)) return false;
    const { sfx } = ctx(this);

    this.grid = place(this.grid, shape, row, col, shape.colorId);
    const lines = findFullLines(this.grid);
    const cleared = countLines(lines);
    this.streak = nextStreak(this.streak, cleared);
    const gained = scorePlacement({ cells: shape.cells.length, linesCleared: cleared, streak: this.streak });

    if (cleared > 0) {
      const cells = linesCells(lines);
      this.grid = clearLines(this.grid, lines);
      this.board.flashCells(cells);
      sfx.play(cleared >= 2 ? 'combo' : 'clear');
      if (cleared >= 2) comboText(this, comboMultiplier(cleared));
    } else {
      sfx.play('place');
    }
    this.board.render(this.grid);

    const center = cellCenter(row + (shape.rows - 1) / 2, col + (shape.cols - 1) / 2);
    floatText(this, center.x, center.y, `+${gained}`, cleared > 0 ? '#ffb703' : theme.text, cleared > 0 ? 48 : 36);
    this.addScore(gained, cleared > 0);
    return true;
  }

  private addScore(gained: number, pop: boolean): void {
    this.score += gained;
    this.hud.setScore(this.score, pop);
    if (this.score > this.best) {
      this.best = this.score;
      this.hud.setBest(this.best);
      ctx(this).storage.setNumber('best', this.best);
    }
  }

  private afterPlacement(): void {
    if (this.tray.isEmpty()) this.tray.setShapes(this.generator.nextTray(this.grid));
    if (!hasAnyMove(this.grid, this.tray.current)) this.gameOver();
  }

  private gameOver(): void {
    const { sdk, sfx } = ctx(this);
    this.over = true;
    sdk.gameplayStop();
    sfx.play('fail');

    this.panel = new GameOverPanel(this, {
      score: this.score,
      best: this.best,
      isNewBest: this.score > this.startBest,
      canRescue: !this.rescueUsed,
      onPlayAgain: () => void this.playAgain(),
      onRescue: () => void this.rescue(),
    });
  }

  private async playAgain(): Promise<void> {
    const { sdk, sfx, adInProgress } = ctx(this);
    if (adInProgress || this.restarting) return;
    this.restarting = true;
    sfx.play('tap');
    await sdk.commercialBreak();
    this.scene.restart();
  }

  /** Pub récompensée : remplace le plateau par des petites pièces et reprend la partie. */
  private async rescue(): Promise<void> {
    const { sdk, sfx, adInProgress } = ctx(this);
    if (adInProgress || this.rescueUsed || this.restarting) return;
    this.rescueUsed = true;
    sfx.play('tap');
    const ok = await sdk.rewardedBreak();
    if (!ok || this.restarting) {
      this.rescueUsed = false;
      return;
    }
    this.panel?.destroy();
    this.panel = null;
    sfx.play('reward');
    this.tray.setShapes(this.generator.rescueTray());
    this.over = false;
    sdk.gameplayStart();
    if (!hasAnyMove(this.grid, this.tray.current)) this.gameOver();
  }
}
