/** Portail cible, fixé à la compilation par VITE_PORTAL. */
export type Portal = 'poki' | 'crazygames' | 'none';

/**
 * Abstraction unique des SDK de portails.
 * Les jeux n'appellent que cette interface ; l'adaptateur concret est choisi par createSDK().
 */
export interface PortalSDK {
  readonly portal: Portal;
  /** Charge et initialise le SDK. Ne rejette jamais : en cas d'échec, l'adaptateur passe en mode dégradé. */
  init(): Promise<void>;
  /** À appeler quand le jeu est prêt à être joué (fin du chargement). */
  loadingFinished(): void;
  /** Début d'une session de jeu (après interaction du joueur). */
  gameplayStart(): void;
  /** Fin d'une session de jeu (game over, pause, menu). */
  gameplayStop(): void;
  /**
   * Pause commerciale. Le son est coupé avant et rétabli après par l'adaptateur.
   * Résout toujours, même si aucune pub n'a été montrée.
   */
  commercialBreak(): Promise<void>;
  /**
   * Publicité récompensée. Résout `true` si la récompense doit être accordée.
   * En mode dégradé (SDK absent), résout `true` : le joueur ne doit jamais être pénalisé.
   */
  rewardedBreak(): Promise<boolean>;
  /** Signal de moment fort (CrazyGames happytime). Sans effet ailleurs. */
  happyTime(): void;
}

/** Hooks fournis par le jeu à l'adaptateur pour couper le son et figer le jeu pendant une pub. */
export interface AdHooks {
  onAdStart(): void;
  onAdEnd(): void;
}

export const noopHooks: AdHooks = {
  onAdStart() {},
  onAdEnd() {},
};
