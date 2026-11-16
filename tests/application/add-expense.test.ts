// Partie B · Couche Applicative
// Rouge tant que src/application/group-repository.ts et add-expense.ts n'existent pas.
import { Group } from '../../src/domain/group';
import { GroupRepository } from '../../src/application/group-repository';
import { AddExpense } from '../../src/application/add-expense';

// Un faux repository, écrit pour le test : lui aussi « signe le contrat ».
class FakeGroupRepository implements GroupRepository {
  saved: Group[] = [];
  constructor(private readonly group?: Group) {}
  async findById(id: string) {
    return this.group?.id === id ? this.group : undefined;
  }
  async save(group: Group) {
    this.saved.push(group);
  }
}

describe('AddExpense', () => {
  it('ajoute la dépense au groupe, puis sauvegarde le groupe', async () => {
    const annecy = new Group('annecy', 'Week-end à Annecy', ['Alice', 'Bob']);
    const groups = new FakeGroupRepository(annecy);

    await new AddExpense(groups).execute({
      groupId: 'annecy',
      label: 'Gîte',
      amountCents: 12000,
      paidBy: 'Alice',
      participants: ['Alice', 'Bob'],
    });

    expect(groups.saved).toHaveLength(1);
    expect(groups.saved[0]?.balances()).toEqual({ Alice: 6000, Bob: -6000 });
  });

  it('refuse un groupe qui n\'existe pas, sans rien sauvegarder', async () => {
    const groups = new FakeGroupRepository();

    await expect(
      new AddExpense(groups).execute({
        groupId: 'inconnu',
        label: 'Gîte',
        amountCents: 12000,
        paidBy: 'Alice',
        participants: ['Alice'],
      }),
    ).rejects.toThrow();
    expect(groups.saved).toHaveLength(0);
  });

  it('ne sauvegarde rien si une règle métier est violée', async () => {
    const annecy = new Group('annecy', 'Week-end à Annecy', ['Alice', 'Bob']);
    const groups = new FakeGroupRepository(annecy);

    await expect(
      new AddExpense(groups).execute({
        groupId: 'annecy',
        label: 'Resto',
        amountCents: 5000,
        paidBy: 'Zoé',
        participants: ['Alice'],
      }),
    ).rejects.toThrow();
    expect(groups.saved).toHaveLength(0);
  });
});
