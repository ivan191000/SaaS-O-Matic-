/**
 * Algoritmo oficial de validación para Identificadores Fiscales Españoles (DNI, NIE y CIF).
 */

/**
 * Valida un DNI, NIE o CIF español.
 * Devuelve true si es válido, false en caso contrario.
 */
export function validateSpanishID(id: string): boolean {
  if (!id) return false;
  
  // Limpiar espacios y guiones, y pasar a mayúsculas
  const cleanId = id.trim().replace(/[-\s]/g, '').toUpperCase();
  
  if (cleanId.length !== 9) return false;

  // Determinar si es DNI, NIE o CIF
  const firstChar = cleanId.charAt(0);

  // Expresiones regulares básicas de formato
  const dniRegex = /^[0-9]{8}[A-Z]$/;
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
  const cifRegex = /^[ABCDEFGHJNPQRSTUVW][0-9]{7}[0-9A-J]$/;

  if (dniRegex.test(cleanId)) {
    return validateDNI(cleanId);
  } else if (nieRegex.test(cleanId)) {
    return validateNIE(cleanId);
  } else if (cifRegex.test(cleanId)) {
    return validateCIF(cleanId);
  }

  return false;
}

/**
 * Validación de DNI
 */
function validateDNI(dni: string): boolean {
  const numberPart = parseInt(dni.substring(0, 8), 10);
  const letter = dni.charAt(8);
  const controlLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const expectedLetter = controlLetters.charAt(numberPart % 23);
  return letter === expectedLetter;
}

/**
 * Validación de NIE
 */
function validateNIE(nie: string): boolean {
  const firstChar = nie.charAt(0);
  let prefix = '';
  
  if (firstChar === 'X') prefix = '0';
  else if (firstChar === 'Y') prefix = '1';
  else if (firstChar === 'Z') prefix = '2';
  else return false;

  const reconstructedDni = prefix + nie.substring(1);
  return validateDNI(reconstructedDni);
}

/**
 * Validación de CIF
 */
function validateCIF(cif: string): boolean {
  const firstChar = cif.charAt(0);
  const digits = cif.substring(1, 8);
  const controlChar = cif.charAt(8);

  let evenSum = 0;
  let oddSum = 0;

  for (let i = 0; i < 7; i++) {
    const val = parseInt(digits.charAt(i), 10);
    if (isNaN(val)) return false;

    if ((i + 1) % 2 === 0) {
      // Posición par (2, 4, 6 en base 1-indexed de la parte numérica)
      evenSum += val;
    } else {
      // Posición impar (1, 3, 5, 7 en base 1-indexed de la parte numérica)
      const doubleVal = val * 2;
      // Sumar los dígitos del resultado (ej. 14 -> 1 + 4 = 5)
      oddSum += Math.floor(doubleVal / 10) + (doubleVal % 10);
    }
  }

  const totalSum = evenSum + oddSum;
  const units = totalSum % 10;
  const controlDigit = (10 - units) % 10;

  // Letras de control correspondientes: 0->J, 1->A, 2->B, etc.
  const controlLetters = 'JABCDEFGHI';
  const expectedControlLetter = controlLetters.charAt(controlDigit);

  // Tipos de CIF según la letra inicial
  const requiresLetter = 'KPQRSW'.includes(firstChar);
  const requiresNumber = 'ABEH'.includes(firstChar);

  if (requiresLetter) {
    return controlChar === expectedControlLetter;
  } else if (requiresNumber) {
    return controlChar === controlDigit.toString();
  } else {
    // Acepta cualquiera de las dos formas
    return controlChar === expectedControlLetter || controlChar === controlDigit.toString();
  }
}
