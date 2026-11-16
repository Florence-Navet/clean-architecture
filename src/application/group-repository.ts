// Couche Applicative · group-repository.ts
// Le contrat dont les use cases ont besoin pour retrouver et sauvegarder un groupe.
// Il est rangé ici, à côté des use cases, car c'est celui qui a besoin qui écrit le contrat.
// Les implémentations (les adapteurs) vivent dans la Couche Infrastructure.
import { Group } from '../domain/group';

export interface GroupRepository {
  findById(id: string): Promise<Group | undefined>;
  save(group: Group): Promise<void>;
}
