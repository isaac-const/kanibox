import { expect, test } from '@playwright/test';
import { ALL, PUBLIC, TOTAL, pickFilter, search, setTheme, visibleItems } from './helpers';

test.describe('página inicial', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero com descrição curta, contagem e os destaques na ordem pedida', async ({ page }) => {
    await expect(page.locator('.sec')).toHaveCount(13);
    await expect(page.locator('.blade')).toHaveCount(13);
    await expect(page.locator('#hero h1')).toHaveText('KaniBox');
    await expect(page.locator('#hero .lead')).toHaveText('Ferramentas, apps e jogos que eu uso e recomendo.');
    await expect(page.locator('#hero .meta-line')).toContainText(`${TOTAL} itens`);
    const top = await page.locator('#hero-top .tn b').allTextContents();
    expect(top).toEqual(['CachyOS', 'VSCodium', 'Godot', 'Krita', 'Claude', 'DeepSeek', 'Obsidian', 'Ghostty', 'Prism Launcher']);
    await expect(page).toHaveTitle(/KaniBox/);
  });

  test('Meus apps e Ferramentas vêm logo no topo', async ({ page }) => {
    const titles = await page.locator('.sec .sec-t').allTextContents();
    expect(titles.slice(0, 3)).toEqual(['Meus apps', 'Ferramentas', 'Navegar']);
  });

  test('o MoonDeck usa o logo enviado e Krita está em Desenhar', async ({ page }) => {
    await expect(page.locator('[data-id="13-moondeck"] img')).toHaveAttribute('src', /moondeck\.png/);
    await expect(page.locator('[data-g="3|Desenhar"] [data-id="3-krita"]')).toHaveCount(1);
  });

  test('buscar esconde os destaques do topo', async ({ page }) => {
    await expect(page.locator('#hero-top')).toBeVisible();
    await search(page, 'zen browser');
    await expect(page.locator('#hero-top')).toBeHidden();
    await page.locator('#qClear').click();
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
  });

  test('busca por "zen browser" mostra só o Zen Browser', async ({ page }) => {
    await search(page, 'zen browser');
    await expect(visibleItems(page)).toHaveCount(1);
    await expect(visibleItems(page).first()).toContainText('Zen Browser');
  });

  test('busca ignora acento e maiúscula e exige todas as palavras', async ({ page }) => {
    await search(page, 'NAVEGADOR zen');
    await expect(visibleItems(page)).toHaveCount(1);
  });

  test('busca por "terminal" mostra os 4 terminais', async ({ page }) => {
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
    await expect(page.locator('.fchip.on:not(.view)')).toHaveCount(2);
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
    await expect(page.locator('.fchip.on:not(.view)')).toHaveCount(0);
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

  test('os itens novos pedidos estão no ar', async ({ page }) => {
    for (const id of ['1-have-i-been-pwned', '1-bitwarden', '1-proton-mail', '1-cloudflare-1-1-1-1', '2-deepl', '3-realtime-colors', '3-obs-studio', '3-sharex', '4-smdownloader', '4-pdf24-tools', '5-vscodium', '5-meupc-net', '7-ninite', '9-courier-owls']) {
      await expect(page.locator(`[data-id="${id}"]`), id).toHaveCount(1);
    }
  });
});

test.describe('Minecraft em abas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('mods viram um grupo só, em abas com resource packs, shaders e servidores', async ({ page }) => {
    const tabs = await page.locator('[data-sub]').allTextContents();
    expect(tabs.map((t) => t.replace(/\s+\d+$/, ''))).toEqual(['Launchers', 'Mods', 'Resource packs', 'Shaders', 'Servidores']);
    await expect(page.locator('[data-g="9|Mods"]')).not.toHaveClass(/sub-off/);
    await expect(page.locator('[data-g="9|Shaders"]')).toHaveClass(/sub-off/);
    await expect(page.locator('[data-g="9|Mods favoritos"], [data-g="9|Mods secundários"]')).toHaveCount(0);
    await expect(page.locator('#s9 .mods li')).toHaveCount(43);
  });

  test('trocar de aba mostra só aquele grupo', async ({ page }) => {
    await page.locator('[data-sub="9|Servidores"]').click();
    await expect(page.locator('[data-g="9|Servidores"]')).not.toHaveClass(/sub-off/);
    await expect(page.locator('[data-g="9|Mods"]')).toHaveClass(/sub-off/);
    await expect(page.locator('[data-sub="9|Servidores"]')).toHaveAttribute('aria-selected', 'true');
  });

  test('a busca esconde abas sem resultado e muda para uma que tenha', async ({ page }) => {
    await search(page, 'shader');
    await expect(page.locator('[data-sub="9|Mods"]')).toBeHidden();
    await expect(page.locator('[data-sub="9|Shaders"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-g="9|Shaders"]')).not.toHaveClass(/sub-off/);
  });

  test('NeoForge apaga só 2 de 42 mods', async ({ page }) => {
    await page.locator('.ldbar [data-ld="neoforge"]').click();
    await expect(page.locator('.mods li.dim')).toHaveCount(2);
    await expect(page.locator('#ldsum')).toContainText('40 de 42');
  });

  test('Fabric apaga 6 mods, e Courier Owls (sem loader confirmado) nunca é riscado', async ({ page }) => {
    await page.locator('.ldbar [data-ld="fabric"]').click();
    await expect(page.locator('.mods li.dim')).toHaveCount(6);
    await expect(page.locator('[data-id="9-courier-owls"]')).not.toHaveClass(/dim/);
    await page.locator('.ldbar [data-ld="todos"]').click();
    await expect(page.locator('.mods li.dim')).toHaveCount(0);
  });

  test('os jogos viram galeria de 22 com Deltarune primeiro', async ({ page }) => {
    await expect(page.locator('#s10 .tile')).toHaveCount(22);
    await expect(page.locator('#s10 .tile b').first()).toContainText('Deltarune');
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
    await page.evaluate(() => document.getElementById('s9')!.scrollIntoView({ block: 'start' }));
    await expect(page.locator('.blade[data-s="9"]')).toHaveAttribute('aria-current', 'true');
  });

  test('clicar numa lâmina vai para a seção', async ({ page }) => {
    await page.locator('.blade[data-s="6"]').click();
    await expect(page).toHaveURL(/#s6$/);
    await expect(page.locator('#s6')).toBeInViewport();
  });

  test('o rótulo da lâmina atual some quando o mouse está em outra (sem texto por cima)', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'sem mouse no celular');
    await page.evaluate(() => document.getElementById('s12')!.scrollIntoView({ block: 'start' }));
    await expect(page.locator('.blade[data-s="12"]')).toHaveAttribute('aria-current', 'true');
    const op = (s: string) => page.locator(`.blade[data-s="${s}"] .lab`).evaluate((e) => getComputedStyle(e).opacity);
    await page.waitForTimeout(500);
    expect(await op('12')).toBe('1');
    await page.locator('.blade[data-s="1"]').hover();
    await page.waitForTimeout(350);
    expect(await op('1')).toBe('1');
    expect(await op('12')).toBe('0');
    await page.mouse.move(5, 300);
    await page.waitForTimeout(350);
    expect(await op('12')).toBe('1');
  });

  test('no tema claro o cabo é preto e vermelho; no escuro, creme e vermelho', async ({ page }) => {
    await page.locator('#themeBtn').click();
    await page.locator('#themes [data-t="white"]').click();
    const kh = () => page.locator('#kh').evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(await kh()).toBe('rgb(27, 26, 23)');
    await page.locator('#themes [data-t="dark"]').click();
    expect(await kh()).toBe('rgb(246, 240, 230)');
  });
});

test.describe('visualização por abas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('começa em lista e o botão Abas mostra uma seção por vez', async ({ page }) => {
    await expect(page.locator('html')).not.toHaveClass(/view-tabs/);
    await expect(page.locator('.sec:not([hidden]):not(.tab-off)')).toHaveCount(13);
    await page.locator('#viewBtn').click();
    await expect(page.locator('html')).toHaveClass(/view-tabs/);
    await expect(page.locator('#viewBtn')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.sec:not(.tab-off)')).toHaveCount(1);
    await expect(page.locator('#tabsbar [data-tab]')).toHaveCount(13);
  });

  test('trocar de aba mostra outra seção e a lâmina acompanha', async ({ page }) => {
    await page.locator('#viewBtn').click();
    await page.locator('#tabsbar [data-tab="9"]').click();
    await expect(page.locator('#s9')).not.toHaveClass(/tab-off/);
    await expect(page.locator('#s13')).toHaveClass(/tab-off/);
    await expect(page.locator('.blade[data-s="9"]')).toHaveAttribute('aria-current', 'true');
    await expect(page).toHaveURL(/#s9$/);
  });

  test('o canivete também troca a aba, sem rolar a página inteira', async ({ page }) => {
    await page.locator('#viewBtn').click();
    await page.locator('.blade[data-s="6"]').click();
    await expect(page.locator('#s6')).not.toHaveClass(/tab-off/);
    await expect(page.locator('.sec:not(.tab-off)')).toHaveCount(1);
  });

  test('a escolha é lembrada ao recarregar e dá para voltar à lista', async ({ page }) => {
    await page.locator('#viewBtn').click();
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/view-tabs/);
    await page.locator('#viewBtn').click();
    await expect(page.locator('html')).not.toHaveClass(/view-tabs/);
    await expect(page.locator('.sec:not([hidden]):not(.tab-off)')).toHaveCount(13);
  });

  test('com busca, só as abas com resultado aparecem', async ({ page }) => {
    await page.locator('#viewBtn').click();
    await search(page, 'terminal');
    await expect(page.locator('#tabsbar [data-tab]:not([hidden])')).toHaveCount(1);
    await expect(page.locator('#s6')).not.toHaveClass(/tab-off/);
  });

  test('o link #s9 abre direto a aba do Minecraft', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('kb-view', 'tabs'));
    await page.goto('/#s9');
    await page.reload(); // mudar só o hash não recarrega a página
    await expect(page.locator('#s9')).not.toHaveClass(/tab-off/);
    await expect(page.locator('.sec:not(.tab-off)')).toHaveCount(1);
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
    test('tema salvo vence a preferência do sistema', async ({ page }) => {
      await setTheme(page, 'dark');
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });
  });
});
