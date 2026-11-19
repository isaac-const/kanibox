import type { Lang } from '../i18n';
import { SECTIONS, type SectionDef } from './sections';

/** Prefixa o caminho com a base do site (ex.: /kanibox no GitHub Pages). */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const withBase = (path: string): string => `${base}${path.startsWith('/') ? path : `/${path}`}`;

const prefix = (lang: Lang) => (lang === 'en' ? '/en' : '');

export type Page = 'home' | 'news' | 'about' | 'rss' | SectionDef;

/** Endereço de uma página no idioma pedido. Sempre termina em / (menos o feed). */
export function route(lang: Lang, page: Page): string {
  if (page === 'home') return withBase(`${prefix(lang)}/`);
  if (page === 'rss') return withBase(`${prefix(lang)}/rss.xml`);
  if (page === 'news') return withBase(`${prefix(lang)}/${lang === 'en' ? 'news' : 'novidades'}/`);
  if (page === 'about') return withBase(`${prefix(lang)}/${lang === 'en' ? 'about' : 'sobre'}/`);
  return withBase(`${prefix(lang)}/${page.slug[lang]}/`);
}

export const sectionById = (id: number): SectionDef => SECTIONS.find((s) => s.id === id)!;
