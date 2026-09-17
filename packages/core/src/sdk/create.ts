import { CrazyGamesAdapter } from './crazygames';
import { NullAdapter } from './null';
import { PokiAdapter } from './poki';
import { noopHooks, type AdHooks, type Portal, type PortalSDK } from './types';

/** Lit VITE_PORTAL à la compilation ; toute valeur inconnue vaut 'none'. */
export function portalFromEnv(value: string | undefined): Portal {
  if (value === 'poki' || value === 'crazygames') return value;
  return 'none';
}

/** Fabrique l'adaptateur du portail demandé. Les hooks coupent le son et figent le jeu pendant une pub. */
export function createSDK(portal: Portal, hooks: AdHooks = noopHooks): PortalSDK {
  switch (portal) {
    case 'poki':
      return new PokiAdapter(hooks);
    case 'crazygames':
      return new CrazyGamesAdapter(hooks);
    default:
      return new NullAdapter(hooks);
  }
}
