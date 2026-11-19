// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// O endereço final do site ainda não foi decidido. Defina SITE_URL no build para
// gerar links absolutos corretos no feed RSS e no canonical.
const site = process.env.SITE_URL || undefined;
// Em subpasta (GitHub Pages), defina BASE_PATH, por exemplo /kanibox.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  integrations: [react()],
  build: { inlineStylesheets: 'auto' },
});
