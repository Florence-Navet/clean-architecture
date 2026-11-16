// Couche Applicative · add-expense.ts
// Use case « ajouter une dépense à un groupe ».
// Il orchestre : retrouver le groupe, lui confier la dépense, sauvegarder.
// Il importe le Domaine et l'interface GroupRepository, jamais l'Infrastructure.
import { Expense } from '../domain/expense';
import { GroupNotFoundError } from './group-not-found-error';
import { GroupRepository } from './group-repository';

// Les données dont le use case a besoin (des types simples, pas de Request Express).
export interface AddExpenseCommand {
  groupId: string;
  label: string;
  amountCents: number;
  paidBy: string;
  participants: string[];
}

export class AddExpense {
  // On reçoit le repository par le constructeur : AddExpense ne sait pas
  // s'il parle à une Map en mémoire, à Postgres ou à un faux repository de test.
  constructor(private readonly groups: GroupRepository) {}

  async execute(command: AddExpenseCommand): Promise<void> {
    const group = await this.groups.findById(command.groupId);
    if (!group) {
      throw new GroupNotFoundError(command.groupId);
    }

    // Les règles (montant, membres…) sont vérifiées par le Domaine.
    // Si l'une d'elles échoue, une erreur est levée et on ne sauvegarde rien.
    const expense = new Expense(command.label, command.amountCents, command.paidBy, command.participants);
    group.addExpense(expense);

    await this.groups.save(group);
  }
}
