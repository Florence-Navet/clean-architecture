// Bonus 2 · rouge tant que handleWithRetry n'est pas complétée.
import { ExpenseAdded } from '../../src/application/events';
import { handleWithRetry } from '../../src/consumers/retry-or-dead-letter';

const zeroEuro: ExpenseAdded = {
  type: 'ExpenseAdded',
  eventId: 'evt-0',
  groupId: 'annecy',
  payerName: 'Alice',
  amountInCents: 0,
  occurredAt: '2026-11-18T14:00:00.000Z',
};

describe('handleWithRetry (bonus 2)', () => {
  it('traite l\'événement une seule fois quand tout va bien', async () => {
    let attempts = 0;
    const dlq: ExpenseAdded[] = [];

    await handleWithRetry(
      zeroEuro,
      async () => { attempts++; },
      async (event) => { dlq.push(event); },
    );

    expect(attempts).toBe(1);
    expect(dlq).toEqual([]);
  });

  it('réessaie, et s\'arrête dès que ça marche', async () => {
    let attempts = 0;
    const dlq: ExpenseAdded[] = [];

    await handleWithRetry(
      zeroEuro,
      async () => {
        attempts++;
        if (attempts < 2) throw new Error('panne passagère');
      },
      async (event) => { dlq.push(event); },
    );

    expect(attempts).toBe(2);
    expect(dlq).toEqual([]);
  });

  it('après 3 échecs, envoie l\'événement à la DLQ (une seule fois)', async () => {
    let attempts = 0;
    const dlq: ExpenseAdded[] = [];

    await handleWithRetry(
      zeroEuro,
      async () => {
        attempts++;
        throw new Error('montant à 0 € : je plante');
      },
      async (event) => { dlq.push(event); },
    );

    expect(attempts).toBe(3);
    expect(dlq).toEqual([zeroEuro]);
  });
});
