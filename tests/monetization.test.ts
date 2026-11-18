import { describe, it, expect } from 'vitest';
import { crc16, pixPayload } from '../src/lib/pix';
import { amazonUrl, affiliate, chapters, pages, support } from '../src/lib/data';

describe('Pix (BR Code)', () => {
  it('CRC16-CCITT-FALSE confere com o valor de referência', () => {
    expect(crc16('123456789')).toBe('29B1');
  });
  it('payload estático tem os campos do padrão e termina com o CRC certo', () => {
    const p = pixPayload({ key: '123e4567-e12b-12d1-a456-426655440000', name: 'Fulano de Tal', city: 'Brasília' });
    expect(p.startsWith('000201')).toBe(true);
    expect(p).toContain('0014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000');
    expect(p).toContain('5802BR5913Fulano de Tal6008Brasilia');
    expect(p).toContain('62070503***6304');
    expect(p.slice(-4)).toBe(crc16(p.slice(0, -4)));
  });
  it('a chave cadastrada é uma chave aleatória (formato UUID), não CPF, telefone ou e-mail', () => {
    if (support.pix.key) expect(support.pix.key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});

describe('afiliados da Amazon', () => {
  it('com tag, o link leva a tag; sem tag, não leva', () => {
    expect(amazonUrl('GTA VI PS5', 'leonidabr-20')).toBe('https://www.amazon.com.br/s?k=GTA+VI+PS5&tag=leonidabr-20');
    expect(amazonUrl('GTA VI PS5', '')).toBe('https://www.amazon.com.br/s?k=GTA+VI+PS5');
  });
  it('o aviso obrigatório do programa está presente', () => {
    expect(affiliate.disclosure).toMatch(/associad[oa] da Amazon/i);
  });
});

describe('página de apoio', () => {
  it('/apoie existe, mas fica fora da sequência de capítulos', () => {
    expect(pages.some((p) => p.slug === 'apoie')).toBe(true);
    expect(chapters.some((p) => p.slug === 'apoie')).toBe(false);
  });
});
