import { describe, expect, it } from 'vitest';
import {
  apply, emptyState, filtersOn, fromParams, isActive, loaderSummary, matches, norm, optionsFor, toParams, toolsVisible,
  type IndexEntry,
} from '../../src/lib/filter';

const E = (o: Partial<IndexEntry> & { id: string }): IndexEntry => ({
  s: 1, g: 'G', p: [], t: 'Tipo', l: '', q: o.id, ...o,
});

const index: IndexEntry[] = [
  E({ id: 'a', s: 1, g: 'Navegadores', p: ['Linux', 'Windows'], t: 'Navegador', l: 'Código aberto', q: norm('Zen Browser Navegador zen-browser.app') }),
  E({ id: 'b', s: 1, g: 'Navegadores', p: ['Linux', 'Windows', 'Android'], t: 'Navegador', l: 'Grátis', q: norm('Vivaldi Navegador vivaldi.com') }),
  E({ id: 'c', s: 2, g: 'Chats', p: ['Web'], t: 'Chat de IA', l: 'Freemium', q: norm('Claude Chat de IA claude.com') }),
  E({ id: 'd', s: 6, g: 'Terminais', p: ['Linux', 'macOS'], t: 'Terminal', l: 'Código aberto', q: norm('Ghostty Terminal Terminais') }),
  E({ id: 'e', s: 13, g: 'Meus apps', p: ['Linux', 'Windows'], t: 'App meu', l: '', q: norm('Grimo Notes App meu'), n: true }),
  E({ id: 'f', s: 9, g: 'Servidores', p: [], t: 'Servidor', l: 'Freemium', q: norm('Hypixel Servidor') }),
];

describe('norm', () => {
  it('ignora maiúscula e acento', () => {
    expect(norm('  Código ABERTO ')).toBe('codigo aberto');
    expect(norm('Ação')).toBe('acao');
  });
});

describe('matches e apply', () => {
  it('sem filtro mostra tudo', () => {
    const r = apply(index, emptyState());
    expect(r.visible.size).toBe(6);
    expect(r.total).toBe(5); // não conta o app em desenvolvimento
    expect(r.shown).toBe(5);
  });

  it('plataforma combina em OU dentro do filtro', () => {
    const st = emptyState();
    st.plat.add('Android');
    st.plat.add('macOS');
    expect([...apply(index, st).visible].sort()).toEqual(['b', 'd']);
  });

  it('filtros diferentes combinam em E', () => {
    const st = emptyState();
    st.plat.add('Linux');
    st.lic.add('Código aberto');
    expect([...apply(index, st).visible].sort()).toEqual(['a', 'd']);
    st.tipo.add('Terminal');
    expect([...apply(index, st).visible]).toEqual(['d']);
  });

  it('item sem plataforma ou licença não passa quando o filtro está ligado', () => {
    const st = emptyState();
    st.plat.add('Linux');
    expect(apply(index, st).visible.has('f')).toBe(false);
    const st2 = emptyState();
    st2.lic.add('Pago');
    expect(apply(index, st2).visible.size).toBe(0);
  });

  it('combinação impossível dá zero', () => {
    const st = emptyState();
    st.plat.add('iOS');
    st.lic.add('Código aberto');
    expect(apply(index, st).visible.size).toBe(0);
  });

  it('busca exige todas as palavras, sem acento', () => {
    const st = emptyState();
    st.q = norm('navegador zen');
    expect([...apply(index, st).visible]).toEqual(['a']);
    st.q = norm('NAVEGADOR');
    expect(apply(index, st).visible.size).toBe(2);
    st.q = 'xyzxyz';
    expect(apply(index, st).visible.size).toBe(0);
  });

  it('a busca por nome da seção funciona porque ela entra no texto indexado', () => {
    const st = emptyState();
    st.q = 'terminais';
    expect([...apply(index, st).visible]).toEqual(['d']);
  });

  it('conta por seção e por grupo, e separa apps em desenvolvimento do total', () => {
    const r = apply(index, emptyState());
    expect(r.bySection.get(1)).toBe(2);
    expect(r.byGroup.get('1|Navegadores')).toBe(2);
    expect(r.bySection.get(13)).toBe(1);
    expect(r.shown).toBe(5);
  });

  it('matches é consistente com apply', () => {
    const st = emptyState();
    st.plat.add('Web');
    expect(index.filter((e) => matches(e, st)).map((e) => e.id)).toEqual(['c']);
  });
});

describe('estado', () => {
  it('filtersOn e isActive', () => {
    const st = emptyState();
    expect(filtersOn(st)).toBe(false);
    expect(isActive(st)).toBe(false);
    st.q = 'x';
    expect(filtersOn(st)).toBe(false);
    expect(isActive(st)).toBe(true);
    st.plat.add('Linux');
    expect(filtersOn(st)).toBe(true);
  });

  it('vai e volta pela URL', () => {
    const st = emptyState();
    st.q = 'terminal';
    st.plat.add('Linux');
    st.plat.add('Windows');
    st.lic.add('Código aberto');
    const qs = toParams(st, 'neoforge').toString();
    const back = fromParams(new URLSearchParams(qs));
    expect(back.state.q).toBe('terminal');
    expect([...back.state.plat]).toEqual(['Linux', 'Windows']);
    expect([...back.state.lic]).toEqual(['Código aberto']);
    expect(back.loader).toBe('neoforge');
  });

  it('loader inválido na URL vira "todos"', () => {
    expect(fromParams(new URLSearchParams('ld=hack')).loader).toBe('todos');
  });

  it('URL sem nada devolve estado vazio', () => {
    const { state, loader } = fromParams(new URLSearchParams(''));
    expect(isActive(state)).toBe(false);
    expect(loader).toBe('todos');
  });
});

describe('optionsFor', () => {
  it('licença na ordem fixa e plataforma na ordem fixa', () => {
    expect(optionsFor(index, 'lic').map((x) => x[0])).toEqual(['Código aberto', 'Freemium', 'Grátis'].sort((a, b) => ['Código aberto', 'Grátis', 'Freemium', 'Pago'].indexOf(a) - ['Código aberto', 'Grátis', 'Freemium', 'Pago'].indexOf(b)));
    expect(optionsFor(index, 'plat').map((x) => x[0])).toEqual(['Linux', 'Windows', 'macOS', 'Android', 'Web']);
  });

  it('tipo vem do mais frequente para o menos', () => {
    const t = optionsFor(index, 'tipo');
    expect(t[0]).toEqual(['Navegador', 2]);
  });

  it('conta sobre o catálogo inteiro e ignora vazios', () => {
    expect(optionsFor(index, 'lic').find((x) => x[0] === '')).toBeUndefined();
    expect(optionsFor(index, 'plat').find((x) => x[0] === 'Linux')![1]).toBe(4);
  });
});

describe('loaderSummary', () => {
  const mods: IndexEntry[] = [
    E({ id: 'm1', ld: ['fabric', 'forge', 'neoforge'] }),
    E({ id: 'm2', ld: ['forge', 'neoforge'] }),
    E({ id: 'm3', ld: ['fabric', 'quilt'] }),
  ];
  it('todos mostra tudo', () => {
    expect(loaderSummary(mods, 'todos')).toEqual({ ok: 3, total: 3, missing: [] });
  });
  it('conta quem tem o loader e lista quem não tem', () => {
    expect(loaderSummary(mods, 'neoforge')).toEqual({ ok: 2, total: 3, missing: ['m3'] });
    expect(loaderSummary(mods, 'fabric').missing).toEqual(['m2']);
  });
});

describe('toolsVisible', () => {
  it('aparece sem filtro e sem busca, some com filtro, e responde a palavras de tempo', () => {
    const st = emptyState();
    expect(toolsVisible(st)).toBe(true);
    st.q = 'zen';
    expect(toolsVisible(st)).toBe(false);
    st.q = 'pomodoro';
    expect(toolsVisible(st)).toBe(true);
    st.plat.add('Linux');
    expect(toolsVisible(st)).toBe(false);
  });
});
