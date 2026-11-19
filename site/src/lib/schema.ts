import { z } from 'astro/zod';

/** Valores aceitos nos filtros. Qualquer valor fora daqui falha o build. */
export const PLATFORMS = ['Linux', 'Windows', 'macOS', 'Android', 'iOS', 'Web', 'Nintendo', 'PlayStation'] as const;
export const LICENSES = ['Código aberto', 'Grátis', 'Freemium', 'Pago'] as const;
export const LOADERS = ['fabric', 'forge', 'neoforge', 'quilt'] as const;

export const itemSchema = z.object({
  sec: z.number().int().min(1).max(13),
  grp: z.string().min(1),
  name: z.string().min(1),
  url: z.union([z.literal(''), z.url()]),
  tipo: z.string().min(1),
  plat: z.array(z.enum(PLATFORMS)),
  lic: z.union([z.literal(''), z.enum(LICENSES)]),
  host: z.string(),
  note: z.string(),
  note_en: z.string().optional(),
  tipo_en: z.string().optional(),
  grp_en: z.string().optional(),
  via: z.string(),
  ini: z.boolean(),
  kind: z.enum(['item', 'game', 'mc']),
  mono: z.boolean(),
  /** nome do arquivo em /icons */
  icon: z.string().optional(),
  /** capa em /games */
  img: z.string().optional(),
  /** capa em retrato (caixa de jogo): mostra inteira em vez de cortar */
  img_fit: z.enum(['contain']).optional(),
  /** ícone em /mc */
  mc_icon: z.string().optional(),
  loaders: z.array(z.enum(LOADERS)).optional(),
  /** de onde veio a licença: GitHub, Modrinth ou vazio (definida à mão) */
  lic_src: z.string().optional(),
  soon: z.boolean().optional(),
  /** destaque: aparece no topo do site */
  top: z.boolean().optional(),
  /** data de entrada no catálogo, AAAA-MM-DD */
  added: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const catalogSchema = z.array(itemSchema);
export type RawItem = z.infer<typeof itemSchema>;
