// Blocs B, C et D · l'adapteur Frankfurter, testé contre l'API simulée (tools/api-simulee.ts).
// Chaque test démarre l'API simulée sur un port libre, puis donne son adresse à l'adapteur :
// ce sont de vrais appels HTTP, mais sans dépendre d'Internet ni des taux du jour.
// Dans l'API simulée, 1 USD vaut toujours 0.9 EUR.
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { startApiSimulee, Mode } from '../../tools/api-simulee';
import { ExchangeRateUnavailableError } from '../../src/application/exchange-rate-unavailable-error';
import { ExchangeRate } from '../../src/domain/exchange-rate';
import { UnknownCurrencyError } from '../../src/domain/unknown-currency-error';
import { FrankfurterExchangeRateProvider } from '../../src/infrastructure/exchange-rates/frankfurter-exchange-rate-provider';

let server: http.Server | undefined;
let requests: string[] = []; // chaque requête reçue par l'API simulée

// Démarre l'API simulée dans le mode demandé et renvoie son adresse, ex. 'http://localhost:41234/v2'.
async function apiSimulee(mode: Mode): Promise<string> {
  requests = [];
  server = await startApiSimulee(mode, 0, (line) => requests.push(line));
  const { port } = server.address() as AddressInfo;
  return `http://localhost:${port}/v2`;
}

afterEach(() => {
  server?.closeAllConnections();
  server?.close();
  server = undefined;
});

describe('Bloc B · traduire la réponse de Frankfurter', () => {
  it('renvoie un ExchangeRate (notre objet du Domaine) pour USD → EUR', async () => {
    const provider = new FrankfurterExchangeRateProvider(await apiSimulee('normale'));

    const rate = await provider.getRate('USD', 'EUR');

    expect(rate).toBeInstanceOf(ExchangeRate);
    expect(rate.base).toBe('USD');
    expect(rate.quote).toBe('EUR');
    expect(rate.rate).toBe(0.9);
  });

  it('traduit un 422 (devise inconnue) en UnknownCurrencyError', async () => {
    const provider = new FrankfurterExchangeRateProvider(await apiSimulee('normale'));

    await expect(provider.getRate('XYZ', 'EUR')).rejects.toBeInstanceOf(UnknownCurrencyError);
  });

  it('traduit une autre erreur HTTP (ici 404, mauvaise adresse) en ExchangeRateUnavailableError', async () => {
    const provider = new FrankfurterExchangeRateProvider(`${await apiSimulee('normale')}/mauvaise-adresse`);

    await expect(provider.getRate('USD', 'EUR')).rejects.toBeInstanceOf(ExchangeRateUnavailableError);
  });
});

describe('Bloc C · ne pas attendre une API lente ou éteinte', () => {
  it('abandonne au bout de TIMEOUT_MS quand l\'API met 3 s à répondre', async () => {
    const provider = new FrankfurterExchangeRateProvider(await apiSimulee('lente'));

    await expect(provider.getRate('USD', 'EUR')).rejects.toBeInstanceOf(ExchangeRateUnavailableError);
  }, 15_000);

  it('traduit « personne ne répond à cette adresse » en ExchangeRateUnavailableError', async () => {
    // Le port 1 n'est jamais ouvert : fetch lève une erreur réseau.
    const provider = new FrankfurterExchangeRateProvider('http://localhost:1/v2');

    await expect(provider.getRate('USD', 'EUR')).rejects.toBeInstanceOf(ExchangeRateUnavailableError);
  });
});

describe('Bloc D · réessayer quand l\'API est en panne', () => {
  it('réessaie après un 500 et finit par renvoyer le taux', async () => {
    // En mode en-panne, la 1re requête répond 500, la 2e répond normalement.
    const provider = new FrankfurterExchangeRateProvider(await apiSimulee('en-panne'));

    const rate = await provider.getRate('USD', 'EUR');

    expect(rate.rate).toBe(0.9);
    expect(requests).toHaveLength(2);
  });

  it('ne réessaie pas une devise inconnue : réessayer ne changerait rien (vert dès le bloc B, doit le rester)', async () => {
    const provider = new FrankfurterExchangeRateProvider(await apiSimulee('normale'));

    await expect(provider.getRate('XYZ', 'EUR')).rejects.toBeInstanceOf(UnknownCurrencyError);
    expect(requests).toHaveLength(1);
  });
});
