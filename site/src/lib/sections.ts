export interface SectionDef {
  id: number;
  icon: string;
  title: string;
  desc: string;
}

/** Ordem de exibição: Meus apps e Ferramentas ficam no topo. Os ids não mudam (são usados nos links #sN). */
export const SECTIONS: SectionDef[] = [
  { id: 13, icon: 'mine', title: 'Meus apps', desc: 'O que eu mesmo fiz.' },
  { id: 12, icon: 'tool', title: 'Ferramentas', desc: 'Tempo, texto, cálculo e sorteio, direto aqui.' },
  { id: 1, icon: 'nav', title: 'Navegar', desc: 'Navegadores, extensões, VPNs, segurança e e-mail.' },
  { id: 2, icon: 'ai', title: 'IA', desc: 'Chats, geradores de imagem e tradução.' },
  { id: 3, icon: 'make', title: 'Criar', desc: 'Imagem, desenho, 3D, áudio, captura, jogos e pixel art.' },
  { id: 4, icon: 'file', title: 'Arquivos', desc: 'Baixar, converter, compactar e enviar.' },
  { id: 5, icon: 'prod', title: 'Produtividade', desc: 'Notas, tarefas, código, foco e utilidades.' },
  { id: 6, icon: 'term', title: 'Terminal', desc: 'Terminais que eu recomendo.' },
  { id: 7, icon: 'sys', title: 'Sistema', desc: 'Distros Linux, Windows e apps para Android.' },
  { id: 8, icon: 'emu', title: 'Emular e jogar', desc: 'Emuladores e jogos de PC no Linux.' },
  { id: 9, icon: 'mc', title: 'Minecraft', desc: 'Launchers, mods, packs, shaders e servidores.' },
  { id: 10, icon: 'fun', title: 'Jogos', desc: 'Os que eu gosto e os que dá para jogar no navegador.' },
  { id: 11, icon: 'learn', title: 'Aprender', desc: 'Digitação, Morse, idiomas e memória.' },
];

/** A seção Ferramentas não vem dos dados: são ilhas React. */
export const TOOLS_SECTION_ID = 12;

/** Ordem dos grupos quando não é a de aparição nos dados. */
export const GROUP_ORDER: Record<number, string[]> = {
  9: ['Launchers', 'Mods', 'Resource packs', 'Shaders', 'Servidores'],
  10: ['Que eu gosto', 'No navegador', 'Curiosidades'],
};

/** Os que o Isaac mais usa, na ordem de exibição no topo. */
export const TOP_ORDER = ['CachyOS', 'VSCodium', 'Godot', 'Krita', 'Claude', 'DeepSeek', 'Obsidian', 'Ghostty', 'Prism Launcher'];

/** Grupo de Minecraft que aparece aberto ao entrar. */
export const MC_DEFAULT_GROUP = '9|Mods';

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
