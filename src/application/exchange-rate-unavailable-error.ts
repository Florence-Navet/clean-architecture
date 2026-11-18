// Couche Applicative · exchange-rate-unavailable-error.ts
// L'erreur levée quand on n'arrive pas à obtenir un taux de change :
// l'API externe est en panne, trop lente, ou le réseau est coupé.
// Ce n'est pas une règle métier violée (la dépense est peut-être valide) :
// c'est « je ne peux pas répondre maintenant, réessayez plus tard ».

export class ExchangeRateUnavailableError extends Error {
  constructor(reason: string) {
    super(`Taux de change indisponible : ${reason}`);
  }
}
