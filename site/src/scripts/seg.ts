/**
 * Segmento elástico, inspirado no Rubber Segment do ReactBits (reactbits.dev/micro/rubber-segment).
 * O marcador desliza até a opção escolhida com uma mola que passa do ponto e se achata um instante,
 * como borracha. Funciona com qualquer grupo `.seg` que tenha um `.seg-pill` e uma opção marcada com
 * aria-selected, aria-current ou aria-pressed.
 */
const SELECTED = '[aria-selected="true"],[aria-current="true"],[aria-current="page"]';

function layout(seg: HTMLElement, animate: boolean) {
  const pill = seg.querySelector<HTMLElement>(':scope > .seg-pill');
  if (!pill) return;
  const sel = [...seg.querySelectorAll<HTMLElement>(SELECTED)].find((e) => e.offsetWidth > 0);
  if (!sel) {
    pill.style.opacity = '0';
    return;
  }
  const x = `${sel.offsetLeft}px`;
  const y = `${sel.offsetTop}px`;
  const w = `${sel.offsetWidth}px`;
  const h = `${sel.offsetHeight}px`;
  const moved = pill.style.getPropertyValue('--x') !== x || pill.style.getPropertyValue('--w') !== w;
  pill.style.opacity = '1';
  pill.style.setProperty('--x', x);
  pill.style.setProperty('--y', y);
  pill.style.setProperty('--w', w);
  pill.style.setProperty('--h', h);
  if (animate && moved && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    pill.classList.remove('stretch');
    void pill.offsetWidth; // reinicia a animação
    pill.classList.add('stretch');
  }
}

export function watchSeg(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.seg').forEach((seg) => {
    if (seg.dataset.rubber) return;
    seg.dataset.rubber = '1';
    const pill = seg.querySelector<HTMLElement>(':scope > .seg-pill');
    if (pill) pill.style.transition = 'none';
    layout(seg, false);
    requestAnimationFrame(() => {
      if (pill) pill.style.transition = '';
    });
    new MutationObserver(() => layout(seg, true)).observe(seg, { attributes: true, subtree: true, attributeFilter: ['aria-selected', 'aria-current', 'hidden'] });
    new ResizeObserver(() => layout(seg, false)).observe(seg);
    document.fonts?.ready.then(() => layout(seg, false));
  });
}
