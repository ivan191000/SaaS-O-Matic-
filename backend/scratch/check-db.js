const { getDb } = require('../dist/db');

async function test() {
  const db = await getDb();
  const customers = await db.all('SELECT * FROM customers');
  console.log('Customers in DB:', customers);
}

test();
