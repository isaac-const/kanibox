import { useState } from 'react';
import { Num, ToolCard, useLang, useT } from './shared';
import { errText } from '../../i18n/tools';
import { CATEGORIES, convert, fmt, unitName } from '../../lib/tools/units';
import { evaluate, ruleOfThree } from '../../lib/tools/calc';

export function Calculator() {
  const T = useT();
  const lang = useLang();
  const [expr, setExpr] = useState('');
  const [deg, setDeg] = useState(true);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState('');
  const [hist, setHist] = useState<{ e: string; r: string }[]>([]);
  const add = (s: string) => setExpr((x) => x + s);
  function run() {
    if (!expr.trim()) return;
    try {
      const r = fmt(evaluate(expr, deg));
      setResult(r);
      setError('');
      setHist((h) => [{ e: expr, r }, ...h].slice(0, 5));
    } catch (e) {
      setError(errText(lang, (e as Error).message));
      setResult('');
    }
  }
  const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '%', '+', '(', ')', '^', 'sqrt('];
  return (
    <ToolCard id="t-calc" title={T('calcTitle')}>
      <input
        id="calc-in"
        className="inp calc-in"
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && run()}
        placeholder="2 + 3 × 4"
        aria-label={T('calcAria')}
        inputMode="text"
        autoComplete="off"
      />
      <output id="calc-out" className={`calc-out${error ? ' err' : ''}`} aria-live="polite">
        {error || (result !== '' ? `= ${result}` : ' ')}
      </output>
      <div className="keys">
        {keys.map((k) => (
          <button type="button" key={k} onClick={() => add(k)}>
            {k === 'sqrt(' ? '√' : k}
          </button>
        ))}
        <button type="button" onClick={() => { setExpr(''); setResult(''); setError(''); }}>C</button>
        <button type="button" onClick={() => setExpr((x) => x.slice(0, -1))} aria-label={T('erase')}>⌫</button>
        <button type="button" className="eq" id="calc-eq" onClick={run}>=</button>
      </div>
      <label className="check">
        <input type="checkbox" checked={deg} onChange={(e) => setDeg(e.target.checked)} /> {T('calcDeg')}
      </label>
      {hist.length > 0 && (
        <div className="laps" aria-label={T('calcHistory')}>
          {hist.map((h, i) => (
            <div key={i}>
              <span>{h.e}</span>
              <span>= {h.r}</span>
            </div>
          ))}
        </div>
      )}
    </ToolCard>
  );
}

export function Units() {
  const T = useT();
  const lang = useLang();
  const [cat, setCat] = useState(CATEGORIES[0].id);
  const c = CATEGORIES.find((x) => x.id === cat)!;
  const [from, setFrom] = useState(c.units[0].id);
  const [to, setTo] = useState(c.units[2].id);
  const [val, setVal] = useState('1');
  const n = Number(val);
  const ok = val.trim() !== '' && Number.isFinite(n);
  function pickCat(id: string) {
    const nc = CATEGORIES.find((x) => x.id === id)!;
    setCat(id);
    setFrom(nc.units[0].id);
    setTo(nc.units[Math.min(2, nc.units.length - 1)].id);
  }
  return (
    <ToolCard id="t-units" title={T('unitsTitle')}>
      <label className="field">
        <span>{T('unitsCat')}</span>
        <select id="un-cat" className="inp" value={cat} onChange={(e) => pickCat(e.target.value)}>
          {CATEGORIES.map((x) => (
            <option key={x.id} value={x.id}>
              {lang === 'en' ? x.en : x.name}
            </option>
          ))}
        </select>
      </label>
      <Num label={T('unitsValue')} id="un-val" value={val} step="any" set={setVal} />
      <div className="swap">
        <label className="field grow">
          <span>{T('unitsFrom')}</span>
          <select id="un-from" className="inp" value={from} onChange={(e) => setFrom(e.target.value)}>
            {c.units.map((u) => (
              <option key={u.id} value={u.id}>{unitName(c, u, lang)}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn ghost small" aria-label={T('unitsSwap')} onClick={() => { setFrom(to); setTo(from); }}>⇄</button>
        <label className="field grow">
          <span>{T('unitsTo')}</span>
          <select id="un-to" className="inp" value={to} onChange={(e) => setTo(e.target.value)}>
            {c.units.map((u) => (
              <option key={u.id} value={u.id}>{unitName(c, u, lang)}</option>
            ))}
          </select>
        </label>
      </div>
      <output id="un-out" className="calc-out" aria-live="polite">
        {ok ? `${fmt(n)} = ${fmt(convert(n, c, from, to))}` : T('unitsEnter')}
      </output>
      {ok && (
        <ul className="utable" aria-label={T('unitsAll')} tabIndex={0}>
          {c.units.filter((u) => u.id !== from).map((u) => (
            <li key={u.id}>
              <span>{unitName(c, u, lang)}</span>
              <b>{fmt(convert(n, c, from, u.id))}</b>
            </li>
          ))}
        </ul>
      )}
    </ToolCard>
  );
}

export function RuleOfThree() {
  const T = useT();
  const lang = useLang();
  const [a, setA] = useState('2');
  const [b, setB] = useState('10');
  const [c, setC] = useState('6');
  const [inv, setInv] = useState(false);
  const ok = [a, b, c].every((v) => v.trim() !== '' && Number.isFinite(Number(v)));
  let out = '';
  if (ok) {
    try {
      out = fmt(ruleOfThree(Number(a), Number(b), Number(c), inv));
    } catch (e) {
      out = errText(lang, (e as Error).message);
    }
  }
  return (
    <ToolCard id="t-r3" title={T('r3Title')}>
      <div className="presets" role="group" aria-label={T('r3Type')}>
        <button type="button" aria-pressed={!inv} onClick={() => setInv(false)}>{T('r3Direct')}</button>
        <button type="button" aria-pressed={inv} onClick={() => setInv(true)}>{T('r3Inverse')}</button>
      </div>
      <div className="r3">
        <Num label="A" id="r3-a" value={a} step="any" set={setA} />
        <span aria-hidden="true">→</span>
        <Num label="B" id="r3-b" value={b} step="any" set={setB} />
        <Num label="C" id="r3-c" value={c} step="any" set={setC} />
        <span aria-hidden="true">→</span>
        <div className="field">
          <span>X</span>
          <output id="r3-out" className="inp x" aria-live="polite">{ok ? out : '?'}</output>
        </div>
      </div>
      <p className="h">{inv ? T('r3HelpInverse') : T('r3HelpDirect')}</p>
    </ToolCard>
  );
}
