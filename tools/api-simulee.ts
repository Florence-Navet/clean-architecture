// L'API simulée : un petit serveur local qui imite Frankfurter v2 (et v1 pour le bonus 4) : mêmes routes, même JSON.
// Ce n'est PAS un fake : c'est un vrai serveur HTTP, que notre adapteur appelle par le réseau.
// Lancement : npm run api-simulee (normale), npm run api-simulee:lente, npm run api-simulee:en-panne
import http from 'node:http';

export type Mode = 'normale' | 'lente' | 'en-panne';

// Combien vaut 1 unité de chaque devise, en euros. Toute autre devise est inconnue (422).
const RATES_IN_EUR: Record<string, number> = { EUR: 1, USD: 0.9, GBP: 1.15, CHF: 1.05, JPY: 0.006 };
const SLOW_DELAY_MS = 3000;

export function startApiSimulee(mode: Mode, port: number, log: (line: string) => void = console.log): Promise<http.Server> {
  let requestCount = 0;
  const server = http.createServer((req, res) => {
    requestCount++;
    const { status, body } = answer(req.url ?? '', mode, requestCount);
    const send = () => res.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(body));
    // Mode lente : toutes les réponses partent 3 s après la requête.
    const delay = mode === 'lente' ? SLOW_DELAY_MS : 0;
    log(`[API simulée · ${mode}] ${req.method} ${req.url} → ${status}${delay ? ` (réponse envoyée dans ${delay / 1000} s)` : ''}`);
    setTimeout(send, delay);
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

// La réponse à une requête : mêmes routes et même JSON que Frankfurter.
//   v2 : /v2/rate/USD/EUR              → { date, base, quote, rate }      (devise inconnue : 422)
//   v1 : /v1/latest?base=USD&symbols=EUR → { amount, base, date, rates }  (devise inconnue : 404, bonus 4)
function answer(url: string, mode: Mode, requestCount: number): { status: number; body: object } {
  const { pathname, searchParams } = new URL(url, 'http://localhost');
  const v2 = /^\/v2\/rate\/([a-zA-Z]+)\/([a-zA-Z]+)$/.exec(pathname);
  const v1 = pathname === '/v1/latest';
  if (!v2 && !v1) return { status: 404, body: { status: 404, message: 'not found' } };
  // Mode en-panne : une requête sur deux (la 1re, la 3e…) répond 500.
  if (mode === 'en-panne' && requestCount % 2 === 1) {
    return { status: 500, body: { status: 500, message: 'internal server error' } };
  }
  const base = (v2 ? v2[1]! : searchParams.get('base') ?? 'EUR').toUpperCase();
  const quote = (v2 ? v2[2]! : searchParams.get('symbols') ?? '').toUpperCase();
  const baseInEur = RATES_IN_EUR[base];
  const quoteInEur = RATES_IN_EUR[quote];
  const date = new Date().toISOString().slice(0, 10);
  if (v1) {
    if (baseInEur === undefined || quoteInEur === undefined) return { status: 404, body: { message: 'not found' } };
    return { status: 200, body: { amount: 1.0, base, date, rates: { [quote]: roundRate(baseInEur / quoteInEur) } } };
  }
  if (baseInEur === undefined) return { status: 422, body: { status: 422, message: `invalid currency: ${base}` } };
  if (quoteInEur === undefined) return { status: 422, body: { status: 422, message: `invalid currency: ${quote}` } };
  return { status: 200, body: { date, base, quote, rate: roundRate(baseInEur / quoteInEur) } };
}

function roundRate(rate: number): number {
  return Math.round(rate * 100000) / 100000;
}

// Lancé directement (npm run api-simulee…), et pas importé par un test : on démarre sur le port 4000.
if (require.main === module) {
  const mode = (process.argv[2] ?? 'normale') as Mode;
  startApiSimulee(mode, 4000).then(() => {
    console.log(`API simulée (mode ${mode}) sur http://localhost:4000/v2 · essayez http://localhost:4000/v2/rate/USD/EUR`);
  });
}
