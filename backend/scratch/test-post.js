const express = require('express');
const { getDb } = require('../dist/db');
const customersRouter = require('../dist/routes/customers').default;

const app = express();
app.use(express.json());
app.use('/customers', customersRouter);

async function test() {
  await getDb(); // Init DB
  
  // Mock request/response or run a local server
  const server = app.listen(4005, async () => {
    try {
      const response = await fetch('http://localhost:4005/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Cliente Español Test',
          fiscalId: '12345678Z',
          email: 'test@es.com',
          country: 'España',
          plan: 'Standard'
        })
      });
      const data = await response.json();
      console.log('Status:', response.status);
      console.log('Response:', data);
    } catch (err) {
      console.error(err);
    } finally {
      server.close();
    }
  });
}

test();
