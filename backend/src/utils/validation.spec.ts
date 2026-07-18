import { validateSpanishID, validateFiscalID } from './validation';

describe('Validador de Identificación Fiscal Española (DNI/NIE/CIF)', () => {
  
  test('Validación de DNI', () => {
    // 12345678Z es matemáticamente correcto pero está en el rango reservado del Ministerio del Interior
    expect(validateSpanishID('12345678Z')).toBe(false);
    expect(validateSpanishID('12345674Y')).toBe(false); // También reservado
    
    // DNI válido fuera del rango reservado
    expect(validateSpanishID('12345679S')).toBe(true); // Resto 15 -> S
    expect(validateSpanishID(' 12345679-S ')).toBe(true); // Con espacios y guion
    expect(validateSpanishID('53676831Y')).toBe(true); // Resto 6 -> Y
    expect(validateSpanishID('53676831Z')).toBe(false); // Letra errónea
    expect(validateSpanishID('11111111H')).toBe(true); // 11111111 % 23 = 9 -> H
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

  test('Validación Multi-País (validateFiscalID)', () => {
    // ---- PORTUGAL ----
    // NIF de empresa válido: 501306021 (Mod 11 checksum correcto)
    expect(validateFiscalID('501306021', 'Portugal')).toBe(true);
    expect(validateFiscalID('501306020', 'Portugal')).toBe(false); // Checksum incorrecto
    // NIF personal válido: 545259045 (Mod 11 checksum correcto)
    expect(validateFiscalID('545259045', 'Portugal')).toBe(true);
    // Cartão de Cidadão (12 caracteres): checksum base-36
    expect(validateFiscalID('000000000ZZ2', 'Portugal')).toBe(true);  // CC válido
    expect(validateFiscalID('000000010ZZ0', 'Portugal')).toBe(false); // CC inválido

    // ---- FRANCIA ----
    // SIREN real: BNP Paribas 732829320 (Luhn válido)
    expect(validateFiscalID('732829320', 'Francia')).toBe(true);
    expect(validateFiscalID('732829321', 'Francia')).toBe(false); // Luhn incorrecto
    // IVA francés: FR40303265045 (clave 40, SIREN 303265045 con Luhn correcto)
    expect(validateFiscalID('FR40303265045', 'Francia')).toBe(true);

    // ---- ITALIA ----
    // Partita IVA: 01234567897 (checksum oficial correcto)
    expect(validateFiscalID('01234567897', 'Italia')).toBe(true);
    expect(validateFiscalID('01234567890', 'Italia')).toBe(false);
    // Carta d'Identità Elettronica (CIE): formato 2L+5D+2L
    expect(validateFiscalID('CA00000AA', 'Italia')).toBe(true);
    // Codice Fiscale: RSSMRA80A01F205X (suma mod 26 = X verificado)
    expect(validateFiscalID('RSSMRA80A01F205X', 'Italia')).toBe(true);
    expect(validateFiscalID('RSSMRA80A01F205A', 'Italia')).toBe(false); // Letra control incorrecta

    // ---- REINO UNIDO ----
    // VAT número de prueba oficial HMRC: GB999999973 (mod 97 = 0)
    expect(validateFiscalID('GB999999973', 'Reino Unido')).toBe(true);
    expect(validateFiscalID('GB999999900', 'Reino Unido')).toBe(false);
    // NINO (National Insurance Number): 2L+6D+1L
    expect(validateFiscalID('AB123456C', 'Reino Unido')).toBe(true);

    // ---- ALEMANIA ----
    // USt-IdNr (DE + 9 dígitos) con ISO 7064 Mod 11,10
    expect(validateFiscalID('DE123456788', 'Alemania')).toBe(true);
    expect(validateFiscalID('DE123456780', 'Alemania')).toBe(false);
    // Steueridentifikationsnummer (11 dígitos) con ISO 7064 Mod 11,10
    expect(validateFiscalID('12345678903', 'Alemania')).toBe(true);
    expect(validateFiscalID('12345678900', 'Alemania')).toBe(false);
    // Personalausweis con dígito de control MRZ ICAO 9303 (10 caracteres)
    // T22000125 -> pesos ICAO: suma=229 -> 229%10=9 -> dígito correcto=9
    expect(validateFiscalID('T220001259', 'Alemania')).toBe(true);
    expect(validateFiscalID('T220001254', 'Alemania')).toBe(false); // check digit 4 ≠ 9
  });
});
