import { expect, test } from '@playwright/test';
import { ALL, PUBLIC, TOTAL, inSec, pickFilter, search, setTheme, visibleItems } from './helpers';

test.describe('início', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero simples, contagem e sem o modo abas', async ({ page }) => {
    await expect(page.locator('#hero h1')).toHaveText('KaniBox');
    await expect(page.locator('#hero .lead')).toHaveText('Ferramentas, apps e jogos que eu uso e recomendo.');
    await expect(page.locator('#hero .meta-line')).toContainText(`${TOTAL} itens`);
    await expect(page).toHaveTitle(/KaniBox/);
    await expect(page.locator('#viewBtn, #tabsbar')).toHaveCount(0);
  });

  test('"Mais recomendados": 8 pílulas vermelhas com estrela, sem o DeepSeek', async ({ page }) => {
    await expect(page.locator('#rec-t')).toHaveText('Mais recomendados');
    const names = await page.locator('#hero-top .tn b').allTextContents();
    expect(names).toEqual(['CachyOS', 'VSCodium', 'Godot', 'Krita', 'Claude', 'Obsidian', 'Ghostty', 'Prism Launcher']);
    expect(names).not.toContain('DeepSeek');
    await expect(page.locator('#hero-top .pill-star')).toHaveCount(8);
    const bg = await page.locator('#hero-top .rec-list a').first().evaluate((e) => getComputedStyle(e).backgroundColor);
    const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(accent).toMatch(/^#/);
  });

  test('categorias: 11 cartões, Meus apps e Ferramentas em destaque e primeiro', async ({ page }) => {
    const titles = await page.locator('#cats .ct b').allTextContents();
    expect(titles).toHaveLength(11);
    expect(titles.slice(0, 2)).toEqual(['Meus apps', 'Ferramentas']);
    await expect(page.locator('#cats .cat.feat')).toHaveCount(2);
    expect(titles).not.toContain('Terminal');
    expect(titles).not.toContain('Emular e jogar');
  });

  test('um cartão leva para a página da categoria', async ({ page }) => {
    await page.locator('#cats a', { hasText: 'IA' }).first().click();
    await expect(page).toHaveURL(/\/ia\/$/);
    await expect(page.locator('h1')).toHaveText('IA');
  });

  test('a lista completa fica escondida até a pessoa buscar', async ({ page }) => {
    await expect(page.locator('#home-sections')).toBeHidden();
    await search(page, 'zen browser');
    await expect(page.locator('#home-sections')).toBeVisible();
    await expect(page.locator('#hero-top')).toBeHidden();
    await expect(page.locator('#cats')).toBeHidden();
    await page.locator('#qClear').click();
    await expect(page.locator('#home-sections')).toBeHidden();
    await expect(page.locator('#hero-top')).toBeVisible();
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
    await expect(page.locator('#menu')).not.toHaveClass(/on/);
  });

  test('busca por "zen browser" acha só o Zen Browser, em qualquer categoria', async ({ page }) => {
    await search(page, 'zen browser');
    await expect(visibleItems(page)).toHaveCount(1);
    await expect(visibleItems(page).first()).toContainText('Zen Browser');
  });

  test('busca ignora acento e maiúscula e exige todas as palavras', async ({ page }) => {
    await search(page, 'NAVEGADOR zen');
    await expect(visibleItems(page)).toHaveCount(1);
  });

  test('busca por "terminal" mostra os 4 terminais (agora em Produtividade)', async ({ page }) => {
    await search(page, 'terminal');
    await expect(visibleItems(page)).toHaveCount(4);
    await expect(page.locator('#home-sections .sec:not([hidden])')).toHaveCount(1);
    await expect(page.locator('#s5')).toBeVisible();
  });

  test('busca por ferramentas mostra um atalho para a página de ferramentas', async ({ page }) => {
    await search(page, 'pomodoro');
    await expect(page.locator('#tools-hint')).toBeVisible();
    await page.locator('#tools-hint a').click();
    await expect(page).toHaveURL(/\/ferramentas\/$/);
    await page.goto('/');
    await search(page, 'zen browser');
    await expect(page.locator('#tools-hint')).toBeHidden();
  });

  test('busca sem resultado mostra o aviso, e limpar volta ao início', async ({ page }) => {
    await search(page, 'xyzxyz');
    await expect(visibleItems(page)).toHaveCount(0);
    await expect(page.locator('#empty')).toHaveClass(/on/);
    await page.locator('#qClear').click();
    await expect(page.locator('#empty')).not.toHaveClass(/on/);
    await expect(page.locator('#hero-top')).toBeVisible();
  });

  test('filtros no início valem para todas as categorias', async ({ page }) => {
    await pickFilter(page, 'plat', 'Linux');
    await expect(visibleItems(page)).toHaveCount(ALL.filter((i) => i.plat.includes('Linux')).length);
    await pickFilter(page, 'lic', 'Código aberto');
    await expect(visibleItems(page)).toHaveCount(ALL.filter((i) => i.plat.includes('Linux') && i.lic === 'Código aberto').length);
    await expect(page.locator('#sum')).toContainText(`de ${PUBLIC.length}`);
  });

  test('filtro de tipo: seis emuladores, e combinação impossível mostra o aviso', async ({ page }) => {
    await pickFilter(page, 'tipo', 'Emulador');
    await expect(visibleItems(page)).toHaveCount(6);
    await page.locator('#clear').click();
    await pickFilter(page, 'plat', 'iOS');
    await pickFilter(page, 'lic', 'Código aberto');
    await pickFilter(page, 'tipo', 'Servidor');
    await expect(visibleItems(page)).toHaveCount(0);
    await expect(page.locator('#empty')).toHaveClass(/on/);
    await page.locator('#clear').click();
    await expect(page.locator('.fchip.on')).toHaveCount(0);
  });

  test('o estado vai para a URL e volta ao recarregar', async ({ page }) => {
    await pickFilter(page, 'plat', 'Android');
    await search(page, 'teclado');
    await expect(page).toHaveURL(/plat=Android/);
    await expect(page).toHaveURL(/q=teclado/);
    expect(await visibleItems(page).count()).toBe(2);
    await page.reload();
    await expect(page.locator('#q')).toHaveValue('teclado');
    await expect(page.locator('.fchip[data-f="plat"]')).toHaveClass(/on/);
    await expect(visibleItems(page)).toHaveCount(2);
  });

  test('os filtros listam só valores que existem nos dados', async ({ page }) => {
    await page.locator('.fchip[data-f="plat"]').click();
    const opts = await page.locator('#panel .opt').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.v));
    expect(opts).toEqual(['Linux', 'Windows', 'macOS', 'Android', 'iOS', 'Web', 'Nintendo', 'PlayStation']);
    await page.locator('.fchip[data-f="lic"]').click();
    const lic = await page.locator('#panel .opt').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.v));
    expect(lic).toEqual(['Código aberto', 'Grátis', 'Freemium', 'Pago']);
  });
});

test.describe('página de categoria', () => {
  test('mostra só a categoria, com h1, e a busca vale só nela', async ({ page }) => {
    await page.goto('/criar/');
    await expect(page.locator('h1')).toHaveText('Criar');
    await expect(page.locator('main .sec')).toHaveCount(1);
    await expect(page.locator('main [data-id]')).toHaveCount(inSec(3).length);
    await expect(page.locator('#hero')).toHaveCount(0);
    await search(page, 'krita');
    await expect(visibleItems(page)).toHaveCount(1);
    await expect(page.locator('[data-g="3|Desenhar"] [data-id="3-krita"]')).toBeVisible();
  });

  test('sem resultado oferece buscar em todas as categorias, levando a busca junto', async ({ page }) => {
    await page.goto('/criar/');
    await search(page, 'bitwarden');
    await expect(page.locator('#empty')).toHaveClass(/on/);
    await page.locator('#empty-global').click();
    await expect(page).toHaveURL(/\/\?q=bitwarden$/);
    await expect(page.locator('#q')).toHaveValue('bitwarden');
    await expect(visibleItems(page)).toHaveCount(1);
  });

  test('os filtros da categoria só contam os itens dela', async ({ page }) => {
    await page.goto('/ia/');
    await page.locator('.fchip[data-f="tipo"]').click();
    const opts = await page.locator('#panel .opt').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.v));
    expect(opts.sort()).toEqual([...new Set(inSec(2).map((i) => i.tipo))].sort());
  });

  test('Terminal está em Produtividade e Emuladores em Jogos', async ({ page }) => {
    await page.goto('/produtividade/');
    await expect(page.locator('[data-g="5|Terminais"] [data-id]')).toHaveCount(4);
    await page.goto('/jogos/');
    await expect(page.locator('[data-sub="10|Emuladores"]')).toHaveCount(1);
  });

  test('Meus apps tem o MoonDeck com o logo enviado', async ({ page }) => {
    await page.goto('/meus-apps/');
    await expect(page.locator('[data-id="13-moondeck"] img')).toHaveAttribute('src', /moondeck\.png/);
  });

  test('itens pedidos estão nas páginas certas', async ({ page }) => {
    const where: Record<string, string[]> = {
      '/navegar/': ['1-have-i-been-pwned', '1-bitwarden', '1-proton-mail', '1-cloudflare-1-1-1-1'],
      '/ia/': ['2-deepl'],
      '/criar/': ['3-realtime-colors', '3-obs-studio', '3-sharex'],
      '/arquivos/': ['4-smdownloader', '4-pdf24-tools'],
      '/produtividade/': ['5-vscodium', '5-meupc-net'],
      '/sistema/': ['7-ninite'],
      '/minecraft/': ['9-courier-owls'],
    };
    for (const [path, ids] of Object.entries(where)) {
      await page.goto(path);
      for (const id of ids) await expect(page.locator(`[data-id="${id}"]`), `${path} ${id}`).toHaveCount(1);
    }
  });
});

test.describe('menu lateral', () => {
  test('abre, lista as categorias com contagem e leva à página', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#menu')).toHaveAttribute('inert', '');
    await page.locator('#menuBtn').click();
    await expect(page.locator('#menu')).toHaveClass(/on/);
    await expect(page.locator('#menuBtn')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#menu .mi')).toHaveCount(12); // início + 11 categorias
    await expect(page.locator('#menu .mi', { hasText: 'Minecraft' }).locator('.mc')).toHaveText(String(inSec(9).length));
    await page.locator('#menu .mi', { hasText: 'Criar' }).click();
    await expect(page).toHaveURL(/\/criar\/$/);
    await expect(page.locator('#menu')).not.toHaveClass(/on/);
  });

  test('fecha com Esc, com o fundo e com o botão, e devolve o foco', async ({ page }) => {
    await page.goto('/');
    await page.locator('#menuBtn').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu')).not.toHaveClass(/on/);
    await expect(page.locator('#menuBtn')).toBeFocused();
    await page.locator('#menuBtn').click();
    await page.mouse.click(Math.round(page.viewportSize()!.width - 8), 400);
    await expect(page.locator('#menu')).not.toHaveClass(/on/);
    await page.locator('#menuBtn').click();
    await page.locator('#menuClose').click();
    await expect(page.locator('#menu')).not.toHaveClass(/on/);
  });

  test('marca a página atual', async ({ page }) => {
    await page.goto('/ia/');
    await page.locator('#menuBtn').click();
    await expect(page.locator('#menu .mi[aria-current="page"]')).toHaveText(/IA/);
  });
});

test.describe('abas elásticas (Rubber Segment)', () => {
  test('Minecraft: mods num grupo só, em abas com resource packs, shaders e servidores', async ({ page }) => {
    await page.goto('/minecraft/');
    const tabs = await page.locator('[data-sub]').allTextContents();
    expect(tabs.map((t) => t.replace(/\s+\d+$/, ''))).toEqual(['Launchers', 'Mods', 'Resource packs', 'Shaders', 'Servidores']);
    await expect(page.locator('[data-g="9|Mods"]')).not.toHaveClass(/sub-off/);
    await expect(page.locator('[data-g="9|Shaders"]')).toHaveClass(/sub-off/);
    await expect(page.locator('#s9 .mods li')).toHaveCount(43);
    await page.locator('[data-sub="9|Servidores"]').click();
    await expect(page.locator('[data-g="9|Servidores"]')).not.toHaveClass(/sub-off/);
    await expect(page.locator('[data-g="9|Mods"]')).toHaveClass(/sub-off/);
  });

  test('o marcador acompanha a aba escolhida', async ({ page }) => {
    await page.goto('/minecraft/');
    await page.waitForTimeout(300);
    const geo = () =>
      page.evaluate(() => {
        const seg = document.querySelector('.subtabs')!;
        const pill = seg.querySelector<HTMLElement>('.seg-pill')!;
        const sel = seg.querySelector<HTMLElement>('[aria-selected="true"]')!;
        return { px: pill.style.getPropertyValue('--x'), sx: sel.offsetLeft + 'px', pw: pill.style.getPropertyValue('--w'), sw: sel.offsetWidth + 'px', op: pill.style.opacity };
      });
    let g = await geo();
    expect(g.px).toBe(g.sx);
    expect(g.pw).toBe(g.sw);
    expect(g.op).toBe('1');
    await page.locator('[data-sub="9|Shaders"]').click();
    await page.waitForTimeout(150);
    g = await geo();
    expect(g.px).toBe(g.sx);
    await expect(page.locator('.subtabs .seg-pill')).toHaveClass(/stretch/);
  });

  test('Jogos: galeria de 22 com Deltarune primeiro, e emuladores em outra aba', async ({ page }) => {
    await page.goto('/jogos/');
    await expect(page.locator('#s10 .tile')).toHaveCount(22);
    await expect(page.locator('#s10 .tile b').first()).toContainText('Deltarune');
    await page.locator('[data-sub="10|Emuladores"]').click();
    await expect(page.locator('[data-g="10|Emuladores"]')).not.toHaveClass(/sub-off/);
    await expect(page.locator('[data-g="10|Que eu gosto"]')).toHaveClass(/sub-off/);
  });

  test('a busca esconde abas sem resultado e muda para uma que tenha', async ({ page }) => {
    await page.goto('/minecraft/');
    await search(page, 'shader');
    await expect(page.locator('[data-sub="9|Mods"]')).toBeHidden();
    await expect(page.locator('[data-sub="9|Shaders"]')).toHaveAttribute('aria-selected', 'true');
  });

  test('loader: NeoForge apaga 2 de 42 mods, Fabric 6, e Courier Owls nunca é riscado', async ({ page }) => {
    await page.goto('/minecraft/');
    await page.locator('.ldbar [data-ld="neoforge"]').click();
    await expect(page.locator('.mods li.dim')).toHaveCount(2);
    await expect(page.locator('#ldsum')).toContainText('40 de 42');
    await page.locator('.ldbar [data-ld="fabric"]').click();
    await expect(page.locator('.mods li.dim')).toHaveCount(6);
    await expect(page.locator('[data-id="9-courier-owls"]')).not.toHaveClass(/dim/);
    await page.locator('.ldbar [data-ld="todos"]').click();
    await expect(page.locator('.mods li.dim')).toHaveCount(0);
  });
});

test.describe('canivete (navegação entre páginas)', () => {
  test('uma lâmina por categoria, e a da página atual fica acesa', async ({ page }) => {
    await page.goto('/ia/');
    await expect(page.locator('.blade')).toHaveCount(11);
    await expect(page.locator('.blade[aria-current="page"]')).toHaveCount(1);
    await expect(page.locator('.blade[aria-current="page"]')).toHaveAttribute('data-s', '2');
  });

  test('clicar numa lâmina vai para a página', async ({ page }) => {
    await page.goto('/');
    await page.locator('.blade[data-s="9"]').click();
    await expect(page).toHaveURL(/\/minecraft\/$/);
  });

  test('clicar no cabo dobra e abre', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 800, 'no celular as lâminas só rolam');
    await page.goto('/');
    await expect(page.locator('#kdock')).toHaveClass(/open/);
    await page.locator('#kh').click();
    await expect(page.locator('#kdock')).toHaveClass(/fold/);
    await page.locator('#kh').click();
    await expect(page.locator('#kdock')).not.toHaveClass(/fold/);
  });

  test('o rótulo da lâmina atual some quando o mouse está em outra (sem texto por cima)', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 800, 'sem mouse no celular');
    await page.goto('/ferramentas/');
    await page.mouse.move(5, 300);
    await page.waitForTimeout(1200);
    const op = (s: string) => page.locator(`.blade[data-s="${s}"] .lab`).evaluate((e) => getComputedStyle(e).opacity);
    expect(await op('12')).toBe('1');
    await page.locator('.blade[data-s="1"]').hover();
    await page.waitForTimeout(450);
    expect(await op('1')).toBe('1');
    expect(await op('12')).toBe('0');
    await page.mouse.move(5, 300);
    await page.waitForTimeout(450);
    expect(await op('12')).toBe('1');
  });

  test('no tema claro o cabo é preto e vermelho; no escuro, creme e vermelho', async ({ page }) => {
    await page.goto('/');
    await page.locator('#themeBtn').click();
    await page.locator('#themes [data-t="white"]').click();
    const kh = () => page.locator('#kh').evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(await kh()).toBe('rgb(27, 26, 23)');
    await page.locator('#themes [data-t="dark"]').click();
    expect(await kh()).toBe('rgb(246, 240, 230)');
  });
});

test.describe('rodapé', () => {
  test('tem marca, links e a faixa de kanikama', async ({ page }) => {
    await page.goto('/');
    const f = page.locator('footer.site');
    await expect(f.locator('.stripe')).toHaveCount(1);
    await expect(f).toContainText('Feito pelo Isaac, em Timon');
    await expect(f.locator('a[href="https://github.com/isaac-const"]')).toHaveCount(1);
    await expect(f.locator('a[href*="rss.xml"]')).toHaveCount(1);
  });
});

test.describe('tema', () => {
  test('troca persiste, e só existem dark e white', async ({ page }) => {
    await page.goto('/');
    const ids = await page.locator('#themes [data-t]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.t));
    expect(ids).toEqual(['dark', 'white']);
    await page.locator('#themeBtn').click();
    await page.locator('#themes [data-t="white"]').click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'white');
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
    test('claro abre em white, e o tema salvo vence', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'white');
      await setTheme(page, 'dark');
      await page.goto('/ia/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });
  });
});
