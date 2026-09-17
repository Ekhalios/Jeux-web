# Jeux web Webetnes pour portails — design

Date : 17 septembre 2026. Auteur des jeux : Ekhalios. Studio : Webetnes.

## Objectif

Publier trois jeux HTML5 casual sur Poki et CrazyGames pour générer un revenu publicitaire, avec un coût nul et un délai de retour de quelques semaines. Les trois jeux couvrent trois genres différents afin d'apprendre vite lequel retient les joueurs, puis d'itérer dans ce genre.

## Contraintes des portails (sources : docs Poki et CrazyGames, septembre 2026)

- Jouable desktop, mobile et tablette. Plein écran sur mobile, portrait ou paysage.
- Démarrage instantané : pas de login, pas d'achat intégré, tout public (PEGI 12 max).
- Premier chargement : moins de 8 Mo (Poki). Moins de 50 Mo et 1 500 fichiers (CrazyGames).
- Seul le SDK du portail sert des publicités. Aucune autre régie, aucun appel réseau tiers.
- Événements SDK obligatoires : début et fin de gameplay, pause commerciale, pub récompensée.
- Le son est coupé pendant une pub et rétabli après.

## Les trois jeux

### Blocky Fit — puzzle de grille

Grille 8×8. Trois pièces proposées, le joueur en glisse une sur la grille. Lignes et colonnes complètes disparaissent et rapportent des points, combo si plusieurs à la fois. Partie perdue quand aucune des pièces ne rentre. Pub commerciale entre deux parties. Pub récompensée : une pièce de secours 1×1 ou un « annuler » quand le joueur est bloqué.

Logique pure testable : représentation de la grille, test de placement, détection et suppression des lignes, détection de fin de partie, génération des pièces, score.

### Merge Drop — physique et fusion

Un bac vertical. Le joueur choisit la position horizontale et lâche une boule d'un niveau donné. Deux boules de même niveau qui se touchent fusionnent en une boule du niveau supérieur (11 niveaux). Partie perdue quand une boule reste au-dessus de la ligne haute pendant deux secondes. Physique Matter.js intégrée à Phaser. Pub récompensée : retirer toutes les boules des deux plus petits niveaux quand la ligne est menacée.

Logique pure testable : table des niveaux (rayon, score, couleur), règle de fusion, calcul du score, générateur de la prochaine boule (niveaux 1 à 5 uniquement), détection de défaite sur une liste de positions.

### Tap Tower — arcade réflexe

Un bloc glisse horizontalement au-dessus de la tour. Un tap le lâche. La partie qui dépasse le bloc du dessous est coupée. Un placement parfait (écart sous un seuil) rend le bloc à sa taille de départ et déclenche un combo. Partie perdue quand le bloc lâché ne touche plus la tour. La caméra suit la hauteur. Pub récompensée : continuer une fois après une chute.

Logique pure testable : calcul du chevauchement et du découpage, seuil de perfection, vitesse en fonction de la hauteur, score et combo.

## Architecture

Monorepo npm workspaces.

```
JeuxWeb/
  package.json               workspaces, scripts globaux (build, test, deploy local)
  packages/core/             bibliothèque partagée TypeScript
    src/sdk/                 PortalSDK (interface), PokiAdapter, CrazyGamesAdapter, NullAdapter, createSDK()
    src/storage.ts           lecture/écriture localStorage protégée par try/catch
    src/audio.ts             sons synthétisés Web Audio, mute global
    src/theme.ts             palette et polices communes
    src/ui.ts                boutons, overlays, écran de fin, aides Phaser
  games/blocky-fit/          Vite + Phaser, src/logic/ (pur, testé), src/scenes/
  games/merge-drop/
  games/tap-tower/
  site/                      page d'accueil Webetnes listant les jeux (GitHub Pages)
  kit/                       fiches de soumission, icônes 512×512, captures, checklist de test
  scripts/                   assemblage du site, génération des icônes, zips pour portails
  .github/workflows/deploy.yml   build et déploiement GitHub Pages
  docs/superpowers/specs/
```

### Couche SDK

```ts
interface PortalSDK {
  init(): Promise<void>;
  gameplayStart(): void;
  gameplayStop(): void;
  commercialBreak(): Promise<void>;      // coupe le son, affiche la pub, rétablit le son
  rewardedBreak(): Promise<boolean>;     // true si la récompense doit être donnée
  loadingFinished(): void;
}
```

Le portail cible est choisi à la compilation par `VITE_PORTAL` = `poki`, `crazygames` ou `none`. Chaque jeu produit donc trois builds. Le script du SDK du portail est injecté dans `index.html` uniquement pour le build de ce portail. Le build `none` sert GitHub Pages et les tests.

### Rendu et taille

Phaser 3 chargé depuis npm et empaqueté par Vite. Résolution logique portrait 720×1280, mode d'échelle FIT centré, fond de page de la couleur du jeu pour que le letterbox reste propre. Tous les graphismes sont dessinés par code (Graphics, textures générées) et tous les sons sont synthétisés. Aucun asset binaire, donc aucun problème de licence et un build inférieur à 2 Mo.

### Base d'URL

Vite `base: './'` pour que le même build fonctionne à la racine d'un zip de portail et dans un sous-dossier de GitHub Pages.

### Déploiement

Une action GitHub construit les trois jeux en mode `none`, assemble `_site/` avec `site/index.html` et un dossier par jeu, puis publie sur GitHub Pages. Le propriétaire du dépôt doit activer Pages avec la source « GitHub Actions » une fois.

Pour les portails, `npm run pack` produit `kit/dist/<jeu>-<portail>.zip` par jeu et par portail.

## Tests

- Vitest sur `src/logic/` de chaque jeu et sur `packages/core` (adapters en mode simulé).
- Vérification manuelle par le propriétaire avec `kit/checklist-test.md` : dix minutes par jeu, desktop et téléphone, y compris le comportement des boutons de pub en mode simulé.

## Gestion des erreurs

- Si le SDK du portail ne se charge pas, l'adaptateur bascule sur NullAdapter : le jeu reste jouable, les récompenses sont accordées sans pub (exigence Poki).
- localStorage indisponible : meilleur score en mémoire seulement.
- Web Audio bloqué avant interaction : le contexte audio est créé au premier tap.

## Hors périmètre de cette itération

Daily puzzle sur domaine propre, classement en ligne, traductions au-delà de l'anglais (les jeux n'affichent presque pas de texte), analytics tiers (interdits sur les portails).

## Critères de réussite

- Les trois jeux tournent sur GitHub Pages, sur desktop et sur un téléphone Android ou iPhone, à plus de 50 images par seconde.
- Les tests unitaires passent.
- Les fiches de soumission (titre, description courte et longue, genre, captures 16:9, icône 512×512) sont prêtes dans `kit/`.
- Au moins un jeu accepté sur un portail avant le jour 30.
