/** Calculadora: analisador próprio, sem eval. Os erros são códigos: div0, paren, incomplete, unknown:nome, use:nome, empty, trailing, invalid. */
const FUNCS: Record<string, (x: number, deg: boolean) => number> = {
  sqrt: (x) => Math.sqrt(x),
  abs: (x) => Math.abs(x),
  ln: (x) => Math.log(x),
  log: (x) => Math.log10(x),
  round: (x) => Math.round(x),
  floor: (x) => Math.floor(x),
  ceil: (x) => Math.ceil(x),
  sin: (x, d) => Math.sin(d ? (x * Math.PI) / 180 : x),
  cos: (x, d) => Math.cos(d ? (x * Math.PI) / 180 : x),
  tan: (x, d) => Math.tan(d ? (x * Math.PI) / 180 : x),
};
const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E };

export function evaluate(input: string, degrees = false): number {
  const src = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.').replace(/π/g, 'pi').replace(/√/g, 'sqrt').toLowerCase();
  let i = 0;
  const ws = () => { while (src[i] === ' ') i++; };
  const peek = () => { ws(); return src[i]; };
  const fail = (m: string): never => { throw new Error(m); };

  function expr(): number {
    let v = term();
    for (;;) {
      const c = peek();
      if (c === '+') { i++; v += term(); }
      else if (c === '-') { i++; v -= term(); }
      else return v;
    }
  }
  function term(): number {
    let v = unary();
    for (;;) {
      const c = peek();
      if (c === '*') { i++; v *= unary(); }
      else if (c === '/') { i++; const r = unary(); if (r === 0) fail('div0'); v /= r; }
      else return v;
    }
  }
  function unary(): number {
    const c = peek();
    if (c === '-') { i++; return -unary(); }
    if (c === '+') { i++; return unary(); }
    return power();
  }
  function power(): number {
    const base = postfix();
    if (peek() === '^') { i++; return Math.pow(base, unary()); }
    return base;
  }
  function postfix(): number {
    let v = primary();
    while (peek() === '%') { i++; v /= 100; }
    return v;
  }
  function primary(): number {
    const c = peek();
    if (c === '(') {
      i++;
      const v = expr();
      if (peek() !== ')') fail('paren');
      i++;
      return v;
    }
    const num = /^\d*\.?\d+(e[+-]?\d+)?|^\d+\./.exec(src.slice(i));
    if (num && /[\d.]/.test(c ?? '')) { i += num[0].length; return parseFloat(num[0]); }
    const id = /^[a-z]+/.exec(src.slice(i));
    if (id) {
      const name = id[0];
      i += name.length;
      if (name in CONSTS) return CONSTS[name];
      if (name in FUNCS) {
        if (peek() !== '(') fail(`use:${name}`);
        i++;
        const arg = expr();
        if (peek() !== ')') fail('paren');
        i++;
        return FUNCS[name](arg, degrees);
      }
      fail(`unknown:${name}`);
    }
    return fail('incomplete');
  }

  if (!src.trim()) fail('empty');
  const v = expr();
  if (peek() !== undefined) fail('trailing');
  if (!Number.isFinite(v)) fail('invalid');
  return v;
}

/** Regra de três simples. Direta: A está para B como C está para X. Inversa: o produto é constante. */
export function ruleOfThree(a: number, b: number, c: number, inverse = false): number {
  if (inverse) {
    if (c === 0) throw new Error('div0');
    return (a * b) / c;
  }
  if (a === 0) throw new Error('div0');
  return (b * c) / a;
}
