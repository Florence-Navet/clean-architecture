import { Router } from 'express';
import { db } from '../db';
import { sendEmail } from '../utils/mailer';
import { findConcert, formatPrice, isAdmin } from '../utils/helpers';

const router = Router();

const MAX_TICKETS_PER_EMAIL = 8;

// Réserver des places
router.post('/concerts/:id/bookings', (req, res) => {
  const concert = findConcert(req, res);
  if (!concert) return;
  const { email, tickets, promoCode, student } = req.body;

  if (concert.status == 'CANCELLED') {
    return res.status(400).json({ error: 'Ce concert est annulé' });
  }
  if (concert.status == 'SOLD_OUT') {
    return res.status(409).json({ error: 'Ce concert est complet' });
  }
  if (!email || email.indexOf('@') == -1) {
    return res.status(400).json({ error: 'Email invalide' });
  }
  if (!tickets || tickets.length == 0) {
    return res.status(400).json({ error: 'Aucun billet demandé' });
  }

  // limite de billets par personne (demandé par les producteurs, anti-revente)
  let already = 0;
  for (const b of db.bookings) {
    if (b.concertId == concert.id && b.email == email) {
      for (const t of b.tickets) already += t.quantity;
    }
  }
  let qty = 0;
  for (const t of tickets) qty += t.quantity;
  if (already + qty > MAX_TICKETS_PER_EMAIL) {
    return res.status(400).json({ error: `Maximum ${MAX_TICKETS_PER_EMAIL} billets par personne` });
  }

  let subtotal = 0;
  const lines: any[] = [];
  for (const t of tickets) {
    const cat = concert.categories.find((c: any) => c.code == t.category);
    if (!cat) {
      return res.status(400).json({ error: `Catégorie inconnue : ${t.category}` });
    }
    if (t.quantity <= 0) {
      return res.status(400).json({ error: 'Quantité invalide' });
    }
    if (cat.sold + t.quantity > cat.quota) {
      return res.status(409).json({ error: `Plus assez de places en ${cat.label}` });
    }
    cat.sold += t.quantity;
    let price = cat.price;
    if (student) {
      if (cat.code != 'VIP') {
        price = price * 0.8;
      }
    }
    subtotal += price * t.quantity;
    lines.push({ category: cat.code, quantity: t.quantity, unitPrice: price });
  }

  // early bird : -10% si on réserve plus de 60 jours avant
  const days = (new Date(concert.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  if (days > 60) {
    subtotal = subtotal * 0.9;
  }
  // tarif groupe
  if (qty >= 6) {
    subtotal = subtotal * 0.95;
  }

  if (promoCode) {
    const promo = db.promoCodes[promoCode.toUpperCase()];
    if (!promo) {
      return res.status(400).json({ error: 'Code promo inconnu' });
    }
    promo.used++;
    if (promo.used > promo.maxUses) {
      return res.status(400).json({ error: 'Code promo épuisé' });
    }
    if (promo.type == 'PERCENT') {
      subtotal = subtotal - (subtotal * promo.value) / 100;
    } else if (promo.type == 'FIXED') {
      if (subtotal >= promo.minAmount) {
        subtotal = subtotal - promo.value;
      }
    }
  }

  // frais : 1,50 € par billet + 3 % de frais de service, plafonnés à 15 €
  let fees = qty * 1.5 + subtotal * 0.03;
  if (fees > 15) fees = 15;
  fees = Math.round(fees * 100) / 100;
  const total = Math.round((subtotal + fees) * 100) / 100;

  const booking = {
    id: db.nextBookingId++,
    concertId: concert.id,
    email,
    tickets: lines,
    subtotal,
    fees,
    total,
    promoCode: promoCode ? promoCode.toUpperCase() : null,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(booking);

  let full = true;
  for (const cat of concert.categories) {
    if (cat.sold < cat.quota) full = false;
  }
  if (full) concert.status = 'SOLD_OUT';

  sendEmail(
    email,
    `Vos billets pour ${concert.artist}`,
    `Réservation n°${booking.id} : ${qty} billet(s) pour ${concert.artist} à ${concert.venue}. Total : ${formatPrice(total)}.`,
  );
  console.log(`[${new Date().toISOString()}] réservation #${booking.id} ${email} ${total}€`);
  res.status(201).json(booking);
});

// Consulter sa réservation
router.get('/bookings/:id', (req, res) => {
  const booking = db.bookings.find((b: any) => b.id == req.params.id);
  if (!booking) return res.status(404).json({ error: 'Réservation introuvable' });
  if (booking.email != req.query.email && !isAdmin(req)) {
    return res.status(404).json({ error: 'Réservation introuvable' });
  }
  const concert = db.concerts.find((c: any) => c.id == booking.concertId);
  res.json({ ...booking, concert: { id: concert.id, artist: concert.artist, date: concert.date, venue: concert.venue } });
});

// Changer de catégorie (ex. passer de fosse à gradin)
router.post('/bookings/:id/change-category', (req, res) => {
  const booking = db.bookings.find((b: any) => b.id == req.params.id);
  if (!booking || booking.email != req.body.email) {
    return res.status(404).json({ error: 'Réservation introuvable' });
  }
  if (booking.status != 'CONFIRMED') {
    return res.status(400).json({ error: 'Réservation non modifiable' });
  }
  if (booking.tickets.length > 1) {
    return res.status(400).json({ error: 'Impossible de modifier une réservation multi-catégories' });
  }
  const concert = db.concerts.find((c: any) => c.id == booking.concertId);
  const line = booking.tickets[0];
  const oldCat = concert.categories.find((c: any) => c.code == line.category);
  const newCat = concert.categories.find((c: any) => c.code == req.body.category);
  if (!newCat) {
    return res.status(400).json({ error: `Catégorie inconnue : ${req.body.category}` });
  }
  if (newCat.code == oldCat.code) {
    return res.status(400).json({ error: 'Même catégorie' });
  }
  if (newCat.sold + line.quantity > newCat.quota) {
    return res.status(409).json({ error: `Plus assez de places en ${newCat.label}` });
  }
  oldCat.sold -= line.quantity;
  newCat.sold += line.quantity;

  // on recalcule le prix (copié de la réservation)
  let price = newCat.price;
  if (line.unitPrice < oldCat.price) {
    // il avait le tarif étudiant
    if (newCat.code != 'VIP') {
      price = price * 0.8;
    }
  }
  let subtotal = price * line.quantity;
  let fees = line.quantity * 1.5 + subtotal * 0.03;
  if (fees > 15) fees = 15;
  fees = Math.round(fees * 100) / 100;
  const total = Math.round((subtotal + fees) * 100) / 100;
  const diff = Math.round((total - booking.total) * 100) / 100;

  booking.tickets = [{ category: newCat.code, quantity: line.quantity, unitPrice: price }];
  booking.subtotal = subtotal;
  booking.fees = fees;
  booking.total = total;

  if (oldCat.sold < oldCat.quota && concert.status == 'SOLD_OUT') {
    concert.status = 'ON_SALE';
  }

  sendEmail(
    booking.email,
    `Modification de votre réservation n°${booking.id}`,
    diff > 0
      ? `Vous passez en ${newCat.label}. Il reste ${formatPrice(diff)} à régler.`
      : `Vous passez en ${newCat.label}. Nous vous remboursons ${formatPrice(-diff)}.`,
  );
  res.json({ ...booking, difference: diff });
});

// Annulation par le client
router.post('/bookings/:id/cancel', (req, res) => {
  const booking = db.bookings.find((b: any) => b.id == req.params.id);
  if (!booking || booking.email != req.body.email) {
    return res.status(404).json({ error: 'Réservation introuvable' });
  }
  if (booking.status == 'CANCELLED') {
    return res.status(400).json({ error: 'Réservation déjà annulée' });
  }
  const concert = db.concerts.find((c: any) => c.id == booking.concertId);
  const days = (new Date(concert.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);

  let refund = 0;
  if (days < 0) {
    return res.status(400).json({ error: 'Le concert a déjà eu lieu' });
  } else {
    if (days > 30) {
      refund = booking.total - booking.fees;
    } else {
      if (days >= 7) {
        refund = (booking.total - booking.fees) / 2;
      } else {
        if (booking.promoCode) {
          return res.status(400).json({ error: 'Annulation impossible à moins de 7 jours' });
        }
        refund = 0;
      }
    }
  }

  booking.status = 'CANCELLED';
  booking.refund = refund;
  booking.cancelledAt = new Date().toISOString();
  for (const t of booking.tickets) {
    const cat = concert.categories.find((c: any) => c.code == t.category);
    cat.sold -= t.quantity;
  }

  sendEmail(
    booking.email,
    `Annulation de votre réservation n°${booking.id}`,
    refund > 0
      ? `Votre réservation est annulée. Remboursement : ${formatPrice(refund)}.`
      : `Votre réservation est annulée. Conformément aux CGV, aucun remboursement n'est possible.`,
  );
  res.json({ id: booking.id, status: booking.status, refund });
});

export default router;
