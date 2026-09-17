/**
 * Produit les vidéos de présentation des portails à partir des enregistrements d'écran bruts
 * (`kit/videos/raw/<jeu>.mp4`, capture PC 1280×628 où le canvas du jeu occupe 354×628 centré) :
 *   kit/videos/<jeu>-portrait-1080x1920.mp4   canvas recadré, plein cadre
 *   kit/videos/<jeu>-landscape-1920x1080.mp4  canvas centré sur un fond flouté tiré du jeu
 * Les fenêtres (début, durée) sont choisies à la main sur les meilleurs moments. Nécessite ffmpeg.
 * Usage : `node scripts/make-videos.mjs`.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

/** Zone du canvas dans l'enregistrement brut (à adapter si la capture change). */
const CROP = 'crop=354:628:463:0';

/** Meilleurs moments : début en secondes et durée. */
const WINDOWS = {
  'blocky-fit': { start: 55, duration: 27.5 },
  'merge-drop': { start: 44, duration: 30 },
  'tap-tower': { start: 1, duration: 22.5 },
};

const ENC = '-c:v libx264 -crf 19 -preset medium -movflags +faststart -an';

for (const [game, w] of Object.entries(WINDOWS)) {
  const input = join(root, 'kit', 'videos', 'raw', `${game}.mp4`);
  if (!existsSync(input)) {
    console.warn(`Enregistrement manquant : ${input}`);
    continue;
  }
  const fadeOut = (w.duration - 0.5).toFixed(1);
  const fades = `fps=30,fade=t=in:st=0:d=0.5,fade=t=out:st=${fadeOut}:d=0.5,format=yuv420p`;
  const portrait = join(root, 'kit', 'videos', `${game}-portrait-1080x1920.mp4`);
  const landscape = join(root, 'kit', 'videos', `${game}-landscape-1920x1080.mp4`);

  execSync(
    `ffmpeg -y -loglevel error -ss ${w.start} -t ${w.duration} -i "${input}" -vf "${CROP},scale=1080:1920:flags=lanczos,unsharp=5:5:0.6:5:5:0,${fades}" ${ENC} "${portrait}"`,
    { stdio: 'inherit' },
  );
  execSync(
    `ffmpeg -y -loglevel error -ss ${w.start} -t ${w.duration} -i "${input}" -filter_complex "[0:v]${CROP},split[a][b];[a]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=40:8,eq=brightness=-0.18:saturation=1.2[bg];[b]scale=-2:1080:flags=lanczos,unsharp=5:5:0.6:5:5:0[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,${fades}" ${ENC} "${landscape}"`,
    { stdio: 'inherit' },
  );
  console.log(`${game} : ${portrait}\n${' '.repeat(game.length + 3)}${landscape}`);
}
