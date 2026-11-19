import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ITEMS, TOTAL, FILTER_INDEX, groupsOf, batches, INITIAL_BATCH } from '../../src/lib/catalog';
import { SECTIONS, TOOLS_SECTION_ID } from '../../src/lib/sections';
import { optionsFor, apply, emptyState } from '../../src/lib/filter';

const pub = (...p: string[]) => resolve(__dirname, '../../public', ...p);

describe('integridade do catálogo', () => {
  it('passa pelo esquema (o import já valida) e tem os 168 itens públicos', () => {
    expect(TOTAL).toBe(168);
    expect(ITEMS.length).toBe(170); // + Grimo Notes e Kita Finances em desenvolvimento
  });

  it('ids únicos', () => {
    const ids = ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda seção de dados tem itens, exceto Ferramentas (que são ilhas React)', () => {
    for (const s of SECTIONS) {
      const n = ITEMS.filter((i) => i.sec === s.id).length;
      if (s.id === TOOLS_SECTION_ID) expect(n).toBe(0);
      else expect(n, s.title).toBeGreaterThan(0);
    }
  });

  it('todo item público tem link https e host', () => {
    for (const i of ITEMS.filter((x) => !x.soon)) {
      expect(i.url.startsWith('https://'), i.name).toBe(true);
      expect(i.host, i.name).not.toBe('');
    }
  });

  it('apps em desenvolvimento não têm link', () => {
    for (const i of ITEMS.filter((x) => x.soon)) expect(i.url).toBe('');
  });

  it('todo arquivo de imagem referenciado existe em public/', () => {
    const missing: string[] = [];
    for (const i of ITEMS) {
      if (i.icon && !existsSync(pub('icons', i.icon))) missing.push(`icons/${i.icon}`);
      if (i.mc_icon && !existsSync(pub('mc', i.mc_icon))) missing.push(`mc/${i.mc_icon}`);
      if (i.img && !existsSync(pub('games', i.img))) missing.push(`games/${i.img}`);
    }
    expect(missing).toEqual([]);
  });

  it('item comum sem ícone próprio usa monograma de propósito', () => {
    for (const i of ITEMS.filter((x) => x.kind === 'item')) {
      expect(Boolean(i.icon) || i.mono, i.name).toBe(true);
    }
  });

  it('todo item do Modrinth tem ícone, e todo mod tem ao menos um loader (packs e shaders não têm)', () => {
    for (const i of ITEMS.filter((x) => x.kind === 'mc')) {
      if (i.name !== 'Courier Owls') expect(i.mc_icon, i.name).toBeTruthy();
      // Courier Owls só existe no CurseForge: sem loaders confirmados
      if (i.tipo === 'Mod' && i.name !== 'Courier Owls') expect((i.loaders ?? []).length, i.name).toBeGreaterThan(0);
      else if (i.tipo !== 'Mod') expect(i.loaders ?? [], i.name).toEqual([]);
    }
  });

  it('22 jogos, todos com capa, Deltarune primeiro e Minecraft incluído', () => {
    const games = ITEMS.filter((i) => i.kind === 'game');
    expect(games.length).toBe(22);
    expect(games.every((g) => g.img)).toBe(true);
    expect(games[0].name).toBe('Deltarune');
    expect(games.map((g) => g.name)).toContain('Minecraft');
    expect(games.filter((g) => g.img_fit === 'contain').length).toBe(10); // capas da Wikipédia, em retrato
  });

  it('licença vinda de fonte confere com a classificação', () => {
    for (const i of ITEMS) {
      if (i.lic_src?.startsWith('GitHub:')) expect(i.lic, i.name).toBe('Código aberto');
    }
  });

  it('datas de entrada são válidas e o lote inicial é 19/11/2026', () => {
    expect(INITIAL_BATCH).toBe('2026-11-19');
    for (const i of ITEMS) expect(i.added).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(batches()[0].date).toBe('2026-11-19');
    expect(batches()[0].items.length).toBe(TOTAL);
  });
});

describe('grupos', () => {
  it('Minecraft: ordem definida e mods recolhidos', () => {
    const g = groupsOf(9);
    expect(g.map((x) => x.name)).toEqual(['Launchers', 'Mods favoritos', 'Mods secundários', 'Resource packs', 'Shaders', 'Servidores']);
    expect(g.filter((x) => x.collapsed).map((x) => x.name)).toEqual(['Mods favoritos', 'Mods secundários']);
    expect(g.find((x) => x.name === 'Mods favoritos')!.items.length).toBe(29);
    expect(g.find((x) => x.name === 'Mods secundários')!.items.length).toBe(14);
  });

  it('Jogos: galeria primeiro', () => {
    const g = groupsOf(10);
    expect(g[0].view).toBe('tiles');
    expect(g[0].items.length).toBe(22);
  });
});

describe('contra os dados reais', () => {
  it('Linux: conta bate com os dados', () => {
    const st = emptyState();
    st.plat.add('Linux');
    const expected = ITEMS.filter((i) => i.plat.includes('Linux')).length;
    expect(apply(FILTER_INDEX, st).visible.size).toBe(expected);
  });

  it('as quatro licenças existem e vêm na ordem fixa', () => {
    expect(optionsFor(FILTER_INDEX, 'lic').map((x) => x[0])).toEqual(['Código aberto', 'Grátis', 'Freemium', 'Pago']);
  });

  it('seis emuladores', () => {
    const st = emptyState();
    st.tipo.add('Emulador');
    expect(apply(FILTER_INDEX, st).visible.size).toBe(6);
  });

  it('quatro terminais pela busca por "terminal"', () => {
    const st = emptyState();
    st.q = 'terminal';
    expect(apply(FILTER_INDEX, st).visible.size).toBe(4);
  });

  it('NeoForge: 40 de 42 mods; Fabric: 6 ficam de fora', () => {
    const mods = FILTER_INDEX.filter((e) => e.ld && (e.g === 'Mods favoritos' || e.g === 'Mods secundários'));
    expect(mods.length).toBe(42);
    expect(mods.filter((m) => !m.ld!.includes('neoforge')).length).toBe(2);
    expect(mods.filter((m) => !m.ld!.includes('fabric')).length).toBe(6);
  });
});
