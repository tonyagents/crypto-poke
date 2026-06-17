import 'dotenv/config';
import express from 'express';
import webhookRouter from './routes/webhook.js';
import { startRecipeEngine } from './recipes/engine.js';
import { startSnapshotWriter } from './services/basket-snapshots.js';

const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/webhook', webhookRouter);

app.get('/', (_req, res) => {
  res.json({
    name: 'crypto-poke',
    description: 'Crypto-native AI assistant in iMessage',
    status: 'running',
  });
});

const server = app.listen(PORT, () => {
  console.log(`\n🌙 crypto-poke running on :${PORT}`);
  console.log(`   Webhook:  http://localhost:${PORT}/webhook/sendblue`);
  console.log(`   Test:     POST http://localhost:${PORT}/webhook/chat`);
  if (process.env.WEBHOOK_BASE_URL) {
    console.log(`   Public:   ${process.env.WEBHOOK_BASE_URL}/webhook/sendblue`);
  }
  console.log('');
  startRecipeEngine();
  startSnapshotWriter();
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Run: lsof -ti :${PORT} | xargs kill -9`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});

export default app;
