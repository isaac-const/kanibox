import {
  apply, emptyState, fromParams, toParams, optionsFor, loaderSummary, toolsVisible, isActive, norm,
  type FilterField, type IndexEntry,
} from '../lib/filter';
import { LOADER_NAMES } from '../lib/sections';
import { watchSeg } from './seg';

const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const json = <T,>(id: string, fallback: T): T => {
  try {
    return JSON.parse(document.getElementById(id)?.textContent || '') as T;
  } catch {
    return fallback;
  }
};
const text = json<Record<string, string>>('i18n', {});
const fmt = (k: string, vars: Record<string, string | number> = {}) => (text[k] ?? k).replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? `{${v}}`));

/* ───────── segmentos elásticos (idioma, abas do Minecraft e dos jogos, abas das ferramentas) ───────── */
watchSeg(document);

/* ───────── tema (todas as páginas) ───────── */
const themeBtn = $('#themeBtn');
const themes = $('#themes');

function paintTheme() {
  const cur = document.documentElement.dataset.theme;
  $$('[data-t]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.t === cur)));
}
function setTheme(t: string, x: number, y: number) {
  const apply = () => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('kb-theme', t); } catch { /* sem armazenamento */ }
    paintTheme();
  };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (!doc.startViewTransition || reduced()) return apply();
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const vt = doc.startViewTransition(apply);
  vt.ready
    .then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
      )
    )
    .catch(() => {});
}
function closeThemes() {
  themes?.classList.remove('on');
  themeBtn?.setAttribute('aria-expanded', 'false');
}
paintTheme();
themeBtn?.addEventListener('click', () => {
  const on = !themes!.classList.contains('on');
  themes!.classList.toggle('on', on);
  themeBtn.setAttribute('aria-expanded', String(on));
});
themes?.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-t]');
  if (!b) return;
  const r = b.getBoundingClientRect();
  setTheme(b.dataset.t!, r.left + 20, r.top + 20);
});
document.addEventListener('click', (e) => {
  if (!(e.target as HTMLElement).closest('.theme-wrap')) closeThemes();
});

/* ───────── menu lateral ───────── */
const menu = $('#menu');
const menuBtn = $('#menuBtn');
const scrim = $('#scrim');
if (menu && menuBtn && scrim) {
  menu.setAttribute('inert', '');
  const setMenu = (on: boolean) => {
    const was = menu.classList.contains('on');
    menu.classList.toggle('on', on);
    scrim.classList.toggle('on', on);
    menu.toggleAttribute('inert', !on);
    menu.setAttribute('aria-hidden', String(!on));
    menuBtn.setAttribute('aria-expanded', String(on));
    document.body.classList.toggle('noscroll', on);
    if (on) $<HTMLElement>('.mi', menu)?.focus();
    else if (was) menuBtn.focus();
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('on')));
  $('#menuClose')?.addEventListener('click', () => setMenu(false));
  scrim.addEventListener('click', () => setMenu(false));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('on')) setMenu(false);
  });
}
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeThemes();
});

/* ───────── canivete: dobrar e abrir ───────── */
const kd = $('#kdock');
const kh = $('#kh');
if (kd && kh) {
  kh.addEventListener('click', () => {
    const fold = !kd.classList.contains('fold');
    kd.classList.toggle('fold', fold);
    kd.classList.toggle('open', !fold);
    kh.setAttribute('aria-pressed', String(fold));
  });
  requestAnimationFrame(() => requestAnimationFrame(() => kd.classList.add('open')));
}

/* ───────── páginas com busca e filtros (início e categorias) ───────── */
const idxEl = document.getElementById('idx');
if (idxEl) initPage(json<IndexEntry[]>('idx', []), json<Record<string, string>>('lbl', {}));

function initPage(index: IndexEntry[], labels: Record<string, string>) {
  const home = document.body.dataset.scope === 'home';
  const countable = index.filter((e) => !e.n);
  const total = countable.length;
  const secTotals = new Map<number, number>();
  for (const e of index) secTotals.set(e.s, (secTotals.get(e.s) ?? 0) + 1);

  const byId = new Map<string, HTMLElement>();
  $$('[data-id]').forEach((el) => byId.set(el.dataset.id!, el));
  const sections = $$('.sec');
  const groups = $$('[data-g]');
  const mods = index.filter((e) => e.ld && e.g === 'Mods');

  const input = $<HTMLInputElement>('#q')!;
  const box = $('#searchBox')!;
  const panel = $('#panel')!;
  const sumEl = $('#sum')!;
  const clearBtn = $('#clear')!;
  const emptyEl = $('#empty')!;
  const ldsum = $('#ldsum');
  const homeWrap = $('#home-sections');
  const heroParts = ['#hero-top', '#cats'].map((s) => $(s)).filter(Boolean) as HTMLElement[];
  const toolsHint = $('#tools-hint');
  const emptyGlobal = $<HTMLAnchorElement>('#empty-global');
  const globalBase = emptyGlobal?.getAttribute('href') ?? '';

  let { state, loader } = fromParams(new URLSearchParams(location.search));
  let rawQ = new URLSearchParams(location.search).get('q') ?? '';
  let openF: FilterField | null = null;
  // aba ativa de cada seção que tem abas (Minecraft e Jogos)
  const subActive = new Map<HTMLElement, string>();
  sections.forEach((s) => {
    const sel = $$('[data-sub]', s).find((b) => b.getAttribute('aria-selected') === 'true');
    if (sel) subActive.set(s, sel.dataset.sub!);
  });
  const label = (v: string) => labels[v] ?? v;

  /* --- desenho --- */
  function render() {
    const act = isActive(state);
    const r = apply(index, state);
    for (const [id, el] of byId) el.hidden = !r.visible.has(id);

    for (const g of groups) {
      const n = r.byGroup.get(g.dataset.g!) ?? 0;
      g.hidden = n === 0;
      const c = $('[data-gcount]', g);
      if (c) c.textContent = String(n);
    }

    // abas elásticas: esconde as sem resultado e troca a ativa se ela esvaziou
    for (const [sec, active] of subActive) {
      const btns = $$('[data-sub]', sec);
      btns.forEach((b) => {
        const n = r.byGroup.get(b.dataset.sub!) ?? 0;
        b.hidden = n === 0;
        const c = $('[data-gcount]', b);
        if (c) c.textContent = String(n);
      });
      let cur = active;
      if (!(r.byGroup.get(cur) ?? 0)) cur = btns.find((b) => !b.hidden)?.dataset.sub ?? cur;
      subActive.set(sec, cur);
      btns.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.sub === cur)));
      $$('[data-g]', sec).forEach((g) => g.classList.toggle('sub-off', g.dataset.g !== cur));
    }

    const tools = home && act && toolsVisible(state);
    for (const s of sections) {
      const id = Number(s.dataset.s);
      const n = r.bySection.get(id) ?? 0;
      s.hidden = n === 0;
      const c = $('[data-seccount]', s);
      const all = secTotals.get(id) ?? 0;
      if (c) c.textContent = n === all ? fmt(all === 1 ? 'nItem' : 'nItems', { n: all }) : fmt('ofTotal', { a: n, b: all });
    }
    homeWrap?.classList.toggle('on', act);
    heroParts.forEach((h) => (h.hidden = act));
    if (toolsHint) toolsHint.hidden = !tools;

    emptyEl.classList.toggle('on', r.visible.size === 0 && !tools);
    sumEl.textContent = act ? fmt('ofTotal', { a: r.shown, b: total }) : fmt('nItems', { n: total });
    clearBtn.classList.toggle('on', act);
    (['plat', 'tipo', 'lic'] as const).forEach((f) => {
      const chip = $(`[data-f="${f}"]`)!;
      const n = state[f].size;
      chip.classList.toggle('on', n > 0);
      $('b', chip)!.textContent = n ? String(n) : '';
    });
    box.classList.toggle('has', rawQ !== '');
    if (emptyGlobal) emptyGlobal.href = rawQ ? `${globalBase}?q=${encodeURIComponent(rawQ)}` : globalBase;

    paintLoader();
    syncUrl();
  }

  function paintLoader() {
    $$('.ldbar [data-ld]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ld === loader)));
    $$('li[data-ld]').forEach((li) => {
      const has = loader === 'todos' || li.dataset.ld!.split(' ').includes(loader);
      li.classList.toggle('dim', !has);
      $$('.ld span', li).forEach((s) => s.classList.toggle('on', loader !== 'todos' && s.dataset.l === loader));
    });
    if (!ldsum) return;
    if (loader === 'todos') {
      ldsum.textContent = fmt('loaderHint');
    } else {
      const s = loaderSummary(mods, loader);
      ldsum.innerHTML = fmt('loaderSum', { name: LOADER_NAMES[loader], ok: s.ok, total: s.total });
    }
  }

  function syncUrl() {
    const p = toParams(state, loader);
    if (rawQ) p.set('q', rawQ);
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
  }

  /* --- busca --- */
  let timer: ReturnType<typeof setTimeout>;
  input.value = rawQ;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      rawQ = input.value.trim();
      state.q = norm(rawQ);
      render();
    }, 70);
  });
  $('#qClear')!.addEventListener('click', () => {
    input.value = '';
    rawQ = '';
    state.q = '';
    render();
    input.focus();
  });
  clearBtn.addEventListener('click', () => {
    state = emptyState();
    rawQ = '';
    input.value = '';
    closePanel();
    render();
  });

  /* --- filtros --- */
  function openPanel(f: FilterField, btn: HTMLElement) {
    openF = f;
    panel.replaceChildren();
    for (const [v, n] of optionsFor(countable, f)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.dataset.v = v;
      b.setAttribute('aria-pressed', String(state[f].has(v)));
      const small = document.createElement('small');
      small.textContent = String(n);
      b.append(label(v) + ' ', small);
      panel.append(b);
    }
    const r = btn.getBoundingClientRect();
    panel.style.top = `${r.bottom + 8}px`;
    panel.style.left = `${Math.max(12, Math.min(r.left, innerWidth - panel.offsetWidth - 12))}px`;
    panel.classList.add('on');
    $$('.fchip[data-f]').forEach((c) => c.setAttribute('aria-expanded', String(c === btn)));
  }
  function closePanel() {
    openF = null;
    panel.classList.remove('on');
    $$('.fchip[data-f]').forEach((c) => c.setAttribute('aria-expanded', 'false'));
  }
  $('#filters')!.addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>('.fchip[data-f]');
    if (!chip) return;
    const f = chip.dataset.f as FilterField;
    openF === f ? closePanel() : openPanel(f, chip);
  });
  panel.addEventListener('click', (e) => {
    const o = (e.target as HTMLElement).closest<HTMLElement>('.opt');
    if (!o || !openF) return;
    const set = state[openF];
    const v = o.dataset.v!;
    set.has(v) ? set.delete(v) : set.add(v);
    o.setAttribute('aria-pressed', String(set.has(v)));
    render();
  });
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.fpanel, .fchip')) closePanel();
  });
  addEventListener('scroll', () => openF && closePanel(), { passive: true });
  addEventListener('resize', () => openF && closePanel());
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  /* --- abas elásticas das seções e loader dos mods --- */
  $$('[data-sub]').forEach((b) =>
    b.addEventListener('click', () => {
      const sec = b.closest<HTMLElement>('.sec')!;
      subActive.set(sec, b.dataset.sub!);
      render();
    })
  );
  $$('.ldbar [data-ld]').forEach((b) =>
    b.addEventListener('click', () => {
      loader = b.dataset.ld!;
      render();
    })
  );

  render();
}
