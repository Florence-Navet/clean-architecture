// Couche Applicative · get-settlements.ts
// Use case « qui rembourse qui ? » : la liste des virements qui remettent le groupe à 0.
// Le calcul est fait par le Domaine (Group.balances() puis settleUp()) : ici, on orchestre.
import { settleUp, Transfer } from '../domain/settle-up';
import { GroupNotFoundError } from './group-not-found-error';
import { GroupRepository } from './group-repository';

export class GetSettlements {
  constructor(private readonly groups: GroupRepository) {}

  async execute(groupId: string): Promise<Transfer[]> {
    const group = await this.groups.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError(groupId);
    }
    return settleUp(group.balances());
  }
}
