"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const pricing_1 = require("../utils/pricing");
const router = (0, express_1.Router)();
/**
 * POST /api/simulations
 * Registra una nueva simulación de facturación para un cliente, calcula el coste por tramos y lo persiste.
 */
router.post('/', async (req, res) => {
    try {
        const { customerId, activeUsers, storageGb, apiCalls } = req.body;
        if (customerId === undefined || activeUsers === undefined || storageGb === undefined || apiCalls === undefined) {
            return res.status(400).json({ error: 'Faltan parámetros requeridos (customerId, activeUsers, storageGb, apiCalls).' });
        }
        const numCustomerId = parseInt(customerId, 10);
        const numActiveUsers = parseInt(activeUsers, 10);
        const numStorageGb = parseFloat(storageGb);
        const numApiCalls = parseInt(apiCalls, 10);
        if (isNaN(numCustomerId) || isNaN(numActiveUsers) || isNaN(numStorageGb) || isNaN(numApiCalls)) {
            return res.status(400).json({ error: 'Todos los parámetros deben ser valores numéricos válidos.' });
        }
        if (numActiveUsers < 0 || numStorageGb < 0 || numApiCalls < 0) {
            return res.status(400).json({ error: 'Los valores de uso no pueden ser negativos.' });
        }
        const db = await (0, db_1.getDb)();
        // Obtener datos del cliente para saber su país
        const customer = await db.get('SELECT * FROM customers WHERE id = ?', numCustomerId);
        if (!customer) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }
        // Calcular el coste mensual base del cliente según tramos y sumarle el IVA/impuestos
        const costBreakdown = (0, pricing_1.calculateTotalCost)(numActiveUsers, customer.country);
        // Guardar en base de datos
        const result = await db.run(`INSERT INTO simulations (customer_id, active_users, storage_gb, api_calls, calculated_cost_eur) 
       VALUES (?, ?, ?, ?, ?)`, numCustomerId, numActiveUsers, numStorageGb, numApiCalls, costBreakdown.totalCostEur);
        const newSimulation = await db.get('SELECT * FROM simulations WHERE id = ?', result.lastID);
        return res.status(201).json({
            id: newSimulation.id,
            customerId: newSimulation.customer_id,
            activeUsers: newSimulation.active_users,
            storageGb: newSimulation.storage_gb,
            apiCalls: newSimulation.api_calls,
            calculatedCostEur: newSimulation.calculated_cost_eur,
            breakdown: {
                baseCost: costBreakdown.baseCost,
                vatRate: costBreakdown.vatRate,
                vatAmount: costBreakdown.vatAmount,
                totalCostEur: costBreakdown.totalCostEur
            },
            createdAt: newSimulation.created_at
        });
    }
    catch (error) {
        console.error('Error al registrar simulación:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.default = router;
