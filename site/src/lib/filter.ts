/**
 * Lógica de busca e filtros. Função pura, sem DOM: roda no navegador e nos testes.
 * Regras:
 *  - os três filtros (plataforma, tipo, licença) combinam em E entre si e em OU dentro de cada um;
 *  - item sem plataforma ou sem licença informada não passa quando o filtro correspondente está ligado;
 *  - a busca exige todas as palavras, sem diferenciar maiúscula nem acento.
 */

export interface IndexEntry {
  id: string;
  /** seção */
  s: number;
  /** grupo */
  g: string;
  /** plataformas */
  p: string[];
  /** tipo */
  t: string;
  /** licença */
  l: string;
  /** texto de busca, já normalizado */
  q: string;
  /** app ainda em desenvolvimento: não entra nas contagens */
  n?: boolean;
  /** loaders (só mods) */
  ld?: string[];
}

export interface FilterState {
  q: string;
  plat: Set<string>;
  tipo: Set<string>;
  lic: Set<string>;
}

export const emptyState = (): FilterState => ({ q: '', plat: new Set(), tipo: new Set(), lic: new Set() });

export const norm = (s: string): string =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

export const filtersOn = (st: FilterState): boolean => st.plat.size + st.tipo.size + st.lic.size > 0;
export const isActive = (st: FilterState): boolean => filtersOn(st) || st.q !== '';

export function matches(e: IndexEntry, st: FilterState): boolean {
  if (st.plat.size && !e.p.some((p) => st.plat.has(p))) return false;
  if (st.tipo.size && !st.tipo.has(e.t)) return false;
  if (st.lic.size && !st.lic.has(e.l)) return false;
  if (st.q) {
    const words = st.q.split(/\s+/).filter(Boolean);
    if (!words.every((w) => e.q.includes(w))) return false;
  }
  return true;
}

export interface Result {
  visible: Set<string>;
  /** itens visíveis por seção (inclui apps em desenvolvimento) */
  bySection: Map<number, number>;
  /** itens visíveis por seção e grupo */
  byGroup: Map<string, number>;
  /** visíveis sem contar apps em desenvolvimento */
  shown: number;
  /** total sem contar apps em desenvolvimento */
  total: number;
}

export const groupKey = (s: number, g: string): string => `${s}|${g}`;

export function apply(index: IndexEntry[], st: FilterState): Result {
  const visible = new Set<string>();
  const bySection = new Map<number, number>();
  const byGroup = new Map<string, number>();
  let shown = 0;
  let total = 0;
  for (const e of index) {
    if (!e.n) total++;
    if (!matches(e, st)) continue;
    visible.add(e.id);
    bySection.set(e.s, (bySection.get(e.s) ?? 0) + 1);
    const k = groupKey(e.s, e.g);
    byGroup.set(k, (byGroup.get(k) ?? 0) + 1);
    if (!e.n) shown++;
  }
  return { visible, bySection, byGroup, shown, total };
}

export type FilterField = 'plat' | 'tipo' | 'lic';

const PLAT_ORDER = ['Linux', 'Windows', 'macOS', 'Android', 'iOS', 'Web', 'Nintendo', 'PlayStation'];
const LIC_ORDER = ['Código aberto', 'Grátis', 'Freemium', 'Pago'];

/** Opções de um filtro com a contagem sobre o catálogo inteiro. */
export function optionsFor(index: IndexEntry[], field: FilterField): [string, number][] {
  const count = new Map<string, number>();
  for (const e of index) {
    const values = field === 'plat' ? e.p : [field === 'tipo' ? e.t : e.l];
    for (const v of values) if (v) count.set(v, (count.get(v) ?? 0) + 1);
  }
  const arr = [...count];
  if (field === 'plat') arr.sort((a, b) => PLAT_ORDER.indexOf(a[0]) - PLAT_ORDER.indexOf(b[0]));
  else if (field === 'lic') arr.sort((a, b) => LIC_ORDER.indexOf(a[0]) - LIC_ORDER.indexOf(b[0]));
  else arr.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'));
  return arr;
}

/** Resumo do filtro de loader dos mods: quantos têm o loader escolhido. */
export function loaderSummary(mods: IndexEntry[], loader: string): { ok: number; total: number; missing: string[] } {
  const total = mods.length;
  if (loader === 'todos') return { ok: total, total, missing: [] };
  const missing = mods.filter((m) => !(m.ld ?? []).includes(loader)).map((m) => m.id);
  return { ok: total - missing.length, total, missing };
}

/** Serializa o estado para a URL (?q=...&plat=Linux,Windows). */
export function toParams(st: FilterState, loader = 'todos'): URLSearchParams {
  const p = new URLSearchParams();
  if (st.q) p.set('q', st.q);
  if (st.plat.size) p.set('plat', [...st.plat].join(','));
  if (st.tipo.size) p.set('tipo', [...st.tipo].join(','));
  if (st.lic.size) p.set('lic', [...st.lic].join(','));
  if (loader !== 'todos') p.set('ld', loader);
  return p;
}

export function fromParams(p: URLSearchParams): { state: FilterState; loader: string } {
  const st = emptyState();
  st.q = norm(p.get('q') ?? '');
  for (const f of ['plat', 'tipo', 'lic'] as const) {
    for (const v of (p.get(f) ?? '').split(',')) if (v) st[f].add(v);
  }
  const ld = p.get('ld') ?? 'todos';
  return { state: st, loader: ['todos', 'fabric', 'forge', 'neoforge', 'quilt'].includes(ld) ? ld : 'todos' };
}

/** Palavras que fazem a seção Ferramentas aparecer na busca. */
export const TOOLS_WORDS = /tempo|timer|cronometro|temporizador|foco|pomodoro|ferramenta|sorteio|sortear|roleta|calculadora|conversor|unidade|regra|aleatorio|numero|texto|zalgo|versalete|quanto falta|contagem|data|sim ou nao/;
export function toolsVisible(st: FilterState): boolean {
  if (filtersOn(st)) return false;
  return !st.q || TOOLS_WORDS.test(st.q);
}
