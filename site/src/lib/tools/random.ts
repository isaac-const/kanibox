/** Sorteios. O gerador de acaso é injetável para testes; o padrão usa crypto. */
export type Rng = () => number;

export const cryptoRng: Rng = () => {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] / 4294967296;
};

export function randomInt(min: number, max: number, rng: Rng = cryptoRng): number {
  if (!Number.isInteger(min) || !Number.isInteger(max)) throw new Error('use números inteiros');
  if (min > max) [min, max] = [max, min];
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number, decimals = 2, rng: Rng = cryptoRng): number {
  if (min > max) [min, max] = [max, min];
  const v = min + rng() * (max - min);
  return Number(v.toFixed(decimals));
}

/** Embaralha sem alterar a lista original (Fisher-Yates). */
export function shuffle<T>(list: readonly T[], rng: Rng = cryptoRng): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(list: readonly T[], n: number, rng: Rng = cryptoRng): T[] {
  return shuffle(list, rng).slice(0, Math.max(0, Math.min(n, list.length)));
}

/** Números inteiros sem repetição dentro do intervalo. */
export function uniqueInts(min: number, max: number, count: number, rng: Rng = cryptoRng): number[] {
  if (min > max) [min, max] = [max, min];
  const size = max - min + 1;
  if (count > size) throw new Error(`só existem ${size} números diferentes nesse intervalo`);
  return pick(Array.from({ length: size }, (_, i) => min + i), count, rng);
}

/** Uma linha por item ou separados por vírgula/ponto e vírgula. Ignora vazios e espaços. */
export function parseList(text: string): string[] {
  return text.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
}
