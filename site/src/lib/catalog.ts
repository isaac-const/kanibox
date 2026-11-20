import raw from '../data/catalogo.json';
import soonRaw from '../data/em-desenvolvimento.json';
import { catalogSchema, type RawItem } from './schema';
import { SECTIONS, GROUP_ORDER, TOP_ORDER, TOOLS_SECTION_ID, type SectionDef } from './sections';
import { t, type Lang } from '../i18n';
import { norm, type IndexEntry } from './filter';

/** Data do lote inicial do catálogo. Itens sem `added` entram com ela. */
export const INITIAL_BATCH = '2026-11-19';

export interface Item extends RawItem {
  id: string;
  added: string;
}

const slug = (s: string) =>
  norm(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function build(): Item[] {
  // Falha o build se qualquer item estiver fora do formato.
  const parsed = catalogSchema.parse([...(raw as unknown[]), ...(soonRaw as unknown[])]);
  const seen = new Map<string, number>();
  return parsed.map((it) => {
    const base = `${it.sec}-${slug(it.name)}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return { ...it, id: n === 1 ? base : `${base}-${n}`, added: it.added ?? INITIAL_BATCH };
  });
}

export const ITEMS: Item[] = build();

/** Total mostrado ao público: não conta apps em desenvolvimento. */
export const TOTAL = ITEMS.filter((i) => !i.soon).length;

export const sectionOf = (id: number): SectionDef => SECTIONS.find((s) => s.id === id)!;

/** Texto de um item no idioma pedido. A chave de filtro continua sendo o valor em português. */
export function loc(i: Item, lang: Lang) {
  return {
    note: lang === 'en' ? i.note_en ?? i.note : i.note,
    tipo: lang === 'en' ? i.tipo_en ?? i.tipo : i.tipo,
    grp: lang === 'en' ? i.grp_en ?? i.grp : i.grp,
  };
}

export type GroupView = 'list' | 'tiles' | 'mods';

export interface Group {
  key: string;
  /** nome em português: é a chave de ordenação e de abas */
  name: string;
  label: string;
  view: GroupView;
  items: Item[];
}

/** Grupos de uma seção, na ordem definida (ou na de aparição nos dados). */
export function groupsOf(secId: number, lang: Lang = 'pt'): Group[] {
  const items = ITEMS.filter((i) => i.sec === secId);
  const order = GROUP_ORDER[secId] ?? [];
  const names = [...new Set(items.map((i) => i.grp))].sort(
    (a, b) => (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b))
  );
  return names.map((name) => {
    const list = items.filter((i) => i.grp === name);
    const view: GroupView = list[0].kind === 'game' ? 'tiles' : name === 'Mods' ? 'mods' : 'list';
    return { key: `${secId}|${name}`, name, label: loc(list[0], lang).grp, view, items: list };
  });
}

/** Índice leve enviado ao navegador para busca e filtros. O texto de busca é do idioma da página. */
export function filterIndex(lang: Lang, secId?: number): IndexEntry[] {
  return ITEMS.filter((i) => secId === undefined || i.sec === secId).map((i) => {
    const l = loc(i, lang);
    return {
      id: i.id,
      s: i.sec,
      g: i.grp,
      p: i.plat,
      t: i.tipo,
      l: i.lic,
      q: norm([i.name, l.tipo, l.grp, i.host, l.note, sectionOf(i.sec).title[lang], i.via].join(' ')),
      ...(i.soon ? { n: true } : {}),
      ...(i.loaders && i.loaders.length ? { ld: i.loaders } : {}),
    };
  });
}

/** Rótulos dos valores de filtro no idioma da página (os valores em si ficam em português). */
export function filterLabels(lang: Lang): Record<string, string> {
  const m: Record<string, string> = {};
  for (const l of ['Código aberto', 'Grátis', 'Freemium', 'Pago']) m[l] = t(lang, `lic.${l}`);
  for (const i of ITEMS) m[i.tipo] = loc(i, lang).tipo;
  return m;
}

/** Destaques do topo, na ordem que escolhi. */
export const TOP_ITEMS: Item[] = TOP_ORDER.map((n) => ITEMS.find((i) => i.name === n && !i.soon)).filter((i): i is Item => Boolean(i));

export const countIn = (secId: number) => ITEMS.filter((i) => i.sec === secId).length;

export { SECTIONS, TOOLS_SECTION_ID };

/** Entradas do log de novidades, da mais nova para a mais antiga. */
export function batches() {
  const by = new Map<string, Item[]>();
  for (const it of ITEMS) {
    if (it.soon) continue;
    by.set(it.added, [...(by.get(it.added) ?? []), it]);
  }
  return [...by.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({
      date,
      items,
      bySection: SECTIONS.map((s) => ({ section: s, count: items.filter((i) => i.sec === s.id).length })).filter((x) => x.count > 0),
    }));
}
