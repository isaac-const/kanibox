import { useState } from 'react';
import { HowLong, Pomodoro, Stopwatch, Timer } from './TimeTools';
import { TextTool } from './TextTool';
import { Calculator, RuleOfThree, Units } from './MathTools';
import { NameDraw, RandomNumber, Roulette, YesNo } from './DrawTools';

const TABS = [
  { id: 'tempo', name: 'Tempo', count: 4 },
  { id: 'texto', name: 'Texto', count: 1 },
  { id: 'calculo', name: 'Cálculo', count: 3 },
  { id: 'sorteio', name: 'Sorteio', count: 4 },
] as const;

export default function Tools() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('tempo');
  // Os painéis ficam montados (só escondidos), então um temporizador em andamento continua ao trocar de aba.
  const panel = (id: string, children: React.ReactNode) => (
    <div className="tools" role="tabpanel" id={`tp-${id}`} aria-labelledby={`tt-${id}`} hidden={tab !== id}>
      {children}
    </div>
  );
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Tipos de ferramenta">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tt-${t.id}`} aria-selected={tab === t.id} aria-controls={`tp-${t.id}`} onClick={() => setTab(t.id)}>
            {t.name} <small>{t.count}</small>
          </button>
        ))}
      </div>
      {panel('tempo', <><Timer /><Stopwatch /><Pomodoro /><HowLong /></>)}
      {panel('texto', <TextTool />)}
      {panel('calculo', <><Calculator /><Units /><RuleOfThree /></>)}
      {panel('sorteio', <><NameDraw /><RandomNumber /><Roulette /><YesNo /></>)}
    </>
  );
}
