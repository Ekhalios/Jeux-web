# Checklist de test — dix minutes par jeu

À faire sur **desktop (Chrome ou Edge)** puis sur **ton téléphone** (Chrome Android ou Safari iPhone), depuis le site GitHub Pages. Coche ce qui passe, note ce qui coince avec une capture si possible.

## Commun aux trois jeux

- [ ] La page charge en moins de 3 secondes, aucun écran blanc, aucun texte illisible.
- [ ] Sur téléphone, le jeu occupe l'écran en portrait sans barre de défilement ; rotation en paysage : le jeu reste centré et jouable.
- [ ] L'écran titre affiche le nom, « Tap to play », le meilleur score et « Webetnes ».
- [ ] Le bouton son (haut droite) coupe et rétablit les sons ; le réglage survit à un rechargement de page.
- [ ] Le meilleur score est conservé après rechargement.
- [ ] Au game over : score, meilleur score, bouton « Play again » ; en cliquant, une courte pause (pub simulée, 0,6 s) puis une nouvelle partie démarre.
- [ ] Le bouton récompensé (une fois par partie) déclenche la pause simulée puis accorde bien la récompense.
- [ ] Pas de saccades visibles après 3 minutes de jeu.
- [ ] Le jeu est **amusant** au bout de deux parties : envie d'en refaire une ? Note de 1 à 5 et une phrase.

## Blocky Fit

- [ ] Glisser une pièce : le fantôme est vert si ça rentre, rouge sinon ; la pièce revient au plateau si on lâche hors grille.
- [ ] Une ligne ou colonne complète disparaît avec un effet ; deux à la fois affichent « COMBO ».
- [ ] Le plateau se remplit après la troisième pièce posée.
- [ ] Le game over arrive quand plus aucune pièce ne rentre ; « Rescue block » donne un 1×1 et la partie continue.

## Merge Drop

- [ ] La boule suit le doigt ou la souris, se lâche au relâchement, la suivante arrive après une courte pause.
- [ ] Deux boules identiques fusionnent avec un pop ; le score monte.
- [ ] La ligne de danger clignote quand le bac est presque plein ; le game over arrive après deux secondes au-dessus.
- [ ] « Clear small balls » supprime les petites boules.

## Tap Tower

- [ ] Tap ou espace pose le bloc ; le débord est coupé et tombe.
- [ ] Un placement quasi parfait affiche « PERFECT » et, après trois d'affilée, le bloc regagne de la largeur.
- [ ] La caméra suit la tour sans à-coups.
- [ ] « Continue » reprend la partie avec le score conservé.

## Ce que je fais ensuite avec tes retours

Je corrige, je republie sur GitHub Pages, puis je prépare les zips et les fiches de soumission dans `kit/` pour que tu les envoies aux portails.
