import type { AdHooks, PortalSDK } from './types';

/**
 * Adaptateur sans portail : GitHub Pages, tests, mode dégradé.
 * Simule une pub de courte durée pour que le flux du jeu reste identique.
 */
export class NullAdapter implements PortalSDK {
  readonly portal = 'none' as const;
  private readonly simulatedAdMs: number;

  constructor(
    private readonly hooks: AdHooks,
    options: { simulatedAdMs?: number } = {},
  ) {
    this.simulatedAdMs = options.simulatedAdMs ?? 600;
  }

  async init(): Promise<void> {}
  loadingFinished(): void {}
  gameplayStart(): void {}
  gameplayStop(): void {}
  happyTime(): void {}

  async commercialBreak(): Promise<void> {
    this.hooks.onAdStart();
    await wait(this.simulatedAdMs);
    this.hooks.onAdEnd();
  }

  async rewardedBreak(): Promise<boolean> {
    this.hooks.onAdStart();
    await wait(this.simulatedAdMs);
    this.hooks.onAdEnd();
    return true;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
