/**
 * Contagem de tempo com partes opcionais.
 * Quem informa só parte da data quer o "próximo" (ou o "último") instante que combine:
 *  - só o mês: o próximo dia 1 daquele mês, às 00:00;
 *  - só o dia: o próximo dia com esse número;
 *  - só a hora: a próxima vez que o relógio marca essa hora;
 *  - campos menos importantes que o menor informado valem o mínimo (dia 1, hora 0, minuto 0);
 *  - campos mais importantes que o menor informado, se vazios, ficam livres e a busca acha o mais próximo.
 */
export interface Parts {
  y?: number;
  mo?: number; // 1 a 12
  d?: number;
  h?: number;
  mi?: number;
}
export type Direction = 'next' | 'prev';

const ORDER = ['y', 'mo', 'd', 'h', 'mi'] as const;
type Key = (typeof ORDER)[number];

export const daysIn = (y: number, mo: number): number => new Date(y, mo, 0).getDate();

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Menor campo informado, ou -1 se nada foi informado. */
function lowest(p: Parts): number {
  let low = -1;
  ORDER.forEach((k, i) => {
    if (isNum(p[k])) low = i;
  });
  return low;
}

function range(p: Parts, k: Key, i: number, low: number, now: Date, dir: Direction): number[] {
  const v = p[k];
  if (isNum(v)) return [v];
  if (i > low) return [k === 'mo' || k === 'd' ? 1 : 0]; // menos importante que o menor informado: mínimo
  // livre
  let list: number[];
  switch (k) {
    case 'y': {
      const y = now.getFullYear();
      list = Array.from({ length: 31 }, (_, n) => (dir === 'next' ? y + n : y - n));
      return dir === 'next' ? list : list.slice().reverse().reverse();
    }
    case 'mo':
      list = Array.from({ length: 12 }, (_, n) => n + 1);
      break;
    case 'd':
      list = Array.from({ length: 31 }, (_, n) => n + 1);
      break;
    case 'h':
      list = Array.from({ length: 24 }, (_, n) => n);
      break;
    default:
      list = Array.from({ length: 60 }, (_, n) => n);
  }
  return list;
}

/** Instante alvo, ou null se não der (nada informado, data impossível ou fora de 30 anos). */
export function targetFrom(p: Parts, now: Date, dir: Direction = 'next'): Date | null {
  const low = lowest(p);
  if (low < 0) return null;
  const lists = ORDER.map((k, i) => range(p, k, i, low, now, dir));
  const prev = dir === 'prev';
  // para "prev" percorremos do mais novo para o mais antigo
  const walk = (a: number[], isYear: boolean) => (prev ? (isYear ? a : a.slice().reverse()) : a);
  const ys = walk(lists[0], true);
  let best: Date | null = null;
  for (const y of ys) {
    for (const mo of walk(lists[1], false)) {
      if (mo < 1 || mo > 12) continue;
      for (const d of walk(lists[2], false)) {
        if (d < 1 || d > daysIn(y, mo)) continue;
        for (const h of walk(lists[3], false)) {
          if (h < 0 || h > 23) continue;
          for (const mi of walk(lists[4], false)) {
            if (mi < 0 || mi > 59) continue;
            const c = new Date(y, mo - 1, d, h, mi, 0, 0);
            if (c.getFullYear() !== y) continue;
            if (!prev && c.getTime() >= now.getTime()) {
              best = c;
              return best;
            }
            if (prev && c.getTime() <= now.getTime()) {
              best = c;
              return best;
            }
          }
        }
      }
    }
    // ano fixo e já passou do alcance: o loop de anos termina com um único ano
  }
  return best;
}

/** Instante exato quando todos os campos foram informados (aceita passado). */
export function exactFrom(p: Parts): Date | null {
  if (![p.y, p.mo, p.d].every(isNum)) return null;
  const y = p.y!, mo = p.mo!, d = p.d!, h = isNum(p.h) ? p.h : 0, mi = isNum(p.mi) ? p.mi : 0;
  if (mo < 1 || mo > 12 || d < 1 || d > daysIn(y, mo) || h < 0 || h > 23 || mi < 0 || mi > 59) return null;
  return new Date(y, mo - 1, d, h, mi, 0, 0);
}

/** Soma meses, com o dia limitado ao fim do mês (31 jan + 1 mês = 28 fev). */
export function addMonths(date: Date, n: number): Date {
  const total = date.getMonth() + n;
  const y = date.getFullYear() + Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12;
  const d = Math.min(date.getDate(), daysIn(y, m + 1));
  return new Date(y, m, d, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
}

export interface Breakdown {
  y: number;
  mo: number;
  d: number;
  h: number;
  mi: number;
  s: number;
  totalDays: number;
  totalMs: number;
}

/** Diferença entre duas datas (a <= b) em anos, meses, dias, horas, minutos e segundos de calendário. */
export function diffParts(a: Date, b: Date): Breakdown {
  const totalMs = Math.max(0, b.getTime() - a.getTime());
  if (totalMs === 0) return { y: 0, mo: 0, d: 0, h: 0, mi: 0, s: 0, totalDays: 0, totalMs: 0 };
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (addMonths(a, months).getTime() > b.getTime()) months--;
  const base = addMonths(a, months);
  let rest = Math.floor((b.getTime() - base.getTime()) / 1000);
  const d = Math.floor(rest / 86400);
  rest -= d * 86400;
  const h = Math.floor(rest / 3600);
  rest -= h * 3600;
  const mi = Math.floor(rest / 60);
  const s = rest - mi * 60;
  return { y: Math.floor(months / 12), mo: months % 12, d, h, mi, s, totalDays: Math.floor(totalMs / 86400000), totalMs };
}

export interface Result {
  target: Date;
  /** true se o alvo está no futuro */
  future: boolean;
  parts: Breakdown;
}

/** Resolve o que o usuário digitou. Com ano, mês e dia informados usa a data exata (passado ou futuro). */
export function resolve(p: Parts, now: Date, dir: Direction = 'next'): Result | null {
  const exact = exactFrom(p);
  const target = exact ?? targetFrom(p, now, dir);
  if (!target) return null;
  const future = target.getTime() >= now.getTime();
  return { target, future, parts: future ? diffParts(now, target) : diffParts(target, now) };
}
