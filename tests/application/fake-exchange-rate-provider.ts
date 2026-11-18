// Bloc A · les fakes : des ExchangeRateProvider en mémoire, pour tester AddExpense sans réseau.
// Un fake « signe le même contrat » que l'adapteur Frankfurter, mais ne fait aucun appel HTTP.
// Même idée que FakeGroupRepository (dans add-expense.test.ts), que vous connaissez depuis mardi.
import { ExchangeRateProvider } from '../../src/application/exchange-rate-provider';
import { ExchangeRateUnavailableError } from '../../src/application/exchange-rate-unavailable-error';
import { ExchangeRate } from '../../src/domain/exchange-rate';
import { UnknownCurrencyError } from '../../src/domain/unknown-currency-error';

export class FakeExchangeRateProvider implements ExchangeRateProvider {
  // Chaque appel reçu, noté 'USD/EUR' : les tests vérifient ainsi qu'on a appelé (ou pas) le fournisseur.
  readonly calls: string[] = [];

  // rates : combien vaut 1 unité de chaque devise connue, en euros. Exemple : { USD: 0.9 }.
  constructor(private readonly rates: Record<string, number>) {}

  async getRate(base: string, quote: string): Promise<ExchangeRate> {
    this.calls.push(`${base}/${quote}`);

    // À compléter (bloc A) :
    //   1. lisez le taux de `base` dans this.rates (il vaut undefined si la devise n'y est pas) ;
    //   2. s'il vaut undefined : levez une UnknownCurrencyError ;
    //   3. sinon : renvoyez new ExchangeRate(base, quote, <le taux>).
    throw new Error('À implémenter (bloc A)');
  }
}

// Bloc A : un fournisseur de taux qui échoue toujours, comme une API en panne.
export class BrokenExchangeRateProvider implements ExchangeRateProvider {
  async getRate(base: string, quote: string): Promise<ExchangeRate> {
    // À compléter (bloc A) : levez une ExchangeRateUnavailableError (message libre, ex. 'API en panne').
    throw new Error('À implémenter (bloc A)');
  }
}
