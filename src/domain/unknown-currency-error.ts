// Couche Domaine · unknown-currency-error.ts
// L'erreur levée quand une devise n'existe pas (ex. 'XYZ').
// C'est une erreur du Domaine : « cette devise n'existe pas » est une règle métier,
// pas un détail technique. Le Domaine ne sait pas que l'API externe répond 422 :
// c'est l'adapteur qui traduit ce 422 en UnknownCurrencyError.
import { DomainError } from './domain-error';

export class UnknownCurrencyError extends DomainError {
  constructor(currency: string) {
    super(`Devise inconnue : ${currency}`);
  }
}
