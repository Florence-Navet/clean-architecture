// Couche Infrastructure · in-memory-group-repository.ts
// Un adapteur qui « signe le contrat » GroupRepository en rangeant les groupes dans une Map.
// Demain, un PostgresGroupRepository pourra le remplacer sans toucher aux use cases.
import { GroupRepository } from '../../application/group-repository';
import { Group } from '../../domain/group';

export class InMemoryGroupRepository implements GroupRepository {
  // Clé : l'id du groupe. Valeur : le groupe.
  private readonly groups = new Map<string, Group>();

  async findById(id: string): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async save(group: Group): Promise<void> {
    // set() ajoute le groupe, ou remplace celui qui a le même id.
    this.groups.set(group.id, group);
  }
}
