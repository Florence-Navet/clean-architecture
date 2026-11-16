// Couche Applicative · notifier.ts
// Le contrat dont AddExpense a besoin pour prévenir les membres du groupe.
import { Expense } from '../domain/expense';
import { Group } from '../domain/group';

export interface Notifier {
  notify(group: Group, expense: Expense): void;
}
