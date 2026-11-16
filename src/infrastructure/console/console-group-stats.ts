// Couche Infrastructure · console-group-stats.ts
// Un adapteur qui implémente GroupStats en affichant le total du groupe.
import { GroupStats } from '../../application/group-stats';
import { Group } from '../../domain/group';

export class ConsoleGroupStats implements GroupStats {
  update(group: Group): void {
    console.log(`📊 ${group.name} : total ${group.totalCents() / 100} €`);
  }
}
