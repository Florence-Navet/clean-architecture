// Couche Infrastructure · console-notifier.ts
// Un adapteur qui implémente Notifier avec un simple console.log (demain : e-mail, push…).
import { Notifier } from '../../application/notifier';
import { Expense } from '../../domain/expense';
import { Group } from '../../domain/group';

export class ConsoleNotifier implements Notifier {
  notify(group: Group, expense: Expense): void {
    for (const member of group.members) {
      if (member !== expense.paidBy) {
        console.log(`📣 À ${member} : ${expense.paidBy} a ajouté ${expense.amountCents / 100} €`);
      }
    }
  }
}
