// Couche Applicative · group-stats.ts
// Le contrat dont AddExpense a besoin pour mettre à jour les statistiques du groupe.
import { Group } from '../domain/group';

export interface GroupStats {
  update(group: Group): void;
}
