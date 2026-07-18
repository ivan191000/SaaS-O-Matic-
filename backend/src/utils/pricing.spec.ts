import { calculateBaseCost, calculateTotalCost, getVatRate } from './pricing';

describe('Cálculo de Tarifas de SaaS-O-Matic (Tiered Pricing)', () => {
  
  test('Caso base: 0 usuarios', () => {
    expect(calculateBaseCost(0)).toBe(0);
    expect(calculateBaseCost(-5)).toBe(0);
  });

  test('Tramo 1 (0 a 10 usuarios): 10 € / usuario', () => {
    expect(calculateBaseCost(1)).toBe(10);
    expect(calculateBaseCost(5)).toBe(50);
    expect(calculateBaseCost(10)).toBe(100);
  });

  test('Tramo 2 (11 a 50 usuarios): 8 € / usuario para los adicionales', () => {
    expect(calculateBaseCost(11)).toBe(108);
    expect(calculateBaseCost(15)).toBe(140);
    expect(calculateBaseCost(50)).toBe(420);
  });

  test('Tramo 3 (Más de 50 usuarios): 5 € / usuario para los adicionales', () => {
    expect(calculateBaseCost(51)).toBe(425);
    expect(calculateBaseCost(60)).toBe(470);
    expect(calculateBaseCost(100)).toBe(670);
  });

  test('Mapeo de IVA por país', () => {
    expect(getVatRate('España')).toBe(0.21);
    expect(getVatRate('Spain')).toBe(0.21);
    expect(getVatRate('Francia')).toBe(0.20);
    expect(getVatRate('Alemania')).toBe(0.19);
    expect(getVatRate('Reino Unido')).toBe(0.20);
    expect(getVatRate('Otros')).toBe(0.0);
    expect(getVatRate('Polonia')).toBe(0.20);
  });

  test('Cálculo total con impuestos', () => {
    const resultEs = calculateTotalCost(15, 'España');
    expect(resultEs.baseCost).toBe(140);
    expect(resultEs.vatRate).toBe(0.21);
    expect(resultEs.vatAmount).toBe(29.40);
    expect(resultEs.totalCostEur).toBe(169.40);

    const resultDe = calculateTotalCost(60, 'Alemania');
    expect(resultDe.baseCost).toBe(470);
    expect(resultDe.vatRate).toBe(0.19);
    expect(resultDe.vatAmount).toBe(89.30);
    expect(resultDe.totalCostEur).toBe(559.30);
  });
});
