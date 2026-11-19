/** Conversor de texto: cada estilo é uma função pura. Zalgo recebe o gerador de acaso para poder ser testado. */

const chars = (s: string) => Array.from(s);
const mapStr = (s: string, map: Record<string, string>) => chars(s).map((c) => map[c] ?? c).join('');
const zip = (from: string, to: string): Record<string, string> => {
  const f = chars(from), t = chars(to);
  const m: Record<string, string> = {};
  f.forEach((c, i) => (m[c] = t[i]));
  return m;
};

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = LOWER.toUpperCase();
const DIGITS = '0123456789';

function block(upper: number, lower: number, digits: number | null, exceptions: Record<string, string> = {}) {
  return (s: string): string =>
    chars(s)
      .map((c) => {
        if (exceptions[c]) return exceptions[c];
        const code = c.codePointAt(0)!;
        if (code >= 65 && code <= 90) return String.fromCodePoint(upper + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(lower + code - 97);
        if (digits !== null && code >= 48 && code <= 57) return String.fromCodePoint(digits + code - 48);
        return c;
      })
      .join('');
}

export const reverse = (s: string): string => chars(s).reverse().join('');

const SMALL_CAPS = zip(LOWER, 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ');
const SUPER = { ...zip(LOWER, 'ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ'), ...zip(DIGITS, '⁰¹²³⁴⁵⁶⁷⁸⁹'), '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾' };
// Subscrito: o Unicode não tem todas as letras, as que faltam ficam como estão.
const SUB = { ...zip('aehijklmnoprstuvx', 'ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ'), ...zip(DIGITS, '₀₁₂₃₄₅₆₇₈₉'), '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎' };

const FLIP = {
  ...zip(LOWER, 'ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz'),
  ...zip(UPPER, '∀ᗺƆᗡƎℲ⅁HIſ⋊⅂WNOԀΌᴚS⊥∩ΛMX⅄Z'),
  ...zip(DIGITS, '0ƖᄅƐㄣϛ9ㄥ86'),
  '.': '˙', ',': "'", '?': '¿', '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '_': '‾', '&': '⅋',
};
const MIRROR = {
  ...zip('abcdefghijklmnopqrstuvwxyz', 'dbɔbɘꟻgʜijʞlmᴎoqpɿƨƚuvwxyƹ'),
  ...zip(UPPER, 'AᗺƆᗡƎꟻGHIJꓘ⅃MИOꟼϘЯƧTUVWXYƸ'),
  '(': ')', ')': '(', '[': ']', ']': '[', '<': '>', '>': '<', '?': '⸮',
};
const LEET = zip('aAeEgGiIlLoOsStTzZ', '44331166110055773322');

const COMBINING = Array.from({ length: 0x70 }, (_, i) => String.fromCodePoint(0x300 + i));

export function zalgo(s: string, level = 3, rng: () => number = Math.random): string {
  return chars(s)
    .map((c) => {
      if (/\s/.test(c)) return c;
      let out = c;
      const n = Math.max(0, Math.round(level)) * 2 + 1;
      for (let i = 0; i < n; i++) out += COMBINING[Math.floor(rng() * COMBINING.length)];
      return out;
    })
    .join('');
}

const wide = (s: string) =>
  chars(s)
    .map((c) => {
      const code = c.codePointAt(0)!;
      if (code === 32) return '　';
      return code >= 33 && code <= 126 ? String.fromCodePoint(code + 0xfee0) : c;
    })
    .join('');

const circled = (s: string) =>
  chars(s)
    .map((c) => {
      const code = c.codePointAt(0)!;
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x24b6 + code - 65);
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x24d0 + code - 97);
      if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49);
      if (code === 48) return '⓪';
      return c;
    })
    .join('');

export interface TextStyle {
  id: string;
  name: string;
  fn: (s: string, opts?: { zalgo?: number }) => string;
}

export const STYLES: TextStyle[] = [
  { id: 'smallcaps', name: 'Versalete', fn: (s) => mapStr(s.toLowerCase(), SMALL_CAPS) },
  { id: 'super', name: 'Pequenas (sobrescrito)', fn: (s) => mapStr(s.toLowerCase(), SUPER) },
  { id: 'sub', name: 'Subscrito', fn: (s) => mapStr(s.toLowerCase(), SUB) },
  { id: 'reverse', name: 'Invertido', fn: reverse },
  { id: 'mirror', name: 'Espelhado', fn: (s) => mapStr(reverse(s), MIRROR) },
  { id: 'flip', name: 'De cabeça para baixo', fn: (s) => mapStr(reverse(s), FLIP) },
  { id: 'strike', name: 'Riscado', fn: (s) => chars(s).map((c) => (/\s/.test(c) ? c : c + '̶')).join('') },
  { id: 'underline', name: 'Sublinhado', fn: (s) => chars(s).map((c) => (/\s/.test(c) ? c : c + '̲')).join('') },
  { id: 'leet', name: 'Leet', fn: (s) => mapStr(s, LEET) },
  { id: 'zalgo', name: 'Zalgo', fn: (s, o) => zalgo(s, o?.zalgo ?? 3) },
  { id: 'fraktur', name: 'Gótico', fn: block(0x1d504, 0x1d51e, null, { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' }) },
  { id: 'script', name: 'Cursivo', fn: block(0x1d4d0, 0x1d4ea, null) },
  { id: 'bold', name: 'Negrito', fn: block(0x1d400, 0x1d41a, 0x1d7ce) },
  { id: 'italic', name: 'Itálico', fn: block(0x1d434, 0x1d44e, null, { h: 'ℎ' }) },
  { id: 'double', name: 'Contorno duplo', fn: block(0x1d538, 0x1d552, 0x1d7d8, { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' }) },
  { id: 'mono', name: 'Monoespaçado', fn: block(0x1d670, 0x1d68a, 0x1d7f6) },
  { id: 'circle', name: 'Círculos', fn: circled },
  { id: 'wide', name: 'Largo', fn: wide },
];
