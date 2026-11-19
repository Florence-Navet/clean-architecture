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
  date: Date;
  base: string;
  quote: string;
  rate: number;
};
// Bloc C : au-delà de ce délai (en millisecondes), on abandonne la requête.
const TIMEOUT_MS = 2000;

// Bloc D : le nombre d'essais au total, et l'attente avant le 1er nouvel essai (elle double à chaque fois).
const MAX_ATTEMPTS = 3;
const FIRST_RETRY_DELAY_MS = 200;

export class FrankfurterExchangeRateProvider implements ExchangeRateProvider {
  // baseUrl : l'adresse de l'API, sans « / » à la fin. Exemple : 'https://api.frankfurter.dev/v2'.
  // Elle est choisie dans main.ts : l'adapteur ne sait pas s'il parle à la vraie API ou à l'API simulée.
  constructor(private readonly baseUrl: string) {
  }

  async getRate(base: string, quote: string): Promise<ExchangeRate> {
    // Bloc D : remplacez cette ligne par une boucle qui réessaie avec backoff.
    let delay = FIRST_RETRY_DELAY_MS;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await this.fetchRate(base, quote);
      } catch (error) {
        // À vous : throw error si pas Unavailable, ou dernier essai.
        // Sinon : await wait(delay), puis doubler delay.
      }
    }
    throw new Error('Impossible d\'arriver ici');
  }

  // Bloc B : UN appel HTTP à l'API, dont la réponse est traduite en objet du Domaine.
  // private async fetchRate(base: string, quote: string): Promise<ExchangeRate> {
  //   // throw new Error('À implémenter (bloc B)');
  //   const response = await fetch(`${this.baseUrl}/rate/${base}/${quote}`);
  //   if (response.status === 422) {
  //     throw new UnknownCurrencyError(base);
  //   }
  //   if(!response.ok){
  //     throw new ExchangeRateUnavailableError(`HTTP ${response.status}`);
  //   }
  //   const data = (await response.json()) as FrankfurterRateResponse;
  //   return new ExchangeRate(data.base, data.quote, data.rate);
  //
  // }
  private async fetchRate(base: string, quote: string): Promise<ExchangeRate> {
    const url = `${this.baseUrl}/rate/${base}/${quote}`;

    // 1. Appeler l'API
    let response: Response;
    try {
      response = await fetch(url, {signal: AbortSignal.timeout(TIMEOUT_MS)});
    } catch (error) {
      throw new ExchangeRateUnavailableError(String(error));
    }

    // 2. Traduire les codes HTTP en NOS erreurs — hors du try
    if (response.status === 422) {
      throw new UnknownCurrencyError(base);
    }
    if (!response.ok) {
      throw new ExchangeRateUnavailableError(`HTTP ${response.status}`);
    }

    // 3. Traduire leur JSON en NOTRE objet
    const data = (await response.json()) as FrankfurterRateResponse;
    return new ExchangeRate(data.base, data.quote, data.rate);
  }
}

// Bloc D : attend `ms` millisecondes avant de continuer. Exemple : await wait(200);
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}