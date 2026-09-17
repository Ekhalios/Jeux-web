import Phaser from 'phaser';
import { Sfx } from './audio';
import { createSDK, portalFromEnv } from './sdk/create';
import type { PortalSDK } from './sdk/types';
import { SafeStorage } from './storage';
import { GAME_HEIGHT, GAME_WIDTH, hex, type Theme } from './theme';

/** Services partagés accessibles depuis toute scène via `ctx(scene)`. */
export interface GameContext {
  sdk: PortalSDK;
  sfx: Sfx;
  storage: SafeStorage;
  theme: Theme;
  /** Vrai pendant une publicité : les scènes doivent ignorer les entrées. */
  adInProgress: boolean;
}

const CONTEXT_KEY = 'webetnes:ctx';

export function ctx(scene: Phaser.Scene): GameContext {
  return scene.registry.get(CONTEXT_KEY) as GameContext;
}

export interface BootstrapOptions {
  /** Identifiant court, préfixe du stockage local. */
  id: string;
  theme: Theme;
  scenes: Phaser.Types.Scenes.SceneType[];
  /** Valeur de import.meta.env.VITE_PORTAL. */
  portalEnv: string | undefined;
  /** Moteur physique optionnel (Merge Drop utilise Matter). */
  physics?: Phaser.Types.Core.PhysicsConfig;
}

/**
 * Crée le jeu Phaser, le SDK du portail, l'audio et le stockage, puis initialise le SDK.
 * Pendant une pub : son coupé et toutes les scènes actives mises en pause, puis reprise.
 */
export async function bootstrap(options: BootstrapOptions): Promise<Phaser.Game> {
  document.body.style.background = hex(options.theme.background);
  document.body.style.margin = '0';

  const sfx = new Sfx();
  const storage = new SafeStorage(`webetnes:${options.id}`);
  sfx.setMuted(storage.getBoolean('muted', false));

  let game: Phaser.Game | null = null;
  const paused: Phaser.Scene[] = [];
  const context: GameContext = {
    sdk: createSDK(portalFromEnv(options.portalEnv), {
      onAdStart() {
        context.adInProgress = true;
        sfx.setAdMuted(true);
        paused.length = 0;
        for (const scene of game?.scene.getScenes(true) ?? []) {
          paused.push(scene);
          scene.scene.pause();
        }
      },
      onAdEnd() {
        for (const scene of paused) scene.scene.resume();
        paused.length = 0;
        sfx.setAdMuted(false);
        context.adInProgress = false;
      },
    }),
    sfx,
    storage,
    theme: options.theme,
    adInProgress: false,
  };

  await context.sdk.init();

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: options.theme.background,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    physics: options.physics,
    input: { activePointers: 2 },
    scene: options.scenes,
    callbacks: {
      preBoot(g) {
        g.registry.set(CONTEXT_KEY, context);
      },
    },
  });

  return game;
}
