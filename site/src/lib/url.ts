/** Prefixa o caminho com a base do site (ex.: /kanibox no GitHub Pages). */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const withBase = (path: string): string => `${base}${path.startsWith('/') ? path : `/${path}`}`;
