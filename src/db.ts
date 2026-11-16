// "Base de données" en mémoire. TODO: passer sur Postgres un jour
export type Category = { code: string; label: string; price: number; quota: number; sold: number };

export type Concert = {
  id: number;
  artist: string;
  venue: string;
  city: string;
  date: string;
  status: string; // ON_SALE | SOLD_OUT | CANCELLED
  categories: Category[];
};

export const db: any = {
  concerts: [] as Concert[],
  bookings: [] as any[],
  promoCodes: {} as any,
  nextConcertId: 1,
  nextBookingId: 1,
};

function inDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(20, 30, 0, 0);
  return d.toISOString();
}

export function seed() {
  db.concerts = [
    {
      id: 1, artist: 'Les Lumières Vives', venue: 'Halle Tony Garnier', city: 'Lyon', date: inDays(90), status: 'ON_SALE',
      categories: [
        { code: 'FOSSE', label: 'Fosse', price: 45, quota: 200, sold: 120 },
        { code: 'GRADIN', label: 'Gradin', price: 60, quota: 100, sold: 40 },
        { code: 'VIP', label: 'Carré VIP', price: 150, quota: 10, sold: 9 },
      ],
    },
    {
      id: 2, artist: 'Nuit Blanche Orchestra', venue: 'Accor Arena', city: 'Paris', date: inDays(20), status: 'ON_SALE',
      categories: [
        { code: 'FOSSE', label: 'Fosse', price: 55, quota: 300, sold: 300 },
        { code: 'GRADIN', label: 'Gradin', price: 70, quota: 200, sold: 150 },
        { code: 'VIP', label: 'Carré VIP', price: 180, quota: 20, sold: 5 },
      ],
    },
    {
      id: 3, artist: 'Margaux Sel', venue: 'Le Dôme', city: 'Marseille', date: inDays(5), status: 'ON_SALE',
      categories: [
        { code: 'FOSSE', label: 'Fosse', price: 35, quota: 150, sold: 20 },
        { code: 'GRADIN', label: 'Gradin', price: 42, quota: 80, sold: 0 },
      ],
    },
    {
      id: 4, artist: 'Kilomètre Zéro', venue: 'Zénith', city: 'Nantes', date: inDays(40), status: 'SOLD_OUT',
      categories: [{ code: 'FOSSE', label: 'Fosse', price: 50, quota: 100, sold: 100 }],
    },
  ];
  db.bookings = [
    {
      id: 1, concertId: 1, email: 'alice@mail.fr', tickets: [{ category: 'FOSSE', quantity: 2, unitPrice: 45 }],
      subtotal: 81, fees: 5.43, total: 86.43, promoCode: null, status: 'CONFIRMED', createdAt: inDays(-3),
    },
    {
      id: 2, concertId: 2, email: 'bob@mail.fr', tickets: [{ category: 'GRADIN', quantity: 4, unitPrice: 70 }],
      subtotal: 280, fees: 14.4, total: 294.4, promoCode: null, status: 'CONFIRMED', createdAt: inDays(-10),
    },
    {
      id: 3, concertId: 1, email: 'bob@mail.fr', tickets: [{ category: 'GRADIN', quantity: 6, unitPrice: 60 }],
      subtotal: 307.8, fees: 15, total: 322.8, promoCode: null, status: 'CANCELLED', refund: 307.8, createdAt: inDays(-30),
    },
  ];
  db.promoCodes = {
    FAN10: { type: 'PERCENT', value: 10, maxUses: 100, used: 12 },
    BIENVENUE5: { type: 'FIXED', value: 5, minAmount: 50, maxUses: 3, used: 2 },
  };
  db.nextConcertId = 5;
  db.nextBookingId = 4;
}

seed();
