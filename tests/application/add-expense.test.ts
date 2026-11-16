// Code de départ · le test de AddExpense tel qu'il est aujourd'hui (vert au départ).
// Il sera supprimé au bloc A, remplacé par add-expense.etape-b.test.ts.
import { Expense } from '../../src/domain/expense';
import { Group } from '../../src/domain/group';
import { GroupRepository } from '../../src/application/group-repository';
import { GroupStats } from '../../src/application/group-stats';
import { Notifier } from '../../src/application/notifier';
import { AddExpense } from '../../src/application/add-expense';

// Faux objet n°1 : un repository qui garde les groupes sauvegardés.
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

// Faux objet n°2 : retient les notifications au lieu de les afficher.
class FakeNotifier implements Notifier {
  notified: Expense[] = [];
  notify(group: Group, expense: Expense) {
    this.notified.push(expense);
  }
}

// Faux objet n°3 : retient les mises à jour des statistiques.
class FakeGroupStats implements GroupStats {
  updated: Group[] = [];
  update(group: Group) {
    this.updated.push(group);
  }
}

describe('AddExpense (code de départ)', () => {
  it('enregistre la dépense, notifie et met à jour les stats', async () => {
    const annecy = new Group('annecy', 'Week-end Annecy', ['Alice', 'Bob', 'Chloé']);
    const groups = new FakeGroupRepository(annecy);
    const notifier = new FakeNotifier();
    const stats = new FakeGroupStats();

    await new AddExpense(groups, notifier, stats).execute({
      groupId: 'annecy',
      label: 'Courses',
      amountCents: 6000,
      paidBy: 'Alice',
    });

    expect(groups.saved).toHaveLength(1);
    expect(notifier.notified).toHaveLength(1);
    expect(stats.updated).toHaveLength(1);
  });

  it('ne fait rien si le payeur n\'est pas membre du groupe', async () => {
    const annecy = new Group('annecy', 'Week-end Annecy', ['Alice', 'Bob', 'Chloé']);
    const groups = new FakeGroupRepository(annecy);
    const notifier = new FakeNotifier();
    const stats = new FakeGroupStats();

    await expect(
      new AddExpense(groups, notifier, stats).execute({
        groupId: 'annecy',
        label: 'Resto',
        amountCents: 5000,
        paidBy: 'Zoé',
      }),
    ).rejects.toThrow();
    expect(groups.saved).toHaveLength(0);
    expect(notifier.notified).toHaveLength(0);
  });
});
