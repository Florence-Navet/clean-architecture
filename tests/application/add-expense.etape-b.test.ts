// Bloc A · le test de AddExpense, déjà réécrit pour la version avec EventPublisher.
// Il est en pause (describe.skip) au départ, car il attend le NOUVEAU constructeur :
//   new AddExpense(groups, publisher)
// Au bloc A, une fois AddExpense modifié :
//   1. supprimez tests/application/add-expense.test.ts (l'ancienne version, celle du code de départ) ;
//   2. ici, remplacez `describe.skip(` par `describe(` ;
//   3. lancez npm test.
import { Group } from '../../src/domain/group';
import { GroupRepository } from '../../src/application/group-repository';
import { EventPublisher, ExpenseAdded } from '../../src/application/events';
import { AddExpense } from '../../src/application/add-expense';

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

// Un seul faux objet pour TOUTES les réactions : il retient les événements publiés.
class FakeEventPublisher implements EventPublisher {
  published: ExpenseAdded[] = [];
  async publish(event: ExpenseAdded) {
    this.published.push(event);
  }
}

describe('AddExpense (bloc A)', () => {
  it('enregistre la dépense, puis publie un événement ExpenseAdded', async () => {
    const annecy = new Group('annecy', 'Week-end Annecy', ['Alice', 'Bob', 'Chloé']);
    const groups = new FakeGroupRepository(annecy);
    const publisher = new FakeEventPublisher();

    await new AddExpense(groups, publisher).execute({
      groupId: 'annecy',
      label: 'Courses',
      amountCents: 6000,
      paidBy: 'Alice',
    });

    expect(groups.saved).toHaveLength(1);
    expect(publisher.published).toEqual([
      {
        type: 'ExpenseAdded',
        eventId: expect.any(String), // un identifiant unique, par exemple crypto.randomUUID()
        groupId: 'annecy',
        payerName: 'Alice',
        amountInCents: 6000,
        occurredAt: expect.any(String), // la date, par exemple new Date().toISOString()
      },
    ]);
  });

  it('donne un eventId différent à chaque événement', async () => {
    const annecy = new Group('annecy', 'Week-end Annecy', ['Alice', 'Bob', 'Chloé']);
    const publisher = new FakeEventPublisher();
    const addExpense = new AddExpense(new FakeGroupRepository(annecy), publisher);

    await addExpense.execute({ groupId: 'annecy', label: 'Pain', amountCents: 300, paidBy: 'Bob' });
    await addExpense.execute({ groupId: 'annecy', label: 'Pain', amountCents: 300, paidBy: 'Bob' });

    expect(publisher.published[0]?.eventId).not.toEqual(publisher.published[1]?.eventId);
  });

  it('ne publie rien si le payeur n\'est pas membre du groupe', async () => {
    const annecy = new Group('annecy', 'Week-end Annecy', ['Alice', 'Bob', 'Chloé']);
    const groups = new FakeGroupRepository(annecy);
    const publisher = new FakeEventPublisher();

    await expect(
      new AddExpense(groups, publisher).execute({
        groupId: 'annecy',
        label: 'Resto',
        amountCents: 5000,
        paidBy: 'Zoé',
      }),
    ).rejects.toThrow();
    expect(publisher.published).toHaveLength(0);
  });
});
