import { useEffect, useMemo, useState } from 'react';
import { ToolCard, useCopy } from './shared';
import { STYLES } from '../../lib/tools/textstyles';

export function TextTool() {
  const [text, setText] = useState('Hello World');
  const [z, setZ] = useState(3);
  // O zalgo usa acaso: no servidor e na hidratação ele fica igual ao texto, e só sorteia depois de montar.
  const [seed, setSeed] = useState(-1);
  useEffect(() => setSeed(0), []);
  const { copied, copy } = useCopy();
  // `seed` só existe para sortear o zalgo de novo
  const outs = useMemo(() => STYLES.map((s) => ({ id: s.id, name: s.name, out: !text ? '' : s.id === 'zalgo' && seed < 0 ? text : s.fn(text, { zalgo: z }) })), [text, z, seed]);
  return (
    <ToolCard id="t-text" title="Conversor de texto" wide>
      <label className="field">
        <span>Seu texto</span>
        <textarea id="tx-in" className="inp" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Digite aqui" />
      </label>
      <div className="row2 zal">
        <label className="field grow">
          <span>Intensidade do zalgo: {z}</span>
          <input type="range" min={1} max={8} value={z} onChange={(e) => setZ(Number(e.target.value))} aria-label="Intensidade do zalgo" />
        </label>
        <button type="button" className="btn ghost small" onClick={() => setSeed((n) => n + 1)}>
          Sortear zalgo
        </button>
      </div>
      <ul className="styles" id="tx-out">
        {outs.map((o) => (
          <li key={o.id}>
            <span className="sn">{o.name}</span>
            <output className="so" data-style={o.id}>{o.out || '·'}</output>
            <button type="button" className="copy" disabled={!o.out} aria-label={`Copiar ${o.name}`} onClick={() => copy(o.id, o.out)}>
              {copied === o.id ? 'Copiado' : 'Copiar'}
            </button>
          </li>
        ))}
      </ul>
    </ToolCard>
  );
}
