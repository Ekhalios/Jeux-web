/**
 * Assemble `_site/` pour GitHub Pages : la page d'accueil Webetnes et un dossier par jeu
 * (build 'none', sans SDK de portail). Prérequis : `npm run build`.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GAMES } from './games.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = join(root, '_site');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const game of GAMES) {
  const dist = join(root, 'games', game.id, 'dist');
  if (!existsSync(dist)) {
    console.error(`Build manquant pour ${game.id} : lance "npm run build" d'abord.`);
    process.exit(1);
  }
  cpSync(dist, join(out, game.id), { recursive: true });
}

const template = readFileSync(join(root, 'site', 'index.html'), 'utf8');
const cards = GAMES.map(
  (g) => `
      <a class="card" href="./${g.id}/" style="--bg:${g.background};--accent:${g.accent}">
        <span class="genre">${g.genre}</span>
        <h2>${g.title}</h2>
        <p>${g.tagline}</p>
        <span class="play">Play</span>
      </a>`,
).join('');
writeFileSync(join(out, 'index.html'), template.replace('<!--GAMES-->', cards));
writeFileSync(join(out, '.nojekyll'), '');
console.log(`Site assemblé dans ${out} (${GAMES.length} jeux).`);
