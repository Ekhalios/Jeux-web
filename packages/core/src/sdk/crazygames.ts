import type { AdHooks, PortalSDK } from './types';

type AdType = 'midgame' | 'rewarded';

interface AdCallbacks {
  adStarted?: () => void;
  adFinished?: () => void;
  adError?: (error: unknown) => void;
}

/** Surface du SDK CrazyGames v3 telle qu'exposée sur window.CrazyGames.SDK. */
interface CrazyGamesGlobal {
  SDK: {
    init(): Promise<void>;
    environment?: 'local' | 'crazygames' | 'disabled';
    game: {
      gameplayStart(): void;
      gameplayStop(): void;
      loadingStart?(): void;
      loadingStop?(): void;
      happytime?(): void;
    };
    ad: {
      requestAd(type: AdType, callbacks: AdCallbacks): void;
      hasAdblock?(): Promise<boolean>;
    };
  };
}

declare global {
  interface Window {
    CrazyGames?: CrazyGamesGlobal;
  }
}

/**
 * Adaptateur CrazyGames. Le script https://sdk.crazygames.com/crazygames-sdk-v3.js
 * est injecté dans index.html par le plugin Vite quand VITE_PORTAL=crazygames.
 */
export class CrazyGamesAdapter implements PortalSDK {
  readonly portal = 'crazygames' as const;
  private sdk: CrazyGamesGlobal['SDK'] | null = null;

  constructor(private readonly hooks: AdHooks) {}

  async init(): Promise<void> {
    const sdk = window.CrazyGames?.SDK;
    if (!sdk) return;
    try {
      await sdk.init();
      if (sdk.environment === 'disabled') {
        this.sdk = null;
        return;
      }
      this.sdk = sdk;
    } catch {
      this.sdk = null;
    }
  }

  loadingFinished(): void {
    this.sdk?.game.loadingStop?.();
  }

  gameplayStart(): void {
    this.sdk?.game.gameplayStart();
  }

  gameplayStop(): void {
    this.sdk?.game.gameplayStop();
  }

  happyTime(): void {
    this.sdk?.game.happytime?.();
  }

  commercialBreak(): Promise<void> {
    return this.requestAd('midgame').then(() => undefined);
  }

  rewardedBreak(): Promise<boolean> {
    return this.requestAd('rewarded');
  }

  /** Résout true si la pub a été vue jusqu'au bout, true aussi en mode dégradé, false sur erreur pub. */
  private requestAd(type: AdType): Promise<boolean> {
    const sdk = this.sdk;
    if (!sdk) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      let started = false;
      sdk.ad.requestAd(type, {
        adStarted: () => {
          started = true;
          this.hooks.onAdStart();
        },
        adFinished: () => {
          if (started) this.hooks.onAdEnd();
          resolve(true);
        },
        adError: () => {
          if (started) this.hooks.onAdEnd();
          // Pas de pub disponible : on ne pénalise pas le joueur sur une midgame,
          // mais une récompense sans pub n'est accordée que si la pub n'a pas commencé.
          resolve(type === 'midgame' ? true : !started);
        },
      });
    });
  }
}
