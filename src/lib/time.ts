/** Formatação de datas/horas em pt-BR com Intl. */
export const BRT = 'America/Sao_Paulo';

export function formatDateTime(ms: number, timeZone?: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...opts,
  }).format(ms);
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }): string {
  const ms = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? Date.parse(`${iso}T12:00:00-03:00`) : Date.parse(iso);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: BRT, ...opts }).format(ms).replace('.', '');
}

export function formatBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export function formatUSD(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

export function yearOf(iso: string): string {
  return iso.slice(0, 4);
}
