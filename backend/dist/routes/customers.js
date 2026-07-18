"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCustomer = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
// Mapeador de base de datos a contrato camelCase
const mapCustomer = (c) => ({
    id: c.id,
    name: c.name,
    fiscalId: c.fiscal_id,
    email: c.email,
    country: c.country,
    plan: c.plan,
    createdAt: c.created_at
});
exports.mapCustomer = mapCustomer;
/**
 * GET /api/customers
 * Retorna todos los clientes registrados, opcionalmente filtrados.
 */
router.get('/', async (req, res) => {
    try {
        const db = await (0, db_1.getDb)();
        const search = req.query.search;
        let query = 'SELECT * FROM customers';
        const params = [];
        if (search) {
            query += ' WHERE name LIKE ? OR fiscal_id LIKE ?';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam);
        }
        query += ' ORDER BY name ASC';
        const customers = await db.all(query, params);
        return res.status(200).json(customers.map(exports.mapCustomer));
    }
    catch (error) {
        console.error('Error al obtener clientes:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
/**
 * GET /api/customers/:id
 * Retorna el detalle del cliente e historial de simulaciones en camelCase.
 */
router.get('/:id', async (req, res) => {
    try {
        const db = await (0, db_1.getDb)();
        const customerId = parseInt(req.params.id, 10);
        if (isNaN(customerId)) {
            return res.status(400).json({ error: 'ID de cliente inválido.' });
        }
        const customer = await db.get('SELECT * FROM customers WHERE id = ?', customerId);
        if (!customer) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }
        const simulations = await db.all('SELECT * FROM simulations WHERE customer_id = ? ORDER BY created_at DESC', customerId);
        return res.status(200).json({
            ...(0, exports.mapCustomer)(customer),
            simulations: simulations.map(s => ({
                id: s.id,
                customerId: s.customer_id,
                activeUsers: s.active_users,
                storageGb: s.storage_gb,
                apiCalls: s.api_calls,
                calculatedCostEur: s.calculated_cost_eur,
                createdAt: s.created_at
            }))
        });
    }
    catch (error) {
        console.error('Error al obtener detalle del cliente:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
/**
 * POST /api/customers
 * Registra un cliente. Valida NIF/CIF si el país es España.
 */
router.post('/', async (req, res) => {
    try {
        const { name, fiscalId, email, country, plan } = req.body;
        if (!name || !fiscalId || !email || !country || !plan) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios (name, fiscalId, email, country, plan).' });
        }
        // Validación algorítmica general del Identificador Fiscal según el país
        console.log(`[Validation] Validando ID Fiscal para ${country}: ${fiscalId} (${name})`);
        const isValidFiscal = (0, validation_1.validateFiscalID)(fiscalId, country);
        if (!isValidFiscal) {
            console.warn(`[Validation] ID Fiscal inválido: ${fiscalId} para ${country}`);
            return res.status(400).json({ error: `El identificador fiscal (NIF/IVA) introducido no es válido para ${country} según sus reglas oficiales de control.` });
        }
        console.log(`[Validation] ID Fiscal válido: ${fiscalId}`);
        const db = await (0, db_1.getDb)();
        try {
            const result = await db.run(`INSERT INTO customers (name, fiscal_id, email, country, plan) VALUES (?, ?, ?, ?, ?)`, name.trim(), fiscalId.trim().toUpperCase(), email.trim(), country.trim(), plan.trim());
            const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', result.lastID);
            return res.status(201).json((0, exports.mapCustomer)(newCustomer));
        }
        catch (dbError) {
            if (dbError.message && dbError.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'El identificador fiscal ya se encuentra registrado para otro cliente.' });
            }
            throw dbError;
        }
    }
    catch (error) {
        console.error('Error al registrar cliente:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.default = router;
