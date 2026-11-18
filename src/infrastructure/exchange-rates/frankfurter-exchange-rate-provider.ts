// Couche Infrastructure · frankfurter-exchange-rate-provider.ts
// L'adapteur qui « signe le contrat » ExchangeRateProvider en appelant l'API Frankfurter.
// Son travail : TRADUIRE. Il reçoit le JSON de Frankfurter (leur modèle) et renvoie
// un ExchangeRate (notre modèle, Couche Domaine). Les codes HTTP deviennent nos erreurs.
// Rien de Frankfurter ne sort de ce fichier : ni leur JSON, ni leurs codes HTTP.
import { ExchangeRateProvider } from '../../application/exchange-rate-provider';
import { ExchangeRateUnavailableError } from '../../application/exchange-rate-unavailable-error';
import { ExchangeRate } from '../../domain/exchange-rate';
import { UnknownCurrencyError } from '../../domain/unknown-currency-error';

// Bloc B : la forme du JSON renvoyé par Frankfurter, telle que décrite dans leur doc.
// C'est LEUR modèle : ce type n'est jamais exporté.
type FrankfurterRateResponse = {
  // À compléter (bloc B) : les 4 champs de la réponse, avec leur type.
};

// Bloc C : au-delà de ce délai (en millisecondes), on abandonne la requête.
const TIMEOUT_MS = 2000;

// Bloc D : le nombre d'essais au total, et l'attente avant le 1er nouvel essai (elle double à chaque fois).
const MAX_ATTEMPTS = 3;
const FIRST_RETRY_DELAY_MS = 200;

export class FrankfurterExchangeRateProvider implements ExchangeRateProvider {
  // baseUrl : l'adresse de l'API, sans « / » à la fin. Exemple : 'https://api.frankfurter.dev/v2'.
  // Elle est choisie dans main.ts : l'adapteur ne sait pas s'il parle à la vraie API ou à l'API simulée.
  constructor(private readonly baseUrl: string) {}

  async getRate(base: string, quote: string): Promise<ExchangeRate> {
    // Bloc D : remplacez cette ligne par une boucle qui réessaie avec backoff.
    return this.fetchRate(base, quote);
  }

  // Bloc B : UN appel HTTP à l'API, dont la réponse est traduite en objet du Domaine.
  private async fetchRate(base: string, quote: string): Promise<ExchangeRate> {
    throw new Error('À implémenter (bloc B)');
  }
}

// Bloc D : attend `ms` millisecondes avant de continuer. Exemple : await wait(200);
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
