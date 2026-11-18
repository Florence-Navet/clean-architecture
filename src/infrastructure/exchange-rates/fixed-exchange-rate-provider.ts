// Couche Infrastructure · fixed-exchange-rate-provider.ts
// Un adapteur complet, fourni : il « signe le contrat » ExchangeRateProvider avec des taux FIGÉS,
// écrits en dur ci-dessous. Aucun appel réseau.
// Il sert à faire tourner l'appli dès le bloc A, avant d'avoir écrit l'adapteur Frankfurter (bloc B).
// Ce n'est pas un fake (le fake vit dans les tests), ni l'API simulée (un serveur) : c'est un adapteur de l'appli.
import { ExchangeRateProvider } from '../../application/exchange-rate-provider';
import { ExchangeRate } from '../../domain/exchange-rate';
import { UnknownCurrencyError } from '../../domain/unknown-currency-error';

// Combien vaut 1 unité de chaque devise, en euros.
const FIXED_RATES_IN_EUR: Record<string, number> = { EUR: 1, USD: 0.9, GBP: 1.15, CHF: 1.05, JPY: 0.006 };

export class FixedExchangeRateProvider implements ExchangeRateProvider {
  async getRate(base: string, quote: string): Promise<ExchangeRate> {
    const baseInEur = FIXED_RATES_IN_EUR[base];
    if (baseInEur === undefined) {
      throw new UnknownCurrencyError(base);
    }
    const quoteInEur = FIXED_RATES_IN_EUR[quote];
    if (quoteInEur === undefined) {
      throw new UnknownCurrencyError(quote);
    }
    return new ExchangeRate(base, quote, baseInEur / quoteInEur);
  }
}
