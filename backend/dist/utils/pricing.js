"use strict";
/**
 * Módulo de negocio para el cálculo de tarifas y tramos de facturación (Tiered Pricing).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVatRate = getVatRate;
exports.calculateBaseCost = calculateBaseCost;
exports.calculateTotalCost = calculateTotalCost;
// Mapeo de IVA/impuestos por país
const COUNTRY_VAT_RATES = {
    'ESPAÑA': 0.21,
    'SPAIN': 0.21,
    'FRANCIA': 0.20,
    'FRANCE': 0.20,
    'ALEMANIA': 0.19,
    'GERMANY': 0.19,
    'ITALIA': 0.22,
    'ITALY': 0.22,
    'REINO UNIDO': 0.20,
    'UNITED KINGDOM': 0.20,
    'UK': 0.20,
    'PORTUGAL': 0.23,
};
/**
 * Retorna la tasa de impuesto (IVA) correspondiente a un país.
 */
function getVatRate(country) {
    if (!country)
        return 0;
    const normalizedCountry = country.trim().toUpperCase();
    if (normalizedCountry in COUNTRY_VAT_RATES) {
        return COUNTRY_VAT_RATES[normalizedCountry];
    }
    // Lista de países europeos comunes para fallback de IVA 20%
    const europeanCountries = [
        'AUSTRIA', 'BÉLGICA', 'BELGIUM', 'BULGARIA', 'CHIPRE', 'CYPRUS', 'CROACIA', 'CROATIA',
        'DINAMARCA', 'DENMARK', 'ESLOVAQUIA', 'SLOVAKIA', 'ESLOVENIA', 'SLOVENIA', 'ESTONIA',
        'FINLANDIA', 'FINLAND', 'GRECIA', 'GREECE', 'HUNGRÍA', 'HUNGARY', 'IRLANDA', 'IRELAND',
        'LETONIA', 'LATVIA', 'LITUANIA', 'LITHUANIA', 'LUXEMBURGO', 'LUXEMBOURG', 'MALTA',
        'PAÍSES BAJOS', 'NETHERLANDS', 'HOLANDA', 'POLONIA', 'POLAND', 'REPÚBLICA CHECA', 'CZECH REPUBLIC',
        'RUMANÍA', 'ROMANIA', 'SUECIA', 'SWEDEN'
    ];
    if (europeanCountries.includes(normalizedCountry)) {
        return 0.20; // Fallback común de la UE
    }
    return 0.0;
}
/**
 * Calcula el coste base mensual según el número de usuarios activos simulados (Tiered Pricing).
 * Tramos:
 * - Tramo 1 (0 a 10 usuarios): 10 € / usuario
 * - Tramo 2 (11 a 50 usuarios): 8 € / usuario
 * - Tramo 3 (Más de 50 usuarios): 5 € / usuario
 */
function calculateBaseCost(users) {
    if (users <= 0)
        return 0;
    let cost = 0;
    if (users <= 10) {
        cost = users * 10;
    }
    else if (users <= 50) {
        // 10 usuarios a 10€ + los restantes a 8€
        cost = (10 * 10) + ((users - 10) * 8);
    }
    else {
        // 10 usuarios a 10€ + 40 usuarios a 8€ + los restantes a 5€
        cost = (10 * 10) + (40 * 8) + ((users - 50) * 5);
    }
    return cost;
}
/**
 * Calcula el desglose completo del coste incluyendo impuestos por país.
 */
function calculateTotalCost(users, country) {
    const baseCost = calculateBaseCost(users);
    const vatRate = getVatRate(country);
    const vatAmount = parseFloat((baseCost * vatRate).toFixed(2));
    const totalCostEur = parseFloat((baseCost + vatAmount).toFixed(2));
    return {
        baseCost,
        vatRate,
        vatAmount,
        totalCostEur
    };
}
