import { expect, test, type Page } from '@playwright/test';

/** Abre a página com o relógio simulado (19 nov 2026, 12:00 UTC) e espera as ferramentas hidratarem. */
async function open(page: Page, opts: { osc?: boolean } = {}) {
  if (opts.osc) {
    // Conta quantos osciladores o Web Audio criou: cada nota do sino cria 3.
    await page.addInitScript(() => {
      (window as unknown as { __osc: number }).__osc = 0;
      const orig = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function (this: AudioContext) {
        (window as unknown as { __osc: number }).__osc++;
        return orig.call(this);
      };
    });
  }
  await page.clock.install({ time: new Date(2026, 10, 19, 12, 0, 0) });
  await page.goto('/');
  await page.locator('#s12').scrollIntoViewIfNeeded();
  await page.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
}
const osc = (page: Page) => page.evaluate(() => (window as unknown as { __osc: number }).__osc);
const tab = (page: Page, id: string) => page.locator(`#tt-${id}`).click();

test.describe('Tempo', () => {
  test.beforeEach(async ({ page }) => open(page));

  test('o temporizador não tem mais a etiqueta "offline"', async ({ page }) => {
    await expect(page.locator('#t-timer h3')).toHaveText('Temporizador');
  });

  test('conta, mostra no título e pausa', async ({ page }) => {
    await page.locator('#t-timer [data-a="start"]').click();
    await page.clock.runFor(1500);
    await expect(page.locator('#t-timer .t')).toHaveText(/04:5[89]/);
    await expect(page).toHaveTitle(/·\s*KaniBox/);
    await page.locator('#t-timer [data-a="start"]').click();
    await expect(page.locator('#t-timer [data-a="start"]')).toHaveText('Continuar');
    await expect(page).toHaveTitle(/^KaniBox/);
  });

  test('tempo personalizado em horas, minutos e segundos', async ({ page }) => {
    await page.locator('#tm-m').fill('2');
    await page.locator('#tm-s').fill('30');
    await expect(page.locator('#t-timer .t')).toHaveText('02:30');
    await page.locator('#tm-h').fill('1');
    await expect(page.locator('#t-timer .t')).toHaveText('01:02:30');
  });

  test('os campos ficam travados enquanto conta', async ({ page }) => {
    await page.locator('#t-timer [data-a="start"]').click();
    await expect(page.locator('#tm-m')).toBeDisabled();
  });

  test('preset de 1 minuto, fim do tempo anima e vibra', async ({ page }) => {
    await page.locator('#t-timer .presets button', { hasText: '1 min' }).click();
    await expect(page.locator('#t-timer .t')).toHaveText('01:00');
    await expect(page.locator('#tm-m')).toHaveValue('1');
    await page.locator('#t-timer [data-a="start"]').click();
    await page.clock.runFor(61_000);
    await expect(page.locator('#t-timer .t')).toHaveText('00:00');
    await expect(page.locator('#t-timer .ring')).toHaveClass(/done/);
    await expect(page.locator('#t-timer [data-a="start"]')).toHaveText('Iniciar');
  });

  test('zerar volta ao tempo escolhido', async ({ page }) => {
    await page.locator('#tm-m').fill('3');
    await page.locator('#t-timer [data-a="start"]').click();
    await page.clock.runFor(3000);
    await page.locator('#t-timer [data-a="reset"]').click();
    await expect(page.locator('#t-timer .t')).toHaveText('03:00');
  });

  test('foco: ao acabar passa para a pausa e conta o ciclo', async ({ page }) => {
    await page.locator('#t-pomo [data-a="start"]').click();
    await page.clock.runFor(25 * 60 * 1000 + 1000);
    await expect(page.locator('#t-pomo .t')).toHaveText('05:00');
    await expect(page.locator('#modes [data-mode="1"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#t-pomo [data-a="start"]').click();
    await page.clock.runFor(5 * 60 * 1000 + 1000);
    await expect(page.locator('#t-pomo .t')).toHaveText('25:00');
    await expect(page.locator('#cyc')).toHaveText('Ciclo 2 de 4');
  });

  test('foco: tempos e número de ciclos personalizáveis', async ({ page }) => {
    await page.locator('#t-pomo summary').click();
    await page.locator('#pf-focus').fill('1');
    await expect(page.locator('#t-pomo .t')).toHaveText('01:00');
    await expect(page.locator('#modes [data-mode="0"]')).toHaveText('Foco 1');
    await page.locator('#pf-cycles').fill('2');
    await expect(page.locator('#cyc')).toHaveText('Ciclo 1 de 2');
    await page.locator('#pf-long').fill('7');
    await page.locator('#t-pomo [data-a="start"]').click();
    await page.clock.runFor(61_000); // foco 1 min -> pausa
    await page.locator('#t-pomo [data-a="start"]').click();
    await page.clock.runFor(5 * 60 * 1000 + 1000); // pausa 5 min -> foco 2
    await expect(page.locator('#cyc')).toHaveText('Ciclo 2 de 2');
    await page.locator('#t-pomo [data-a="start"]').click();
    await page.clock.runFor(61_000); // último foco -> pausa longa de 7
    await expect(page.locator('#t-pomo .t')).toHaveText('07:00');
    await expect(page.locator('#modes [data-mode="2"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('cronômetro corre, registra volta e zera', async ({ page }) => {
    await page.locator('#sStart').click();
    await page.clock.runFor(2500);
    await expect(page.locator('#sw')).not.toHaveText(/^00:00\.00$/);
    await page.locator('#sLap').click();
    await expect(page.locator('#laps div')).toHaveCount(1);
    await page.locator('#sReset').click();
    await expect(page.locator('#sw')).toHaveText('00:00.00');
    await expect(page.locator('#laps div')).toHaveCount(0);
  });

  test('trocar de aba não para um temporizador em andamento', async ({ page }) => {
    await page.locator('#t-timer [data-a="start"]').click();
    await tab(page, 'sorteio');
    await expect(page.locator('#tp-tempo')).toBeHidden();
    await expect(page.locator('#t-wheel')).toBeVisible();
    await page.clock.runFor(10_000);
    await tab(page, 'tempo');
    await expect(page.locator('#t-timer .t')).toHaveText(/04:[45]\d/);
  });

  test('quanto tempo: só o mês mostra o próximo dia 1 daquele mês', async ({ page }) => {
    await page.locator('#hl-mo').fill('12');
    await expect(page.locator('#hl-out .target')).toContainText('1 de dezembro de 2026, 00:00');
    await expect(page.locator('#hl-out .tile2').first()).toContainText('dias');
    await expect(page.locator('#hl-out')).toContainText('Total: 11 dias');
  });

  test('quanto tempo: só a hora, só o dia, e o último que passou', async ({ page }) => {
    await page.locator('#hl-h').fill('18');
    await expect(page.locator('#hl-out .target')).toContainText('19 de novembro de 2026, 18:00');
    await page.locator('#hl-h').fill('');
    await page.locator('#hl-d').fill('5');
    await expect(page.locator('#hl-out .target')).toContainText('5 de dezembro de 2026');
    await page.getByRole('button', { name: /Último/ }).click();
    await expect(page.locator('#hl-out .target')).toContainText('Passou desde');
    await expect(page.locator('#hl-out .target')).toContainText('5 de novembro de 2026');
  });

  test('quanto tempo: data exata no futuro e no passado, e data impossível', async ({ page }) => {
    await page.locator('#hl-y').fill('2030');
    await page.locator('#hl-mo').fill('1');
    await page.locator('#hl-d').fill('1');
    await expect(page.locator('#hl-out .target')).toContainText('Falta até');
    await expect(page.locator('#hl-out .target')).toContainText('1 de janeiro de 2030');
    await page.locator('#hl-y').fill('2020');
    await expect(page.locator('#hl-out .target')).toContainText('Passou desde');
    await page.locator('#hl-y').fill('2026');
    await page.locator('#hl-mo').fill('2');
    await page.locator('#hl-d').fill('30');
    await expect(page.locator('#hl-out')).toContainText('não existe');
  });

  test('quanto tempo: sem preencher nada mostra exemplos', async ({ page }) => {
    await expect(page.locator('#hl-out')).toContainText('Exemplos');
  });
});

test.describe('modo foco (expandir)', () => {
  test.beforeEach(async ({ page }) => open(page));

  for (const [id, name] of [['t-timer', 'Temporizador'], ['t-sw', 'Cronômetro'], ['t-pomo', 'Foco']] as const) {
    test(`${name} expande em tela cheia e fecha com Esc`, async ({ page }) => {
      const card = page.locator(`#${id}`);
      await card.locator('.expand').click();
      await expect(card).toHaveClass(/expanded/);
      await expect(card).toHaveAttribute('role', 'dialog');
      const box = await card.boundingBox();
      const vp = page.viewportSize()!;
      expect(box!.width).toBeGreaterThanOrEqual(vp.width - 2);
      expect(box!.height).toBeGreaterThanOrEqual(vp.height - 2);
      await page.keyboard.press('Escape');
      await expect(card).not.toHaveClass(/expanded/);
    });
  }

  test('o botão Fechar também sai do modo foco e a contagem continua', async ({ page }) => {
    await page.locator('#t-timer [data-a="start"]').click();
    await page.locator('#t-timer .expand').click();
    await page.clock.runFor(5000);
    await page.locator('#t-timer .expand').click();
    await expect(page.locator('#t-timer')).not.toHaveClass(/expanded/);
    await expect(page.locator('#t-timer .t')).toHaveText(/04:5\d|04:4\d/);
  });
});

test.describe('som opcional', () => {
  test.beforeEach(async ({ page }) => open(page, { osc: true }));

  test('por padrão o som está desligado e o fim do tempo não toca', async ({ page }) => {
    await expect(page.locator('#soundBtn-timer')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#soundBtn-timer')).toHaveText('Som desligado');
    await page.locator('#t-timer .presets button', { hasText: '1 min' }).click();
    await page.locator('#t-timer [data-a="start"]').click();
    await page.clock.runFor(61_000);
    await expect(page.locator('#t-timer .t')).toHaveText('00:00');
    expect(await osc(page)).toBe(0);
  });

  test('ligado, o temporizador toca o sino de 4 notas ao acabar', async ({ page }) => {
    await page.locator('#soundBtn-timer').click();
    const demo = await osc(page);
    expect(demo).toBe(12); // ao ligar toca uma demonstração
    await page.locator('#t-timer .presets button', { hasText: '1 min' }).click();
    await page.locator('#t-timer [data-a="start"]').click();
    await page.clock.runFor(61_000);
    await expect(page.locator('#t-timer .t')).toHaveText('00:00');
    expect(await osc(page)).toBe(demo + 12);
  });

  test('cada ferramenta tem o seu próprio botão de som', async ({ page }) => {
    await page.locator('#soundBtn-pomo').click();
    await expect(page.locator('#soundBtn-pomo')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#soundBtn-timer')).toHaveAttribute('aria-pressed', 'false');
    const demo = await osc(page);
    await page.locator('#t-pomo [data-a="start"]').click();
    await page.clock.runFor(25 * 60 * 1000 + 1000);
    expect(await osc(page)).toBe(demo + 12); // fim do foco: sobe
    await page.locator('#t-pomo [data-a="start"]').click();
    await page.clock.runFor(5 * 60 * 1000 + 1000);
    expect(await osc(page)).toBe(demo + 12 + 9); // fim da pausa: desce, 3 notas
  });

  test('desligar de novo silencia e a escolha fica salva ao recarregar', async ({ page }) => {
    await page.locator('#soundBtn-timer').click();
    await page.locator('#soundBtn-timer').click();
    await expect(page.locator('#soundBtn-timer')).toHaveText('Som desligado');
    await page.locator('#soundBtn-pomo').click();
    await page.reload();
    await page.locator('#s12').scrollIntoViewIfNeeded();
    await page.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
    await expect(page.locator('#soundBtn-pomo')).toHaveText('Som ligado');
    await expect(page.locator('#soundBtn-timer')).toHaveText('Som desligado');
  });
});

test.describe('Texto', () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
    await tab(page, 'texto');
  });
  const out = (page: Page, id: string) => page.locator(`#tx-out [data-style="${id}"]`);

  test('os estilos pedidos aparecem com o texto padrão', async ({ page }) => {
    await expect(page.locator('#tx-out li')).toHaveCount(18);
    await expect(out(page, 'smallcaps')).toHaveText('ʜᴇʟʟᴏ ᴡᴏʀʟᴅ');
    await expect(out(page, 'super')).toHaveText('ʰᵉˡˡᵒ ʷᵒʳˡᵈ');
    await expect(out(page, 'sub')).toHaveText('ₕₑₗₗₒ wₒᵣₗd');
    await expect(out(page, 'reverse')).toHaveText('dlroW olleH');
    await expect(out(page, 'leet')).toHaveText('H3110 W0r1d');
    await expect(out(page, 'fraktur')).toHaveText('ℌ𝔢𝔩𝔩𝔬 𝔚𝔬𝔯𝔩𝔡');
  });

  test('digitar atualiza tudo, e o zalgo mantém as letras', async ({ page }) => {
    await page.locator('#tx-in').fill('Hello world');
    await expect(out(page, 'reverse')).toHaveText('dlrow olleH');
    await expect(out(page, 'fraktur')).toHaveText('ℌ𝔢𝔩𝔩𝔬 𝔴𝔬𝔯𝔩𝔡');
    const z = await out(page, 'zalgo').textContent();
    expect(z!.normalize('NFD').replace(/[̀-ͯ]/g, '')).toBe('Hello world');
    expect(z!.length).toBeGreaterThan(11);
  });

  test('texto vazio deixa os botões de copiar desligados', async ({ page }) => {
    await page.locator('#tx-in').fill('');
    await expect(page.locator('#tx-out .copy').first()).toBeDisabled();
  });

  test('copiar mostra a confirmação', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await page.getByRole('button', { name: 'Copiar Leet' }).click();
    await expect(page.getByRole('button', { name: 'Copiar Leet' })).toHaveText('Copiado');
  });
});

test.describe('Cálculo', () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
    await tab(page, 'calculo');
  });

  test('calculadora: digitar, Enter, teclado e histórico', async ({ page }) => {
    await page.locator('#calc-in').fill('2+3*4');
    await page.locator('#calc-in').press('Enter');
    await expect(page.locator('#calc-out')).toHaveText('= 14');
    await page.locator('#t-calc button', { hasText: /^C$/ }).click();
    await page.locator('#t-calc .keys button', { hasText: /^7$/ }).click();
    await page.locator('#t-calc .keys button', { hasText: /^×$/ }).click();
    await page.locator('#t-calc .keys button', { hasText: /^6$/ }).click();
    await page.locator('#calc-eq').click();
    await expect(page.locator('#calc-out')).toHaveText('= 42');
    await expect(page.locator('#t-calc .laps div')).toHaveCount(2);
  });

  test('calculadora: erro claro em divisão por zero, sem quebrar', async ({ page }) => {
    await page.locator('#calc-in').fill('1/0');
    await page.locator('#calc-eq').click();
    await expect(page.locator('#calc-out')).toContainText('divisão por zero');
  });

  test('conversor: temperatura e mudança de grandeza', async ({ page }) => {
    await page.locator('#un-cat').selectOption({ label: 'Temperatura' });
    await page.locator('#un-val').fill('100');
    await page.locator('#un-from').selectOption('c');
    await page.locator('#un-to').selectOption('f');
    await expect(page.locator('#un-out')).toHaveText('100 = 212');
    await page.locator('#un-cat').selectOption({ label: 'Dados' });
    await page.locator('#un-from').selectOption('GiB');
    await page.locator('#un-to').selectOption('MB');
    await page.locator('#un-val').fill('1');
    await expect(page.locator('#un-out')).toHaveText('1 = 1073.741824');
    await expect(page.locator('#t-units .utable li').first()).toBeVisible();
  });

  test('conversor: trocar as unidades inverte', async ({ page }) => {
    await page.locator('#un-val').fill('1000');
    await expect(page.locator('#un-out')).toHaveText('1000 = 1');
    await page.getByRole('button', { name: 'Trocar as unidades' }).click();
    await expect(page.locator('#un-out')).toHaveText('1000 = 1000000');
  });

  test('regra de 3: direta e inversa', async ({ page }) => {
    await expect(page.locator('#r3-out')).toHaveText('30');
    await page.getByRole('button', { name: 'Inversa' }).click();
    await page.locator('#r3-a').fill('4');
    await page.locator('#r3-b').fill('6');
    await page.locator('#r3-c').fill('8');
    await expect(page.locator('#r3-out')).toHaveText('3');
  });
});

test.describe('Sorteio', () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
    await tab(page, 'sorteio');
  });

  test('sorteio de nomes: sorteia da lista e não repete quando pedido', async ({ page }) => {
    await page.locator('#nm-go').click();
    const w = await page.locator('#nm-out .win').allTextContents();
    expect(w).toHaveLength(1);
    expect(['Ana', 'Bruno', 'Carla', 'Diego']).toContain(w[0]);
    await page.locator('#t-names .check input').check();
    await page.locator('#nm-n').fill('4');
    await page.locator('#nm-go').click();
    const all = (await page.locator('#nm-out .win').allTextContents()).sort();
    expect(all).toEqual(['Ana', 'Bruno', 'Carla', 'Diego']);
    await page.locator('#nm-go').click();
    await expect(page.locator('#nm-out')).toContainText('Todos já foram sorteados');
  });

  test('sorteio de nomes: aceita vírgulas e avisa se pedir mais do que existe', async ({ page }) => {
    await page.locator('#nm-in').fill('Ana, Bia; Caio');
    await page.locator('#nm-n').fill('9');
    await page.locator('#nm-go').click();
    await expect(page.locator('#nm-out .win')).toHaveCount(3);
    await expect(page.locator('#nm-out')).toContainText('Só havia 3');
  });

  test('número aleatório: intervalo fixo, quantidade e sem repetição', async ({ page }) => {
    await page.locator('#rn-min').fill('5');
    await page.locator('#rn-max').fill('5');
    await page.locator('#rn-go').click();
    await expect(page.locator('#rn-out .win')).toHaveText('5');
    await page.locator('#rn-min').fill('1');
    await page.locator('#rn-max').fill('10');
    await page.locator('#rn-n').fill('10');
    await page.locator('#t-rand .check input').check();
    await page.locator('#rn-go').click();
    const n = (await page.locator('#rn-out .win').allTextContents()).map(Number).sort((a, b) => a - b);
    expect(n).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    await page.locator('#rn-n').fill('11');
    await page.locator('#rn-go').click();
    await expect(page.locator('#rn-out')).toContainText('só existem 10');
  });

  test('número aleatório: casas decimais ficam dentro do intervalo', async ({ page }) => {
    await page.locator('#rn-min').fill('0');
    await page.locator('#rn-max').fill('1');
    await page.locator('#rn-d').fill('2');
    await page.locator('#rn-n').fill('20');
    await page.locator('#rn-go').click();
    const v = (await page.locator('#rn-out .win').allTextContents()).map(Number);
    expect(v).toHaveLength(20);
    for (const x of v) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1);
    }
  });

  test('roleta: gira, para e mostra uma das opções', async ({ page }) => {
    await page.locator('#wh-go').click();
    await expect(page.locator('#wh-go')).toBeDisabled();
    await page.clock.runFor(4500);
    await expect(page.locator('#wh-out')).toContainText('Saiu:');
    const txt = (await page.locator('#wh-out').textContent())!.replace('Saiu: ', '');
    expect(['Pizza', 'Hambúrguer', 'Sushi', 'Lanche']).toContain(txt);
    await expect(page.locator('#wh-go')).toBeEnabled();
  });

  test('roleta: com menos de duas opções não gira', async ({ page }) => {
    await page.locator('#wh-in').fill('Só uma');
    await expect(page.locator('#wh-go')).toBeDisabled();
    await expect(page.locator('#wh-out')).toContainText('ao menos duas');
  });

  test('sim ou não: responde e conta o placar', async ({ page }) => {
    for (let i = 0; i < 6; i++) await page.locator('#yn-go').click();
    const t = await page.locator('#yn-out').textContent();
    expect(['Sim', 'Não']).toContain(t);
    const score = await page.locator('#t-yesno .h').textContent();
    const [s, n] = [...score!.matchAll(/(\d+)/g)].map((m) => Number(m[1]));
    expect(s + n).toBe(6);
    await page.getByRole('button', { name: 'Zerar placar' }).click();
    await expect(page.locator('#yn-out')).toHaveText('?');
  });
});

test.describe('ferramentas na busca', () => {
  test('somem com filtro e aparecem quando a busca fala delas', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#s12')).toBeVisible();
    await page.locator('#q').fill('zen browser');
    await page.waitForTimeout(150);
    await expect(page.locator('#s12')).toBeHidden();
    for (const w of ['pomodoro', 'roleta', 'calculadora', 'zalgo']) {
      await page.locator('#q').fill(w);
      await page.waitForTimeout(150);
      await expect(page.locator('#s12'), w).toBeVisible();
    }
  });
});
