import { Request, Response } from 'express';
import { db } from '../db';

export const ADMIN_KEY = 'admin123';

export function isAdmin(req: Request) {
  return req.headers['x-admin-key'] == ADMIN_KEY;
}

export function formatPrice(n: number) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

export function daysBefore(dateStr: string) {
  return (new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
}

export function findConcert(req: Request, res: Response) {
  const concert = db.concerts.find((c: any) => c.id == req.params.id);
  if (!concert) {
    res.status(404).json({ error: 'Concert introuvable' });
    return null;
  }
  return concert;
}

export function remainingSeats(concert: any) {
  let total = 0;
  for (const cat of concert.categories) {
    total += cat.quota - cat.sold;
  }
  return total;
}
