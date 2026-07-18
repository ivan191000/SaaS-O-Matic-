import { validateSpanishID } from './validation';

describe('Validador de Identificación Fiscal Española (DNI/NIE/CIF)', () => {
  
  test('Validación de DNI', () => {
    expect(validateSpanishID('12345678Z')).toBe(true);
    expect(validateSpanishID(' 12345678-Z ')).toBe(true);
    expect(validateSpanishID('53676831Z')).toBe(false);
  });

  test('Validación de NIE', () => {
    expect(validateSpanishID('Y1234567X')).toBe(true);
    expect(validateSpanishID('X1234567L')).toBe(true);
    expect(validateSpanishID('Z1234567R')).toBe(true);
    expect(validateSpanishID('Y1234567Z')).toBe(false);
  });

  test('Validación de CIF', () => {
    expect(validateSpanishID('A58818501')).toBe(true);
    expect(validateSpanishID('A-5881850-1')).toBe(true);
    expect(validateSpanishID('B86548757')).toBe(true);
    expect(validateSpanishID('A58818509')).toBe(false);
  });

  test('Formatos inválidos', () => {
    expect(validateSpanishID('')).toBe(false);
    expect(validateSpanishID('1234567')).toBe(false);
    expect(validateSpanishID('1234567890')).toBe(false);
    expect(validateSpanishID('ABC123456')).toBe(false);
  });
});
