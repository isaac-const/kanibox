export interface SectionDef {
  id: number;
  icon: string;
  title: string;
  desc: string;
}

export const SECTIONS: SectionDef[] = [
  { id: 1, icon: 'nav', title: 'Navegar', desc: 'Navegadores e extensões.' },
  { id: 2, icon: 'ai', title: 'IA', desc: 'Chats e geradores de imagem.' },
  { id: 3, icon: 'make', title: 'Criar', desc: 'Imagem, 3D, áudio, jogos e pixel art.' },
  { id: 4, icon: 'file', title: 'Arquivos', desc: 'Baixar, converter, compactar e enviar.' },
  { id: 5, icon: 'prod', title: 'Produtividade', desc: 'Notas, tarefas, foco e utilidades.' },
  { id: 6, icon: 'term', title: 'Terminal', desc: 'Terminais que eu recomendo.' },
  { id: 7, icon: 'sys', title: 'Sistema', desc: 'Distros Linux e apps para Android.' },
  { id: 8, icon: 'emu', title: 'Emular e jogar', desc: 'Emuladores e jogos de PC no Linux.' },
  { id: 9, icon: 'mc', title: 'Minecraft', desc: 'Launchers, mods, packs, shaders e servidores.' },
  { id: 10, icon: 'fun', title: 'Jogos', desc: 'Os que eu gosto e os que dá para jogar no navegador.' },
  { id: 11, icon: 'learn', title: 'Aprender', desc: 'Digitação, Morse, idiomas e memória.' },
  { id: 12, icon: 'tool', title: 'Ferramentas', desc: 'Mini ferramentas de tempo, direto aqui.' },
  { id: 13, icon: 'mine', title: 'Meus apps', desc: 'O que eu mesmo fiz.' },
];

/** A seção Ferramentas não vem dos dados: são ilhas React. */
export const TOOLS_SECTION_ID = 12;

/** Ordem dos grupos quando não é a de aparição nos dados. */
export const GROUP_ORDER: Record<number, string[]> = {
  9: ['Launchers', 'Mods favoritos', 'Mods secundários', 'Resource packs', 'Shaders', 'Servidores'],
  10: ['Que eu gosto', 'No navegador', 'Curiosidades'],
};

/** Grupos que começam recolhidos. */
export const COLLAPSED_GROUPS = new Set(['Mods favoritos', 'Mods secundários']);

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
