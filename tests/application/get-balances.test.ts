// Partie B · Couche Applicative
// Rouge tant que src/application/get-balances.ts n'existe pas.
import { Expense } from '../../src/domain/expense';
import { Group } from '../../src/domain/group';
import { GroupRepository } from '../../src/application/group-repository';
import { GetBalances } from '../../src/application/get-balances';

class FakeGroupRepository implements GroupRepository {
  constructor(private readonly group?: Group) {}
  async findById(id: string) {
    return this.group?.id === id ? this.group : undefined;
  }
  async save() {}
}

describe('GetBalances', () => {
  it('renvoie les soldes du groupe', async () => {
    const annecy = new Group('annecy', 'Week-end à Annecy', ['Alice', 'Bob']);
    annecy.addExpense(new Expense('Gîte', 12000, 'Alice', ['Alice', 'Bob']));

    const soldes = await new GetBalances(new FakeGroupRepository(annecy)).execute('annecy');

    expect(soldes).toEqual({ Alice: 6000, Bob: -6000 });
  });

  it('refuse un groupe qui n\'existe pas', async () => {
    await expect(new GetBalances(new FakeGroupRepository()).execute('inconnu')).rejects.toThrow();
  });
});
