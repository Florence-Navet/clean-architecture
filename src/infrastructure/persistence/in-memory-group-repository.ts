// Couche Infrastructure · in-memory-group-repository.ts
// Un adapteur qui implémente GroupRepository en rangeant les groupes dans une Map.
import { GroupRepository } from '../../application/group-repository';
import { Group } from '../../domain/group';

export class InMemoryGroupRepository implements GroupRepository {
  private readonly groups = new Map<string, Group>();

  async findById(id: string): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async save(group: Group): Promise<void> {
    this.groups.set(group.id, group);
  }
}
