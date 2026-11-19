import { describe, expect, it } from 'vitest';
import { ui, t, LANGS } from '../../src/i18n';
import { toolsDict, tt, errText } from '../../src/i18n/tools';
import { ITEMS, filterIndex, filterLabels, groupsOf, loc } from '../../src/lib/catalog';
import { SECTIONS, SUBTABS, GROUP_ORDER, bySlug } from '../../src/lib/sections';
import { route } from '../../src/lib/url';
import { STYLES } from '../../src/lib/tools/textstyles';
import { CATEGORIES, unitName } from '../../src/lib/tools/units';

describe('dicionários', () => {
  it('português e inglês têm exatamente as mesmas chaves (site)', () => {
    expect(Object.keys(ui.en).sort()).toEqual(Object.keys(ui.pt).sort());
  });
  it('português e inglês têm exatamente as mesmas chaves (ferramentas)', () => {
    expect(Object.keys(toolsDict.en).sort()).toEqual(Object.keys(toolsDict.pt).sort());
  });
  it('nenhum texto em inglês ficou igual ao português por esquecimento', () => {
    const same = Object.keys(ui.pt).filter((k) => ui.pt[k] === ui.en[k] && !['lic.Freemium', 'nItem', 'menu', 'via', 'loaderLabel', 'footLinks'].includes(k));
    expect(same).toEqual([]);
    const sameT = Object.keys(toolsDict.pt).filter((k) => toolsDict.pt[k] === toolsDict.en[k]);
    // permitidos: nomes iguais nos dois idiomas
    expect(sameT.filter((k) => !['pomoBadge', 'minN', 'uMin', 'errUse'].includes(k))).toEqual([]);
  });
  it('as variáveis {x} batem entre os idiomas', () => {
    const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
    for (const k of Object.keys(ui.pt)) expect(vars(ui.en[k]), k).toBe(vars(ui.pt[k]));
    for (const k of Object.keys(toolsDict.pt)) expect(vars(toolsDict.en[k]), k).toBe(vars(toolsDict.pt[k]));
  });
  it('t e tt trocam variáveis e usam o português como reserva', () => {
    expect(t('en', 'ofTotal', { a: 3, b: 9 })).toBe('3 of 9');
    expect(t('pt', 'ofTotal', { a: 3, b: 9 })).toBe('3 de 9');
    expect(tt('en', 'pomoCycle', { a: 1, b: 4 })).toBe('Cycle 1 of 4');
    expect(t('en', 'chave-que-nao-existe')).toBe('chave-que-nao-existe');
  });
  it('erros das bibliotecas viram texto nos dois idiomas', () => {
    expect(errText('pt', 'div0')).toBe('divisão por zero');
    expect(errText('en', 'div0')).toBe('division by zero');
    expect(errText('en', 'only:3')).toContain('only 3');
    expect(errText('pt', 'unknown:foo')).toContain('foo');
  });
  it('doze meses nos dois idiomas', () => {
    for (const l of LANGS) expect(toolsDict[l].months.split(',')).toHaveLength(12);
  });
});

describe('categorias e rotas', () => {
  it('11 categorias, Meus apps e Ferramentas primeiro, sem Terminal nem Emular separados', () => {
    expect(SECTIONS).toHaveLength(11);
    expect(SECTIONS.slice(0, 2).map((s) => s.slug.pt)).toEqual(['meus-apps', 'ferramentas']);
    expect(SECTIONS.map((s) => s.title.pt)).not.toContain('Terminal');
    expect(SECTIONS.map((s) => s.title.pt)).not.toContain('Emular e jogar');
  });
  it('endereços únicos em cada idioma e sem colidir com as páginas fixas', () => {
    for (const l of LANGS) {
      const slugs = SECTIONS.map((s) => s.slug[l]);
      expect(new Set(slugs).size).toBe(slugs.length);
      expect(slugs).not.toContain(l === 'pt' ? 'novidades' : 'news');
      expect(slugs).not.toContain(l === 'pt' ? 'sobre' : 'about');
    }
  });
  it('rotas em português e inglês (sem base)', () => {
    const ia = bySlug('pt', 'ia')!;
    expect(route('pt', ia)).toBe('/ia/');
    expect(route('en', ia)).toBe('/en/ai/');
    expect(route('pt', 'home')).toBe('/');
    expect(route('en', 'home')).toBe('/en/');
    expect(route('en', 'news')).toBe('/en/news/');
    expect(route('pt', 'about')).toBe('/sobre/');
    expect(route('en', 'rss')).toBe('/en/rss.xml');
    expect(bySlug('en', 'tools')!.id).toBe(12);
  });
  it('Terminal virou grupo de Produtividade e Emuladores é grupo de Jogos', () => {
    expect(ITEMS.find((i) => i.name === 'Ghostty')!.sec).toBe(5);
    expect(ITEMS.find((i) => i.name === 'RetroArch')!.sec).toBe(10);
    expect(groupsOf(10).map((g) => g.name)).toEqual(['Que eu gosto', 'Emuladores', 'Jogar no Linux', 'No navegador', 'Curiosidades']);
  });
  it('abas só em Minecraft e Jogos, e o grupo inicial existe', () => {
    expect(Object.keys(SUBTABS).map(Number).sort((a, b) => a - b)).toEqual([9, 10]);
    for (const [sec, key] of Object.entries(SUBTABS)) expect(groupsOf(Number(sec)).map((g) => g.key)).toContain(key);
    for (const sec of Object.keys(GROUP_ORDER)) expect(groupsOf(Number(sec)).length).toBeGreaterThan(1);
  });
});

describe('conteúdo em inglês', () => {
  it('todo item com descrição tem descrição em inglês', () => {
    const miss = ITEMS.filter((i) => i.note && !i.note_en).map((i) => i.name);
    expect(miss).toEqual([]);
  });
  it('tipos e grupos têm rótulo em inglês, ou são o mesmo termo nos dois idiomas', () => {
    const same = new Set(['3D', 'Flashcards', 'Launcher', 'Mod', 'Morse', 'PDF', 'Pixel art', 'Pomodoro', 'README', 'Resource pack', 'Shader', 'Terminal', 'VPN', 'Windows', 'Android', 'Mods', 'Launchers', 'Resource packs', 'Shaders', 'VPNs', 'Chats']);
    for (const i of ITEMS) {
      if (!i.tipo_en) expect(same.has(i.tipo) || /^[A-Z0-9 .-]+$/.test(i.tipo), `tipo ${i.tipo}`).toBe(true);
      if (!i.grp_en) expect(same.has(i.grp), `grupo ${i.grp}`).toBe(true);
    }
  });
  it('loc devolve o texto do idioma pedido', () => {
    const z = ITEMS.find((i) => i.name === 'Zen Browser')!;
    expect(loc(z, 'pt').note).toContain('abas verticais');
    expect(loc(z, 'en').note).toContain('vertical tabs');
    expect(loc(z, 'en').tipo).toBe('Browser');
  });
  it('a busca em inglês acha por descrição em inglês, e em português por português', () => {
    const en = filterIndex('en').find((e) => e.id === '1-zen-browser')!;
    const pt = filterIndex('pt').find((e) => e.id === '1-zen-browser')!;
    expect(en.q).toContain('vertical tabs');
    expect(en.q).not.toContain('abas verticais');
    expect(pt.q).toContain('abas verticais');
  });
  it('rótulos de filtro traduzem licença e tipo', () => {
    expect(filterLabels('en')['Código aberto']).toBe('Open source');
    expect(filterLabels('pt')['Código aberto']).toBe('Código aberto');
    expect(filterLabels('en')['Navegador']).toBe('Browser');
  });
  it('o índice de uma categoria só tem os itens dela', () => {
    const idx = filterIndex('pt', 2);
    expect(idx.length).toBeGreaterThan(0);
    expect(idx.every((e) => e.s === 2)).toBe(true);
  });
});

describe('nomes das ferramentas em inglês', () => {
  it('todo estilo de texto tem nome em inglês diferente do português ou igual por ser um termo comum', () => {
    for (const s of STYLES) expect(s.en, s.id).toBeTruthy();
    expect(STYLES.find((s) => s.id === 'smallcaps')!.en).toBe('Small caps');
  });
  it('toda grandeza e unidade tem nome em inglês', () => {
    for (const c of CATEGORIES) {
      expect(c.en, c.id).toBeTruthy();
      for (const u of c.units) expect(unitName(c, u, 'en'), `${c.id}.${u.id}`).not.toMatch(/quilômetro|milha|grama|polegada|jarda|colher|xícara|galão|segundo$/);
    }
    const c = CATEGORIES.find((x) => x.id === 'len')!;
    expect(unitName(c, c.units.find((u) => u.id === 'km')!, 'en')).toBe('kilometer (km)');
    expect(unitName(c, c.units.find((u) => u.id === 'km')!, 'pt')).toBe('quilômetro (km)');
  });
});
