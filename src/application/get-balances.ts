// Couche Applicative · get-balances.ts
// Use case « consulter les soldes d'un groupe ».
// Le calcul lui-même est fait par le Domaine (Group.balances()) : ici, on orchestre.
import { GroupNotFoundError } from './group-not-found-error';
import { GroupRepository } from './group-repository';

export class GetBalances {
  constructor(private readonly groups: GroupRepository) {}

  async execute(groupId: string): Promise<Record<string, number>> {
    const group = await this.groups.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError(groupId);
    }
    return group.balances();
  }
}
