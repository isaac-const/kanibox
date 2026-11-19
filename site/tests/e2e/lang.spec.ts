import { expect, test } from '@playwright/test';
import { TOTAL, inSec, search, pickFilter, visibleItems } from './helpers';

test.describe('inglês', () => {
  test('o início em inglês tem hero, recomendados e categorias traduzidos', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#hero .lead')).toHaveText('Tools, apps and games I use and recommend.');
    await expect(page.locator('#hero .meta-line')).toContainText(`${TOTAL} items`);
    await expect(page.locator('#hero .meta-line')).toContainText('Nov 19, 2026');
    await expect(page.locator('#rec-t')).toHaveText('Top picks');
    const cats = await page.locator('#cats .ct b').allTextContents();
    expect(cats).toEqual(['My apps', 'Tools', 'Browse', 'AI', 'Create', 'Files', 'Productivity', 'System', 'Games', 'Minecraft', 'Learn']);
    await expect(page.locator('#q')).toHaveAttribute('placeholder', 'Search by name, type or site');
    await expect(page.locator('.fchip[data-f="plat"]')).toContainText('Platform');
  });

  test('os endereços em inglês existem e o h1 está em inglês', async ({ page }) => {
    for (const [path, h1] of [['/en/ai/', 'AI'], ['/en/browse/', 'Browse'], ['/en/games/', 'Games'], ['/en/tools/', 'Tools'], ['/en/my-apps/', 'My apps'], ['/en/news/', 'News'], ['/en/about/', 'About']]) {
      const r = await page.goto(path);
      expect(r?.status(), path).toBe(200);
      await expect(page.locator('h1'), path).toHaveText(h1);
    }
  });

  test('o seletor de idioma leva à mesma página no outro idioma', async ({ page }) => {
    await page.goto('/ia/');
    await expect(page.locator('.lang a[aria-current="true"]')).toHaveText('PT');
    await page.locator('.lang a', { hasText: 'EN' }).click();
    await expect(page).toHaveURL(/\/en\/ai\/$/);
    await expect(page.locator('.lang a[aria-current="true"]')).toHaveText('EN');
    await page.locator('.lang a', { hasText: 'PT' }).click();
    await expect(page).toHaveURL(/\/ia\/$/);
    await page.goto('/sobre/');
    await page.locator('.lang a', { hasText: 'EN' }).click();
    await expect(page).toHaveURL(/\/en\/about\/$/);
  });

  test('o marcador do idioma acompanha a escolha', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForTimeout(300);
    const geo = await page.evaluate(() => {
      const seg = document.querySelector('.lang')!;
      const pill = seg.querySelector<HTMLElement>('.seg-pill')!;
      const sel = seg.querySelector<HTMLElement>('[aria-current="true"]')!;
      return { px: pill.style.getPropertyValue('--x'), sx: sel.offsetLeft + 'px', txt: sel.textContent };
    });
    expect(geo.txt).toBe('EN');
    expect(geo.px).toBe(geo.sx);
  });

  test('declara os dois idiomas para buscadores', async ({ page }) => {
    await page.goto('/ia/');
    const hl = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) => els.map((e) => `${e.getAttribute('hreflang')}=${new URL((e as HTMLLinkElement).href).pathname}`));
    expect(hl).toEqual(['pt-BR=/ia/', 'en=/en/ai/']);
  });

  test('descrições, tipos e licenças aparecem em inglês', async ({ page }) => {
    await page.goto('/en/browse/');
    const row = page.locator('[data-id="1-zen-browser"]');
    await expect(row.locator('.note')).toHaveText('Firefox-based browser with vertical tabs and workspaces.');
    await expect(row.locator('.sub')).toContainText('Browser');
    await expect(row.locator('.lic')).toHaveText('Open source');
    await expect(page.locator('[data-g="1|VPNs"] h3')).toContainText('VPNs');
    await expect(page.locator('[data-g="1|Segurança"] h3')).toContainText('Security');
    expect(await page.locator('main .note').allTextContents()).not.toContain('Navegador baseado no Firefox, com abas verticais e espaços de trabalho.');
  });

  test('a busca em inglês acha pelo texto em inglês e os filtros têm rótulos em inglês', async ({ page }) => {
    await page.goto('/en/');
    await search(page, 'password manager');
    await expect(visibleItems(page)).toHaveCount(2);
    await page.locator('#qClear').click();
    await page.locator('.fchip[data-f="lic"]').click();
    const labels = await page.locator('#panel .opt').allTextContents();
    expect(labels.map((l) => l.replace(/\s*\d+$/, ''))).toEqual(['Open source', 'Free', 'Freemium', 'Paid']);
    await page.keyboard.press('Escape');
    await pickFilter(page, 'lic', 'Pago');
    await expect(page.locator('.fchip[data-f="lic"]')).toHaveClass(/on/);
    await expect(page.locator('#sum')).toContainText('of ');
  });

  test('Minecraft e Jogos em inglês têm abas com nomes em inglês', async ({ page }) => {
    await page.goto('/en/minecraft/');
    const tabs = (await page.locator('[data-sub]').allTextContents()).map((t) => t.replace(/\s+\d+$/, ''));
    expect(tabs).toEqual(['Launchers', 'Mods', 'Resource packs', 'Shaders', 'Servers']);
    await expect(page.locator('#ldsum')).toHaveText('Pick a loader to see which mods run on it.');
    await page.locator('.ldbar [data-ld="neoforge"]').click();
    await expect(page.locator('#ldsum')).toContainText('40 of 42');
    await page.goto('/en/games/');
    const g = (await page.locator('[data-sub]').allTextContents()).map((t) => t.replace(/\s+\d+$/, ''));
    expect(g).toEqual(['Favorites', 'Emulators', 'Gaming on Linux', 'In the browser', 'Curiosities']);
  });

  test('o menu, o rodapé e o canivete ficam em inglês e apontam para /en/', async ({ page }) => {
    await page.goto('/en/ai/');
    await page.locator('#menuBtn').click();
    const links = await page.locator('#menu .mi').evaluateAll((els) => els.map((e) => new URL((e as HTMLAnchorElement).href).pathname));
    expect(links[0]).toBe('/en/');
    expect(links.every((l) => l.startsWith('/en/'))).toBe(true);
    await expect(page.locator('#menu h2')).toHaveText('Categories');
    await expect(page.locator('footer.site')).toContainText('Made by isaac-const');
    const blades = await page.locator('.blade').evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute('aria-label')));
    expect(blades).toContain('Create');
  });

  test('página sem resultado oferece buscar em todas as categorias em inglês', async ({ page }) => {
    await page.goto('/en/create/');
    await search(page, 'zzzz');
    await expect(page.locator('#empty')).toHaveClass(/on/);
    await expect(page.locator('#empty-global')).toHaveText('Search all categories');
    await expect(page.locator('#empty-global')).toHaveAttribute('href', /\/en\/\?q=zzzz$/);
  });

  test('rss existe nos dois idiomas', async ({ request }) => {
    const pt = await (await request.get('/rss.xml')).text();
    const en = await (await request.get('/en/rss.xml')).text();
    expect(pt).toContain('KaniBox: novidades');
    expect(pt).toContain(`${TOTAL} itens`);
    expect(en).toContain('KaniBox: news');
    expect(en).toContain(`${TOTAL} items`);
  });

  test('páginas de texto em inglês', async ({ page }) => {
    await page.goto('/en/about/');
    await expect(page.locator('main')).toContainText('No link is an affiliate link');
    await page.goto('/en/news/');
    await expect(page.locator('.log h2').first()).toContainText(`First batch: ${TOTAL}`);
  });

  test('a categoria em inglês tem os mesmos itens que em português', async ({ page }) => {
    await page.goto('/en/ai/');
    await expect(page.locator('main [data-id]')).toHaveCount(inSec(2).length);
  });
});
