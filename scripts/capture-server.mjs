/**
 * Mini serveur local pour récupérer des captures d'écran depuis la page d'un jeu :
 *   POST http://localhost:8799/save  { "name": "blocky-fit/01-title.png", "dataUrl": "data:image/png;base64,..." }
 * écrit kit/screenshots/<name>. Outil de développement uniquement, ne fait pas partie des builds.
 */
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, 'kit', 'screenshots');
const port = Number(process.env.PORT ?? 8799);

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();
  if (req.method !== 'POST' || req.url !== '/save') return res.writeHead(404).end();
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    try {
      const { name, dataUrl } = JSON.parse(body);
      const safe = normalize(name).replace(/^(\.\.[/\\])+/, '');
      const target = join(outRoot, safe);
      if (!target.startsWith(outRoot)) throw new Error('chemin refusé');
      const base64 = String(dataUrl).split(',')[1] ?? '';
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, Buffer.from(base64, 'base64'));
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ saved: target }));
      console.log('saved', target);
    } catch (e) {
      res.writeHead(400).end(String(e));
    }
  });
}).listen(port, () => console.log(`capture server on http://localhost:${port}`));
