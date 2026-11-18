// Partie C · Couche Infrastructure
// Rouge tant que src/infrastructure/persistence/in-memory-group-repository.ts n'existe pas.
import { Group } from '../../src/domain/group';
import { InMemoryGroupRepository } from '../../src/infrastructure/persistence/in-memory-group-repository';
import {GroupRepository} from "../../src/application/group-repository";

export function groupRepositoryContract(create: () => GroupRepository) {

    describe('InMemoryGroupRepository', () => {
        it('ne trouve pas un groupe jamais sauvegardé', async () => {
            const groups = create();

            expect(await groups.findById('annecy')).toBeUndefined();
        });

        it('retrouve un groupe sauvegardé', async () => {
            const groups = create();
            const annecy = new Group('annecy', 'Week-end à Annecy', ['Alice', 'Bob']);

            await groups.save(annecy);

            const found = await groups.findById('annecy');

            expect(found?.name).toBe(annecy.name);
            expect(found?.members).toEqual(annecy.members);
            expect(found?.expenses).toEqual(annecy.expenses);
        });

        it('remplace un groupe sauvegardé deux fois', async () => {
            const groups = new InMemoryGroupRepository();
            await groups.save(new Group('annecy', 'Ancien nom', ['Alice']));
            await groups.save(new Group('annecy', 'Week-end à Annecy', ['Alice', 'Bob']));

            expect((await groups.findById('annecy'))?.name).toBe('Week-end à Annecy');
        });
    });

}

