// Composition root : le seul endroit qui connaît toutes les couches.
// On câble l'application à la main, avec des `new`.
import express from 'express';
import { Expense } from './domain/expense';
import { Group } from './domain/group';
import { AddExpense } from './application/add-expense';
import { ConsoleGroupStats } from './infrastructure/console/console-group-stats';
import { ConsoleNotifier } from './infrastructure/console/console-notifier';
import { InMemoryGroupRepository } from './infrastructure/persistence/in-memory-group-repository';
import { expenseRoutes } from './infrastructure/http/expense-routes';

const PORT = 3000;

async function main(): Promise<void> {
  // 1. Les adapteurs (Infrastructure), avec un groupe déjà créé : 240 € de dépenses
  const groups = new InMemoryGroupRepository();
  const annecy = new Group('annecy', 'Week-end Annecy', ['Alice', 'Bob', 'Chloé']);
  annecy.addExpense(new Expense('Gîte', 24000, 'Bob'));
  await groups.save(annecy);

  // 2. Le use case (Applicative), qui reçoit ce dont il a besoin
  const addExpense = new AddExpense(groups, new ConsoleNotifier(), new ConsoleGroupStats());

  // 3. L'app Express (Infrastructure), qui reçoit le use case
  const app = express();
  app.use(express.json());
  app.use(expenseRoutes(addExpense));
  app.listen(PORT, () => {
    console.log(`API démarrée sur http://localhost:${PORT}`);
  });
}

main();
