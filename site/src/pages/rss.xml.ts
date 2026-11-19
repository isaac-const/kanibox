import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { batches } from '../lib/catalog';

export function GET(context: APIContext) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const list = batches();
  return rss({
    title: 'KaniBox: novidades',
    description: 'O que entrou no KaniBox e quando.',
    site: context.site ?? 'http://localhost:4321',
    items: list.map((b, i) => ({
      title: `${i === list.length - 1 ? 'Lote inicial' : 'Novos itens'}: ${b.items.length} itens`,
      pubDate: new Date(`${b.date}T12:00:00Z`),
      link: `${base}/novidades`,
      description: b.bySection.map((x) => `${x.section.title}: ${x.count}`).join(', ') + '.',
    })),
  });
}
