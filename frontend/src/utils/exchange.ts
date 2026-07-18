export interface ExchangeRates {
  EUR: number;
  USD: number;
  GBP: number;
  JPY: number;
  CAD: number;
  [key: string]: number;
}

// Tasas de cambio estáticas de fallback en caso de error de red
const FALLBACK_RATES: ExchangeRates = {
  EUR: 1.0,
  USD: 1.09,
  GBP: 0.85,
  JPY: 162.5,
  CAD: 1.48
};

/**
 * Obtiene los tipos de cambio más recientes relativos a la base EUR.
 * Si falla, retorna las tasas fijas de fallback y registra un aviso.
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/EUR');
    if (!response.ok) {
      throw new Error('Respuesta de red no válida al obtener tipos de cambio.');
    }
    const data = await response.json();
    if (data && data.rates) {
      return data.rates as ExchangeRates;
    }
    throw new Error('Estructura de tipos de cambio inválida.');
  } catch (error) {
    console.warn('⚠️ No se pudieron obtener los tipos de cambio en tiempo real. Usando tasas estáticas de fallback.', error);
    return FALLBACK_RATES;
  }
}

/**
 * Mapeo de símbolos de divisa para su visualización
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
};
