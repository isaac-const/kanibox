import { expect, test } from '@playwright/test';
import { ALL, PUBLIC, pickFilter, search, setTheme, visibleItems } from './helpers';

test.describe('página inicial', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('abre com uma linha de descrição, 13 seções e 13 lâminas, sem hero', async ({ page }) => {
    await expect(page.locator('.sec')).toHaveCount(13);
    await expect(page.locator('.blade')).toHaveCount(13);
    await expect(page.locator('.intro p')).toHaveText('Ferramentas, apps e jogos que eu uso e recomendo.');
    await expect(page.locator('.intro small')).toContainText(`${PUBLIC.length} itens`);
    await expect(page.locator('.hero, .slogan')).toHaveCount(0);
    await expect(page).toHaveTitle(/KaniBox/);
  });

  test('nenhum atalho de teclado: Ctrl K, 6, T e / não fazem nada', async ({ page }) => {
    const theme = await page.locator('html').getAttribute('data-theme');
    const url = page.url();
    await page.locator('body').click({ position: { x: 5, y: 300 } });
    for (const k of ['Control+k', '6', '9', 't', '/']) await page.keyboard.press(k);
    expect(page.url()).toBe(url);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme!);
    await expect(page.locator('#panel')).not.toHaveClass(/on/);
    await expect(page.locator('#q')).not.toBeFocused();
  });

  test('busca por "zen browser" mostra só o Zen Browser', async ({ page }) => {
    await search(page, 'zen browser');
    await expect(visibleItems(page)).toHaveCount(1);
    await expect(visibleItems(page).first()).toContainText('Zen Browser');
  });

  test('busca ignora acento e maiúscula', async ({ page }) => {
    await search(page, 'CODIGO ABERTO ZEN');
    // "código aberto" não está no texto indexado, então não acha: confirma que a busca é por palavra
    await expect(visibleItems(page)).toHaveCount(0);
    await search(page, 'NAVEGADOR zen');
    await expect(visibleItems(page)).toHaveCount(1);
  });

  test('busca por "terminal" mostra os 4 terminais e esconde as outras seções do canivete', async ({ page }) => {
    await search(page, 'terminal');
    await expect(visibleItems(page)).toHaveCount(4);
    await expect(page.locator('.sec:not([hidden])')).toHaveCount(1);
    await expect(page.locator('.blade:not([hidden])')).toHaveCount(1);
  });

  test('busca sem resultado mostra o aviso, e limpar volta tudo', async ({ page }) => {
    await search(page, 'xyzxyz');
    await expect(visibleItems(page)).toHaveCount(0);
    await expect(page.locator('#empty')).toHaveClass(/on/);
    await page.locator('#qClear').click();
    await expect(page.locator('#empty')).not.toHaveClass(/on/);
    await expect(visibleItems(page)).toHaveCount(ALL.length);
  });

  test('filtro de plataforma confere com os dados', async ({ page }) => {
    await pickFilter(page, 'plat', 'Linux');
    await expect(visibleItems(page)).toHaveCount(ALL.filter((i) => i.plat.includes('Linux')).length);
  });

  test('plataforma + licença combinam em E', async ({ page }) => {
    await pickFilter(page, 'plat', 'Linux');
    await pickFilter(page, 'lic', 'Código aberto');
    await expect(visibleItems(page)).toHaveCount(ALL.filter((i) => i.plat.includes('Linux') && i.lic === 'Código aberto').length);
    await expect(page.locator('.fchip.on')).toHaveCount(2);
    await expect(page.locator('#sum')).toContainText(`de ${PUBLIC.length}`);
  });

  test('filtro de tipo: seis emuladores', async ({ page }) => {
    await pickFilter(page, 'tipo', 'Emulador');
    await expect(visibleItems(page)).toHaveCount(6);
  });

  test('combinação impossível mostra o aviso, e "Limpar filtros" restaura', async ({ page }) => {
    await pickFilter(page, 'plat', 'iOS');
    await pickFilter(page, 'lic', 'Código aberto');
    await pickFilter(page, 'tipo', 'Servidor');
    await expect(visibleItems(page)).toHaveCount(0);
    await expect(page.locator('#empty')).toHaveClass(/on/);
    await page.locator('#clear').click();
    await expect(visibleItems(page)).toHaveCount(ALL.length);
    await expect(page.locator('.fchip.on')).toHaveCount(0);
  });

  test('o estado vai para a URL e volta ao recarregar', async ({ page }) => {
    await pickFilter(page, 'plat', 'Android');
    await search(page, 'teclado');
    await expect(page).toHaveURL(/plat=Android/);
    await expect(page).toHaveURL(/q=teclado/);
    const n = await visibleItems(page).count();
    expect(n).toBe(2);
    await page.reload();
    await expect(page.locator('#q')).toHaveValue('teclado');
    await expect(page.locator('.fchip[data-f="plat"]')).toHaveClass(/on/);
    await expect(visibleItems(page)).toHaveCount(n);
  });

  test('o filtro Plataforma lista só valores que existem nos dados', async ({ page }) => {
    await page.locator('.fchip[data-f="plat"]').click();
    const opts = await page.locator('#panel .opt').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.v));
    expect(opts).toEqual(['Linux', 'Windows', 'macOS', 'Android', 'iOS', 'Web', 'Nintendo', 'PlayStation']);
    await page.locator('.fchip[data-f="lic"]').click();
    const lic = await page.locator('#panel .opt').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.v));
    expect(lic).toEqual(['Código aberto', 'Grátis', 'Freemium', 'Pago']);
  });
});

test.describe('Minecraft', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('mods começam recolhidos e os jogos viram galeria de 13', async ({ page }) => {
    await expect(page.locator('details[data-g="9|Mods favoritos"]')).not.toHaveAttribute('open', '');
    await expect(page.locator('details[data-g="9|Mods secundários"]')).not.toHaveAttribute('open', '');
    await expect(page.locator('#s10 .tile')).toHaveCount(22);
  });

  test('NeoForge apaga só 2 de 42 mods e abre os grupos', async ({ page }) => {
    await page.locator('.ldbar [data-ld="neoforge"]').click();
    await expect(page.locator('.mods li.dim')).toHaveCount(2);
    await expect(page.locator('#ldsum')).toContainText('40 de 42');
    await expect(page.locator('details[data-g="9|Mods favoritos"]')).toHaveAttribute('open', '');
  });

  test('Fabric apaga 6 mods e, ao voltar para "Todos", o que abriu sozinho recolhe', async ({ page }) => {
    await page.locator('.ldbar [data-ld="fabric"]').click();
    await expect(page.locator('.mods li.dim')).toHaveCount(6);
    await page.locator('.ldbar [data-ld="todos"]').click();
    await expect(page.locator('.mods li.dim')).toHaveCount(0);
    await expect(page.locator('details[data-g="9|Mods favoritos"]')).not.toHaveAttribute('open', '');
  });

  test('o que o Isaac abre na mão não recolhe sozinho', async ({ page }) => {
    await page.locator('details[data-g="9|Mods favoritos"] > summary').click();
    await expect(page.locator('details[data-g="9|Mods favoritos"]')).toHaveAttribute('open', '');
    await page.locator('.ldbar [data-ld="forge"]').click();
    await page.locator('.ldbar [data-ld="todos"]').click();
    await expect(page.locator('details[data-g="9|Mods favoritos"]')).toHaveAttribute('open', '');
  });
});

test.describe('canivete', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('clicar no cabo dobra e abre', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'no celular as lâminas só rolam');
    await expect(page.locator('#kdock')).toHaveClass(/open/);
    await page.locator('#kh').click();
    await expect(page.locator('#kdock')).toHaveClass(/fold/);
    await expect(page.locator('#kh')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#kh').click();
    await expect(page.locator('#kdock')).not.toHaveClass(/fold/);
  });

  test('a lâmina da seção visível fica acesa', async ({ page }) => {
    await page.locator('#s9').scrollIntoViewIfNeeded();
    await page.evaluate(() => document.getElementById('s9')!.scrollIntoView({ block: 'start' }));
    await expect(page.locator('.blade[data-s="9"]')).toHaveAttribute('aria-current', 'true');
  });

  test('clicar numa lâmina vai para a seção', async ({ page }) => {
    await page.locator('.blade[data-s="6"]').click();
    await expect(page).toHaveURL(/#s6$/);
    await expect(page.locator('#s6')).toBeInViewport();
  });
});

test.describe('tema', () => {
  test('troca de tema persiste ao recarregar', async ({ page }) => {
    await page.goto('/');
    await page.locator('#themeBtn').click();
    await page.locator('#themes [data-t="white"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'white');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'white');
    await expect(page.locator('#themes [data-t="white"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('só dois temas: dark e white', async ({ page }) => {
    await page.goto('/');
    const ids = await page.locator('#themes [data-t]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.t));
    expect(ids).toEqual(['dark', 'white']);
  });

  test.describe('padrão pelo sistema', () => {
    test.use({ colorScheme: 'dark' });
    test('escuro abre em dark', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });
  });
  test.describe('padrão pelo sistema (claro)', () => {
    test.use({ colorScheme: 'light' });
    test('claro abre em white', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'white');
    });
  });

  test.use({ colorScheme: 'light' });
  test('tema salvo vence a preferência do sistema (sistema claro, tema salvo dark)', async ({ page }) => {
    await setTheme(page, 'dark');
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});
