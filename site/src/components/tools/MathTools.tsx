import { useState } from 'react';
import { Num, ToolCard } from './shared';
import { CATEGORIES, convert, fmt } from '../../lib/tools/units';
import { evaluate, ruleOfThree } from '../../lib/tools/calc';

export function Calculator() {
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
      setError((e as Error).message);
      setResult('');
    }
  }
  const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '%', '+', '(', ')', '^', 'sqrt('];
  return (
    <ToolCard id="t-calc" title="Calculadora">
      <input
        id="calc-in"
        className="inp calc-in"
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && run()}
        placeholder="2 + 3 × 4"
        aria-label="Conta"
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
        <button type="button" onClick={() => setExpr((x) => x.slice(0, -1))} aria-label="Apagar">⌫</button>
        <button type="button" className="eq" id="calc-eq" onClick={run}>=</button>
      </div>
      <label className="check">
        <input type="checkbox" checked={deg} onChange={(e) => setDeg(e.target.checked)} /> Ângulos em graus (sin, cos, tan)
      </label>
      {hist.length > 0 && (
        <div className="laps" aria-label="Histórico">
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
    <ToolCard id="t-units" title="Conversor de unidades">
      <label className="field">
        <span>Grandeza</span>
        <select id="un-cat" className="inp" value={cat} onChange={(e) => pickCat(e.target.value)}>
          {CATEGORIES.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </label>
      <Num label="Valor" id="un-val" value={val} step="any" set={setVal} />
      <div className="swap">
        <label className="field grow">
          <span>De</span>
          <select id="un-from" className="inp" value={from} onChange={(e) => setFrom(e.target.value)}>
            {c.units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn ghost small" aria-label="Trocar as unidades" onClick={() => { setFrom(to); setTo(from); }}>⇄</button>
        <label className="field grow">
          <span>Para</span>
          <select id="un-to" className="inp" value={to} onChange={(e) => setTo(e.target.value)}>
            {c.units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </label>
      </div>
      <output id="un-out" className="calc-out" aria-live="polite">
        {ok ? `${fmt(n)} = ${fmt(convert(n, c, from, to))}` : 'Digite um número'}
      </output>
      {ok && (
        <ul className="utable" aria-label="Todas as unidades" tabIndex={0}>
          {c.units.filter((u) => u.id !== from).map((u) => (
            <li key={u.id}>
              <span>{u.name}</span>
              <b>{fmt(convert(n, c, from, u.id))}</b>
            </li>
          ))}
        </ul>
      )}
    </ToolCard>
  );
}

export function RuleOfThree() {
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
      out = (e as Error).message;
    }
  }
  return (
    <ToolCard id="t-r3" title="Regra de 3">
      <div className="presets" role="group" aria-label="Tipo de proporção">
        <button type="button" aria-pressed={!inv} onClick={() => setInv(false)}>Direta</button>
        <button type="button" aria-pressed={inv} onClick={() => setInv(true)}>Inversa</button>
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
      <p className="h">{inv ? 'Inversa: quando A aumenta, B diminui (X = A × B ÷ C).' : 'Direta: A está para B como C está para X (X = B × C ÷ A).'}</p>
    </ToolCard>
  );
}
