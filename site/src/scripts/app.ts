import {
  apply, emptyState, fromParams, toParams, optionsFor, loaderSummary, toolsVisible, isActive, norm,
  type FilterField, type IndexEntry,
} from '../lib/filter';
import { LOADER_NAMES } from '../lib/sections';

const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

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
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeThemes();
});

/* ───────── página inicial: busca, filtros, abas, Minecraft e canivete ───────── */
const idxEl = document.getElementById('idx');
if (idxEl) initHome(JSON.parse(idxEl.textContent || '[]') as IndexEntry[]);

function initHome(index: IndexEntry[]) {
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
  const hero = $('#hero-top');
  const viewBtn = $('#viewBtn')!;
  const tabsbar = $('#tabsbar')!;
  const subBtns = $$('[data-sub]');

  let { state, loader } = fromParams(new URLSearchParams(location.search));
  let rawQ = new URLSearchParams(location.search).get('q') ?? '';
  let openF: FilterField | null = null;
  let view: 'list' | 'tabs' = 'list';
  try { view = localStorage.getItem('kb-view') === 'tabs' ? 'tabs' : 'list'; } catch { /* sem armazenamento */ }
  const hashId = Number(location.hash.match(/^#s(\d+)$/)?.[1]);
  let activeTab = Number.isFinite(hashId) && hashId > 0 ? hashId : Number(sections[0].dataset.s);
  let activeSub = subBtns.find((b) => b.getAttribute('aria-selected') === 'true')?.dataset.sub ?? '';

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

    // abas do Minecraft: esconde as sem resultado e troca a ativa se ela esvaziou
    subBtns.forEach((b) => {
      const n = r.byGroup.get(b.dataset.sub!) ?? 0;
      b.hidden = n === 0;
      const c = $('[data-gcount]', b);
      if (c) c.textContent = String(n);
    });
    if (subBtns.length && !(r.byGroup.get(activeSub) ?? 0)) {
      activeSub = subBtns.find((b) => !b.hidden)?.dataset.sub ?? activeSub;
    }
    subBtns.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.sub === activeSub)));
    for (const g of groups) {
      if (g.closest('[data-s="9"]')) g.classList.toggle('sub-off', g.dataset.g !== activeSub);
    }

    const tools = toolsVisible(state);
    for (const s of sections) {
      const id = Number(s.dataset.s);
      const c = $('[data-seccount]', s);
      if (id === 12) {
        s.hidden = !tools;
        continue;
      }
      const n = r.bySection.get(id) ?? 0;
      s.hidden = n === 0;
      const all = secTotals.get(id) ?? 0;
      if (c) c.textContent = n === all ? `${all} ${all === 1 ? 'item' : 'itens'}` : `${n} de ${all}`;
    }

    emptyEl.classList.toggle('on', r.visible.size === 0 && !tools);
    sumEl.textContent = act ? `${r.shown} de ${total}` : `${total} itens`;
    clearBtn.classList.toggle('on', act);
    (['plat', 'tipo', 'lic'] as const).forEach((f) => {
      const chip = $(`[data-f="${f}"]`)!;
      const n = state[f].size;
      chip.classList.toggle('on', n > 0);
      $('b', chip)!.textContent = n ? String(n) : '';
    });
    box.classList.toggle('has', rawQ !== '');
    if (hero) hero.hidden = act;

    paintLoader();
    applyView();
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
      ldsum.textContent = 'Escolha um loader para ver quais mods rodam nele.';
    } else {
      const s = loaderSummary(mods, loader);
      ldsum.innerHTML = `No <b>${LOADER_NAMES[loader]}</b>: <b>${s.ok} de ${s.total}</b> mods. Os riscados não têm esse loader.`;
    }
  }

  function syncUrl() {
    const p = toParams(state, loader);
    if (rawQ) p.set('q', rawQ);
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
  }

  /* --- visualização: lista (tudo numa página) ou abas (uma seção por vez) --- */
  function applyView() {
    const tabs = view === 'tabs';
    document.documentElement.classList.toggle('view-tabs', tabs);
    viewBtn.setAttribute('aria-pressed', String(tabs));
    const visible = sections.filter((s) => !s.hidden);
    if (!visible.some((s) => Number(s.dataset.s) === activeTab) && visible.length) activeTab = Number(visible[0].dataset.s);
    sections.forEach((s) => s.classList.toggle('tab-off', tabs && Number(s.dataset.s) !== activeTab));
    $$('[data-tab]', tabsbar).forEach((b) => {
      const sec = document.getElementById(`s${b.dataset.tab}`);
      b.hidden = !sec || sec.hidden;
      b.setAttribute('aria-selected', String(tabs && Number(b.dataset.tab) === activeTab));
    });
    if (tabs) blades.forEach((b) => (Number(b.dataset.s) === activeTab ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
    updateBlades();
  }
  function setTab(id: number, scroll = true) {
    activeTab = id;
    applyView();
    history.replaceState(null, '', location.pathname + location.search + `#s${id}`);
    if (scroll) {
      const top = tabsbar.getBoundingClientRect().top + scrollY - 130;
      scrollTo({ top: Math.max(0, top), behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
  }
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  viewBtn.addEventListener('click', () => {
    view = view === 'tabs' ? 'list' : 'tabs';
    try { localStorage.setItem('kb-view', view); } catch { /* sem armazenamento */ }
    applyView();
  });
  tabsbar.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-tab]');
    if (b) setTab(Number(b.dataset.tab));
  });

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
      b.append(v + ' ', small);
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

  /* --- Minecraft: abas e loader --- */
  subBtns.forEach((b) =>
    b.addEventListener('click', () => {
      activeSub = b.dataset.sub!;
      render();
    })
  );
  $$('.ldbar [data-ld]').forEach((b) =>
    b.addEventListener('click', () => {
      loader = b.dataset.ld!;
      render();
    })
  );

  /* --- canivete --- */
  const kd = $('#kdock')!;
  const kh = $('#kh')!;
  const blades = $$<HTMLAnchorElement>('.blade');
  function updateBlades() {
    let k = 0;
    for (const b of blades) {
      const sec = document.getElementById(`s${b.dataset.s}`);
      const vis = !!sec && !sec.hidden;
      b.hidden = !vis;
      if (vis) b.style.setProperty('--k', String(k++));
      else b.removeAttribute('aria-current');
    }
  }
  kh.addEventListener('click', () => {
    const fold = !kd.classList.contains('fold');
    kd.classList.toggle('fold', fold);
    kd.classList.toggle('open', !fold);
    kh.setAttribute('aria-pressed', String(fold));
  });
  blades.forEach((b) =>
    b.addEventListener('click', (e) => {
      if (view !== 'tabs') return;
      e.preventDefault();
      setTab(Number(b.dataset.s));
    })
  );
  const spy = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting || view === 'tabs') return;
        const id = (en.target as HTMLElement).dataset.s;
        blades.forEach((b) => (b.dataset.s === id ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
      }),
    { rootMargin: '-35% 0px -55% 0px' }
  );
  sections.forEach((s) => spy.observe(s));
  requestAnimationFrame(() => requestAnimationFrame(() => kd.classList.add('open')));

  render();
}
