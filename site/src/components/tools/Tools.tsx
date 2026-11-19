import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../../i18n';
import { LangCtx, useT } from './shared';
import { HowLong, Pomodoro, Stopwatch, Timer } from './TimeTools';
import { TextTool } from './TextTool';
import { Calculator, RuleOfThree, Units } from './MathTools';
import { NameDraw, RandomNumber, Roulette, YesNo } from './DrawTools';
import { watchSeg } from '../../scripts/seg';

const TABS = [
  { id: 'tempo', key: 'tabTime', count: 4 },
  { id: 'texto', key: 'tabText', count: 1 },
  { id: 'calculo', key: 'tabMath', count: 3 },
  { id: 'sorteio', key: 'tabDraw', count: 4 },
] as const;

function Inner() {
  const T = useT();
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('tempo');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) watchSeg(ref.current);
  }, []);
  // Os painéis ficam montados (só escondidos), então um temporizador em andamento continua ao trocar de aba.
  const panel = (id: string, children: React.ReactNode) => (
    <div className="tools" role="tabpanel" id={`tp-${id}`} aria-labelledby={`tt-${id}`} hidden={tab !== id}>
      {children}
    </div>
  );
  return (
    <div ref={ref}>
      <div className="seg" role="tablist" aria-label={T('tabsAria')}>
        <span className="seg-pill" aria-hidden="true" />
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tt-${t.id}`} aria-selected={tab === t.id} aria-controls={`tp-${t.id}`} onClick={() => setTab(t.id)}>
            {T(t.key)} <small>{t.count}</small>
          </button>
        ))}
      </div>
      {panel('tempo', <><Timer /><Stopwatch /><Pomodoro /><HowLong /></>)}
      {panel('texto', <TextTool />)}
      {panel('calculo', <><Calculator /><Units /><RuleOfThree /></>)}
      {panel('sorteio', <><NameDraw /><RandomNumber /><Roulette /><YesNo /></>)}
    </div>
  );
}

export default function Tools({ lang = 'pt' }: { lang?: Lang }) {
  return (
    <LangCtx.Provider value={lang}>
      <Inner />
    </LangCtx.Provider>
  );
}
