import { afterEach, describe, expect, it, vi } from 'vitest';
import { CrazyGamesAdapter } from './crazygames';
import { createSDK, portalFromEnv } from './create';
import { NullAdapter } from './null';
import { PokiAdapter } from './poki';
import type { AdHooks } from './types';

function hooks(): AdHooks & { starts: number; ends: number } {
  const h = {
    starts: 0,
    ends: 0,
    onAdStart() {
      h.starts += 1;
    },
    onAdEnd() {
      h.ends += 1;
    },
  };
  return h;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('portalFromEnv', () => {
  it('reconnaît poki et crazygames, sinon none', () => {
    expect(portalFromEnv('poki')).toBe('poki');
    expect(portalFromEnv('crazygames')).toBe('crazygames');
    expect(portalFromEnv('autre')).toBe('none');
    expect(portalFromEnv(undefined)).toBe('none');
  });
});

describe('createSDK', () => {
  it('fabrique l’adaptateur correspondant', () => {
    expect(createSDK('poki')).toBeInstanceOf(PokiAdapter);
    expect(createSDK('crazygames')).toBeInstanceOf(CrazyGamesAdapter);
    expect(createSDK('none')).toBeInstanceOf(NullAdapter);
  });
});

describe('NullAdapter', () => {
  it('simule une pub et accorde toujours la récompense', async () => {
    const h = hooks();
    const sdk = new NullAdapter(h, { simulatedAdMs: 1 });
    await sdk.init();
    await sdk.commercialBreak();
    expect(await sdk.rewardedBreak()).toBe(true);
    expect(h.starts).toBe(2);
    expect(h.ends).toBe(2);
  });
});

describe('PokiAdapter', () => {
  it('sans script Poki, reste jouable et accorde la récompense', async () => {
    vi.stubGlobal('window', {});
    const sdk = new PokiAdapter(hooks());
    await sdk.init();
    await sdk.commercialBreak();
    expect(await sdk.rewardedBreak()).toBe(true);
  });

  it('avec le SDK, relaie les appels et encadre la pub par les hooks', async () => {
    const calls: string[] = [];
    vi.stubGlobal('window', {
      PokiSDK: {
        init: async () => {
          calls.push('init');
        },
        gameLoadingFinished: () => calls.push('loaded'),
        gameplayStart: () => calls.push('start'),
        gameplayStop: () => calls.push('stop'),
        commercialBreak: async () => {
          calls.push('commercial');
        },
        rewardedBreak: async () => {
          calls.push('rewarded');
          return false;
        },
      },
    });
    const h = hooks();
    const sdk = new PokiAdapter(h);
    await sdk.init();
    sdk.loadingFinished();
    sdk.gameplayStart();
    sdk.gameplayStop();
    await sdk.commercialBreak();
    expect(await sdk.rewardedBreak()).toBe(false);
    expect(calls).toEqual(['init', 'loaded', 'start', 'stop', 'commercial', 'rewarded']);
    expect(h.starts).toBe(2);
    expect(h.ends).toBe(2);
  });

  it('si init échoue (bloqueur), passe en mode dégradé', async () => {
    vi.stubGlobal('window', {
      PokiSDK: {
        init: async () => {
          throw new Error('blocked');
        },
        gameLoadingFinished: () => {},
        gameplayStart: () => {},
        gameplayStop: () => {},
        commercialBreak: async () => {
          throw new Error('should not be called');
        },
        rewardedBreak: async () => false,
      },
    });
    const sdk = new PokiAdapter(hooks());
    await sdk.init();
    await sdk.commercialBreak();
    expect(await sdk.rewardedBreak()).toBe(true);
  });
});

describe('CrazyGamesAdapter', () => {
  function stubCrazy(requestAd: (type: string, cb: Record<string, (e?: unknown) => void>) => void) {
    const calls: string[] = [];
    vi.stubGlobal('window', {
      CrazyGames: {
        SDK: {
          init: async () => {
            calls.push('init');
          },
          environment: 'crazygames',
          game: {
            gameplayStart: () => calls.push('start'),
            gameplayStop: () => calls.push('stop'),
            loadingStop: () => calls.push('loaded'),
            happytime: () => calls.push('happy'),
          },
          ad: { requestAd },
        },
      },
    });
    return calls;
  }

  it('relaie les événements de jeu', async () => {
    const calls = stubCrazy(() => {});
    const sdk = new CrazyGamesAdapter(hooks());
    await sdk.init();
    sdk.loadingFinished();
    sdk.gameplayStart();
    sdk.gameplayStop();
    sdk.happyTime();
    expect(calls).toEqual(['init', 'loaded', 'start', 'stop', 'happy']);
  });

  it('pub récompensée vue jusqu’au bout : récompense accordée, hooks appelés', async () => {
    stubCrazy((_type, cb) => {
      cb.adStarted?.();
      cb.adFinished?.();
    });
    const h = hooks();
    const sdk = new CrazyGamesAdapter(h);
    await sdk.init();
    expect(await sdk.rewardedBreak()).toBe(true);
    expect(h.starts).toBe(1);
    expect(h.ends).toBe(1);
  });

  it('pub récompensée indisponible avant démarrage : récompense accordée quand même', async () => {
    stubCrazy((_type, cb) => cb.adError?.(new Error('no fill')));
    const sdk = new CrazyGamesAdapter(hooks());
    await sdk.init();
    expect(await sdk.rewardedBreak()).toBe(true);
  });

  it('pub récompensée interrompue après démarrage : pas de récompense', async () => {
    stubCrazy((_type, cb) => {
      cb.adStarted?.();
      cb.adError?.(new Error('skipped'));
    });
    const h = hooks();
    const sdk = new CrazyGamesAdapter(h);
    await sdk.init();
    expect(await sdk.rewardedBreak()).toBe(false);
    expect(h.ends).toBe(1);
  });

  it('environnement disabled : mode dégradé', async () => {
    vi.stubGlobal('window', {
      CrazyGames: {
        SDK: {
          init: async () => {},
          environment: 'disabled',
          game: { gameplayStart: () => {}, gameplayStop: () => {} },
          ad: {
            requestAd: () => {
              throw new Error('should not be called');
            },
          },
        },
      },
    });
    const sdk = new CrazyGamesAdapter(hooks());
    await sdk.init();
    await sdk.commercialBreak();
    expect(await sdk.rewardedBreak()).toBe(true);
  });
});
