import express from 'express';
import cors from 'cors';
import { getDb } from './db';
import customersRouter from './routes/customers';
import simulationsRouter from './routes/simulations';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/customers', customersRouter);
app.use('/api/simulations', simulationsRouter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SaaS-O-Matic API is healthy.' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

async function startServer() {
  try {
    console.log('Inicializando base de datos SQLite...');
    await getDb();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al inicializar el servidor:', error);
    process.exit(1);
  }
}

startServer();
