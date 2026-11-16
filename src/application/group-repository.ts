// Couche Applicative · group-repository.ts
// Le contrat dont le use case a besoin pour retrouver et sauvegarder un groupe.
import { Group } from '../domain/group';

export interface GroupRepository {
  findById(id: string): Promise<Group | undefined>;
  save(group: Group): Promise<void>;
}
