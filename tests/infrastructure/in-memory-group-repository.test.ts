// Code de mardi (vert au départ) · Couche Infrastructure : le repository en mémoire
import { Group } from '../../src/domain/group';
import { InMemoryGroupRepository } from '../../src/infrastructure/persistence/in-memory-group-repository';

describe('InMemoryGroupRepository', () => {
  it('ne trouve pas un groupe jamais sauvegardé', async () => {
    const groups = new InMemoryGroupRepository();

    expect(await groups.findById('annecy')).toBeUndefined();
  });

  it('retrouve un groupe sauvegardé', async () => {
    const groups = new InMemoryGroupRepository();
    const annecy = new Group('annecy', 'Week-end à Annecy', ['Alice', 'Bob']);

    await groups.save(annecy);

    expect(await groups.findById('annecy')).toBe(annecy);
  });

  it('remplace un groupe sauvegardé deux fois', async () => {
    const groups = new InMemoryGroupRepository();
    await groups.save(new Group('annecy', 'Ancien nom', ['Alice']));
    await groups.save(new Group('annecy', 'Week-end à Annecy', ['Alice', 'Bob']));

    expect((await groups.findById('annecy'))?.name).toBe('Week-end à Annecy');
  });
});
