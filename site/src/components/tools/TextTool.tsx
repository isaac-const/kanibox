import { useEffect, useMemo, useState } from 'react';
import { ToolCard, useCopy, useLang, useT } from './shared';
import { STYLES } from '../../lib/tools/textstyles';

export function TextTool() {
  const T = useT();
  const lang = useLang();
  const [text, setText] = useState('Hello World');
  const [z, setZ] = useState(3);
  // O zalgo usa acaso: no servidor e na hidratação ele fica igual ao texto, e só sorteia depois de montar.
  const [seed, setSeed] = useState(-1);
  useEffect(() => setSeed(0), []);
  const { copied, copy } = useCopy();
  // `seed` só existe para sortear o zalgo de novo
  const outs = useMemo(() => STYLES.map((s) => ({ id: s.id, name: lang === 'en' ? s.en : s.name, out: !text ? '' : s.id === 'zalgo' && seed < 0 ? text : s.fn(text, { zalgo: z }) })), [text, z, seed, lang]);
  return (
    <ToolCard id="t-text" title={T('textTitle')} wide>
      <label className="field">
        <span>{T('textYour')}</span>
        <textarea id="tx-in" className="inp" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={T('textPlaceholder')} />
      </label>
      <div className="row2 zal">
        <label className="field grow">
          <span>{T('textZalgo', { n: z })}</span>
          <input type="range" min={1} max={8} value={z} onChange={(e) => setZ(Number(e.target.value))} aria-label={T('textZalgoAria')} />
        </label>
        <button type="button" className="btn ghost small" onClick={() => setSeed((n) => n + 1)}>
          {T('textReroll')}
        </button>
      </div>
      <ul className="styles" id="tx-out">
        {outs.map((o) => (
          <li key={o.id}>
            <span className="sn">{o.name}</span>
            <output className="so" data-style={o.id}>{o.out || '·'}</output>
            <button type="button" className="copy" disabled={!o.out} aria-label={T('copyAria', { name: o.name })} onClick={() => copy(o.id, o.out)}>
              {copied === o.id ? T('copied') : T('copy')}
            </button>
          </li>
        ))}
      </ul>
    </ToolCard>
  );
}
