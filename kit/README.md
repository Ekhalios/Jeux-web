# Kit de soumission Webetnes

Tout ce qu'il faut pour envoyer les trois jeux à CrazyGames et Poki. Compte 15 minutes par jeu et par portail.

## Contenu

| Dossier | Contenu |
|---|---|
| `dist/` | Six zips : `<jeu>-crazygames.zip` et `<jeu>-poki.zip`, SDK du bon portail inclus, `index.html` à la racine. Régénérer avec `npm run pack`. **CrazyGames refuse les archives** : glisser à la place le contenu du dossier `games/<jeu>/dist-crazygames/` (`index.html` + `assets/`), créé par la même commande. |
| `icons/` | Icône 512×512 (`<jeu>-512.png`) et covers aux trois formats exigés par CrazyGames : `<jeu>-cover-1920x1080.png`, `<jeu>-cover-800x1200.png`, `<jeu>-cover-800x800.png`. Régénérer avec `npm run icons`. |
| `videos/` | Vidéos de présentation : `<jeu>-portrait-1080x1920.mp4` et `<jeu>-landscape-1920x1080.mp4` (15 à 30 s, sans son). Enregistrements bruts dans `videos/raw/`. `node scripts/make-videos.mjs` les découpe et les met au format si besoin. |
| `screenshots/<jeu>/` | Trois captures portrait 720×1280 (titre, partie, moment fort). `wide/` : les mêmes composées en 1920×1080 pour les formulaires qui exigent du 16:9. |
| `submissions/<jeu>.md` | Textes prêts à copier : titre, descriptions courte et longue, genre, tags, contrôles, notes de monétisation. |
| `checklist-test.md` | La checklist de test manuelle, remplie le 17 septembre 2026. |

## CrazyGames, dans l'ordre

1. Se connecter sur [developer.crazygames.com](https://developer.crazygames.com/) → « Submit a game ».
2. Renseigner le formulaire avec `submissions/<jeu>.md` : titre, description courte, description, genre, tags, entrées (Mouse, Touch ; plus Keyboard pour Tap Tower et Merge Drop), singleplayer.
3. Upload files : glisser `index.html` et le dossier `assets` depuis `games/<jeu>/dist-crazygames/` (pas le zip). Progress save : « Yes, using LocalStorage ». Mobile : coché, orientation Portrait. Muting audio through SDK : décoché pour l'instant.
4. Covers : les trois fichiers `icons/<jeu>-cover-*.png`. Vidéos : `videos/<jeu>-landscape-1920x1080.mp4` et `videos/<jeu>-portrait-1080x1920.mp4`. Captures : `screenshots/<jeu>/wide/`.
5. Basic Launch requirements : Yes partout, N/A pour la mention de conditions générales (aucune donnée personnelle collectée).
6. Envoyer. Délai de revue annoncé : quelques jours. Ils répondent par email, souvent avec des demandes de correction : me transmettre le message tel quel.

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
