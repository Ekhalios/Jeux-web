/**
 * Compose des captures 16:9 (1920×1080) pour les formulaires des portails à partir des captures
 * portrait 720×1280 de kit/screenshots/<jeu>/*.png : capture centrée, fond de la couleur du jeu,
 * ombre douce. Écrit kit/screenshots/<jeu>/wide/<nom>-1920x1080.png. Usage : `node scripts/compose-screenshots.mjs`.
 */
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { GAMES } from './games.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const W = 1920;
const H = 1080;
const SHOT_H = 1000;
const SHOT_W = 562;
const LEFT = Math.round((W - SHOT_W) / 2);
const TOP = Math.round((H - SHOT_H) / 2);

for (const game of GAMES) {
  const dir = join(root, 'kit', 'screenshots', game.id);
  if (!existsSync(dir)) continue;
  const outDir = join(dir, 'wide');
  mkdirSync(outDir, { recursive: true });
  const shots = readdirSync(dir).filter((f) => f.endsWith('.png'));
  for (const file of shots) {
    const shot = await sharp(join(dir, file)).resize(SHOT_W, SHOT_H).png().toBuffer();
    const shadow = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <defs>
          <radialGradient id="g" cx="0.5" cy="0.5" r="0.75"><stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/><stop offset="1" stop-color="#000000" stop-opacity="0.35"/></radialGradient>
          <filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="28"/></filter>
        </defs>
        <rect width="${W}" height="${H}" fill="${game.background}"/>
        <rect width="${W}" height="${H}" fill="url(#g)"/>
        <rect x="${LEFT}" y="${TOP + 24}" width="${SHOT_W}" height="${SHOT_H}" rx="28" fill="#000000" opacity="0.55" filter="url(#b)"/>
      </svg>`,
    );
    const rounded = await sharp(shot)
      .composite([
        {
          input: Buffer.from(`<svg width="${SHOT_W}" height="${SHOT_H}"><rect width="${SHOT_W}" height="${SHOT_H}" rx="28" fill="#fff"/></svg>`),
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer();
    const out = join(outDir, file.replace(/\.png$/, '-1920x1080.png'));
    await sharp(shadow)
      .composite([{ input: rounded, left: LEFT, top: TOP }])
      .png()
      .toFile(out);
    console.log(out);
  }
}
