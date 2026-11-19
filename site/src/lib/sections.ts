import type { Lang } from '../i18n';

export interface SectionDef {
  id: number;
  icon: string;
  slug: Record<Lang, string>;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
}

const s = (id: number, icon: string, slug: [string, string], title: [string, string], desc: [string, string]): SectionDef => ({
  id,
  icon,
  slug: { pt: slug[0], en: slug[1] },
  title: { pt: title[0], en: title[1] },
  desc: { pt: desc[0], en: desc[1] },
});

/**
 * Categorias, na ordem do menu. Meus apps e Ferramentas vêm primeiro.
 * Terminal virou parte de Produtividade e Emular e jogar virou parte de Jogos.
 */
export const SECTIONS: SectionDef[] = [
  s(13, 'mine', ['meus-apps', 'my-apps'], ['Meus apps', 'My apps'], ['O que eu mesmo fiz.', 'What I built myself.']),
  s(12, 'tool', ['ferramentas', 'tools'], ['Ferramentas', 'Tools'], ['Tempo, texto, cálculo e sorteio, direto aqui.', 'Time, text, math and draw tools, right here.']),
  s(1, 'nav', ['navegar', 'browse'], ['Navegar', 'Browse'], ['Navegadores, extensões, VPNs, segurança e e-mail.', 'Browsers, extensions, VPNs, security and email.']),
  s(2, 'ai', ['ia', 'ai'], ['IA', 'AI'], ['Chats, geradores de imagem e tradução.', 'Chats, image generators and translation.']),
  s(3, 'make', ['criar', 'create'], ['Criar', 'Create'], ['Imagem, desenho, 3D, áudio, captura, jogos e pixel art.', 'Image, drawing, 3D, audio, capture, games and pixel art.']),
  s(4, 'file', ['arquivos', 'files'], ['Arquivos', 'Files'], ['Baixar, converter, compactar e enviar.', 'Download, convert, compress and send.']),
  s(5, 'prod', ['produtividade', 'productivity'], ['Produtividade', 'Productivity'], ['Terminais, código, notas, tarefas, foco e utilidades.', 'Terminals, code, notes, tasks, focus and utilities.']),
  s(7, 'sys', ['sistema', 'system'], ['Sistema', 'System'], ['Distros Linux, Windows e apps para Android.', 'Linux distros, Windows and Android apps.']),
  s(10, 'fun', ['jogos', 'games'], ['Jogos', 'Games'], ['Os que eu gosto, emuladores, Linux e jogos de navegador.', 'My favorites, emulators, Linux gaming and browser games.']),
  s(9, 'mc', ['minecraft', 'minecraft'], ['Minecraft', 'Minecraft'], ['Launchers, mods, packs, shaders e servidores.', 'Launchers, mods, packs, shaders and servers.']),
  s(11, 'learn', ['aprender', 'learn'], ['Aprender', 'Learn'], ['Digitação, Morse, idiomas e memória.', 'Typing, Morse, languages and memory.']),
];

export const TOOLS_SECTION_ID = 12;

export const bySlug = (lang: Lang, slug: string): SectionDef | undefined => SECTIONS.find((x) => x.slug[lang] === slug);

/** Ordem dos grupos quando não é a de aparição nos dados. */
export const GROUP_ORDER: Record<number, string[]> = {
  9: ['Launchers', 'Mods', 'Resource packs', 'Shaders', 'Servidores'],
  10: ['Que eu gosto', 'Emuladores', 'Jogar no Linux', 'No navegador', 'Curiosidades'],
};

/** Seções cujos grupos viram abas elásticas, uma por vez. O valor é o grupo que abre primeiro. */
export const SUBTABS: Record<number, string> = { 9: '9|Mods', 10: '10|Que eu gosto' };

/** Os que o Isaac mais usa, na ordem de exibição no topo. */
export const TOP_ORDER = ['CachyOS', 'VSCodium', 'Godot', 'Krita', 'Claude', 'Obsidian', 'Ghostty', 'Prism Launcher'];

export const LOADER_NAMES: Record<string, string> = {
  fabric: 'Fabric',
  forge: 'Forge',
  neoforge: 'NeoForge',
  quilt: 'Quilt',
};

export const THEMES = [
  { id: 'dark', name: 'Dark', bg: '#121211', accent: '#ff5a36' },
  { id: 'white', name: 'White', bg: '#f5f3ee', accent: '#d93a16' },
] as const;
