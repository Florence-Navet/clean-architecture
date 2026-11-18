// Couche Applicative · add-expense.ts
// Use case « ajouter une dépense à un groupe ».
// Il orchestre : retrouver le groupe, convertir le montant en euros, lui confier la dépense, sauvegarder.
// Il importe le Domaine et les interfaces (GroupRepository, ExchangeRateProvider), jamais l'Infrastructure.
import { Expense } from '../domain/expense';
import { ExchangeRateProvider } from './exchange-rate-provider';
import { GroupNotFoundError } from './group-not-found-error';
import { GroupRepository } from './group-repository';

// Les données dont le use case a besoin (des types simples, pas de Request Express).
export interface AddExpenseCommand {
  groupId: string;
  label: string;
  amountCents: number; // en centimes de `currency` (3000 avec 'USD' = 30 $)
  currency: string; // la devise de la dépense, ex. 'EUR', 'USD'
  paidBy: string;
  participants: string[];
}

export class AddExpense {
  // On reçoit les dépendances par le constructeur : AddExpense ne sait pas
  // s'il parle à une Map ou à Postgres, ni à Frankfurter ou à un fake de test.
  constructor(
    private readonly groups: GroupRepository,
    private readonly exchangeRates: ExchangeRateProvider,
  ) {}

  async execute(command: AddExpenseCommand): Promise<void> {
    const group = await this.groups.findById(command.groupId);
    if (!group) {
      throw new GroupNotFoundError(command.groupId);
    }

    // Le groupe compte en euros : toute dépense entre dans le groupe en euros.
    const amountInEurCents = await this.toEurCents(command.amountCents, command.currency);

    // Les règles (montant, membres…) sont vérifiées par le Domaine.
    // Si l'une d'elles échoue, une erreur est levée et on ne sauvegarde rien.
    const expense = new Expense(command.label, amountInEurCents, command.paidBy, command.participants);
    group.addExpense(expense);

    await this.groups.save(group);
  }

  // Bloc A : convertit un montant en centimes de `currency` en centimes d'euros.
  // À compléter :
  //   - si `currency` vaut 'EUR' : renvoyer `amountCents` tel quel, sans appeler le fournisseur de taux ;
  //   - sinon : demander le taux à `this.exchangeRates` (de `currency` vers 'EUR'),
  //     puis renvoyer le montant converti avec la méthode `convert` du taux.
  private async toEurCents(amountCents: number, currency: string): Promise<number> {
    return amountCents; // ← provisoire : pour l'instant, 30 $ deviennent 30 €. C'est faux !
  }
}
