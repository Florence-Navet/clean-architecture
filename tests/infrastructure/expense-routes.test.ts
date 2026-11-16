// Bonus D · l'adapteur HTTP, testé avec supertest
// supertest envoie de vraies requêtes HTTP à l'app Express, sans lancer de serveur sur un port.
import express from 'express';
import request from 'supertest';
import { Group } from '../../src/domain/group';
import { AddExpense } from '../../src/application/add-expense';
import { GetBalances } from '../../src/application/get-balances';
import { GetSettlements } from '../../src/application/get-settlements';
import { InMemoryGroupRepository } from '../../src/infrastructure/persistence/in-memory-group-repository';
import { expenseRoutes } from '../../src/infrastructure/http/expense-routes';

// Monte l'app comme main.ts, avec un groupe Annecy déjà créé.
async function createTestApp() {
  const groups = new InMemoryGroupRepository();
  await groups.save(new Group('annecy', 'Week-end à Annecy', ['Alice', 'Bob', 'Chloé', 'David']));

  const app = express();
  app.use(express.json());
  app.use(expenseRoutes(new AddExpense(groups), new GetBalances(groups), new GetSettlements(groups)));
  return app;
}

const AMIS = ['Alice', 'Bob', 'Chloé', 'David'];

describe('Adapteur HTTP', () => {
  it('ajoute les 3 dépenses d\'Annecy puis renvoie les soldes', async () => {
    const app = await createTestApp();

    await request(app)
      .post('/groups/annecy/expenses')
      .send({ label: 'Gîte', amountCents: 12000, paidBy: 'Alice', participants: AMIS })
      .expect(201);
    await request(app)
      .post('/groups/annecy/expenses')
      .send({ label: 'Courses', amountCents: 6000, paidBy: 'Bob', participants: AMIS })
      .expect(201);
    await request(app)
      .post('/groups/annecy/expenses')
      .send({ label: 'Essence', amountCents: 4000, paidBy: 'Chloé', participants: ['Alice', 'Chloé'] })
      .expect(201);

    const response = await request(app).get('/groups/annecy/balances').expect(200);
    expect(response.body).toEqual({ Alice: 5500, Bob: 1500, Chloé: -2500, David: -4500 });

    const settlements = await request(app).get('/groups/annecy/settlements').expect(200);
    expect(settlements.body).toEqual([
      { from: 'David', to: 'Alice', amountCents: 4500 },
      { from: 'Chloé', to: 'Bob', amountCents: 1500 },
      { from: 'Chloé', to: 'Alice', amountCents: 1000 },
    ]);
  });

  it('répond 404 pour un groupe inconnu', async () => {
    const app = await createTestApp();

    await request(app).get('/groups/inconnu/balances').expect(404);
    await request(app).get('/groups/inconnu/settlements').expect(404);
    await request(app)
      .post('/groups/inconnu/expenses')
      .send({ label: 'Gîte', amountCents: 12000, paidBy: 'Alice', participants: ['Alice'] })
      .expect(404);
  });

  it('répond 400 quand une règle métier est violée', async () => {
    const app = await createTestApp();

    // montant négatif : c'est Expense (le Domaine) qui refuse, la route ne fait que traduire
    await request(app)
      .post('/groups/annecy/expenses')
      .send({ label: 'Resto', amountCents: -500, paidBy: 'Alice', participants: ['Alice'] })
      .expect(400);
    // payeur non membre : c'est Group (le Domaine) qui refuse
    await request(app)
      .post('/groups/annecy/expenses')
      .send({ label: 'Resto', amountCents: 5000, paidBy: 'Zoé', participants: ['Alice'] })
      .expect(400);
  });

  it('répond 400 quand le JSON n\'a pas la bonne forme', async () => {
    const app = await createTestApp();

    await request(app)
      .post('/groups/annecy/expenses')
      .send({ label: 'Gîte', amountCents: '120 €', paidBy: 'Alice', participants: ['Alice'] })
      .expect(400);
  });
});
