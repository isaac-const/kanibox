import { useRef, useState } from 'react';
import { Num, ToolCard, useLang, useT } from './shared';
import { errText } from '../../i18n/tools';
import { parseList, pick, randomFloat, randomInt, uniqueInts, cryptoRng } from '../../lib/tools/random';

export function NameDraw() {
  const T = useT();
  const [text, setText] = useState('Ana\nBruno\nCarla\nDiego');
  const [count, setCount] = useState('1');
  const [remove, setRemove] = useState(false);
  const [drawn, setDrawn] = useState<string[]>([]);
  const [winners, setWinners] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const all = parseList(text);
  const pool = remove ? all.filter((n) => !drawn.includes(n)) : all;
  function run() {
    const n = Math.max(1, Math.floor(Number(count) || 1));
    if (pool.length === 0) return setMsg(remove && all.length ? T('namesAllDone') : T('namesNone'));
    const w = pick(pool, n);
    setWinners(w);
    setMsg(n > pool.length ? T('namesOnly', { n: pool.length, w: pool.length === 1 ? T('name') : T('names') }) : '');
    if (remove) setDrawn((d) => [...d, ...w]);
  }
  return (
    <ToolCard id="t-names" title={T('namesTitle')}>
      <label className="field">
        <span>{T('namesLabel')}</span>
        <textarea id="nm-in" className="inp" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="row2 aend">
        <Num label={T('namesCount')} id="nm-n" value={count} min={1} max={999} set={setCount} />
        <label className="check">
          <input type="checkbox" checked={remove} onChange={(e) => setRemove(e.target.checked)} /> {T('namesNoRepeat')}
        </label>
      </div>
      <div className="row2">
        <button type="button" className="btn solid" id="nm-go" onClick={run}>{T('namesGo')}</button>
        {drawn.length > 0 && <button type="button" className="btn ghost" onClick={() => { setDrawn([]); setWinners([]); setMsg(''); }}>{T('namesClear')}</button>}
      </div>
      <div className="winners" id="nm-out" aria-live="polite">
        {winners.map((w, i) => (
          <span key={`${w}-${i}-${winners.length}`} className="win">{w}</span>
        ))}
        {msg && <p className="h">{msg}</p>}
      </div>
      <p className="h">{T('namesPool', { n: pool.length, w: pool.length === 1 ? T('name') : T('names'), extra: drawn.length > 0 ? T('namesExtra', { n: drawn.length }) : '' })}</p>
    </ToolCard>
  );
}

export function RandomNumber() {
  const T = useT();
  const lang = useLang();
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('1');
  const [unique, setUnique] = useState(false);
  const [dec, setDec] = useState('0');
  const [out, setOut] = useState<string[]>([]);
  const [err, setErr] = useState('');
  function run() {
    try {
      const a = Number(min), b = Number(max), n = Math.max(1, Math.min(500, Math.floor(Number(count) || 1))), d = Math.max(0, Math.min(6, Math.floor(Number(dec) || 0)));
      if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('fill');
      let list: number[];
      if (d === 0) list = unique ? uniqueInts(Math.round(a), Math.round(b), n) : Array.from({ length: n }, () => randomInt(Math.round(a), Math.round(b)));
      else list = Array.from({ length: n }, () => randomFloat(a, b, d));
      setOut(list.map(String));
      setErr('');
    } catch (e) {
      const m = (e as Error).message;
      setErr(m === 'fill' ? T('randFill') : errText(lang, m));
      setOut([]);
    }
  }
  return (
    <ToolCard id="t-rand" title={T('randTitle')}>
      <div className="fields" role="group" aria-label={T('randRange')}>
        <Num label={T('randFrom')} id="rn-min" value={min} step="any" set={setMin} />
        <Num label={T('randTo')} id="rn-max" value={max} step="any" set={setMax} />
        <Num label={T('randCount')} id="rn-n" value={count} min={1} max={500} set={setCount} />
        <Num label={T('randDec')} id="rn-d" value={dec} min={0} max={6} set={setDec} />
      </div>
      <label className="check">
        <input type="checkbox" checked={unique} disabled={Number(dec) > 0} onChange={(e) => setUnique(e.target.checked)} /> {T('randUnique')}
      </label>
      <button type="button" className="btn solid" id="rn-go" onClick={run}>{T('randGo')}</button>
      <div className="winners big" id="rn-out" aria-live="polite">
        {out.map((v, i) => (
          <span key={`${v}-${i}-${out.length}`} className="win num">{v}</span>
        ))}
        {err && <p className="h err">{err}</p>}
      </div>
    </ToolCard>
  );
}

const COLORS = ['#ff5a36', '#f2b134', '#4cc38a', '#4ea8de', '#a78bfa', '#f472b6', '#94a3b8', '#fb923c'];

export function Roulette() {
  const T = useT();
  const [text, setText] = useState(T('wheelDefault'));
  const [deg, setDeg] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const items = parseList(text).slice(0, 24);
  const n = items.length;
  const seg = n ? 360 / n : 360;
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function spin() {
    if (n < 2 || spinning) return;
    const i = randomInt(0, n - 1);
    const center = (i + 0.5) * seg + (cryptoRng() - 0.5) * seg * 0.7;
    const base = Math.ceil(deg / 360) * 360;
    setResult('');
    setSpinning(true);
    setDeg(base + 360 * 5 + (360 - center));
    timer.current = setTimeout(() => {
      setSpinning(false);
      setResult(items[i]);
    }, reduce ? 50 : 4200);
  }
  const paths = items.map((label, i) => {
    const a0 = ((i * seg - 90) * Math.PI) / 180, a1 = (((i + 1) * seg - 90) * Math.PI) / 180;
    const r = 100;
    const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0), x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
    const mid = (((i + 0.5) * seg - 90) * Math.PI) / 180;
    const d = n === 1 ? `M0 0 m-${r} 0 a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 -${r * 2} 0` : `M0 0 L${x0} ${y0} A${r} ${r} 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
    return { d, label, color: COLORS[i % COLORS.length], tx: 62 * Math.cos(mid), ty: 62 * Math.sin(mid), rot: (mid * 180) / Math.PI };
  });
  return (
    <ToolCard id="t-wheel" title={T('wheelTitle')}>
      <div className="wheel-wrap">
        <div className="pointer" aria-hidden="true" />
        <svg viewBox="-104 -104 208 208" className="wheel" style={{ transform: `rotate(${deg}deg)`, transition: spinning && !reduce ? 'transform 4s cubic-bezier(.12,.7,.1,1)' : 'none' }} role="img" aria-label={T('wheelAria', { n })}>
          {paths.map((p, i) => (
            <g key={i}>
              <path d={p.d} fill={p.color} stroke="rgba(0,0,0,.25)" strokeWidth="0.8" />
              {n > 1 && <text x={p.tx} y={p.ty} transform={`rotate(${p.rot} ${p.tx} ${p.ty})`} textAnchor="middle" dominantBaseline="middle" fontSize={n > 12 ? 6 : 8.5} fontWeight="700" fill="#111">{p.label.length > 12 ? p.label.slice(0, 11) + '…' : p.label}</text>}
            </g>
          ))}
          <circle r="9" fill="var(--surface)" stroke="var(--line)" />
        </svg>
      </div>
      <div className="row2">
        <button type="button" className="btn solid" id="wh-go" disabled={n < 2 || spinning} onClick={spin}>{spinning ? T('wheelSpinning') : T('wheelGo')}</button>
      </div>
      <output id="wh-out" className="calc-out" aria-live="polite">{result ? T('wheelWon', { x: result }) : n < 2 ? T('wheelMin') : ' '}</output>
      <label className="field">
        <span>{T('wheelOptions')}</span>
        <textarea id="wh-in" className="inp" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
    </ToolCard>
  );
}

export function YesNo() {
  const T = useT();
  const [res, setRes] = useState<'yes' | 'no' | null>(null);
  const [n, setN] = useState(0);
  const [tally, setTally] = useState({ s: 0, n: 0 });
  function flip() {
    const r = randomInt(0, 1) === 0 ? 'yes' : 'no';
    setRes(r);
    setN((x) => x + 1);
    setTally((t) => (r === 'yes' ? { ...t, s: t.s + 1 } : { ...t, n: t.n + 1 }));
  }
  return (
    <ToolCard id="t-yesno" title={T('ynTitle')}>
      <button type="button" className="coin" id="yn-go" onClick={flip} aria-label={T('ynAria')}>
        <span key={n} className={`face ${res ?? ''}`} id="yn-out" aria-live="polite">
          {res === 'yes' ? T('ynYes') : res === 'no' ? T('ynNo') : '?'}
        </span>
      </button>
      <p className="h">{T('ynHint', { s: tally.s, n: tally.n })}</p>
      {n > 0 && <button type="button" className="btn ghost" onClick={() => { setRes(null); setN(0); setTally({ s: 0, n: 0 }); }}>{T('ynReset')}</button>}
    </ToolCard>
  );
}
