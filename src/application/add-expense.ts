// Couche Applicative · add-expense.ts
// Use case « ajouter une dépense à un groupe ».
import { DomainError } from '../domain/domain-error';
import { Expense } from '../domain/expense';
import { GroupRepository } from './group-repository';
import { GroupStats } from './group-stats';
import { Notifier } from './notifier';

export type AddExpenseCommand = {
  groupId: string;
  label: string;
  amountCents: number;
  paidBy: string;
};

export class AddExpense {
  constructor(
    private readonly groups: GroupRepository,
    private readonly notifier: Notifier,
    private readonly stats: GroupStats,
  ) {}

  async execute(command: AddExpenseCommand): Promise<void> {
    const group = await this.groups.findById(command.groupId);
    if (!group) {
      throw new DomainError(`Groupe introuvable : ${command.groupId}`);
    }

    const expense = new Expense(command.label, command.amountCents, command.paidBy);
    group.addExpense(expense);
    await this.groups.save(group);

    // Les réactions à la nouvelle dépense : chacune est appelée ici, une par une.
    this.notifier.notify(group, expense);
    this.stats.update(group);
  }
}
