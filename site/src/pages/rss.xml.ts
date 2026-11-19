import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { batches } from '../lib/catalog';
import { route } from '../lib/url';
import { t } from '../i18n';

export function GET(context: APIContext) {
  const list = batches();
  return rss({
    title: 'KaniBox: novidades',
    description: t('pt', 'newsDesc'),
    site: context.site ?? 'http://localhost:4321',
    items: list.map((b, i) => ({
      title: `${i === list.length - 1 ? t('pt', 'newsInitial') : t('pt', 'newsNew')}: ${b.items.length} itens`,
      pubDate: new Date(`${b.date}T12:00:00Z`),
      link: route('pt', 'news'),
      description: b.bySection.map((x) => `${x.section.title.pt}: ${x.count}`).join(', ') + '.',
    })),
  });
}
