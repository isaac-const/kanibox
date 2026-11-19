import type { Page } from '@playwright/test';
import catalogo from '../../src/data/catalogo.json' with { type: 'json' };
import soon from '../../src/data/em-desenvolvimento.json' with { type: 'json' };

type Raw = { name: string; plat: string[]; lic: string; tipo: string; kind: string; loaders?: string[]; grp: string; soon?: boolean };
export const ALL = [...(catalogo as Raw[]), ...(soon as Raw[])];
export const PUBLIC = ALL.filter((i) => !i.soon);
export const TOTAL = PUBLIC.length;

/** Itens da lista que não estão escondidos pelos filtros (inclui os dentro de grupos recolhidos). */
export const visibleItems = (page: Page) => page.locator('#sections [data-id]:not([hidden])');

export async function setTheme(page: Page, theme: string) {
  await page.addInitScript((t) => localStorage.setItem('kb-theme', t), theme);
}

export async function pickFilter(page: Page, field: 'plat' | 'tipo' | 'lic', value: string) {
  await page.locator(`.fchip[data-f="${field}"]`).click();
  await page.locator(`#panel .opt[data-v="${value}"]`).click();
  await page.keyboard.press('Escape');
}

export async function search(page: Page, text: string) {
  await page.locator('#q').fill(text);
  await page.waitForTimeout(150);
}
