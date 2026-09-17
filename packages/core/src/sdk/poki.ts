import type { AdHooks, PortalSDK } from './types';

/** Surface du SDK Poki v2 telle qu'exposée sur window.PokiSDK. */
interface PokiGlobal {
  init(): Promise<void>;
  setDebug?(enabled: boolean): void;
  gameLoadingFinished(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  commercialBreak(beforeAd?: () => void): Promise<void>;
  rewardedBreak(beforeAd?: () => void): Promise<boolean>;
}

declare global {
  interface Window {
    PokiSDK?: PokiGlobal;
  }
}

/**
 * Adaptateur Poki. Le script https://game-cdn.poki.com/scripts/v2/poki-sdk.js
 * est injecté dans index.html par le plugin Vite quand VITE_PORTAL=poki.
 * Si le script est absent ou si init() échoue (bloqueur de pub), on passe en mode dégradé :
 * le jeu continue, les récompenses sont accordées, comme l'exige Poki.
 */
export class PokiAdapter implements PortalSDK {
  readonly portal = 'poki' as const;
  private sdk: PokiGlobal | null = null;

  constructor(private readonly hooks: AdHooks) {}

  async init(): Promise<void> {
    const sdk = window.PokiSDK;
    if (!sdk) return;
    try {
      await sdk.init();
      this.sdk = sdk;
    } catch {
      this.sdk = null;
    }
  }

  loadingFinished(): void {
    this.sdk?.gameLoadingFinished();
  }

  gameplayStart(): void {
    this.sdk?.gameplayStart();
  }

  gameplayStop(): void {
    this.sdk?.gameplayStop();
  }

  happyTime(): void {}

  async commercialBreak(): Promise<void> {
    if (!this.sdk) return;
    this.hooks.onAdStart();
    try {
      await this.sdk.commercialBreak();
    } finally {
      this.hooks.onAdEnd();
    }
  }

  async rewardedBreak(): Promise<boolean> {
    if (!this.sdk) return true;
    this.hooks.onAdStart();
    try {
      return await this.sdk.rewardedBreak();
    } catch {
      return true;
    } finally {
      this.hooks.onAdEnd();
    }
  }
}
