import { Router } from 'express';
import { db } from '../db';
import { sendEmail } from '../utils/mailer';
import { isAdmin, findConcert, remainingSeats, daysBefore, formatPrice } from '../utils/helpers';

const router = Router();

// Liste publique des concerts
router.get('/concerts', (req, res) => {
  let list = db.concerts.filter((c: any) => c.status != 'CANCELLED');
  if (req.query.city) {
    list = list.filter((c: any) => c.city.toLowerCase() == String(req.query.city).toLowerCase());
  }
  if (req.query.available == 'true') {
    list = list.filter((c: any) => c.status == 'ON_SALE');
  }
  const result = list.map((c: any) => {
    let fromPrice = 999999;
    for (const cat of c.categories) {
      if (cat.sold < cat.quota && cat.price < fromPrice) fromPrice = cat.price;
    }
    return {
      id: c.id,
      artist: c.artist,
      city: c.city,
      venue: c.venue,
      date: c.date,
      status: c.status,
      fromPrice: fromPrice == 999999 ? null : fromPrice,
      remaining: remainingSeats(c),
      earlyBird: daysBefore(c.date) > 60,
    };
  });
  result.sort((a: any, b: any) => (a.date < b.date ? -1 : 1));
  res.json(result);
});

router.get('/concerts/:id', (req, res) => {
  const concert = findConcert(req, res);
  if (!concert) return;
  res.json({
    ...concert,
    remaining: remainingSeats(concert),
    categories: concert.categories.map((cat: any) => ({
      ...cat,
      remaining: cat.quota - cat.sold,
      priceLabel: formatPrice(cat.price),
    })),
  });
});

// Création d'un concert (organisateur)
router.post('/concerts', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
  const { artist, venue, city, date, categories } = req.body;
  if (!artist || !venue || !city || !date) {
    return res.status(400).json({ error: 'Champs obligatoires : artist, venue, city, date' });
  }
  if (new Date(date).getTime() < Date.now()) {
    return res.status(400).json({ error: 'La date doit être dans le futur' });
  }
  if (!categories || categories.length == 0) {
    return res.status(400).json({ error: 'Il faut au moins une catégorie' });
  }
  for (const cat of categories) {
    if (!cat.code || !cat.price || !cat.quota) {
      return res.status(400).json({ error: 'Catégorie invalide' });
    }
    if (cat.price < 0 || cat.quota < 0) {
      return res.status(400).json({ error: 'Prix et quota doivent être positifs' });
    }
  }
  const concert = {
    id: db.nextConcertId++,
    artist,
    venue,
    city,
    date,
    status: 'ON_SALE',
    categories: categories.map((cat: any) => ({
      code: cat.code.toUpperCase(),
      label: cat.label || cat.code,
      price: cat.price,
      quota: cat.quota,
      sold: 0,
    })),
  };
  db.concerts.push(concert);
  console.log(`[${new Date().toISOString()}] concert créé #${concert.id} ${artist}`);
  res.status(201).json(concert);
});

// Annulation d'un concert par l'organisateur : on rembourse tout le monde
router.post('/concerts/:id/cancel', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
  const concert = findConcert(req, res);
  if (!concert) return;
  if (concert.status == 'CANCELLED') {
    return res.status(400).json({ error: 'Concert déjà annulé' });
  }
  concert.status = 'CANCELLED';
  let refunded = 0;
  let count = 0;
  for (const b of db.bookings) {
    if (b.concertId == concert.id && b.status == 'CONFIRMED') {
      b.status = 'CANCELLED';
      b.refund = b.total; // frais compris, c'est nous qui annulons
      b.cancelledAt = new Date().toISOString();
      refunded += b.total;
      count++;
      sendEmail(
        b.email,
        `Annulation : ${concert.artist}`,
        `Le concert de ${concert.artist} du ${new Date(concert.date).toLocaleDateString('fr-FR')} est annulé. ` +
          `Vous serez remboursé de ${formatPrice(b.total)} sous 14 jours.`,
      );
    }
  }
  res.json({ concertId: concert.id, status: concert.status, cancelledBookings: count, refunded });
});

// Stats pour l'organisateur
router.get('/concerts/:id/stats', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
  const concert = findConcert(req, res);
  if (!concert) return;
  let revenue = 0;
  let refunds = 0;
  let ticketsSold = 0;
  const byCategory: any = {};
  for (const cat of concert.categories) {
    byCategory[cat.code] = { sold: cat.sold, quota: cat.quota, fillRate: Math.round((cat.sold / cat.quota) * 100) };
    ticketsSold += cat.sold;
  }
  for (const b of db.bookings) {
    if (b.concertId != concert.id) continue;
    if (b.status == 'CONFIRMED') {
      revenue += b.total;
    } else if (b.status == 'CANCELLED') {
      revenue += b.total;
      refunds += b.refund || 0;
    }
  }
  res.json({
    concertId: concert.id,
    ticketsSold,
    revenue: revenue - refunds,
    refunds,
    byCategory,
  });
});

export default router;
