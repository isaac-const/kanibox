const SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function parts(date: string): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new Error(`data inválida: ${date}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** 2026-11-19 -> "19 nov 2026". Não depende de locale nem de fuso. */
export function shortDate(date: string): string {
  const [y, m, d] = parts(date);
  return `${d} ${SHORT[m - 1]} ${y}`;
}

/** 2026-11-19 -> "19 de novembro de 2026". */
export function longDate(date: string): string {
  const [y, m, d] = parts(date);
  return `${d} de ${LONG[m - 1]} de ${y}`;
}
