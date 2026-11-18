// Bloc A · AddExpense avec une dépense en devise étrangère, testé avec un fake (aucun appel réseau).
// Rouge tant que FakeExchangeRateProvider (fake-exchange-rate-provider.ts) et
// la méthode toEurCents de AddExpense (src/application/add-expense.ts) ne sont pas complétés.
import { Group } from '../../src/domain/group';
import { UnknownCurrencyError } from '../../src/domain/unknown-currency-error';
import { GroupRepository } from '../../src/application/group-repository';
import { AddExpense } from '../../src/application/add-expense';
import { FakeExchangeRateProvider } from './fake-exchange-rate-provider';

class FakeGroupRepository implements GroupRepository {
  saved: Group[] = [];
  constructor(private readonly group?: Group) {}
  async findById(id: string) {
    return this.group?.id === id ? this.group : undefined;
  }
  async save(group: Group) {
    this.saved.push(group);
  }
}

describe('Bloc A · AddExpense avec des devises', () => {
  it('convertit 30 $ en 27 € avant d\'ajouter la dépense au groupe', async () => {
    const newYork = new Group('new-york', 'Week-end à New York', ['Alice', 'Bob']);
    const groups = new FakeGroupRepository(newYork);
    const exchangeRates = new FakeExchangeRateProvider({ USD: 0.9 }); // 1 $ = 0,90 €

    await new AddExpense(groups, exchangeRates).execute({
      groupId: 'new-york',
      label: 'Resto',
      amountCents: 3000, // 30 $
      currency: 'USD',
      paidBy: 'Alice',
      participants: ['Alice', 'Bob'],
    });

    // 30 $ × 0,9 = 27 €, partagés en 2 : Bob doit 13,50 € à Alice.
    expect(exchangeRates.calls).toEqual(['USD/EUR']);
    expect(groups.saved[0]?.balances()).toEqual({ Alice: 1350, Bob: -1350 });
  });

  it('n\'appelle pas le fournisseur de taux pour une dépense déjà en euros', async () => {
    const newYork = new Group('new-york', 'Week-end à New York', ['Alice', 'Bob']);
    const groups = new FakeGroupRepository(newYork);
    const exchangeRates = new FakeExchangeRateProvider({ USD: 0.9 });

    await new AddExpense(groups, exchangeRates).execute({
      groupId: 'new-york',
      label: 'Taxi',
      amountCents: 4000,
      currency: 'EUR',
      paidBy: 'Bob',
      participants: ['Alice', 'Bob'],
    });

    expect(exchangeRates.calls).toEqual([]);
    expect(groups.saved[0]?.balances()).toEqual({ Alice: -2000, Bob: 2000 });
  });

  it('refuse une devise inconnue, sans rien sauvegarder', async () => {
    const newYork = new Group('new-york', 'Week-end à New York', ['Alice', 'Bob']);
    const groups = new FakeGroupRepository(newYork);
    const exchangeRates = new FakeExchangeRateProvider({ USD: 0.9 });

    await expect(
      new AddExpense(groups, exchangeRates).execute({
        groupId: 'new-york',
        label: 'Souvenirs',
        amountCents: 1000,
        currency: 'XYZ',
        paidBy: 'Alice',
        participants: ['Alice', 'Bob'],
      }),
    ).rejects.toBeInstanceOf(UnknownCurrencyError);
    expect(groups.saved).toHaveLength(0);
  });

  // À vous (bloc A) : écrivez ce test vous-même, sur le modèle du test précédent.
  //   - utilisez un BrokenExchangeRateProvider (fake-exchange-rate-provider.ts) à la place du FakeExchangeRateProvider ;
  //   - attendez une ExchangeRateUnavailableError (à importer depuis src/application) ;
  //   - vérifiez que rien n'est sauvegardé.
  // Puis remplacez `it.todo(` par `it(` et ajoutez la fonction de test : `async () => { … }`.
  it.todo('ne sauvegarde rien si le fournisseur de taux échoue');
});
