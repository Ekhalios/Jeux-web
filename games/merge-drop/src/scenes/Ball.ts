import Phaser from 'phaser';
import { levelInfo } from '../logic/levels';
import { DEPTH } from './layout';
import { ballTextureKey } from './textures';

/** Boule physique dans le bac : image Matter circulaire portant son niveau. */
export class Ball extends Phaser.Physics.Matter.Image {
  readonly level: number;
  readonly radius: number;
  /** Marquée quand une fusion l'a consommée dans le tick courant, pour éviter les doubles fusions. */
  merged = false;

  constructor(scene: Phaser.Scene, x: number, y: number, level: number) {
    super(scene.matter.world, x, y, ballTextureKey(level));
    const info = levelInfo(level);
    this.level = level;
    this.radius = info.radius;
    this.setCircle(info.radius, { restitution: 0.1, friction: 0.4, frictionAir: 0.01, label: 'ball' });
    this.setDepth(DEPTH.balls);
    scene.add.existing(this);
  }

  /** Vitesse scalaire du corps (px par pas), utilisée par la détection de danger. */
  get speed(): number {
    return (this.body as MatterJS.BodyType).speed;
  }
}

export function isBall(body: MatterJS.BodyType): body is MatterJS.BodyType & { gameObject: Ball } {
  return body.gameObject instanceof Ball;
}
