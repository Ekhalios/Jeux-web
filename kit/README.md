# Kit de soumission Webetnes

Tout ce qu'il faut pour envoyer les trois jeux à CrazyGames et Poki. Compte 15 minutes par jeu et par portail.

## Contenu

| Dossier | Contenu |
|---|---|
| `dist/` | Six zips prêts à envoyer : `<jeu>-crazygames.zip` et `<jeu>-poki.zip`. Chaque zip contient le SDK du bon portail, `index.html` à la racine. Régénérer avec `npm run pack`. |
| `icons/` | Icône 512×512 (`<jeu>-512.png`) et couverture 1920×1080 (`<jeu>-cover-1920x1080.png`) par jeu. Régénérer avec `npm run icons`. |
| `screenshots/<jeu>/` | Trois captures portrait 720×1280 (titre, partie, moment fort). `wide/` : les mêmes composées en 1920×1080 pour les formulaires qui exigent du 16:9. |
| `submissions/<jeu>.md` | Textes prêts à copier : titre, descriptions courte et longue, genre, tags, contrôles, notes de monétisation. |
| `checklist-test.md` | La checklist de test manuelle, remplie le 17 septembre 2026. |

## CrazyGames, dans l'ordre

1. Se connecter sur [developer.crazygames.com](https://developer.crazygames.com/) → « Submit a game ».
2. Renseigner le formulaire avec `submissions/<jeu>.md` : titre, description courte, description, genre, tags, entrées (Mouse, Touch ; plus Keyboard pour Tap Tower et Merge Drop), singleplayer.
3. Téléverser `dist/<jeu>-crazygames.zip` en « HTML5 game », `icons/<jeu>-512.png` en cover, et au moins trois captures depuis `screenshots/<jeu>/wide/`.
4. Cocher que le jeu utilise le CrazyGames SDK (pubs midgame et rewarded, événements gameplayStart/Stop).
5. Envoyer. Délai de revue annoncé : quelques jours. Ils répondent par email, souvent avec des demandes de correction : me transmettre le message tel quel.

## Poki, dans l'ordre

1. Aller sur [developers.poki.com](https://developers.poki.com/) → « Submit your game » (formulaire, pas de compte préalable).
2. Décrire le jeu avec `submissions/<jeu>.md`, fournir un lien jouable : `https://ekhalios.github.io/Jeux-web/<jeu>/`, et les captures.
3. Poki demande un court trailer : une capture d'écran vidéo de 20 secondes de gameplay au téléphone suffit à ce stade (enregistrement d'écran natif Android ou iPhone). Si tu préfères, je peux en générer un plus tard.
4. Poki sélectionne à la main. En cas d'acceptation, ils envoient un accès à leur plateforme et exigent le passage du « Web Fit test » : le build `dist/<jeu>-poki.zip` intègre déjà leur SDK, je m'occupe des ajustements demandés.

## Ordre conseillé

Commencer par **CrazyGames avec Merge Drop et Blocky Fit** (formulaire complet, revue rapide, revenus dès l'acceptation), puis Tap Tower. Soumettre les trois à Poki dans la même semaine : leur délai est plus long et la sélection plus stricte.

## Après acceptation

- CrazyGames verse chaque mois à partir de 100 € de solde : le statut de micro-entrepreneur doit exister avant le premier virement.
- Me signaler l'acceptation : je surveille les statistiques du portail et je propose les itérations (le portail montre les retours des joueurs et la rétention).
