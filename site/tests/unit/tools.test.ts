import { describe, expect, it } from 'vitest';
import { addMonths, diffParts, exactFrom, resolve, targetFrom } from '../../src/lib/tools/timecalc';
import { STYLES, reverse, zalgo } from '../../src/lib/tools/textstyles';
import { CATEGORIES, convert, fmt } from '../../src/lib/tools/units';
import { evaluate, ruleOfThree } from '../../src/lib/tools/calc';
import { parseList, pick, randomInt, shuffle, uniqueInts } from '../../src/lib/tools/random';

const now = new Date(2026, 10, 19, 12, 0, 0); // 19 nov 2026, 12:00
const iso = (d: Date | null) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : null);

describe('contagem de tempo com partes opcionais', () => {
  it('só o mês: o próximo dia 1 daquele mês', () => {
    expect(iso(targetFrom({ mo: 12 }, now))).toBe('2026-12-01 00:00');
    expect(iso(targetFrom({ mo: 11 }, now))).toBe('2027-11-01 00:00'); // este mês já começou
    expect(iso(targetFrom({ mo: 1 }, now))).toBe('2027-01-01 00:00');
  });
  it('só o dia: o próximo dia com esse número', () => {
    expect(iso(targetFrom({ d: 25 }, now))).toBe('2026-11-25 00:00');
    expect(iso(targetFrom({ d: 5 }, now))).toBe('2026-12-05 00:00');
    expect(iso(targetFrom({ d: 31 }, now))).toBe('2026-12-31 00:00'); // novembro não tem 31
  });
  it('só a hora: a próxima vez que o relógio marca', () => {
    expect(iso(targetFrom({ h: 18 }, now))).toBe('2026-11-19 18:00');
    expect(iso(targetFrom({ h: 8 }, now))).toBe('2026-11-20 08:00');
    expect(iso(targetFrom({ h: 12 }, now))).toBe('2026-11-19 12:00'); // agora mesmo conta
  });
  it('só o minuto', () => {
    expect(iso(targetFrom({ mi: 30 }, now))).toBe('2026-11-19 12:30');
  });
  it('mês e dia sem ano: próximo aniversário, inclusive 29 de fevereiro', () => {
    expect(iso(targetFrom({ mo: 3, d: 10 }, now))).toBe('2027-03-10 00:00');
    expect(iso(targetFrom({ mo: 2, d: 29 }, now))).toBe('2028-02-29 00:00');
  });
  it('dia e hora sem mês e ano', () => {
    expect(iso(targetFrom({ d: 20, h: 9 }, now))).toBe('2026-11-20 09:00');
  });
  it('ano fixo com mês: o primeiro dia daquele mês', () => {
    expect(iso(targetFrom({ y: 2030, mo: 6 }, now))).toBe('2030-06-01 00:00');
  });
  it('"último" procura para trás', () => {
    expect(iso(targetFrom({ mo: 3 }, now, 'prev'))).toBe('2026-03-01 00:00');
    expect(iso(targetFrom({ mo: 12 }, now, 'prev'))).toBe('2025-12-01 00:00');
    expect(iso(targetFrom({ h: 15 }, now, 'prev'))).toBe('2026-11-18 15:00');
  });
  it('nada informado ou data impossível devolve null', () => {
    expect(targetFrom({}, now)).toBeNull();
    expect(exactFrom({ y: 2026, mo: 2, d: 30 })).toBeNull();
    expect(exactFrom({ y: 2026, mo: 13, d: 1 })).toBeNull();
    expect(exactFrom({ mo: 1, d: 1 })).toBeNull();
  });
  it('data completa aceita passado e usa hora e minuto opcionais', () => {
    expect(iso(exactFrom({ y: 2020, mo: 5, d: 17 }))).toBe('2020-05-17 00:00');
    expect(iso(exactFrom({ y: 2020, mo: 5, d: 17, h: 8, mi: 30 }))).toBe('2020-05-17 08:30');
    const r = resolve({ y: 2020, mo: 5, d: 17 }, now)!;
    expect(r.future).toBe(false);
    expect(r.parts.y).toBe(6);
  });
});

describe('diferença de calendário', () => {
  it('anos, meses, dias, horas, minutos e segundos', () => {
    const p = diffParts(new Date(2026, 0, 1), new Date(2027, 2, 4, 5, 6, 7));
    expect([p.y, p.mo, p.d, p.h, p.mi, p.s]).toEqual([1, 2, 3, 5, 6, 7]);
  });
  it('31 de janeiro até 1º de março conta fevereiro com o dia limitado', () => {
    const p = diffParts(new Date(2026, 0, 31), new Date(2026, 2, 1));
    expect([p.mo, p.d]).toEqual([1, 1]);
  });
  it('mesmo instante e total de dias', () => {
    expect(diffParts(now, now).totalMs).toBe(0);
    expect(diffParts(new Date(2026, 0, 1), new Date(2026, 0, 11)).totalDays).toBe(10);
  });
  it('addMonths limita o dia ao fim do mês', () => {
    expect(addMonths(new Date(2026, 0, 31), 1).getDate()).toBe(28);
    expect(addMonths(new Date(2026, 10, 15), 3).getMonth()).toBe(1);
  });
});

describe('estilos de texto (os exemplos do Isaac)', () => {
  const by = (id: string, s: string, o?: { zalgo?: number }) => STYLES.find((x) => x.id === id)!.fn(s, o);
  it('versalete, sobrescrito, subscrito', () => {
    expect(by('smallcaps', 'hello world')).toBe('ʜᴇʟʟᴏ ᴡᴏʀʟᴅ');
    expect(by('super', 'hello world')).toBe('ʰᵉˡˡᵒ ʷᵒʳˡᵈ');
    expect(by('sub', 'hello world')).toBe('ₕₑₗₗₒ wₒᵣₗd');
  });
  it('invertido, espelhado e de cabeça para baixo mudam a ordem', () => {
    expect(by('reverse', 'Hello world')).toBe('dlrow olleH');
    expect(reverse('abc')).toBe('cba');
    expect(by('flip', 'hello')).toBe('ollǝɥ');
    expect(by('mirror', 'ab').length).toBe(2);
  });
  it('gótico', () => {
    expect(by('fraktur', 'Hello world')).toBe('ℌ𝔢𝔩𝔩𝔬 𝔴𝔬𝔯𝔩𝔡');
  });
  it('riscado e sublinhado preservam espaços', () => {
    expect(by('strike', 'a b')).toBe('a̶ b̶');
    expect(by('underline', 'a b')).toBe('a̲ b̲');
  });
  it('leet', () => {
    expect(by('leet', 'leet')).toBe('1337');
  });
  it('zalgo mantém as letras e acrescenta marcas combinantes', () => {
    const z = zalgo('Hi', 2, () => 0.5);
    expect(z.normalize('NFD').replace(/[̀-ͯ]/g, '')).toBe('Hi');
    expect(z.length).toBeGreaterThan(2);
    expect(zalgo('a b', 1, () => 0.1)).toContain(' ');
  });
  it('estilos Unicode em bloco', () => {
    expect(by('bold', 'Ab1')).toBe('𝐀𝐛𝟏');
    expect(by('double', 'CNa')).toBe('ℂℕ𝕒');
    expect(by('italic', 'h')).toBe('ℎ');
    expect(by('wide', 'a b')).toBe('ａ　ｂ');
    expect(by('circle', 'a1')).toBe('ⓐ①');
  });
  it('todo estilo devolve texto e não quebra com vazio, emoji ou acento', () => {
    for (const s of STYLES) {
      expect(typeof s.fn('', { zalgo: 2 })).toBe('string');
      expect(s.fn('olá 😀 mundo', { zalgo: 1 }).length).toBeGreaterThan(0);
    }
  });
});

describe('unidades', () => {
  const cat = (id: string) => CATEGORIES.find((c) => c.id === id)!;
  it('comprimento, massa e dados', () => {
    expect(convert(1, cat('len'), 'mi', 'km')).toBeCloseTo(1.609344, 9);
    expect(convert(1000, cat('mass'), 'g', 'kg')).toBeCloseTo(1, 9);
    expect(convert(1, cat('data'), 'GiB', 'MB')).toBeCloseTo(1073.741824, 6);
  });
  it('temperatura', () => {
    expect(convert(100, cat('temp'), 'c', 'f')).toBeCloseTo(212, 9);
    expect(convert(0, cat('temp'), 'c', 'k')).toBeCloseTo(273.15, 9);
    expect(convert(32, cat('temp'), 'f', 'c')).toBeCloseTo(0, 9);
  });
  it('ida e volta fecha em toda categoria', () => {
    for (const c of CATEGORIES) {
      const [a, b] = [c.units[0].id, c.units[c.units.length - 1].id];
      expect(convert(convert(7.5, c, a, b), c, b, a), c.name).toBeCloseTo(7.5, 6);
    }
  });
  it('ids únicos por categoria e formatação sem ruído', () => {
    for (const c of CATEGORIES) expect(new Set(c.units.map((u) => u.id)).size, c.name).toBe(c.units.length);
    expect(fmt(0.1 + 0.2)).toBe('0.3');
    expect(fmt(1609.344)).toBe('1609.344');
    expect(fmt(NaN)).toBe('—');
  });
});

describe('calculadora', () => {
  it('precedência, parênteses, potência e unário', () => {
    expect(evaluate('2+3*4')).toBe(14);
    expect(evaluate('(2+3)*4')).toBe(20);
    expect(evaluate('2^3^2')).toBe(512);
    expect(evaluate('-2^2')).toBe(-4);
    expect(evaluate('10/4')).toBe(2.5);
    expect(evaluate('1,5+1,5')).toBe(3);
  });
  it('porcentagem, funções e constantes', () => {
    expect(evaluate('50%')).toBe(0.5);
    expect(evaluate('200*10%')).toBe(20);
    expect(evaluate('sqrt(16)+1')).toBe(5);
    expect(evaluate('pi*2')).toBeCloseTo(6.283185307, 8);
    expect(evaluate('sin(90)', true)).toBeCloseTo(1, 9);
    expect(evaluate('abs(-3)')).toBe(3);
  });
  it('erros claros, sem eval', () => {
    expect(() => evaluate('1/0')).toThrow('divisão por zero');
    expect(() => evaluate('2+')).toThrow();
    expect(() => evaluate('(1+2')).toThrow('parêntese');
    expect(() => evaluate('foo(1)')).toThrow();
    expect(() => evaluate('alert(1)')).toThrow();
    expect(() => evaluate('')).toThrow();
    expect(() => evaluate('1 2')).toThrow();
  });
  it('regra de três direta e inversa', () => {
    expect(ruleOfThree(2, 10, 6)).toBe(30);
    expect(ruleOfThree(4, 6, 8, true)).toBe(3); // 4 operários em 6 dias, 8 operários em 3 dias
    expect(() => ruleOfThree(0, 1, 1)).toThrow();
    expect(() => ruleOfThree(1, 1, 0, true)).toThrow();
  });
});

describe('sorteios', () => {
  const seq = (...v: number[]) => { let i = 0; return () => v[i++ % v.length]; };
  it('inteiro dentro do intervalo, inclusive nas pontas', () => {
    expect(randomInt(1, 6, () => 0)).toBe(1);
    expect(randomInt(1, 6, () => 0.999999)).toBe(6);
    expect(randomInt(6, 1, () => 0)).toBe(1); // troca os extremos
    expect(() => randomInt(1.5, 3)).toThrow();
  });
  it('sem repetição e com limite', () => {
    const n = uniqueInts(1, 10, 10);
    expect([...n].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(() => uniqueInts(1, 3, 4)).toThrow('só existem 3');
  });
  it('embaralhar preserva os itens e não altera a lista original', () => {
    const l = [1, 2, 3, 4, 5];
    expect(shuffle(l, seq(0.3, 0.7, 0.1, 0.9)).sort()).toEqual(l);
    expect(l).toEqual([1, 2, 3, 4, 5]);
    expect(pick(['a', 'b', 'c'], 2)).toHaveLength(2);
    expect(pick(['a'], 5)).toHaveLength(1);
  });
  it('lista por linha, vírgula ou ponto e vírgula', () => {
    expect(parseList('Ana, Bia;\n Caio \n\n')).toEqual(['Ana', 'Bia', 'Caio']);
  });
});
