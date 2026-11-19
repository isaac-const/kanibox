import { describe, expect, it } from 'vitest';
import { longDate, shortDate } from '../../src/lib/format';

describe('datas', () => {
  it('formato curto e longo, sem depender de locale', () => {
    expect(shortDate('2026-11-19')).toBe('19 nov 2026');
    expect(longDate('2026-11-19')).toBe('19 de novembro de 2026');
    expect(shortDate('2027-03-05')).toBe('5 mar 2027');
    expect(longDate('2027-03-05')).toBe('5 de março de 2027');
  });
  it('recusa data inválida', () => {
    expect(() => shortDate('19/11/2026')).toThrow();
    expect(() => longDate('')).toThrow();
  });
});
