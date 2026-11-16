// Bloc A · rouge tant que InMemoryEventPublisher.publish n'est pas complétée.
import { ExpenseAdded } from '../../src/application/events';
import { InMemoryEventPublisher } from '../../src/infrastructure/events/in-memory-event-publisher';

const courses: ExpenseAdded = {
  type: 'ExpenseAdded',
  eventId: 'evt-1',
  groupId: 'annecy',
  payerName: 'Alice',
  amountInCents: 6000,
  occurredAt: '2026-11-18T14:00:00.000Z',
};

describe('InMemoryEventPublisher (bloc A)', () => {
  it('ne contient rien au départ', () => {
    expect(new InMemoryEventPublisher().published).toEqual([]);
  });

  it('range chaque événement publié, dans l\'ordre', async () => {
    const publisher = new InMemoryEventPublisher();
    const essence: ExpenseAdded = { ...courses, eventId: 'evt-2', amountInCents: 4000 };

    await publisher.publish(courses);
    await publisher.publish(essence);

    expect(publisher.published).toEqual([courses, essence]);
  });
});
