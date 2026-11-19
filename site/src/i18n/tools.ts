import type { Lang } from './index';

type Dict = Record<string, string>;

export const toolsDict: Record<Lang, Dict> = {
  pt: {
    start: 'Iniciar', pause: 'Pausar', resume: 'Continuar', reset: 'Zerar',
    soonOn: 'Som ligado', soonOff: 'Som desligado',
    expand: 'Expandir', close: 'Fechar', expandAria: 'Expandir {t} em tela cheia', closeAria: 'Fechar {t}',
    tabsAria: 'Tipos de ferramenta', tabTime: 'Tempo', tabText: 'Texto', tabMath: 'Cálculo', tabDraw: 'Sorteio',
    hours: 'Horas', minutes: 'Minutos', seconds: 'Segundos', minN: '{n} min',
    timerTitle: 'Temporizador', timerLeft: 'Tempo restante do temporizador', timerCustom: 'Tempo personalizado',
    timerHint: 'A contagem aparece também no título da aba.',
    pomoTitle: 'Foco', pomoBadge: 'pomodoro', pomoLeft: 'Tempo restante do foco', pomoFocus: 'Foco {n}', pomoShort: 'Pausa {n}', pomoLong: 'Longa {n}',
    pomoCfg: 'Personalizar tempos', pomoCfgAria: 'Tempos do foco', pomoFocusMin: 'Foco (min)', pomoShortMin: 'Pausa (min)', pomoLongMin: 'Longa (min)', pomoCycles: 'Ciclos', pomoCycle: 'Ciclo {a} de {b}',
    swTitle: 'Cronômetro', lap: 'Volta', lapN: 'Volta {n}',
    howTitle: 'Quanto tempo', howBadge: 'falta ou passou',
    howHelp: 'Preencha só o que importa. Só o mês mostra quanto falta para o próximo mês escolhido; só o dia, para o próximo dia com esse número; só a hora, para a próxima vez que o relógio marca essa hora.',
    howRef: 'Data de referência', howY: 'Ano', howMo: 'Mês', howD: 'Dia', howH: 'Hora', howMi: 'Minuto',
    howOpt: 'opcional', howPMo: '1 a 12', howPD: '1 a 31', howPH: '0 a 23', howPMi: '0 a 59',
    howDir: 'Direção', howNext: 'Próximo (quanto falta)', howPrev: 'Último (quanto passou)',
    howExamples: 'Exemplos: mês 12 (falta para dezembro), dia 25 e hora 18, ou 2030 / 1 / 1 para uma data exata.',
    howInvalid: 'Essa data não existe. Confira o dia do mês e os limites de hora e minuto.',
    howUntil: 'Falta até', howSince: 'Passou desde', howDate: '{d} de {month} de {y}, {hh}:{mm}',
    uYears: 'anos', uMonths: 'meses', uDays: 'dias', uHours: 'horas', uMin: 'min', uSec: 'seg',
    howTotal: 'Total: {d} {w}, ou {h} horas.', day: 'dia', days: 'dias',
    months: 'janeiro,fevereiro,março,abril,maio,junho,julho,agosto,setembro,outubro,novembro,dezembro',
    textTitle: 'Conversor de texto', textYour: 'Seu texto', textPlaceholder: 'Digite aqui', textZalgo: 'Intensidade do zalgo: {n}', textZalgoAria: 'Intensidade do zalgo', textReroll: 'Sortear zalgo',
    copy: 'Copiar', copied: 'Copiado', copyAria: 'Copiar {name}',
    calcTitle: 'Calculadora', calcAria: 'Conta', calcDeg: 'Ângulos em graus (sin, cos, tan)', calcHistory: 'Histórico', erase: 'Apagar',
    errDiv0: 'divisão por zero', errParen: 'falta fechar o parêntese', errIncomplete: 'expressão incompleta', errUnknown: 'não conheço "{x}"', errUse: 'use {x}(...)',
    errEmpty: 'vazio', errTrailing: 'sobrou algo no fim da conta', errInvalid: 'resultado inválido', errIntegers: 'use números inteiros', errOnly: 'só existem {n} números diferentes nesse intervalo',
    unitsTitle: 'Conversor de unidades', unitsCat: 'Grandeza', unitsValue: 'Valor', unitsFrom: 'De', unitsTo: 'Para', unitsSwap: 'Trocar as unidades', unitsEnter: 'Digite um número', unitsAll: 'Todas as unidades',
    r3Title: 'Regra de 3', r3Direct: 'Direta', r3Inverse: 'Inversa', r3Type: 'Tipo de proporção',
    r3HelpDirect: 'Direta: A está para B como C está para X (X = B × C ÷ A).', r3HelpInverse: 'Inversa: quando A aumenta, B diminui (X = A × B ÷ C).',
    namesTitle: 'Sorteio de nomes', namesLabel: 'Nomes (um por linha ou separados por vírgula)', namesCount: 'Quantos', namesNoRepeat: 'Não repetir sorteados',
    namesGo: 'Sortear', namesClear: 'Limpar sorteados', namesAllDone: 'Todos já foram sorteados. Limpe a lista de sorteados.', namesNone: 'Digite ao menos um nome.',
    namesOnly: 'Só havia {n} {w} disponíveis.', name: 'nome', names: 'nomes', namesPool: '{n} {w} na disputa{extra}.', namesExtra: ', {n} já sorteados',
    randTitle: 'Número aleatório', randRange: 'Intervalo', randFrom: 'De', randTo: 'Até', randCount: 'Quantos', randDec: 'Casas decimais', randUnique: 'Sem repetir (só inteiros)', randGo: 'Gerar', randFill: 'Preencha o menor e o maior número.',
    wheelTitle: 'Roleta', wheelGo: 'Girar', wheelSpinning: 'Girando…', wheelWon: 'Saiu: {x}', wheelMin: 'Escreva ao menos duas opções', wheelOptions: 'Opções (uma por linha, até 24)', wheelAria: 'Roleta com {n} opções',
    wheelDefault: 'Pizza\nHambúrguer\nSushi\nLanche',
    ynTitle: 'Sim ou não', ynYes: 'Sim', ynNo: 'Não', ynAria: 'Sortear sim ou não', ynHint: 'Toque na moeda. Sim: {s} · Não: {n}', ynReset: 'Zerar placar',
  },
  en: {
    start: 'Start', pause: 'Pause', resume: 'Resume', reset: 'Reset',
    soonOn: 'Sound on', soonOff: 'Sound off',
    expand: 'Expand', close: 'Close', expandAria: 'Expand {t} to full screen', closeAria: 'Close {t}',
    tabsAria: 'Tool types', tabTime: 'Time', tabText: 'Text', tabMath: 'Math', tabDraw: 'Draw',
    hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds', minN: '{n} min',
    timerTitle: 'Timer', timerLeft: 'Time left on the timer', timerCustom: 'Custom time',
    timerHint: 'The countdown also shows in the tab title.',
    pomoTitle: 'Focus', pomoBadge: 'pomodoro', pomoLeft: 'Time left in the focus session', pomoFocus: 'Focus {n}', pomoShort: 'Break {n}', pomoLong: 'Long {n}',
    pomoCfg: 'Customize times', pomoCfgAria: 'Focus times', pomoFocusMin: 'Focus (min)', pomoShortMin: 'Break (min)', pomoLongMin: 'Long (min)', pomoCycles: 'Cycles', pomoCycle: 'Cycle {a} of {b}',
    swTitle: 'Stopwatch', lap: 'Lap', lapN: 'Lap {n}',
    howTitle: 'How long', howBadge: 'until or since',
    howHelp: 'Fill in only what matters. Month alone shows the time until the next chosen month; day alone, until the next day with that number; hour alone, until the next time the clock shows that hour.',
    howRef: 'Reference date', howY: 'Year', howMo: 'Month', howD: 'Day', howH: 'Hour', howMi: 'Minute',
    howOpt: 'optional', howPMo: '1 to 12', howPD: '1 to 31', howPH: '0 to 23', howPMi: '0 to 59',
    howDir: 'Direction', howNext: 'Next (time until)', howPrev: 'Last (time since)',
    howExamples: 'Examples: month 12 (time until December), day 25 and hour 18, or 2030 / 1 / 1 for an exact date.',
    howInvalid: 'That date does not exist. Check the day of the month and the hour and minute limits.',
    howUntil: 'Time until', howSince: 'Time since', howDate: '{month} {d}, {y}, {hh}:{mm}',
    uYears: 'years', uMonths: 'months', uDays: 'days', uHours: 'hours', uMin: 'min', uSec: 'sec',
    howTotal: 'Total: {d} {w}, or {h} hours.', day: 'day', days: 'days',
    months: 'January,February,March,April,May,June,July,August,September,October,November,December',
    textTitle: 'Text converter', textYour: 'Your text', textPlaceholder: 'Type here', textZalgo: 'Zalgo intensity: {n}', textZalgoAria: 'Zalgo intensity', textReroll: 'Reroll zalgo',
    copy: 'Copy', copied: 'Copied', copyAria: 'Copy {name}',
    calcTitle: 'Calculator', calcAria: 'Expression', calcDeg: 'Angles in degrees (sin, cos, tan)', calcHistory: 'History', erase: 'Delete',
    errDiv0: 'division by zero', errParen: 'missing closing parenthesis', errIncomplete: 'incomplete expression', errUnknown: 'unknown "{x}"', errUse: 'use {x}(...)',
    errEmpty: 'empty', errTrailing: 'something left over at the end', errInvalid: 'invalid result', errIntegers: 'use whole numbers', errOnly: 'only {n} different numbers exist in that range',
    unitsTitle: 'Unit converter', unitsCat: 'Measure', unitsValue: 'Value', unitsFrom: 'From', unitsTo: 'To', unitsSwap: 'Swap units', unitsEnter: 'Enter a number', unitsAll: 'All units',
    r3Title: 'Rule of three', r3Direct: 'Direct', r3Inverse: 'Inverse', r3Type: 'Proportion type',
    r3HelpDirect: 'Direct: A is to B as C is to X (X = B × C ÷ A).', r3HelpInverse: 'Inverse: when A goes up, B goes down (X = A × B ÷ C).',
    namesTitle: 'Name draw', namesLabel: 'Names (one per line or comma-separated)', namesCount: 'How many', namesNoRepeat: 'Do not repeat winners',
    namesGo: 'Draw', namesClear: 'Clear drawn', namesAllDone: 'Everyone has been drawn. Clear the drawn list.', namesNone: 'Type at least one name.',
    namesOnly: 'Only {n} {w} available.', name: 'name', names: 'names', namesPool: '{n} {w} in the draw{extra}.', namesExtra: ', {n} already drawn',
    randTitle: 'Random number', randRange: 'Range', randFrom: 'From', randTo: 'To', randCount: 'How many', randDec: 'Decimal places', randUnique: 'No repeats (integers only)', randGo: 'Generate', randFill: 'Fill in the lowest and highest numbers.',
    wheelTitle: 'Wheel', wheelGo: 'Spin', wheelSpinning: 'Spinning…', wheelWon: 'Result: {x}', wheelMin: 'Write at least two options', wheelOptions: 'Options (one per line, up to 24)', wheelAria: 'Wheel with {n} options',
    wheelDefault: 'Pizza\nBurger\nSushi\nSandwich',
    ynTitle: 'Yes or no', ynYes: 'Yes', ynNo: 'No', ynAria: 'Flip yes or no', ynHint: 'Tap the coin. Yes: {s} · No: {n}', ynReset: 'Reset score',
  },
};

export function tt(lang: Lang, key: string, vars: Record<string, string | number> = {}): string {
  const s = toolsDict[lang][key] ?? toolsDict.pt[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

/** Traduz um erro das bibliotecas (códigos como "div0", "unknown:foo", "only:3"). */
export function errText(lang: Lang, code: string): string {
  const [k, arg] = code.split(':');
  const map: Record<string, string> = { div0: 'errDiv0', paren: 'errParen', incomplete: 'errIncomplete', unknown: 'errUnknown', use: 'errUse', empty: 'errEmpty', trailing: 'errTrailing', invalid: 'errInvalid', integers: 'errIntegers', only: 'errOnly' };
  const key = map[k];
  return key ? tt(lang, key, { x: arg ?? '', n: arg ?? '' }) : code;
}
