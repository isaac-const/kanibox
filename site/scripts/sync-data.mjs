// Copia dados e imagens verificados (gerados por ../scripts/build_catalog.py) para dentro do site.
// Uso: node scripts/sync-data.mjs
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '..');
const root = resolve(site, '..');
const assets = resolve(root, 'demo/assets');

writeFileSync(
  resolve(site, 'src/data/catalogo.json'),
  readFileSync(resolve(root, 'dados/catalogo.json'))
);
for (const d of ['icons', 'mc', 'games']) {
  mkdirSync(resolve(site, 'public', d), { recursive: true });
  cpSync(resolve(assets, d), resolve(site, 'public', d), { recursive: true });
}
// As fontes já estão convertidas e reduzidas em public/fonts (WOFF2), então não são copiadas.
console.log('dados e imagens sincronizados');
