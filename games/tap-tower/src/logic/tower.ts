/**
 * Position du bloc d'un étage donné. `level` est le nombre de blocs déjà posés (base incluse),
 * indépendant du nombre de blocs encore affichés : les blocs bas sont détruits pour la mémoire,
 * la tour doit continuer à monter.
 */
export function blockTopForLevel(level: number, baseTop: number, blockHeight: number): number {
  return baseTop - level * blockHeight;
}

/** Abscisse de départ du bloc mobile : bord gauche pour un départ vers la droite, bord droit sinon. */
export function movingStartX(direction: 1 | -1, width: number, gameWidth: number, margin: number): number {
  return direction === 1 ? margin : gameWidth - margin - width;
}

/** Sens de départ alterné à chaque étage. */
export function movingDirectionForLevel(level: number): 1 | -1 {
  return level % 2 === 1 ? 1 : -1;
}
