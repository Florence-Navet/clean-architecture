import express from 'express';
import concertsRouter from './routes/concerts';
import bookingsRouter from './routes/bookings';
import { db, seed } from './db';
import { isAdmin } from './utils/helpers';

export const app = express();
app.use(express.json());

app.use(concertsRouter);
app.use(bookingsRouter);

// utilisé par l'équipe QA pour remettre les données de démo
app.post('/admin/reset', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
  seed();
  res.json({ ok: true, concerts: db.concerts.length, bookings: db.bookings.length });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
