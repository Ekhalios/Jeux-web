/**
 * Génère les visuels de chaque jeu dans `kit/icons/` à partir d'emblèmes SVG dessinés ici (aucun asset externe) :
 *   <jeu>-512.png                 icône carrée 512×512
 *   <jeu>-cover-1920x1080.png     cover paysage 16:9 (CrazyGames, Poki)
 *   <jeu>-cover-800x1200.png      cover portrait 2:3 (CrazyGames)
 *   <jeu>-cover-800x800.png       cover carrée 1:1 (CrazyGames)
 * Usage : `npm run icons`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { GAMES } from './games.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = join(root, 'kit', 'icons');
mkdirSync(out, { recursive: true });

/** Emblème de chaque jeu, dessiné dans un carré 512×512 (sans texte : rendu identique partout). */
const EMBLEMS = {
  'blocky-fit': (bg) => `
    <rect width="512" height="512" rx="96" fill="${bg}"/>
    <g opacity="0.12" stroke="#ffffff" stroke-width="4">
      ${[0, 1, 2, 3, 4].map((i) => `<line x1="${96 + i * 80}" y1="96" x2="${96 + i * 80}" y2="416"/>`).join('')}
      ${[0, 1, 2, 3, 4].map((i) => `<line x1="96" y1="${96 + i * 80}" x2="416" y2="${96 + i * 80}"/>`).join('')}
    </g>
    <rect x="104" y="264" width="72" height="72" rx="14" fill="#ff5d73"/>
    <rect x="184" y="264" width="72" height="72" rx="14" fill="#ff5d73"/>
    <rect x="184" y="184" width="72" height="72" rx="14" fill="#ff5d73"/>
    <rect x="264" y="344" width="72" height="72" rx="14" fill="#3ddc97"/>
    <rect x="344" y="344" width="72" height="72" rx="14" fill="#3ddc97"/>
    <rect x="264" y="104" width="152" height="152" rx="18" fill="#ffb703"/>
    <rect x="104" y="104" width="72" height="72" rx="14" fill="#4cc9f0"/>`,
  'merge-drop': (bg) => `
    <rect width="512" height="512" rx="96" fill="${bg}"/>
    <rect x="72" y="120" width="368" height="320" rx="40" fill="#ffffff" opacity="0.06"/>
    <circle cx="176" cy="360" r="60" fill="#ff7ab6"/>
    <circle cx="330" cy="332" r="88" fill="#b388ff"/>
    <circle cx="212" cy="196" r="44" fill="#ffd166"/>
    <g fill="#241b2f">
      <circle cx="300" cy="316" r="9"/><circle cx="356" cy="316" r="9"/>
      <path d="M302 352 q26 22 52 0" stroke="#241b2f" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="160" cy="352" r="6"/><circle cx="192" cy="352" r="6"/>
      <path d="M162 374 q14 12 28 0" stroke="#241b2f" stroke-width="6" fill="none" stroke-linecap="round"/>
    </g>
    <circle cx="352" cy="300" r="14" fill="#ffffff" opacity="0.5"/>`,
  'tap-tower': (bg) => `
    <rect width="512" height="512" rx="96" fill="${bg}"/>
    <rect x="96" y="384" width="320" height="56" rx="10" fill="#4cc9f0"/>
    <rect x="112" y="326" width="288" height="56" rx="10" fill="#56c4ea"/>
    <rect x="140" y="268" width="232" height="56" rx="10" fill="#6ab8e6"/>
    <rect x="150" y="210" width="212" height="56" rx="10" fill="#7fabe0"/>
    <rect x="170" y="152" width="172" height="56" rx="10" fill="#96a0dc"/>
    <rect x="228" y="82" width="172" height="56" rx="10" fill="#ff8f3f"/>
    <path d="M414 60 l-18 24 M436 74 l-26 14" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity="0.9"/>`,
};

/** Cover : fond de la couleur du jeu, halo radial, motif discret, emblème centré à ~62 % du petit côté. */
function coverSvg(game, emblem, w, h) {
  const size = Math.round(Math.min(w, h) * 0.62);
  const scale = size / 512;
  const x = Math.round((w - size) / 2);
  const y = Math.round((h - size) / 2);
  const dots = [];
  for (let i = 0; i < 40; i++) {
    const dx = ((i * 197) % w) + 20;
    const dy = ((i * 331) % h) + 10;
    const r = 6 + ((i * 7) % 18);
    dots.push(`<circle cx="${dx}" cy="${dy}" r="${r}" fill="${game.accent}" opacity="${0.04 + ((i % 4) * 0.02).toFixed(2)}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <radialGradient id="g" cx="0.5" cy="0.45" r="0.75"><stop offset="0" stop-color="#ffffff" stop-opacity="0.14"/><stop offset="1" stop-color="#000000" stop-opacity="0.30"/></radialGradient>
      <filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${Math.round(size * 0.05)}"/></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="${game.background}"/>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    ${dots.join('')}
    <rect x="${x}" y="${y + Math.round(size * 0.06)}" width="${size}" height="${size}" rx="${Math.round(96 * scale)}" fill="#000000" opacity="0.45" filter="url(#s)"/>
    <g transform="translate(${x} ${y}) scale(${scale})">${emblem}</g>
  </svg>`;
}

const COVER_SIZES = [
  [1920, 1080],
  [800, 1200],
  [800, 800],
];

for (const game of GAMES) {
  const emblem = EMBLEMS[game.id](game.background);
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${emblem}</svg>`;
  await sharp(Buffer.from(iconSvg)).png().toFile(join(out, `${game.id}-512.png`));
  writeFileSync(join(out, `${game.id}.svg`), iconSvg);
  for (const [w, h] of COVER_SIZES) {
    const file = join(out, `${game.id}-cover-${w}x${h}.png`);
    await sharp(Buffer.from(coverSvg(game, emblem, w, h))).resize(w, h).png().toFile(file);
  }
  console.log(`${game.id} : icône 512 + covers ${COVER_SIZES.map(([w, h]) => `${w}x${h}`).join(', ')}`);
}
