// Composition root : le seul endroit qui connaît toutes les couches.
// On câble l'application à la main, avec des `new` : pas de framework d'injection.
import express from 'express';
import { Group } from './domain/group';
import { AddExpense } from './application/add-expense';
import { GetBalances } from './application/get-balances';
import { GetSettlements } from './application/get-settlements';
import { GroupRepository } from './application/group-repository';
import { InMemoryGroupRepository } from './infrastructure/persistence/in-memory-group-repository';
import { expenseRoutes } from './infrastructure/http/expense-routes';
import {postgresGroupRepository} from "./infrastructure/persistence/postgres-group-repository";
import {PrismaClient} from "@prisma/client";

const PORT = 3000;

// Le seul endroit où l'on choisit l'adapteur de stockage.
// STORAGE vient de l'environnement (fichier .env) : memory par défaut, ou postgres.
function createGroupRepository(storage: string): GroupRepository {
  switch (storage) {
    case 'memory':
      return new InMemoryGroupRepository();
    case 'postgres':
      // TODO séance 4 · bloc A : brancher ici le PostgresGroupRepository
      // (src/infrastructure/persistence/postgres-group-repository.ts

      // throw new Error("STORAGE=postgres : l'adapteur PostgresGroupRepository n'est pas encore écrit");
          return new postgresGroupRepository(new PrismaClient());
    default:
      throw new Error(`STORAGE inconnu : « ${storage} » (valeurs possibles : memory, postgres)`);
  }
}

async function main(): Promise<void> {
  const storage = process.env.STORAGE ?? 'memory';

  // 1. Les adapteurs (Infrastructure)
  const groups = createGroupRepository(storage);

  // Pas encore de route pour créer un groupe : on prépare celui d'Annecy à la main.
  // Seulement s'il n'existe pas déjà, pour ne pas écraser les dépenses gardées en base.
  if (!(await groups.findById('annecy'))) {
    await groups.save(new Group('annecy', 'Week-end à Annecy', ['Alice', 'Bob', 'Chloé', 'David']));
  }

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
    console.log(`API démarrée sur http://localhost:${PORT} (stockage : ${storage})`);
  });
}

main();
