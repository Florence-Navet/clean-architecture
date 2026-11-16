// Bonus 2 · retry-or-dead-letter.ts
// Traite un événement avec plusieurs essais. Après le dernier échec, l'envoie à la DLQ
// (« dead letter queue », le topic expenses.dlq) au lieu de bloquer le consumer.
import { ExpenseAdded } from '../application/events';

export async function handleWithRetry(
  event: ExpenseAdded,
  handle: (event: ExpenseAdded) => Promise<void>, // la réaction, qui peut planter
  sendToDlq: (event: ExpenseAdded) => Promise<void>, // envoie l'événement dans expenses.dlq
  maxAttempts = 3,
): Promise<void> {
  // À compléter (bonus 2) : essayez handle jusqu'à maxAttempts fois ;
  // si tous les essais échouent, appelez sendToDlq une seule fois.
  throw new Error('À compléter : bonus 2');
}
