// Code de mardi (vert au départ) · le week-end à Annecy, de bout en bout
// Les vrais use cases + le vrai adapteur en mémoire : pas de base, pas de serveur.
import { Group } from '../../src/domain/group';
import { AddExpense } from '../../src/application/add-expense';
import { FakeExchangeRateProvider } from './fake-exchange-rate-provider';
import { GetBalances } from '../../src/application/get-balances';
import { InMemoryGroupRepository } from '../../src/infrastructure/persistence/in-memory-group-repository';

describe('Week-end à Annecy', () => {
  it('les 3 dépenses passent par AddExpense, puis GetBalances renvoie les soldes', async () => {
    // Préparer : un repository en mémoire qui contient le groupe d'Annecy
    const groups = new InMemoryGroupRepository();
    await groups.save(new Group('annecy', 'Week-end à Annecy', ['Alice', 'Bob', 'Chloé', 'David']));

    const addExpense = new AddExpense(groups, new FakeExchangeRateProvider({}));
    const getBalances = new GetBalances(groups);

    // Agir : les 3 dépenses du week-end (sans oublier les await !)
    await addExpense.execute({
      groupId: 'annecy',
      label: 'Gîte',
      amountCents: 12000,
      currency: 'EUR',
      paidBy: 'Alice',
      participants: ['Alice', 'Bob', 'Chloé', 'David'],
    });
    await addExpense.execute({
      groupId: 'annecy',
      label: 'Courses',
      amountCents: 6000,
      currency: 'EUR',
      paidBy: 'Bob',
      participants: ['Alice', 'Bob', 'Chloé', 'David'],
    });
    await addExpense.execute({
      groupId: 'annecy',
      label: 'Essence',
      amountCents: 4000,
      currency: 'EUR',
      paidBy: 'Chloé',
      participants: ['Alice', 'Chloé'],
    });

    // Vérifier
    const soldes = await getBalances.execute('annecy');
    expect(soldes).toEqual({ Alice: 5500, Bob: 1500, Chloé: -2500, David: -4500 });
  });
});
