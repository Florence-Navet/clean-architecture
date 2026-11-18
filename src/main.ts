// Composition root : le seul endroit qui connaît toutes les couches.
// On câble l'application à la main, avec des `new` : pas de framework d'injection.
import express from 'express';
import { Group } from './domain/group';
import { AddExpense } from './application/add-expense';
import { GetBalances } from './application/get-balances';
import { GetSettlements } from './application/get-settlements';
import { InMemoryGroupRepository } from './infrastructure/persistence/in-memory-group-repository';
import { FixedExchangeRateProvider } from './infrastructure/exchange-rates/fixed-exchange-rate-provider';
import { FrankfurterExchangeRateProvider } from './infrastructure/exchange-rates/frankfurter-exchange-rate-provider';
import { expenseRoutes } from './infrastructure/http/expense-routes';

const PORT = 3000;
// L'adresse de l'API de taux de change (bloc B). C'est le seul endroit où elle est écrite.
const EXCHANGE_API_URL = 'https://api.frankfurter.dev/v2'; // ← partie C : remplacer par 'http://localhost:4000/v2'

async function main(): Promise<void> {
  // 1. Les adapteurs (Infrastructure)
  const groups = new InMemoryGroupRepository();
  const exchangeRates = new FixedExchangeRateProvider(); // ← partie B : remplacer par new FrankfurterExchangeRateProvider(EXCHANGE_API_URL)

  // Pas encore de route pour créer un groupe : on prépare les groupes à la main.
  await groups.save(new Group('annecy', 'Week-end à Annecy', ['Alice', 'Bob', 'Chloé', 'David']));
  await groups.save(new Group('new-york', 'Week-end à New York', ['Alice', 'Bob']));

  // 2. Les use cases (Applicative), qui reçoivent les adapteurs
  const addExpense = new AddExpense(groups, exchangeRates);
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
