// Couche Infrastructure · expense-routes.ts
// L'adapteur HTTP : il traduit une requête HTTP en appel de use case,
// puis le résultat (ou l'erreur) en réponse HTTP.
// Aucune règle métier ici : pas de calcul de soldes, pas de vérification « montant > 0 ».
import { Response, Router } from 'express';
import { AddExpense } from '../../application/add-expense';
import { GetBalances } from '../../application/get-balances';
import { GetSettlements } from '../../application/get-settlements';
import { GroupNotFoundError } from '../../application/group-not-found-error';
import { ExchangeRateUnavailableError } from '../../application/exchange-rate-unavailable-error';
import { DomainError } from '../../domain/domain-error';

// Les use cases arrivent en paramètres : ce fichier ne fait jamais `new AddExpense(...)`.
export function expenseRoutes(
  addExpense: AddExpense,
  getBalances: GetBalances,
  getSettlements: GetSettlements,
): Router {
  const router = Router();

  // Ajouter une dépense à un groupe
  router.post('/groups/:id/expenses', async (req, res) => {
    const body = req.body;

    // On vérifie seulement la FORME du JSON reçu (les bons types).
    // Les règles métier (montant positif, membres…) restent dans le Domaine.
    if (
      body === undefined ||
      typeof body.label !== 'string' ||
      typeof body.amountCents !== 'number' ||
      typeof body.paidBy !== 'string' ||
      !Array.isArray(body.participants) ||
      (body.currency !== undefined && typeof body.currency !== 'string')
    ) {
      res.status(400).json({ error: 'Corps attendu : { label, amountCents, currency?, paidBy, participants }' });
      return;
    }

    try {
      await addExpense.execute({
        groupId: req.params.id,
        label: body.label,
        amountCents: body.amountCents,
        // `currency` est facultatif : sans devise, la dépense est en euros (comme mardi).
        currency: body.currency ?? 'EUR',
        paidBy: body.paidBy,
        participants: body.participants,
      });
      res.status(201).end();
    } catch (error) {
      sendError(res, error);
    }
  });

  // Consulter les soldes d'un groupe
  router.get('/groups/:id/balances', async (req, res) => {
    try {
      const balances = await getBalances.execute(req.params.id);
      res.status(200).json(balances);
    } catch (error) {
      sendError(res, error);
    }
  });

  // Qui rembourse qui ? La liste des virements qui remettent le groupe à 0
  router.get('/groups/:id/settlements', async (req, res) => {
    try {
      const settlements = await getSettlements.execute(req.params.id);
      res.status(200).json(settlements);
    } catch (error) {
      sendError(res, error);
    }
  });

  return router;
}

// Traduit une erreur des couches internes en code HTTP.
function sendError(res: Response, error: unknown): void {
  if (error instanceof GroupNotFoundError) {
    res.status(404).json({ error: error.message });
  } else if (error instanceof DomainError) {
    // UnknownCurrencyError hérite de DomainError : une devise inconnue répond donc 400.
    res.status(400).json({ error: error.message });
  } else if (error instanceof ExchangeRateUnavailableError) {
    // 503 = « service indisponible » : ce n'est pas la faute du client, il peut réessayer plus tard.
    res.status(503).json({ error: error.message });
  } else {
    // Erreur imprévue : on ne montre pas le détail au client.
    console.error(error);
    res.status(500).json({ error: 'Erreur interne' });
  }
}
