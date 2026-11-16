// Couche Infrastructure · expense-routes.ts
// L'adapteur HTTP : traduit une requête en appel du use case, puis le résultat en réponse.
import { Router } from 'express';
import { AddExpense } from '../../application/add-expense';
import { DomainError } from '../../domain/domain-error';

export function expenseRoutes(addExpense: AddExpense): Router {
  const router = Router();

  router.post('/groups/:id/expenses', async (req, res) => {
    try {
      await addExpense.execute({
        groupId: req.params.id,
        label: req.body.label,
        amountCents: req.body.amountCents,
        paidBy: req.body.paidBy,
      });
      res.status(201).end();
    } catch (error) {
      if (error instanceof DomainError) {
        res.status(400).json({ error: error.message });
      } else {
        console.error(error);
        res.status(500).json({ error: 'Erreur interne' });
      }
    }
  });

  return router;
}
