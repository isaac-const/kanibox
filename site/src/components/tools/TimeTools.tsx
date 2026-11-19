import { useEffect, useMemo, useRef, useState } from 'react';
import { Num, Ring, SoundToggle, ToolCard, chime, startLabel, useCountdown, useStored } from './shared';
import { resolve, type Direction, type Parts } from '../../lib/tools/timecalc';

const clampInt = (v: string, max: number) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));

export function Timer() {
  const [sound, setSound] = useStored('kb-sound-timer', false);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const cd = useCountdown(300, () => soundRef.current && chime('up'));
  const [h, setH] = useState('0');
  const [m, setM] = useState('5');
  const [s, setS] = useState('0');
  const apply = (hh: string, mm: string, ss: string) => {
    const total = clampInt(hh, 99) * 3600 + clampInt(mm, 999) * 60 + clampInt(ss, 59);
    if (total > 0) cd.set(total);
  };
  const preset = (min: number) => {
    setH('0');
    setM(String(min));
    setS('0');
    cd.set(min * 60);
  };
  return (
    <ToolCard id="t-timer" title="Temporizador">
      <Ring total={cd.total} left={cd.left} finished={cd.finished} label="Tempo restante do temporizador" />
      <div className="presets">
        {[1, 5, 10, 25].map((min) => (
          <button type="button" key={min} aria-pressed={cd.total === min * 60} onClick={() => preset(min)}>
            {min} min
          </button>
        ))}
      </div>
      <div className="fields" role="group" aria-label="Tempo personalizado">
        <Num label="Horas" id="tm-h" value={h} min={0} max={99} disabled={cd.running} set={(v) => { setH(v); apply(v, m, s); }} />
        <Num label="Minutos" id="tm-m" value={m} min={0} max={999} disabled={cd.running} set={(v) => { setM(v); apply(h, v, s); }} />
        <Num label="Segundos" id="tm-s" value={s} min={0} max={59} disabled={cd.running} set={(v) => { setS(v); apply(h, m, v); }} />
      </div>
      <div className="row2">
        <button type="button" className="btn solid" data-a="start" onClick={() => (cd.running ? cd.pause() : cd.start())}>
          {startLabel(cd.running, cd.left, cd.total)}
        </button>
        <button type="button" className="btn ghost" data-a="reset" onClick={() => cd.set(cd.total)}>
          Zerar
        </button>
      </div>
      <div className="foot">
        <SoundToggle id="soundBtn-timer" on={sound} set={setSound} />
        <p className="h">A contagem aparece também no título da aba.</p>
      </div>
    </ToolCard>
  );
}

export function Pomodoro() {
  const [sound, setSound] = useStored('kb-sound-pomo', false);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const [cfg, setCfg] = useState({ focus: '25', short: '5', long: '15', cycles: '4' });
  const mins = { focus: clampInt(cfg.focus, 600) || 25, short: clampInt(cfg.short, 600) || 5, long: clampInt(cfg.long, 600) || 15, cycles: clampInt(cfg.cycles, 20) || 4 };
  const MODES = [
    { name: `Foco ${mins.focus}`, sec: mins.focus * 60 },
    { name: `Pausa ${mins.short}`, sec: mins.short * 60 },
    { name: `Longa ${mins.long}`, sec: mins.long * 60 },
  ];
  const [mode, setMode] = useState(0);
  const [cycle, setCycle] = useState(1);
  const cd = useCountdown(MODES[0].sec, () => advance());
  const go = (m: number) => {
    setMode(m);
    cd.set(MODES[m].sec);
  };
  function advance() {
    if (soundRef.current) chime(mode === 0 ? 'up' : 'down');
    if (mode === 0) {
      if (cycle < mins.cycles) go(1);
      else {
        go(2);
        setCycle(1);
      }
    } else {
      if (mode === 1) setCycle((c) => c + 1);
      go(0);
    }
  }
  const change = (k: keyof typeof cfg) => (v: string) => {
    const next = { ...cfg, [k]: v };
    setCfg(next);
    if (!cd.running && k !== 'cycles') {
      const key = k === 'focus' ? 0 : k === 'short' ? 1 : 2;
      if (key === mode) cd.set((clampInt(v, 600) || [25, 5, 15][key]) * 60);
    }
  };
  return (
    <ToolCard id="t-pomo" title="Foco" badge="pomodoro">
      <Ring total={cd.total} left={cd.left} finished={cd.finished} label="Tempo restante do foco" />
      <div className="presets" id="modes">
        {MODES.map((m, i) => (
          <button type="button" key={i} data-mode={i} aria-pressed={mode === i} onClick={() => go(i)}>
            {m.name}
          </button>
        ))}
      </div>
      <div className="row2">
        <button type="button" className="btn solid" data-a="start" onClick={() => (cd.running ? cd.pause() : cd.start())}>
          {startLabel(cd.running, cd.left, cd.total)}
        </button>
        <button type="button" className="btn ghost" data-a="reset" onClick={() => cd.set(cd.total)}>
          Zerar
        </button>
      </div>
      <details className="cfg">
        <summary>Personalizar tempos</summary>
        <div className="fields" role="group" aria-label="Tempos do foco">
          <Num label="Foco (min)" id="pf-focus" value={cfg.focus} min={1} max={600} set={change('focus')} />
          <Num label="Pausa (min)" id="pf-short" value={cfg.short} min={1} max={600} set={change('short')} />
          <Num label="Longa (min)" id="pf-long" value={cfg.long} min={1} max={600} set={change('long')} />
          <Num label="Ciclos" id="pf-cycles" value={cfg.cycles} min={1} max={20} set={change('cycles')} />
        </div>
      </details>
      <div className="foot">
        <SoundToggle id="soundBtn-pomo" on={sound} set={setSound} />
        <p className="h" id="cyc">
          Ciclo {cycle} de {mins.cycles}
        </p>
      </div>
    </ToolCard>
  );
}

const fmt = (ms: number) => {
  const c = Math.floor(ms / 10) % 100;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000);
  return { a: String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'), b: '.' + String(c).padStart(2, '0') };
};

export function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<{ n: number; at: string; delta: string }[]>([]);
  const t0 = useRef(0);
  const acc = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    if (!running) return;
    t0.current = performance.now();
    const iv = setInterval(() => setElapsed(acc.current + performance.now() - t0.current), 30);
    return () => clearInterval(iv);
  }, [running]);

  function toggle() {
    if (running) {
      acc.current += performance.now() - t0.current;
      setElapsed(acc.current);
      setRunning(false);
    } else setRunning(true);
  }
  const now = () => (running ? acc.current + performance.now() - t0.current : acc.current);
  const f = fmt(elapsed);
  return (
    <ToolCard id="t-sw" title="Cronômetro">
      <div className="swt" id="sw" role="timer" aria-label="Cronômetro">
        {f.a}
        <small>{f.b}</small>
      </div>
      <div className="row2">
        <button type="button" className="btn solid" id="sStart" onClick={toggle}>
          {running ? 'Pausar' : elapsed > 0 ? 'Continuar' : 'Iniciar'}
        </button>
        <button
          type="button"
          className="btn ghost"
          id="sLap"
          onClick={() => {
            const ms = now();
            if (!ms) return;
            const a = fmt(ms);
            const d = fmt(ms - last.current);
            last.current = ms;
            setLaps((l) => [{ n: l.length + 1, at: a.a + a.b, delta: '+' + d.a + d.b }, ...l]);
          }}
        >
          Volta
        </button>
        <button
          type="button"
          className="btn ghost"
          id="sReset"
          onClick={() => {
            setRunning(false);
            acc.current = 0;
            last.current = 0;
            setElapsed(0);
            setLaps([]);
          }}
        >
          Zerar
        </button>
      </div>
      <div className="laps" id="laps" aria-live="polite">
        {laps.map((l) => (
          <div key={l.n}>
            <span>Volta {l.n}</span>
            <span>{l.at}</span>
            <span>{l.delta}</span>
          </div>
        ))}
      </div>
    </ToolCard>
  );
}

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export function HowLong() {
  const [p, setP] = useState({ y: '', mo: '', d: '', h: '', mi: '' });
  const [dir, setDir] = useState<Direction>('next');
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  const set = (k: keyof typeof p) => (v: string) => setP((x) => ({ ...x, [k]: v }));
  const parts: Parts = useMemo(() => {
    const o: Parts = {};
    (['y', 'mo', 'd', 'h', 'mi'] as const).forEach((k) => {
      if (p[k].trim() !== '' && Number.isFinite(Number(p[k]))) o[k] = Math.floor(Number(p[k]));
    });
    return o;
  }, [p]);
  const empty = Object.keys(parts).length === 0;
  const res = now && !empty ? resolve(parts, now, dir) : null;
  const t = res?.parts;
  const tiles: [string, number][] = t
    ? ([['anos', t.y], ['meses', t.mo], ['dias', t.d], ['horas', t.h], ['min', t.mi], ['seg', t.s]] as [string, number][])
    : [];
  const first = tiles.findIndex(([, n]) => n > 0);
  const shown = first < 0 ? tiles.slice(-1) : tiles.slice(first);
  const partial = !(parts.y !== undefined && parts.mo !== undefined && parts.d !== undefined);
  return (
    <ToolCard id="t-how" title="Quanto tempo" badge="falta ou passou" wide>
      <p className="h">Preencha só o que importa. Só o mês mostra quanto falta para o próximo mês escolhido; só o dia, para o próximo dia com esse número; só a hora, para a próxima vez que o relógio marca essa hora.</p>
      <div className="fields five" role="group" aria-label="Data de referência">
        <Num label="Ano" id="hl-y" value={p.y} placeholder="opcional" min={1900} max={2200} set={set('y')} />
        <Num label="Mês" id="hl-mo" value={p.mo} placeholder="1 a 12" min={1} max={12} set={set('mo')} />
        <Num label="Dia" id="hl-d" value={p.d} placeholder="1 a 31" min={1} max={31} set={set('d')} />
        <Num label="Hora" id="hl-h" value={p.h} placeholder="0 a 23" min={0} max={23} set={set('h')} />
        <Num label="Minuto" id="hl-mi" value={p.mi} placeholder="0 a 59" min={0} max={59} set={set('mi')} />
      </div>
      {partial && !empty && (
        <div className="presets" role="group" aria-label="Direção">
          <button type="button" aria-pressed={dir === 'next'} onClick={() => setDir('next')}>
            Próximo (quanto falta)
          </button>
          <button type="button" aria-pressed={dir === 'prev'} onClick={() => setDir('prev')}>
            Último (quanto passou)
          </button>
        </div>
      )}
      <div className="how-out" id="hl-out" aria-live="polite">
        {empty && <p className="h">Exemplos: mês 12 (falta para dezembro), dia 25 e hora 18, ou 2030 / 1 / 1 para uma data exata.</p>}
        {!empty && !res && now && <p className="h">Essa data não existe. Confira o dia do mês e os limites de hora e minuto.</p>}
        {res && (
          <>
            <p className="target">
              {res.future ? 'Falta até' : 'Passou desde'}{' '}
              <b>
                {res.target.getDate()} de {MONTHS[res.target.getMonth()]} de {res.target.getFullYear()}, {String(res.target.getHours()).padStart(2, '0')}:{String(res.target.getMinutes()).padStart(2, '0')}
              </b>
            </p>
            <div className="tiles2">
              {shown.map(([label, n]) => (
                <div key={label} className="tile2">
                  <b>{n}</b>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <p className="h">
              Total: {res.parts.totalDays} {res.parts.totalDays === 1 ? 'dia' : 'dias'}, ou {Math.floor(res.parts.totalMs / 3600000)} horas.
            </p>
          </>
        )}
      </div>
    </ToolCard>
  );
}
