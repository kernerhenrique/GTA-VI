/**
 * "Pix copia e cola" (BR Code estático, padrão EMV do Banco Central) para doação de qualquer valor.
 * Campos: 00 formato, 26 conta Pix (GUI + chave), 52 MCC, 53 moeda (986 = BRL), 58 país, 59 nome, 60 cidade,
 * 62 dados adicionais (txid "***" = sem identificador) e 63 CRC16-CCITT-FALSE.
 */

const field = (id: string, value: string) => `${id}${String(value.length).padStart(2, '0')}${value}`;

/** CRC-16/CCITT-FALSE (polinômio 0x1021, início 0xFFFF), em 4 dígitos hexadecimais maiúsculos. */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(payload)) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Remove acentos e caracteres fora do padrão (nome e cidade do BR Code). */
const clean = (s: string, max: number) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 .-]/g, '').trim().slice(0, max);

export function pixPayload({ key, name, city }: { key: string; name: string; city: string }): string {
  const account = field('00', 'br.gov.bcb.pix') + field('01', key.trim());
  const body =
    field('00', '01') +
    field('26', account) +
    field('52', '0000') +
    field('53', '986') +
    field('58', 'BR') +
    field('59', clean(name, 25)) +
    field('60', clean(city, 15)) +
    field('62', field('05', '***')) +
    '6304';
  return body + crc16(body);
}
