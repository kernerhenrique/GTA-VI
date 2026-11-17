/**
 * Lógica pura do lançamento — sem DOM, testável (tests/launch-state.test.ts).
 * Usada no build (para o HTML inicial) e no navegador (contador, linha do tempo).
 */
export type LaunchState = 'pre' | 'launching' | 'live';

export interface LaunchConfig {
  /** Instante do lançamento em ms (epoch). */
  releaseMs: number;
  /** Duração da animação de "liberação" logo após o zero, em ms. */
  launchWindowMs: number;
}

export function getLaunchState(nowMs: number, cfg: LaunchConfig): LaunchState {
  const delta = nowMs - cfg.releaseMs;
  if (delta < 0) return 'pre';
  if (delta < cfg.launchWindowMs) return 'launching';
  return 'live';
}

export interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

/** Quebra uma duração (ms) em dias/horas/minutos/segundos. Valores negativos viram 0. */
export function splitDuration(ms: number): Parts {
  const total = Math.max(0, Math.floor(ms));
  const s = Math.floor(total / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    totalMs: total,
  };
}

/** Tempo restante até o lançamento (0 depois dele). */
export function timeUntil(nowMs: number, releaseMs: number): Parts {
  return splitDuration(releaseMs - nowMs);
}

/** Tempo decorrido desde o lançamento (0 antes dele). */
export function timeSince(nowMs: number, releaseMs: number): Parts {
  return splitDuration(nowMs - releaseMs);
}

/**
 * Meia-noite local (no fuso do visitante) da data "YYYY-MM-DD".
 * Regra oficial da Rockstar: liberação à meia-noite local em cada região.
 */
export function localMidnightMs(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

/**
 * Lê a data simulada de "?agora=ISO" (ou "?now=ISO"). Retorna null se ausente/inválida.
 * Ex.: ?agora=2026-11-18T23:59:50-03:00
 */
export function parseSimulatedNow(search: string): number | null {
  const params = new URLSearchParams(search);
  const raw = params.get('agora') ?? params.get('now');
  if (!raw) return null;
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : null;
}

/** Converte a data de um evento ("YYYY-MM-DD" ou ISO completo) em ms. Datas sem hora = 0h de Brasília. */
export function eventDateMs(date: string, defaultOffset = '-03:00'): number {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return Date.parse(`${date}T00:00:00${defaultOffset}`);
  return Date.parse(date);
}

export interface TimelineProgress {
  /** Para cada evento: já aconteceu ('past') ou ainda vai acontecer ('future'). */
  states: Array<'past' | 'future'>;
  /** Índice do último evento que já aconteceu (-1 se nenhum). O nó "você está aqui" fica logo depois dele. */
  lastPastIndex: number;
  /** Fração (0–1) da linha até o "você está aqui", por número de eventos. */
  fraction: number;
}

export function getTimelineProgress(dates: string[], nowMs: number): TimelineProgress {
  const states = dates.map((d) => (eventDateMs(d) <= nowMs ? 'past' : 'future')) as Array<'past' | 'future'>;
  let lastPastIndex = -1;
  states.forEach((s, i) => {
    if (s === 'past') lastPastIndex = i;
  });
  const fraction = dates.length === 0 ? 0 : (lastPastIndex + 1) / dates.length;
  return { states, lastPastIndex, fraction };
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
