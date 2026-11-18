// Code de mardi (vert au départ) · Couche Applicative : le use case « qui rembourse qui ? »
import { Expense } from '../../src/domain/expense';
import { Group } from '../../src/domain/group';
import { GroupRepository } from '../../src/application/group-repository';
import { GetSettlements } from '../../src/application/get-settlements';

class FakeGroupRepository implements GroupRepository {
  constructor(private readonly group?: Group) {}
  async findById(id: string) {
    return this.group?.id === id ? this.group : undefined;
  }
  async save() {}
}

describe('GetSettlements', () => {
  it('renvoie les virements qui règlent le week-end à Annecy', async () => {
    const amis = ['Alice', 'Bob', 'Chloé', 'David'];
    const annecy = new Group('annecy', 'Week-end à Annecy', amis);
    annecy.addExpense(new Expense('Gîte', 12000, 'Alice', amis));
    annecy.addExpense(new Expense('Courses', 6000, 'Bob', amis));
    annecy.addExpense(new Expense('Essence', 4000, 'Chloé', ['Alice', 'Chloé']));

    const virements = await new GetSettlements(new FakeGroupRepository(annecy)).execute('annecy');

    expect(virements).toEqual([
      { from: 'David', to: 'Alice', amountCents: 4500 },
      { from: 'Chloé', to: 'Bob', amountCents: 1500 },
      { from: 'Chloé', to: 'Alice', amountCents: 1000 },
    ]);
  });

  it('refuse un groupe qui n\'existe pas', async () => {
    await expect(new GetSettlements(new FakeGroupRepository()).execute('inconnu')).rejects.toThrow();
  });
});
