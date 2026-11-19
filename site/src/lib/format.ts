const SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function parts(date: string): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new Error(`data inválida: ${date}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

const SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** 2026-11-19 -> "19 nov 2026" (pt) ou "Nov 19, 2026" (en). Não depende de locale nem de fuso. */
export function shortDate(date: string, lang: 'pt' | 'en' = 'pt'): string {
  const [y, m, d] = parts(date);
  return lang === 'en' ? `${SHORT_EN[m - 1]} ${d}, ${y}` : `${d} ${SHORT[m - 1]} ${y}`;
}

/** 2026-11-19 -> "19 de novembro de 2026". */
export function longDate(date: string, lang: 'pt' | 'en' = 'pt'): string {
  const [y, m, d] = parts(date);
  return lang === 'en' ? `${LONG_EN[m - 1]} ${d}, ${y}` : `${d} de ${LONG[m - 1]} de ${y}`;
}
