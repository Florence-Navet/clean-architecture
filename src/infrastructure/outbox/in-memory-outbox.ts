// Bonus 1 · in-memory-outbox.ts
// L'outbox : au lieu d'envoyer l'événement à Kafka, on le RANGE à côté des données.
// Un relais (OutboxRelay) l'enverra plus tard. Comme il implémente EventPublisher,
// AddExpense ne voit pas la différence.
import { EventPublisher, ExpenseAdded } from '../../application/events';

export class InMemoryOutbox implements EventPublisher {
  // À compléter : de quoi ranger les événements pas encore envoyés.

  // Range l'événement, marqué « pas encore envoyé ».
  async publish(event: ExpenseAdded): Promise<void> {
    throw new Error('À compléter : bonus 1');
  }

  // Les événements pas encore envoyés, dans l'ordre où ils sont arrivés.
  pending(): ExpenseAdded[] {
    throw new Error('À compléter : bonus 1');
  }

  // Marque un événement comme envoyé : il ne sort plus dans pending().
  markAsSent(eventId: string): void {
    throw new Error('À compléter : bonus 1');
  }
}
