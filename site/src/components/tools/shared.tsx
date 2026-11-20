import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Lang } from '../../i18n';
import { tt } from '../../i18n/tools';

export const LangCtx = createContext<Lang>('pt');
export const useLang = () => useContext(LangCtx);
/** Tradutor dos textos das ferramentas no idioma da página. */
export function useT() {
  const l = useLang();
  return (k: string, v?: Record<string, string | number>) => tt(l, k, v);
}

export const CIRC = 440; // 2 * pi * 70

export const f2 = (s: number): string => {
  const t = Math.ceil(s);
  const h = Math.floor(t / 3600);
  const mm = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
  const ss = String(t % 60).padStart(2, '0');
  return h > 0 ? `${String(h).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
};

/* ───────── som ───────── */
// Sino feito com Web Audio (sem arquivo de áudio). O AudioContext só pode nascer num gesto do usuário,
// então é criado ao apertar Iniciar ou ao ligar o som.
let ctx: AudioContext | null = null;

export function unlockAudio() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* sem áudio neste navegador */
  }
}

function bell(freq: number, t: number) {
  if (!ctx) return;
  for (const [mult, amp] of [[1, 1], [2.01, 0.35], [3.02, 0.12]] as const) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16 * amp, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1.2);
  }
}

/** up: acabou o tempo (sobe e fecha com um agudo). down: acabou uma pausa (desce). */
export function chime(kind: 'up' | 'down') {
  if (!ctx) return;
  const notes = kind === 'up' ? [659.25, 830.61, 987.77, 1318.51] : [987.77, 783.99, 659.25];
  const t0 = ctx.currentTime + 0.03;
  notes.forEach((f, i) => bell(f, t0 + i * 0.17));
}

/** Preferência salva no navegador. Começa em `initial` e lê o valor guardado depois da hidratação. */
export function useStored(key: string, initial: boolean): [boolean, (v: boolean) => void] {
  const [v, setV] = useState(initial);
  useEffect(() => {
    try {
      const s = localStorage.getItem(key);
      if (s !== null) setV(s === 'on');
    } catch {
      /* sem armazenamento */
    }
  }, [key]);
  return [
    v,
    (n: boolean) => {
      setV(n);
      try {
        localStorage.setItem(key, n ? 'on' : 'off');
      } catch {
        /* sem armazenamento */
      }
    },
  ];
}

/** Botão de som de uma ferramenta. Começa desligado e só toca se a pessoa ligar. */
export function SoundToggle({ id, on, set }: { id: string; on: boolean; set: (v: boolean) => void }) {
  const T = useT();
  return (
    <button
      type="button"
      id={id}
      className="opt sound"
      aria-pressed={on}
      onClick={() => {
        const n = !on;
        set(n);
        if (n) {
          unlockAudio();
          chime('up'); // ao ligar, toca para mostrar como é
        }
      }}
    >
      {on ? T('soonOn') : T('soonOff')}
    </button>
  );
}

/* ───────── contagem regressiva ───────── */
export function useCountdown(initial: number, onDone?: () => void) {
  const [total, setTotal] = useState(initial);
  const [left, setLeft] = useState(initial);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(0);
  const end = useRef(0);
  // garante que o fim de uma contagem é tratado uma única vez, mesmo com ticks atrasados
  const active = useRef(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const baseTitle = useRef('');

  useEffect(() => {
    baseTitle.current = document.title;
  }, []);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (!active.current) return;
      const l = Math.max(0, (end.current - Date.now()) / 1000);
      setLeft(l);
      if (l <= 0) {
        active.current = false;
        setRunning(false);
        setFinished((n) => n + 1);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([180, 90, 180]);
        doneRef.current?.();
      }
    };
    const iv = setInterval(tick, 200);
    tick();
    return () => clearInterval(iv);
  }, [running]);

  useEffect(() => {
    if (!baseTitle.current) return;
    document.title = running ? `${f2(left)} · KaniBox` : baseTitle.current;
    return () => {
      document.title = baseTitle.current;
    };
  }, [running, left]);

  return {
    total,
    left,
    running,
    finished,
    start() {
      unlockAudio();
      const from = left <= 0 ? total : left;
      end.current = Date.now() + from * 1000;
      active.current = true;
      setLeft(from);
      setRunning(true);
    },
    pause() {
      active.current = false;
      setRunning(false);
    },
    set(sec: number) {
      active.current = false;
      setRunning(false);
      setTotal(sec);
      setLeft(sec);
    },
  };
}

export function Ring({ total, left, finished, label }: { total: number; left: number; finished: number; label: string }) {
  const showDone = finished > 0 && left <= 0;
  return (
    <div key={showDone ? finished : 0} className={showDone ? 'ring done' : 'ring'}>
      <svg viewBox="0 0 156 156" aria-hidden="true">
        <circle className="bg" cx="78" cy="78" r="70" />
        <circle className="fg" cx="78" cy="78" r="70" style={{ strokeDasharray: CIRC, strokeDashoffset: total > 0 ? CIRC * (1 - left / total) : 0 }} />
      </svg>
      <div className="t" role="timer" aria-label={label}>
        {f2(left)}
      </div>
    </div>
  );
}

export function startLabel(T: (k: string) => string, running: boolean, left: number, total: number) {
  if (running) return T('pause');
  return left > 0 && left < total ? T('resume') : T('start');
}

/* ───────── cartão de ferramenta, com modo foco (tela cheia) ───────── */
export function ToolCard({ id, title, badge, children, wide }: { id: string; title: string; badge?: string; children: ReactNode; wide?: boolean }) {
  const T = useT();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest(`#${id}`)) {
        e.preventDefault();
        setOpen(false);
      }
    };
    addEventListener('keydown', onKey);
    addEventListener('pointerdown', onDown, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('pointerdown', onDown, true);
      document.body.style.overflow = prev;
    };
  }, [open, id]);
  return (
    <div
      className={`tool${open ? ' expanded' : ''}${wide ? ' wide' : ''}`}
      id={id}
      role={open ? 'dialog' : undefined}
      aria-modal={open ? true : undefined}
      aria-label={open ? title : undefined}
    >
      <div className="tool-head">
        <h3>
          {title} {badge && <small>{badge}</small>}
        </h3>
        <button type="button" className="expand" aria-label={open ? T('closeAria', { t: title }) : T('expandAria', { t: title })} aria-expanded={open} onClick={() => setOpen(!open)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {open ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
          </svg>
          <span>{open ? T('close') : T('expand')}</span>
        </button>
      </div>
      <div className="tool-body">{children}</div>
    </div>
  );
}

/* ───────── campos ───────── */
export function Num({ label, value, set, min, max, step, id, placeholder, disabled }: { label: string; value: string | number; set: (v: string) => void; min?: number; max?: number; step?: number | string; id?: string; placeholder?: string; disabled?: boolean }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input id={id} className="inp" type="number" inputMode="decimal" value={value} min={min} max={max} step={step} placeholder={placeholder} disabled={disabled} onChange={(e) => set(e.target.value)} />
    </label>
  );
}

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  return {
    copied,
    async copy(key: string, text: string) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.append(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1400);
    },
  };
}
