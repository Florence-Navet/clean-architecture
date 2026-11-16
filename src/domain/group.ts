// Couche Domaine · group.ts
// Un groupe d'amis qui partagent des dépenses.
import { DomainError } from './domain-error';
import { Expense } from './expense';

export class Group {
  readonly expenses: Expense[] = [];

  constructor(
    readonly id: string,
    readonly name: string,
    readonly members: string[],
  ) {}

  addExpense(expense: Expense): void {
    // Règle métier : seul un membre du groupe peut payer.
    if (!this.members.includes(expense.paidBy)) {
      throw new DomainError(`${expense.paidBy} n'est pas membre du groupe`);
    }
    this.expenses.push(expense);
  }

  totalCents(): number {
    let total = 0;
    for (const expense of this.expenses) {
      total += expense.amountCents;
    }
    return total;
  }
}
