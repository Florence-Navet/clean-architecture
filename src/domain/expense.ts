// Couche Domaine · expense.ts
// Une dépense : un libellé, un montant en centimes, et qui a payé.
export class Expense {
  constructor(
    readonly label: string,
    readonly amountCents: number,
    readonly paidBy: string,
  ) {}
}
