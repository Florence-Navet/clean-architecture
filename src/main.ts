// Composition root : le seul endroit qui connaît toutes les couches.
// On câble l'application à la main, avec des `new` : pas de framework d'injection.
import express from 'express';
import { Group } from './domain/group';
import { AddExpense } from './application/add-expense';
import { GetBalances } from './application/get-balances';
import { GetSettlements } from './application/get-settlements';
import { InMemoryGroupRepository } from './infrastructure/persistence/in-memory-group-repository';
import { expenseRoutes } from './infrastructure/http/expense-routes';

const PORT = 3000;

async function main(): Promise<void> {
  // 1. Les adapteurs (Infrastructure)
  const groups = new InMemoryGroupRepository();

  // Pas encore de route pour créer un groupe : on prépare celui d'Annecy à la main.
  await groups.save(new Group('annecy', 'Week-end à Annecy', ['Alice', 'Bob', 'Chloé', 'David']));

  // 2. Les use cases (Applicative), qui reçoivent les adapteurs
  const addExpense = new AddExpense(groups);
  const getBalances = new GetBalances(groups);
  const getSettlements = new GetSettlements(groups);

  // 3. L'app Express (Infrastructure/http), qui reçoit les use cases
  const app = express();
  app.use(express.json());
  app.use(expenseRoutes(addExpense, getBalances, getSettlements));

  // 4. Démarrer le serveur
  app.listen(PORT, () => {
    console.log(`API démarrée sur http://localhost:${PORT}`);
  });
}

main();
