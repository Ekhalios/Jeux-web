/**
 * Produit un zip par jeu et par portail dans `kit/dist/` :
 *   kit/dist/<jeu>-poki.zip et kit/dist/<jeu>-crazygames.zip
 * Chaque zip contient index.html à sa racine avec le SDK du portail injecté.
 * Usage : `npm run pack` (tous) ou `node scripts/pack-portals.mjs blocky-fit poki`.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GAMES } from './games.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const [onlyGame, onlyPortal] = process.argv.slice(2);
const portals = onlyPortal ? [onlyPortal] : ['poki', 'crazygames'];
const games = GAMES.filter((g) => !onlyGame || g.id === onlyGame);
const outDir = join(root, 'kit', 'dist');
mkdirSync(outDir, { recursive: true });

function folderSize(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    total += entry.isDirectory() ? folderSize(p) : statSync(p).size;
  }
  return total;
}

for (const game of games) {
  for (const portal of portals) {
    const dist = join(root, 'games', game.id, `dist-${portal}`);
    rmSync(dist, { recursive: true, force: true });
    execSync(`npm run build:${portal} -w games/${game.id}`, { cwd: root, stdio: 'inherit' });
    const zip = join(outDir, `${game.id}-${portal}.zip`);
    rmSync(zip, { force: true });
    // bsdtar (Windows 10+, macOS) choisit le format zip d'après l'extension.
    execSync(`tar -a -c -f "${zip}" -C "${dist}" .`, { stdio: 'inherit' });
    const mb = (folderSize(dist) / 1024 / 1024).toFixed(2);
    console.log(`${game.id} / ${portal} : ${mb} Mo décompressés → ${zip}`);
    if (!existsSync(zip)) process.exit(1);
  }
}
