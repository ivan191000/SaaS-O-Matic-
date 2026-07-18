import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

let dbInstance: Database | null = null;

/**
 * Retorna la instancia de la base de datos conectada.
 * Si no está inicializada, abre la conexión y realiza las migraciones.
 */
export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = path.resolve(__dirname, '../database.sqlite');

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await dbInstance.run('PRAGMA foreign_keys = ON');
  await migrate(dbInstance);

  return dbInstance;
}

/**
 * Ejecuta migraciones para crear tablas de base de datos y sembrar datos de prueba iniciales.
 */
async function migrate(db: Database) {
  // Tabla de clientes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      fiscal_id TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      country TEXT NOT NULL,
      plan TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de simulaciones
  await db.exec(`
    CREATE TABLE IF NOT EXISTS simulations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      active_users INTEGER NOT NULL,
      storage_gb REAL NOT NULL,
      api_calls INTEGER NOT NULL,
      calculated_cost_eur REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )
  `);

  // Sembrar clientes corporativos de prueba si la tabla está vacía
  const count = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM customers');
  if (count && count.count === 0) {
    console.log('Sembrando base de datos con clientes iniciales...');
    
    await db.run(
      `INSERT INTO customers (name, fiscal_id, email, country, plan) VALUES (?, ?, ?, ?, ?)`,
      'Acme España S.A.', 'A58818501', 'ventas@acme.es', 'España', 'Premium'
    );
    await db.run(
      `INSERT INTO customers (name, fiscal_id, email, country, plan) VALUES (?, ?, ?, ?, ?)`,
      'Globex International', 'B86548757', 'billing@globex.com', 'Alemania', 'Enterprise'
    );
    await db.run(
      `INSERT INTO customers (name, fiscal_id, email, country, plan) VALUES (?, ?, ?, ?, ?)`,
      'Initech Software Ltd', 'Y1234567X', 'support@initech.co.uk', 'Reino Unido', 'Standard'
    );
    
    // Sembrar algunas simulaciones para el primer cliente
    const firstCustomer = await db.get<{ id: number }>('SELECT id FROM customers LIMIT 1');
    if (firstCustomer) {
      await db.run(
        `INSERT INTO simulations (customer_id, active_users, storage_gb, api_calls, calculated_cost_eur) VALUES (?, ?, ?, ?, ?)`,
        firstCustomer.id, 15, 100, 25000, 169.40
      );
      await db.run(
        `INSERT INTO simulations (customer_id, active_users, storage_gb, api_calls, calculated_cost_eur) VALUES (?, ?, ?, ?, ?)`,
        firstCustomer.id, 60, 500, 150000, 568.70
      );
    }
    console.log('Sembrado completado con éxito.');
  }
}
