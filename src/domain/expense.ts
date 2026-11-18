// Couche Domaine · expense.ts
// Une dépense : un libellé, un montant en centimes, qui a payé, et pour qui.
// Il n'importe que d'autres fichiers du Domaine.
import { DomainError } from './domain-error';

export class Expense {
  constructor(
    readonly label: string,
    readonly amountCents: number,
    readonly paidBy: string,
    readonly participants: string[],
  ) {
    // Les règles sont vérifiées ici, dans le constructeur :
    // impossible de créer une dépense invalide, d'où qu'on l'appelle.
    if (amountCents <= 0) {
      throw new DomainError('Le montant doit être supérieur à 0');
    }
    if (participants.length === 0) {
      throw new DomainError('Une dépense doit avoir au moins un participant');
    }
  }
}
