import { expect, test } from '@playwright/test';

test.describe('ferramentas de tempo', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date('2026-11-19T12:00:00Z') });
    await page.goto('/');
    await page.locator('#s12').scrollIntoViewIfNeeded();
    await expect(page.locator('#t-timer .t')).toHaveText('05:00');
    // aguarda a hidratação do React (client:visible): o atributo ssr some da ilha quando termina
    await page.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
  });

  test('temporizador conta, mostra no título e pausa', async ({ page }) => {
    await page.locator('#t-timer [data-a="start"]').click();
    await page.clock.runFor(1500);
    await expect(page.locator('#t-timer .t')).toHaveText(/04:5[89]/);
    await expect(page).toHaveTitle(/·\s*KaniBox/);
    await page.locator('#t-timer [data-a="start"]').click();
    await expect(page.locator('#t-timer [data-a="start"]')).toHaveText('Continuar');
    await expect(page).toHaveTitle(/^KaniBox/);
  });

  test('preset de 1 minuto, fim do tempo anima e vibra', async ({ page }) => {
    await page.locator('#t-timer .presets button', { hasText: '1 min' }).click();
    await expect(page.locator('#t-timer .t')).toHaveText('01:00');
    await page.locator('#t-timer [data-a="start"]').click();
    await page.clock.runFor(61_000);
    await expect(page.locator('#t-timer .t')).toHaveText('00:00');
    await expect(page.locator('#t-timer .ring')).toHaveClass(/done/);
    await expect(page.locator('#t-timer [data-a="start"]')).toHaveText('Iniciar');
  });

  test('zerar volta ao tempo do preset', async ({ page }) => {
    await page.locator('#t-timer [data-a="start"]').click();
    await page.clock.runFor(3000);
    await page.locator('#t-timer [data-a="reset"]').click();
    await expect(page.locator('#t-timer .t')).toHaveText('05:00');
  });

  test('foco: ao acabar passa para a pausa de 5 min e conta o ciclo', async ({ page }) => {
    await expect(page.locator('#t-pomo .t')).toHaveText('25:00');
    await expect(page.locator('#cyc')).toHaveText('Ciclo 1 de 4');
    await page.locator('#t-pomo [data-a="start"]').click();
    await page.clock.runFor(25 * 60 * 1000 + 1000);
    await expect(page.locator('#t-pomo .t')).toHaveText('05:00');
    await expect(page.locator('#modes [data-mode="1"]')).toHaveAttribute('aria-pressed', 'true');
    // termina a pausa curta: volta ao foco e o ciclo avança
    await page.locator('#t-pomo [data-a="start"]').click();
    await page.clock.runFor(5 * 60 * 1000 + 1000);
    await expect(page.locator('#t-pomo .t')).toHaveText('25:00');
    await expect(page.locator('#cyc')).toHaveText('Ciclo 2 de 4');
  });

  test('foco: o quarto ciclo termina numa pausa longa de 15 min', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.locator('#t-pomo [data-a="start"]').click();
      await page.clock.runFor(25 * 60 * 1000 + 1000);
      await page.locator('#t-pomo [data-a="start"]').click();
      await page.clock.runFor(5 * 60 * 1000 + 1000);
    }
    await expect(page.locator('#cyc')).toHaveText('Ciclo 4 de 4');
    await page.locator('#t-pomo [data-a="start"]').click();
    await page.clock.runFor(25 * 60 * 1000 + 1000);
    await expect(page.locator('#t-pomo .t')).toHaveText('15:00');
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
});

test.describe('ferramentas na busca', () => {
  test('somem com filtro e aparecem quando a busca fala de tempo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#s12')).toBeVisible();
    await page.locator('#q').fill('zen');
    await page.waitForTimeout(150);
    await expect(page.locator('#s12')).toBeHidden();
    await page.locator('#q').fill('pomodoro');
    await page.waitForTimeout(150);
    await expect(page.locator('#s12')).toBeVisible();
  });
});

test.describe('som do fim do tempo', () => {
  // Conta quantos osciladores o Web Audio criou: cada nota do sino cria 3.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __osc: number }).__osc = 0;
      const orig = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function (this: AudioContext) {
        (window as unknown as { __osc: number }).__osc++;
        return orig.call(this);
      };
    });
    await page.clock.install({ time: new Date('2026-11-19T12:00:00Z') });
    await page.goto('/');
    await page.locator('#s12').scrollIntoViewIfNeeded();
    await page.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
  });
  const osc = (page: import('@playwright/test').Page) => page.evaluate(() => (window as unknown as { __osc: number }).__osc);

  test('o temporizador toca o sino ao acabar (4 notas)', async ({ page }) => {
    await page.locator('#t-timer .presets button', { hasText: '1 min' }).click();
    await page.locator('#t-timer [data-a="start"]').click();
    expect(await osc(page)).toBe(0);
    await page.clock.runFor(61_000);
    await expect(page.locator('#t-timer .t')).toHaveText('00:00');
    expect(await osc(page)).toBe(12); // 4 notas x 3 parciais
  });

  test('o foco toca um sino que sobe ao acabar o foco', async ({ page }) => {
    await page.locator('#t-pomo [data-a="start"]').click();
    await page.clock.runFor(25 * 60 * 1000 + 1000);
    expect(await osc(page)).toBe(12);
  });

  test('o foco toca um sino que desce ao acabar a pausa (3 notas)', async ({ page }) => {
    await page.locator('#modes [data-mode="1"]').click();
    await page.locator('#t-pomo [data-a="start"]').click();
    await page.clock.runFor(5 * 60 * 1000 + 1000);
    expect(await osc(page)).toBe(9);
  });

  test('desligar o som silencia e o botão lembra a escolha ao recarregar', async ({ page }) => {
    await expect(page.locator('#soundBtn')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#soundBtn').click();
    await expect(page.locator('#soundBtn')).toHaveText('Som desligado');
    const afterToggle = await osc(page);
    await page.locator('#t-timer .presets button', { hasText: '1 min' }).click();
    await page.locator('#t-timer [data-a="start"]').click();
    await page.clock.runFor(61_000);
    await expect(page.locator('#t-timer .t')).toHaveText('00:00');
    expect(await osc(page)).toBe(afterToggle); // nenhum oscilador novo
    await page.reload();
    await page.locator('#s12').scrollIntoViewIfNeeded();
    await page.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
    await expect(page.locator('#soundBtn')).toHaveText('Som desligado');
  });

  test('ligar o som toca o sino de demonstração', async ({ page }) => {
    await page.locator('#soundBtn').click(); // desliga
    const before = await osc(page);
    await page.locator('#soundBtn').click(); // liga e toca
    expect(await osc(page)).toBe(before + 12);
  });
});
