import { useEffect, useRef, useState } from 'react';

const CIRC = 440; // 2 * pi * 70

/* ───────── som ───────── */
// Sino de notas com parciais (fundamental + 2 harmônicos), feito com Web Audio: sem arquivo de áudio.
// O AudioContext só pode nascer num gesto do usuário, então é criado ao apertar Iniciar.
let ctx: AudioContext | null = null;
let soundOn = true;

function unlockAudio() {
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
function chime(kind: 'up' | 'down') {
  if (!soundOn || !ctx) return;
  const notes = kind === 'up' ? [659.25, 830.61, 987.77, 1318.51] : [987.77, 783.99, 659.25];
  const t0 = ctx.currentTime + 0.03;
  notes.forEach((f, i) => bell(f, t0 + i * 0.17));
}

const f2 = (s: number): string => {
  const t = Math.ceil(s);
  return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
};

/** Contagem regressiva com título da aba, vibração ao acabar e callback. */
function useCountdown(initial: number, onDone?: () => void) {
  const [total, setTotal] = useState(initial);
  const [left, setLeft] = useState(initial);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(0);
  const end = useRef(0);
  /** garante que o fim de uma contagem é tratado uma única vez, mesmo com ticks atrasados */
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

function Ring({ total, left, finished, label }: { total: number; left: number; finished: number; label: string }) {
  const showDone = finished > 0 && left <= 0;
  return (
    <div key={showDone ? finished : 0} className={showDone ? 'ring done' : 'ring'}>
      <svg viewBox="0 0 156 156" aria-hidden="true">
        <circle className="bg" cx="78" cy="78" r="70" />
        <circle className="fg" cx="78" cy="78" r="70" style={{ strokeDasharray: CIRC, strokeDashoffset: CIRC * (1 - left / total) }} />
      </svg>
      <div className="t" role="timer" aria-label={label}>
        {f2(left)}
      </div>
    </div>
  );
}

function startLabel(running: boolean, left: number, total: number) {
  if (running) return 'Pausar';
  return left > 0 && left < total ? 'Continuar' : 'Iniciar';
}

function Timer() {
  const cd = useCountdown(300, () => chime('up'));
  const [preset, setPreset] = useState(5);
  return (
    <div className="tool" id="t-timer">
      <h3>
        Temporizador <small>offline</small>
      </h3>
      <Ring total={cd.total} left={cd.left} finished={cd.finished} label="Tempo restante do temporizador" />
      <div className="presets">
        {[1, 5, 10, 25].map((m) => (
          <button
            type="button"
            key={m}
            aria-pressed={preset === m}
            onClick={() => {
              setPreset(m);
              cd.set(m * 60);
            }}
          >
            {m} min
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
      <p className="h">A contagem aparece também no título da aba.</p>
    </div>
  );
}

const MODES = [
  { name: 'Foco 25', sec: 1500 },
  { name: 'Pausa 5', sec: 300 },
  { name: 'Longa 15', sec: 900 },
];

function Pomodoro() {
  const [mode, setMode] = useState(0);
  const [cycle, setCycle] = useState(1);
  const cd = useCountdown(MODES[0].sec, () => advance());
  const go = (m: number) => {
    setMode(m);
    cd.set(MODES[m].sec);
  };
  function advance() {
    chime(mode === 0 ? 'up' : 'down');
    if (mode === 0) {
      if (cycle < 4) go(1);
      else {
        go(2);
        setCycle(1);
      }
    } else {
      if (mode === 1) setCycle((c) => c + 1);
      go(0);
    }
  }
  return (
    <div className="tool" id="t-pomo">
      <h3>
        Foco <small>pomodoro</small>
      </h3>
      <Ring total={cd.total} left={cd.left} finished={cd.finished} label="Tempo restante do foco" />
      <div className="presets" id="modes">
        {MODES.map((m, i) => (
          <button type="button" key={m.name} data-mode={i} aria-pressed={mode === i} onClick={() => go(i)}>
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
      <p className="h" id="cyc">
        Ciclo {cycle} de 4
      </p>
    </div>
  );
}

const fmt = (ms: number) => {
  const c = Math.floor(ms / 10) % 100;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000);
  return { a: String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'), b: '.' + String(c).padStart(2, '0') };
};

function Stopwatch() {
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
      // pausa: guarda o tempo corrido antes de parar
      acc.current += performance.now() - t0.current;
      setElapsed(acc.current);
      setRunning(false);
    } else {
      setRunning(true);
    }
  }

  const now = () => (running ? acc.current + performance.now() - t0.current : acc.current);
  const f = fmt(elapsed);
  return (
    <div className="tool" id="t-sw">
      <h3>Cronômetro</h3>
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
    </div>
  );
}

export default function Tools() {
  const [sound, setSound] = useState(true);
  useEffect(() => {
    try {
      const off = localStorage.getItem('kb-sound') === 'off';
      soundOn = !off;
      setSound(!off);
    } catch {
      /* sem armazenamento */
    }
  }, []);
  function toggleSound() {
    const next = !sound;
    soundOn = next;
    setSound(next);
    try {
      localStorage.setItem('kb-sound', next ? 'on' : 'off');
    } catch {
      /* sem armazenamento */
    }
    if (next) {
      unlockAudio();
      chime('up'); // ao ligar, toca o som para mostrar como é
    }
  }
  return (
    <>
      <div className="tools-bar">
        <button type="button" id="soundBtn" className="opt" aria-pressed={sound} onClick={toggleSound}>
          Som {sound ? 'ligado' : 'desligado'}
        </button>
        <span>O fim do tempo toca um sino curto e vibra no celular.</span>
      </div>
      <div className="tools" id="tools">
        <Timer />
        <Stopwatch />
        <Pomodoro />
      </div>
      <p className="soon-line">A seguir: relógio mundial, alarme e seletor de cor.</p>
    </>
  );
}
