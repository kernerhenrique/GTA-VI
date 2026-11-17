import { describe, expect, it } from 'vitest';
import {
  getLaunchState,
  splitDuration,
  timeUntil,
  timeSince,
  parseSimulatedNow,
  getTimelineProgress,
  eventDateMs,
} from '../src/lib/launch-state';
import launch from '../src/data/launch.json';

const releaseMs = Date.parse(launch.releaseISO);
const cfg = { releaseMs, launchWindowMs: launch.launchAnimationSeconds * 1000 };

describe('configuração do lançamento', () => {
  it('mira 0h de Brasília de 19/11/2026 (03:00 UTC)', () => {
    expect(new Date(releaseMs).toISOString()).toBe('2026-11-19T03:00:00.000Z');
  });
});

describe('getLaunchState — três momentos', () => {
  it('ANTES: um dia antes é "pre"', () => {
    expect(getLaunchState(releaseMs - 86_400_000, cfg)).toBe('pre');
  });
  it('ANTES: 1 ms antes ainda é "pre"', () => {
    expect(getLaunchState(releaseMs - 1, cfg)).toBe('pre');
  });
  it('NO EXATO MOMENTO: T-0 é "launching" (animação de liberação)', () => {
    expect(getLaunchState(releaseMs, cfg)).toBe('launching');
  });
  it('durante a janela da animação continua "launching"', () => {
    expect(getLaunchState(releaseMs + cfg.launchWindowMs - 1, cfg)).toBe('launching');
  });
  it('DEPOIS: ao fim da janela vira "live"', () => {
    expect(getLaunchState(releaseMs + cfg.launchWindowMs, cfg)).toBe('live');
  });
  it('DEPOIS: uma semana depois é "live"', () => {
    expect(getLaunchState(releaseMs + 7 * 86_400_000, cfg)).toBe('live');
  });
});

describe('contagem', () => {
  it('quebra 1d 2h 3m 4s', () => {
    const ms = ((1 * 24 + 2) * 3600 + 3 * 60 + 4) * 1000;
    expect(splitDuration(ms)).toMatchObject({ days: 1, hours: 2, minutes: 3, seconds: 4 });
  });
  it('nunca fica negativa', () => {
    expect(timeUntil(releaseMs + 5000, releaseMs)).toMatchObject({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(timeSince(releaseMs - 5000, releaseMs).totalMs).toBe(0);
  });
  it('em 18/11 23:59:50 BRT faltam 10 segundos', () => {
    const now = Date.parse('2026-11-18T23:59:50-03:00');
    expect(timeUntil(now, releaseMs)).toMatchObject({ days: 0, hours: 0, minutes: 0, seconds: 10 });
  });
});

describe('simulação por URL', () => {
  it('lê ?agora=', () => {
    expect(parseSimulatedNow('?agora=2026-11-19T00:00:00-03:00')).toBe(releaseMs);
  });
  it('ignora valores inválidos', () => {
    expect(parseSimulatedNow('?agora=ontem')).toBeNull();
    expect(parseSimulatedNow('')).toBeNull();
  });
});

describe('linha do tempo — "você está aqui"', () => {
  const dates = ['2022-02-04', '2026-11-18T06:00:00-05:00', '2026-11-19T00:00:00-03:00', '2026-11-21'];
  it('antes do lançamento: lançamento e festival são futuros', () => {
    const p = getTimelineProgress(dates, Date.parse('2026-11-17T12:00:00-03:00'));
    expect(p.states).toEqual(['past', 'future', 'future', 'future']);
    expect(p.lastPastIndex).toBe(0);
  });
  it('no exato momento do lançamento o nó do lançamento vira passado', () => {
    const p = getTimelineProgress(dates, releaseMs);
    expect(p.states).toEqual(['past', 'past', 'past', 'future']);
    expect(p.lastPastIndex).toBe(2);
  });
  it('depois do festival tudo é passado', () => {
    const p = getTimelineProgress(dates, Date.parse('2026-11-25T12:00:00-03:00'));
    expect(p.states.every((s) => s === 'past')).toBe(true);
    expect(p.fraction).toBe(1);
  });
  it('datas sem hora são 0h de Brasília', () => {
    expect(new Date(eventDateMs('2026-11-21')).toISOString()).toBe('2026-11-21T03:00:00.000Z');
  });
});
