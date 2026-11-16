// Bonus 1 · rouge tant que InMemoryOutbox et OutboxRelay ne sont pas complétés.
import { EventPublisher, ExpenseAdded } from '../../src/application/events';
import { InMemoryOutbox } from '../../src/infrastructure/outbox/in-memory-outbox';
import { OutboxRelay } from '../../src/infrastructure/outbox/outbox-relay';

function expenseAdded(eventId: string): ExpenseAdded {
  return {
    type: 'ExpenseAdded',
    eventId,
    groupId: 'annecy',
    payerName: 'Alice',
    amountInCents: 6000,
    occurredAt: '2026-11-18T14:00:00.000Z',
  };
}

// Un faux Kafka, qu'on peut « arrêter » pour simuler une panne.
class FakeKafka implements EventPublisher {
  sent: ExpenseAdded[] = [];
  down = false;
  async publish(event: ExpenseAdded) {
    if (this.down) throw new Error('Kafka est arrêté');
    this.sent.push(event);
  }
}

describe('InMemoryOutbox (bonus 1)', () => {
  it('garde les événements publiés en attente, dans l\'ordre', async () => {
    const outbox = new InMemoryOutbox();
    await outbox.publish(expenseAdded('evt-1'));
    await outbox.publish(expenseAdded('evt-2'));

    expect(outbox.pending().map((event) => event.eventId)).toEqual(['evt-1', 'evt-2']);
  });

  it('ne rend plus un événement marqué comme envoyé', async () => {
    const outbox = new InMemoryOutbox();
    await outbox.publish(expenseAdded('evt-1'));
    await outbox.publish(expenseAdded('evt-2'));

    outbox.markAsSent('evt-1');

    expect(outbox.pending().map((event) => event.eventId)).toEqual(['evt-2']);
  });
});

describe('OutboxRelay (bonus 1)', () => {
  it('publie les événements en attente, puis l\'outbox est vide', async () => {
    const outbox = new InMemoryOutbox();
    const kafka = new FakeKafka();
    await outbox.publish(expenseAdded('evt-1'));

    await new OutboxRelay(outbox, kafka).relayOnce();

    expect(kafka.sent.map((event) => event.eventId)).toEqual(['evt-1']);
    expect(outbox.pending()).toEqual([]);
  });

  it('garde l\'événement si Kafka est arrêté, et l\'envoie au tour suivant', async () => {
    const outbox = new InMemoryOutbox();
    const kafka = new FakeKafka();
    const relay = new OutboxRelay(outbox, kafka);
    await outbox.publish(expenseAdded('evt-1'));

    kafka.down = true;
    await relay.relayOnce().catch(() => {}); // le relais peut lever une erreur, ou non : les deux sont acceptés
    expect(outbox.pending()).toHaveLength(1);

    kafka.down = false;
    await relay.relayOnce();
    expect(kafka.sent.map((event) => event.eventId)).toEqual(['evt-1']);
    expect(outbox.pending()).toEqual([]);
  });
});
