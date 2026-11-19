import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ALL, TOTAL, setTheme } from './helpers';

const THEMES = ['dark', 'white'];

test.describe('páginas', () => {
  test('novidades lista o lote inicial', async ({ page }) => {
    await page.goto('/novidades');
    await expect(page.locator('h1')).toHaveText('Novidades');
    await expect(page.locator('.log h2').first()).toContainText(`Lote inicial: ${TOTAL} itens`);
    await expect(page.locator('.log time').first()).toHaveAttribute('datetime', '2026-11-19');
  });

  test('sobre diz que não há afiliado', async ({ page }) => {
    await page.goto('/sobre');
    await expect(page.locator('main')).toContainText('Nenhum link é afiliado');
  });

  test('rss é um XML válido com o lote inicial', async ({ request }) => {
    const res = await request.get('/rss.xml');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('xml');
    const body = await res.text();
    expect(body).toContain('<title>KaniBox: novidades</title>');
    expect(body).toContain(`Lote inicial: ${TOTAL} itens`);
  });

  test('404 existe', async ({ page }) => {
    const res = await page.goto('/nao-existe');
    expect(res?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('não existe');
  });

  test('sem rolagem horizontal em nenhuma página', async ({ page }) => {
    for (const p of ['/', '/novidades', '/sobre']) {
      await page.goto(p);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(over, p).toBeLessThanOrEqual(0);
    }
  });

  test('todo link externo abre em outra aba com rel seguro', async ({ page }) => {
    await page.goto('/');
    const bad = await page.locator('#sections a[href^="http"]').evaluateAll((as) =>
      as.filter((a) => (a as HTMLAnchorElement).target !== '_blank' || !/noopener/.test((a as HTMLAnchorElement).rel)).map((a) => (a as HTMLAnchorElement).href)
    );
    expect(bad).toEqual([]);
  });

  test('imagens carregam (nenhuma quebrada) depois de rolar a página inteira', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await page.waitForTimeout(600);
    const broken = await page.locator('img').evaluateAll((imgs) =>
      (imgs as HTMLImageElement[]).filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src'))
    );
    expect(broken).toEqual([]);
  });

  test('funciona sem JavaScript: todo o catálogo está no HTML e os filtros ficam escondidos', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('#sections [data-id]')).toHaveCount(ALL.length);
    await expect(page.locator('.filters')).toBeHidden();
    await expect(page.locator('.blade').first()).toBeVisible();
    await ctx.close();
  });
});

test.describe('acessibilidade (axe, WCAG 2 A e AA)', () => {
  for (const theme of THEMES) {
    test(`início no tema ${theme}`, async ({ page }) => {
      await setTheme(page, theme);
      await page.goto('/');
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(
        r.violations.map((v) => `${v.id}: ${v.nodes.length}x ${v.nodes[0]?.target?.join(' ')} | ${v.nodes[0]?.failureSummary?.split('\n')[1] ?? ''}`)
      ).toEqual([]);
    });
  }

  test('novidades e sobre', async ({ page }) => {
    for (const p of ['/novidades', '/sobre']) {
      await page.goto(p);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(r.violations.map((v) => `${p} ${v.id}: ${v.nodes[0]?.target?.join(' ')} | ${v.nodes[0]?.failureSummary?.split('\n')[1] ?? ''}`)).toEqual([]);
    }
  });

  test('as ferramentas, uma aba por vez e no modo foco', async ({ page }) => {
    await page.goto('/');
    await page.locator('#s12').scrollIntoViewIfNeeded();
    await page.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
    for (const t of ['tempo', 'texto', 'calculo', 'sorteio']) {
      await page.locator(`#tt-${t}`).click();
      const r = await new AxeBuilder({ page }).include('#s12').withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(r.violations.map((v) => `${t} ${v.id}: ${v.nodes[0]?.target?.join(' ')} | ${v.nodes[0]?.failureSummary?.split('\n')[1] ?? ''}`)).toEqual([]);
    }
    await page.locator('#tt-tempo').click();
    await page.locator('#t-timer .expand').click();
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(r.violations.map((v) => `foco ${v.id}: ${v.nodes[0]?.target?.join(' ')}`)).toEqual([]);
  });

  test('com abas ligadas e filtros abertos', async ({ page }) => {
    await page.goto('/');
    await page.locator('#viewBtn').click();
    await page.locator('.fchip[data-f="tipo"]').click();
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes[0]?.target?.join(' ')}`)).toEqual([]);
  });

  test('com filtros abertos e mods expandidos', async ({ page }) => {
    await page.goto('/');
    await page.locator('.ldbar [data-ld="neoforge"]').click();
    await page.locator('.fchip[data-f="tipo"]').click();
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes[0]?.target?.join(' ')}`)).toEqual([]);
  });
});
