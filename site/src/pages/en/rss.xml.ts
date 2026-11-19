import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { batches } from '../../lib/catalog';
import { route } from '../../lib/url';
import { t } from '../../i18n';

export function GET(context: APIContext) {
  const list = batches();
  return rss({
    title: 'KaniBox: news',
    description: t('en', 'newsDesc'),
    site: context.site ?? 'http://localhost:4321',
    items: list.map((b, i) => ({
      title: `${i === list.length - 1 ? t('en', 'newsInitial') : t('en', 'newsNew')}: ${b.items.length} items`,
      pubDate: new Date(`${b.date}T12:00:00Z`),
      link: route('en', 'news'),
      description: b.bySection.map((x) => `${x.section.title.en}: ${x.count}`).join(', ') + '.',
    })),
  });
}
