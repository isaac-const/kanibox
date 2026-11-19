/** Conversão de unidades: cada unidade tem um fator para a unidade base da categoria. Temperatura é caso à parte. */
export interface Unit {
  id: string;
  name: string;
  en?: string;
  /** quantas unidades base cabem em 1 desta unidade */
  f: number;
}
export interface Category {
  id: string;
  name: string;
  en: string;
  units: Unit[];
  special?: 'temp';
}

const u = (id: string, name: string, f: number): Unit => ({ id, name, f });

export const CATEGORIES: Category[] = [
  { id: 'len', en: 'Length', name: 'Comprimento', units: [u('mm', 'milímetro (mm)', 0.001), u('cm', 'centímetro (cm)', 0.01), u('m', 'metro (m)', 1), u('km', 'quilômetro (km)', 1000), u('in', 'polegada (in)', 0.0254), u('ft', 'pé (ft)', 0.3048), u('yd', 'jarda (yd)', 0.9144), u('mi', 'milha (mi)', 1609.344), u('nmi', 'milha náutica', 1852)] },
  { id: 'mass', en: 'Mass', name: 'Massa', units: [u('mg', 'miligrama (mg)', 1e-6), u('g', 'grama (g)', 0.001), u('kg', 'quilograma (kg)', 1), u('t', 'tonelada (t)', 1000), u('oz', 'onça (oz)', 0.028349523125), u('lb', 'libra (lb)', 0.45359237)] },
  { id: 'vol', en: 'Volume', name: 'Volume', units: [u('ml', 'mililitro (mL)', 0.001), u('l', 'litro (L)', 1), u('m3', 'metro cúbico (m³)', 1000), u('tsp', 'colher de chá (US)', 0.00492892159375), u('tbsp', 'colher de sopa (US)', 0.01478676478125), u('cup', 'xícara (US)', 0.2365882365), u('floz', 'onça fluida (US)', 0.0295735295625), u('pt', 'pinta (US)', 0.473176473), u('gal', 'galão (US)', 3.785411784)] },
  { id: 'temp', en: 'Temperature', name: 'Temperatura', special: 'temp', units: [u('c', 'Celsius (°C)', 1), u('f', 'Fahrenheit (°F)', 1), u('k', 'Kelvin (K)', 1)] },
  { id: 'area', en: 'Area', name: 'Área', units: [u('cm2', 'cm²', 1e-4), u('m2', 'm²', 1), u('km2', 'km²', 1e6), u('ha', 'hectare (ha)', 1e4), u('in2', 'polegada² (in²)', 6.4516e-4), u('ft2', 'pé² (ft²)', 0.09290304), u('ac', 'acre', 4046.8564224), u('mi2', 'milha² (mi²)', 2589988.110336)] },
  { id: 'speed', en: 'Speed', name: 'Velocidade', units: [u('ms', 'metro/segundo (m/s)', 1), u('kmh', 'quilômetro/hora (km/h)', 1 / 3.6), u('mph', 'milha/hora (mph)', 0.44704), u('kn', 'nó', 1852 / 3600)] },
  { id: 'time', en: 'Time', name: 'Tempo', units: [u('ms', 'milissegundo', 0.001), u('s', 'segundo', 1), u('min', 'minuto', 60), u('h', 'hora', 3600), u('d', 'dia', 86400), u('wk', 'semana', 604800), u('yr', 'ano (365 dias)', 31536000)] },
  { id: 'data', en: 'Data', name: 'Dados', units: [u('bit', 'bit', 0.125), u('B', 'byte (B)', 1), u('KB', 'quilobyte (KB)', 1e3), u('MB', 'megabyte (MB)', 1e6), u('GB', 'gigabyte (GB)', 1e9), u('TB', 'terabyte (TB)', 1e12), u('KiB', 'kibibyte (KiB)', 1024), u('MiB', 'mebibyte (MiB)', 1024 ** 2), u('GiB', 'gibibyte (GiB)', 1024 ** 3), u('TiB', 'tebibyte (TiB)', 1024 ** 4)] },
  { id: 'energy', en: 'Energy', name: 'Energia', units: [u('J', 'joule (J)', 1), u('kJ', 'quilojoule (kJ)', 1000), u('cal', 'caloria (cal)', 4.184), u('kcal', 'quilocaloria (kcal)', 4184), u('Wh', 'watt-hora (Wh)', 3600), u('kWh', 'quilowatt-hora (kWh)', 3.6e6)] },
  { id: 'power', en: 'Power', name: 'Potência', units: [u('W', 'watt (W)', 1), u('kW', 'quilowatt (kW)', 1000), u('cv', 'cavalo-vapor (cv)', 735.49875), u('hp', 'horsepower (hp)', 745.69987158227)] },
  { id: 'press', en: 'Pressure', name: 'Pressão', units: [u('Pa', 'pascal (Pa)', 1), u('kPa', 'quilopascal (kPa)', 1000), u('bar', 'bar', 1e5), u('atm', 'atmosfera (atm)', 101325), u('psi', 'psi', 6894.757293168)] },
  { id: 'angle', en: 'Angle', name: 'Ângulo', units: [u('deg', 'grau (°)', 1), u('rad', 'radiano (rad)', 180 / Math.PI), u('grad', 'grado (gon)', 0.9)] },
];

const toCelsius = (v: number, id: string) => (id === 'f' ? ((v - 32) * 5) / 9 : id === 'k' ? v - 273.15 : v);
const fromCelsius = (v: number, id: string) => (id === 'f' ? (v * 9) / 5 + 32 : id === 'k' ? v + 273.15 : v);

export function convert(value: number, cat: Category, from: string, to: string): number {
  if (cat.special === 'temp') return fromCelsius(toCelsius(value, from), to);
  const a = cat.units.find((x) => x.id === from);
  const b = cat.units.find((x) => x.id === to);
  if (!a || !b) throw new Error('unidade desconhecida');
  return (value * a.f) / b.f;
}

/** Formata sem ruído de ponto flutuante: até 10 algarismos significativos. */
export function fmt(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-6) return n.toExponential(6).replace(/\.?0+e/, 'e');
  return String(Number(n.toPrecision(10)));
}

/** Nomes das unidades em inglês, só onde diferem do português. */
const UNIT_EN: Record<string, string> = {
  'len.mm': 'millimeter (mm)', 'len.cm': 'centimeter (cm)', 'len.m': 'meter (m)', 'len.km': 'kilometer (km)', 'len.in': 'inch (in)', 'len.ft': 'foot (ft)', 'len.yd': 'yard (yd)', 'len.mi': 'mile (mi)', 'len.nmi': 'nautical mile',
  'mass.mg': 'milligram (mg)', 'mass.g': 'gram (g)', 'mass.kg': 'kilogram (kg)', 'mass.t': 'tonne (t)', 'mass.oz': 'ounce (oz)', 'mass.lb': 'pound (lb)',
  'vol.ml': 'milliliter (mL)', 'vol.l': 'liter (L)', 'vol.m3': 'cubic meter (m³)', 'vol.tsp': 'teaspoon (US)', 'vol.tbsp': 'tablespoon (US)', 'vol.cup': 'cup (US)', 'vol.floz': 'fluid ounce (US)', 'vol.pt': 'pint (US)', 'vol.gal': 'gallon (US)',
  'temp.c': 'Celsius (°C)', 'temp.f': 'Fahrenheit (°F)', 'temp.k': 'Kelvin (K)',
  'area.in2': 'square inch (in²)', 'area.ft2': 'square foot (ft²)', 'area.ac': 'acre', 'area.mi2': 'square mile (mi²)', 'area.ha': 'hectare (ha)',
  'speed.ms': 'meter/second (m/s)', 'speed.kmh': 'kilometer/hour (km/h)', 'speed.mph': 'mile/hour (mph)', 'speed.kn': 'knot',
  'time.ms': 'millisecond', 'time.s': 'second', 'time.min': 'minute', 'time.h': 'hour', 'time.d': 'day', 'time.wk': 'week', 'time.yr': 'year (365 days)',
  'data.bit': 'bit', 'data.B': 'byte (B)', 'data.KB': 'kilobyte (KB)', 'data.MB': 'megabyte (MB)', 'data.GB': 'gigabyte (GB)', 'data.TB': 'terabyte (TB)', 'data.KiB': 'kibibyte (KiB)', 'data.MiB': 'mebibyte (MiB)', 'data.GiB': 'gibibyte (GiB)', 'data.TiB': 'tebibyte (TiB)',
  'energy.J': 'joule (J)', 'energy.kJ': 'kilojoule (kJ)', 'energy.cal': 'calorie (cal)', 'energy.kcal': 'kilocalorie (kcal)', 'energy.Wh': 'watt-hour (Wh)', 'energy.kWh': 'kilowatt-hour (kWh)',
  'power.W': 'watt (W)', 'power.kW': 'kilowatt (kW)', 'power.cv': 'metric horsepower (cv)', 'power.hp': 'horsepower (hp)',
  'press.Pa': 'pascal (Pa)', 'press.kPa': 'kilopascal (kPa)', 'press.bar': 'bar', 'press.atm': 'atmosphere (atm)', 'press.psi': 'psi',
  'angle.deg': 'degree (°)', 'angle.rad': 'radian (rad)', 'angle.grad': 'gradian (gon)',
};

export function unitName(cat: Category, unit: Unit, lang: 'pt' | 'en'): string {
  return lang === 'en' ? UNIT_EN[`${cat.id}.${unit.id}`] ?? unit.name : unit.name;
}
