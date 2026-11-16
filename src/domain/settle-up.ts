// Couche Domaine · settle-up.ts
// Service du Domaine : à partir des soldes, liste les virements qui remettent tout le monde à 0.
// C'est une règle métier pure (aucun stockage, aucun HTTP) : elle a sa place dans le Domaine.
import { DomainError } from './domain-error';

// Un virement : `from` envoie `amountCents` à `to`.
export interface Transfer {
  from: string;
  to: string;
  amountCents: number;
}

// Ce qu'il reste à régler pour un membre pendant le calcul.
interface RemainingBalance {
  member: string;
  amountCents: number;
}

// Algorithme glouton : tant qu'il reste des soldes non nuls,
// celui qui doit le plus rembourse celui à qui on doit le plus, autant que possible.
// Chaque virement remet au moins une personne à 0, donc il y a au plus (nombre de membres - 1) virements.
export function settleUp(balances: Record<string, number>): Transfer[] {
  const remaining: RemainingBalance[] = [];
  let total = 0;
  for (const member of Object.keys(balances)) {
    const amountCents = balances[member] ?? 0;
    remaining.push({ member, amountCents });
    total += amountCents;
  }
  if (total !== 0) {
    throw new DomainError('La somme des soldes doit valoir 0');
  }

  const transfers: Transfer[] = [];
  let creditor = findLargestCreditor(remaining);
  let debtor = findLargestDebtor(remaining);

  while (creditor !== undefined && debtor !== undefined) {
    // On rembourse le plus petit des deux montants : l'un des deux tombe à 0.
    const amountCents = Math.min(creditor.amountCents, -debtor.amountCents);
    transfers.push({ from: debtor.member, to: creditor.member, amountCents });
    creditor.amountCents -= amountCents;
    debtor.amountCents += amountCents;

    creditor = findLargestCreditor(remaining);
    debtor = findLargestDebtor(remaining);
  }

  return transfers;
}

// Le membre à qui on doit le plus (solde positif le plus grand), ou undefined s'il n'y en a plus.
function findLargestCreditor(remaining: RemainingBalance[]): RemainingBalance | undefined {
  let largest: RemainingBalance | undefined = undefined;
  for (const balance of remaining) {
    if (balance.amountCents > 0 && (largest === undefined || balance.amountCents > largest.amountCents)) {
      largest = balance;
    }
  }
  return largest;
}

// Le membre qui doit le plus (solde négatif le plus bas), ou undefined s'il n'y en a plus.
function findLargestDebtor(remaining: RemainingBalance[]): RemainingBalance | undefined {
  let largest: RemainingBalance | undefined = undefined;
  for (const balance of remaining) {
    if (balance.amountCents < 0 && (largest === undefined || balance.amountCents < largest.amountCents)) {
      largest = balance;
    }
  }
  return largest;
}
