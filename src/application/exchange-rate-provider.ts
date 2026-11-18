// Couche Applicative · exchange-rate-provider.ts
// Le contrat dont AddExpense a besoin pour convertir une dépense en euros.
// Comme GroupRepository mardi : c'est celui qui a besoin (le use case) qui écrit le contrat.
// L'adapteur qui appelle la vraie API vit dans la Couche Infrastructure.
import { ExchangeRate } from '../domain/exchange-rate';

export interface ExchangeRateProvider {
  // Le taux pour passer de `base` à `quote`. Exemple : getRate('USD', 'EUR').
  // Peut échouer de deux façons :
  //   - UnknownCurrencyError (Domaine) : la devise n'existe pas ;
  //   - ExchangeRateUnavailableError (Applicative) : le fournisseur de taux ne répond pas.
  getRate(base: string, quote: string): Promise<ExchangeRate>;
}
