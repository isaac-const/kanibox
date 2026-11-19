// Gera os prints do site de produção (precisa do preview rodando em 127.0.0.1:4321).
// Uso: node scripts/shots.mjs [pasta de saída]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve(process.argv[2] || 'docs/prints');
mkdirSync(out, { recursive: true });
const base = 'http://127.0.0.1:4321';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });

async function page(theme, width, height, mobile = false) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: mobile, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await ctx.addInitScript((t) => localStorage.setItem('kb-theme', t), theme);
  const p = await ctx.newPage();
  await p.goto(base + '/');
  await p.waitForSelector('#kdock.open');
  await p.waitForTimeout(300);
  return p;
}
const top = (p, sel) => p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);
const shotAt = async (p, name, y, h) => {
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: true, clip: { x: 0, y, width: p.viewportSize().width, height: h } });
  console.log('ok', name);
};

// 1. topo, escuro
{
  const p = await page('dark', 1440, 900);
  await p.screenshot({ path: `${out}/01-topo-dark.png` });
  console.log('ok 01');
  await p.context().close();
}
// 2. filtros em uso, painel de tipo aberto, claro
{
  const p = await page('white', 1440, 900);
  await p.locator('.fchip[data-f="plat"]').click();
  await p.locator('#panel .opt[data-v="Linux"]').click();
  await p.keyboard.press('Escape');
  await p.locator('.fchip[data-f="lic"]').click();
  await p.locator('#panel .opt[data-v="Código aberto"]').click();
  await p.keyboard.press('Escape');
  await p.locator('.fchip[data-f="tipo"]').click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/02-filtros-white.png` });
  console.log('ok 02');
  await p.context().close();
}
// 3. Minecraft com loader Fabric, rose black
{
  const p = await page('dark', 1440, 900);
  await p.locator('.ldbar [data-ld="fabric"]').click();
  await p.waitForTimeout(200);
  const y = await top(p, '#s9');
  await shotAt(p, '03-minecraft-fabric-rose-black', y - 20, 1700);
  await p.context().close();
}
// 4. jogos, claro
{
  const p = await page('white', 1440, 900);
  const y = await top(p, '#s10');
  await shotAt(p, '04-jogos-white', y - 20, 1500);
  await p.context().close();
}
// 5. ferramentas, blue dark (já com o canivete visível)
{
  const p = await page('dark', 1440, 900);
  await p.evaluate(() => document.getElementById('s12').scrollIntoView({ block: 'start' }));
  await p.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/05-ferramentas-blue-dark.png` });
  console.log('ok 05');
  await p.context().close();
}
// 6. canivete dobrado
{
  const p = await page('white', 1440, 900);
  await p.locator('#kh').click();
  await p.waitForTimeout(900);
  await p.evaluate(() => document.getElementById('s7').scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/06-canivete-dobrado-rose-white.png` });
  console.log('ok 06');
  await p.context().close();
}
// 7. celular
{
  const p = await page('dark', 390, 844, true);
  await p.screenshot({ path: `${out}/07a-celular-topo.png` });
  await p.locator('.fchip[data-f="plat"]').click();
  await p.locator('#panel .opt[data-v="Android"]').click();
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  await p.evaluate(() => scrollTo(0, 0));
  await p.screenshot({ path: `${out}/07b-celular-filtro-android.png` });
  await p.context().close();
  const q = await page('white', 390, 844, true);
  await q.evaluate(() => document.getElementById('s10').scrollIntoView({ block: 'start' }));
  await q.waitForTimeout(400);
  await q.screenshot({ path: `${out}/07c-celular-jogos.png` });
  await q.evaluate(() => document.getElementById('s12').scrollIntoView({ block: 'start' }));
  await q.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
  await q.waitForTimeout(500);
  await q.screenshot({ path: `${out}/07d-celular-ferramentas.png` });
  console.log('ok 07');
  await q.context().close();
}
await browser.close();
