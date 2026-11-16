// Couche Infrastructure · in-memory-event-publisher.ts
// Bloc A : un adapteur qui implémente EventPublisher en rangeant les événements dans un tableau.
// Utile pour les tests et pour lancer l'API sans Kafka.
import { EventPublisher, ExpenseAdded } from '../../application/events';

export class InMemoryEventPublisher implements EventPublisher {
  readonly published: ExpenseAdded[] = [];

  async publish(event: ExpenseAdded): Promise<void> {
    // À compléter (bloc A) : rangez l'événement dans this.published.
    throw new Error('À compléter : bloc A');
  }
}
