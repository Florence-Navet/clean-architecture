// Couche Domaine · exchange-rate.ts
// Un taux de change : « 1 USD vaut 0,9 EUR » s'écrit new ExchangeRate('USD', 'EUR', 0.9).
// C'est NOTRE objet, pas celui de l'API externe : il ne sait rien de HTTP ni de Frankfurter.
// Le calcul « montant × taux » se fait ici, dans le Domaine.
import { DomainError } from './domain-error';

export class ExchangeRate {
  constructor(
    readonly base: string, // la devise de départ, ex. 'USD'
    readonly quote: string, // la devise d'arrivée, ex. 'EUR'
    readonly rate: number, // combien vaut 1 unité de `base` en `quote`, ex. 0.9
  ) {
    if (rate <= 0) {
      throw new DomainError('Un taux de change doit être supérieur à 0');
    }
  }

  // Convertit un montant en centimes de `base` vers des centimes de `quote`.
  // Exemple : 3000 centimes de USD (30 $) × 0.9 = 2700 centimes d'EUR (27 €).
  // On arrondit au centime le plus proche : pas de demi-centime.
  convert(amountCents: number): number {
    return Math.round(amountCents * this.rate);
  }
}
