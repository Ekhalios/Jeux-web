import Phaser from 'phaser';
import { FONT_FAMILY } from '@webetnes/core';
import { DEPTH } from './layout';

/** Anneau qui s'agrandit et s'estompe au point de fusion. */
export function mergeRing(scene: Phaser.Scene, x: number, y: number, radius: number, color: number): void {
  const ring = scene.add.circle(x, y, radius, 0, 0).setStrokeStyle(6, color, 0.9).setDepth(DEPTH.fx);
  scene.tweens.add({
    targets: ring,
    scale: 1.8,
    alpha: 0,
    duration: 380,
    ease: 'Cubic.easeOut',
    onComplete: () => ring.destroy(),
  });
}

/** Texte de score qui flotte vers le haut puis disparaît. */
export function floatingText(scene: Phaser.Scene, x: number, y: number, content: string, color: string, size = 40): void {
  const t = scene.add
    .text(x, y, content, { fontFamily: FONT_FAMILY, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#2b1d3a', strokeThickness: 6 })
    .setOrigin(0.5)
    .setDepth(DEPTH.fx);
  scene.tweens.add({
    targets: t,
    y: y - 70,
    alpha: 0,
    duration: 700,
    ease: 'Quad.easeOut',
    onComplete: () => t.destroy(),
  });
}

/** Petit « pop » d'apparition : part réduit et rebondit vers l'échelle 1. */
export function popIn(scene: Phaser.Scene, target: Phaser.GameObjects.Components.Transform): void {
  target.setScale(0.6);
  scene.tweens.add({ targets: target, scale: 1, duration: 220, ease: 'Back.easeOut' });
}

/** Rétrécit puis détruit un objet (retrait par la récompense). Échelle jamais nulle : le corps Matter est mis à l'échelle avec l'image. */
export function shrinkOut(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform, delay = 0): void {
  scene.tweens.add({
    targets: target,
    scale: 0.05,
    alpha: 0,
    duration: 260,
    delay,
    ease: 'Quad.easeIn',
    onComplete: () => target.destroy(),
  });
}
