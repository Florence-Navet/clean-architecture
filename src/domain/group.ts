// Couche Domaine · group.ts
// Un groupe d'amis qui partagent des dépenses.
// Il n'importe que d'autres fichiers du Domaine.
import { DomainError } from './domain-error';
import { Expense } from './expense';

export class Group {
  private readonly expenses: Expense[] = [];

  constructor(
    readonly id: string,
    readonly name: string,
    readonly members: string[],
  ) {}

  addExpense(expense: Expense): void {
    // Règle métier : seuls les membres du groupe peuvent payer ou participer.
    if (!this.members.includes(expense.paidBy)) {
      throw new DomainError(`${expense.paidBy} n'est pas membre du groupe`);
    }
    for (const participant of expense.participants) {
      if (!this.members.includes(participant)) {
        throw new DomainError(`${participant} n'est pas membre du groupe`);
      }
    }
    this.expenses.push(expense);
  }

  // Le solde de chaque membre, en centimes :
  // positif = on lui doit de l'argent, négatif = il ou elle doit de l'argent.
  balances(): Record<string, number> {
    const balances: Record<string, number> = {};
    for (const member of this.members) {
      balances[member] = 0;
    }

    for (const expense of this.expenses) {
      // Celui qui a payé avance tout le montant : on le lui doit.
      this.addToBalance(balances, expense.paidBy, expense.amountCents);

      // Chaque participant doit sa part, en centimes entiers.
      // Exemple : 1000 centimes à 3 → part de base 333, il reste 1 centime.
      // Ce centime en trop est payé par le premier participant (334, 333, 333).
      // S'il reste 2 centimes, les 2 premiers participants paient 1 centime de plus, etc.
      const participantCount = expense.participants.length;
      const baseShare = Math.floor(expense.amountCents / participantCount);
      const leftoverCents = expense.amountCents - baseShare * participantCount;

      let position = 0;
      for (const participant of expense.participants) {
        const share = position < leftoverCents ? baseShare + 1 : baseShare;
        this.addToBalance(balances, participant, -share);
        position++;
      }
    }

    return balances;
  }

  private addToBalance(balances: Record<string, number>, member: string, amountCents: number): void {
    // Avec noUncheckedIndexedAccess, balances[member] est de type number | undefined :
    // on remplace undefined par 0 avant d'additionner.
    const current = balances[member] ?? 0;
    balances[member] = current + amountCents;
  }
}
