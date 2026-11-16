// Bonus 1 · outbox-relay.ts
// Le relais : toutes les 2 secondes, il publie ce que l'outbox n'a pas encore envoyé.
import { EventPublisher } from '../../application/events';
import { InMemoryOutbox } from './in-memory-outbox';

export class OutboxRelay {
  constructor(
    private readonly outbox: InMemoryOutbox,
    private readonly publisher: EventPublisher, // le vrai : KafkaEventPublisher
  ) {}

  // À compléter : publie chaque événement en attente, puis le marque comme envoyé.
  // Si publish échoue (Kafka arrêté), l'événement reste en attente pour le prochain tour.
  async relayOnce(): Promise<void> {
    throw new Error('À compléter : bonus 1');
  }

  // Fourni : appelle relayOnce toutes les 2 secondes.
  start(intervalMs = 2000): void {
    setInterval(() => this.relayOnce().catch(console.error), intervalMs);
  }
}
