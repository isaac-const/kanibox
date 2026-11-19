import type { Lang } from '../../i18n';
import { LangCtx, useT } from './shared';
import { HowLong, Pomodoro, Stopwatch, Timer } from './TimeTools';
import { TextTool } from './TextTool';
import { Calculator, RuleOfThree, Units } from './MathTools';
import { NameDraw, RandomNumber, Roulette, YesNo } from './DrawTools';

function Group({ id, titleKey, children }: { id: string; titleKey: string; children: React.ReactNode }) {
  const T = useT();
  return (
    <section className="tgroup" aria-labelledby={`tg-${id}`}>
      <h2 className="tgroup-t" id={`tg-${id}`}>{T(titleKey)}</h2>
      <div className="tools">{children}</div>
    </section>
  );
}

function Inner() {
  return (
    <div className="tools-all">
      <Group id="tempo" titleKey="tabTime"><Timer /><Stopwatch /><Pomodoro /><HowLong /></Group>
      <Group id="texto" titleKey="tabText"><TextTool /></Group>
      <Group id="calculo" titleKey="tabMath"><Calculator /><Units /><RuleOfThree /></Group>
      <Group id="sorteio" titleKey="tabDraw"><NameDraw /><RandomNumber /><YesNo /><Roulette /></Group>
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
