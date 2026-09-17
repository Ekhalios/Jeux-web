# Webetnes — jeux web

Trois jeux HTML5 casual pour Poki et CrazyGames. Auteur : Ekhalios. Design : `docs/superpowers/specs/`.

## Commandes

```bash
npm install            # une fois
npm test               # tests unitaires (socle + logique des jeux)
npm run typecheck --workspaces --if-present
npm run dev            # Blocky Fit en développement ; ou : npm run dev -w games/merge-drop
npm run build          # build 'none' de chaque jeu dans games/<id>/dist
npm run site           # assemble _site/ pour GitHub Pages
npm run icons          # icônes 512×512 et couvertures dans kit/icons
npm run pack           # zips par portail dans kit/dist (build --mode poki / crazygames)
```

## Structure

- `packages/core` : SDK portails (Poki, CrazyGames, mode simulé), audio synthétisé, stockage protégé, UI Phaser, `bootstrap()`.
- `games/<id>` : un jeu Phaser 3 + Vite. `src/logic` est pur et testé ; `src/scenes` contient les scènes.
- `site/` : page d'accueil. `scripts/` : assemblage, empaquetage, icônes. `kit/` : fiches de soumission, checklist de test, icônes, zips.
- `.github/workflows/deploy.yml` : tests, build et publication GitHub Pages à chaque push sur `main`. Activer Pages une fois : Settings → Pages → Source « GitHub Actions ».

## Portails

Le portail est choisi par le mode Vite : `vite build --mode poki` ou `--mode crazygames`. Le plugin `packages/core/vite-portal-plugin.mjs` injecte le script du SDK et définit `import.meta.env.VITE_PORTAL`. Le build par défaut n'embarque aucun SDK et simule les pubs.
