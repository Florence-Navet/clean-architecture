// Partie A · Couche Domaine
import { Expense } from '../../src/domain/expense';
import { Group } from '../../src/domain/group';

const AMIS = ['Alice', 'Bob', 'Chloé', 'David'];

describe('Group', () => {
  it('a un id, un nom et des membres', () => {
    const annecy = new Group('annecy', 'Week-end à Annecy', AMIS);

    expect(annecy.id).toBe('annecy');
    expect(annecy.name).toBe('Week-end à Annecy');
    expect(annecy.members).toEqual(AMIS);
  });

  it('refuse une dépense payée par quelqu\'un qui n\'est pas membre', () => {
    const annecy = new Group('annecy', 'Week-end à Annecy', AMIS);

    expect(() => annecy.addExpense(new Expense('Resto', 5000, 'Zoé', ['Alice']))).toThrow();
  });

  it('refuse une dépense partagée avec quelqu\'un qui n\'est pas membre', () => {
    const annecy = new Group('annecy', 'Week-end à Annecy', AMIS);

    expect(() => annecy.addExpense(new Expense('Resto', 5000, 'Alice', ['Alice', 'Zoé']))).toThrow();
  });

  it('sans dépense, tous les soldes sont à 0', () => {
    const annecy = new Group('annecy', 'Week-end à Annecy', AMIS);

    expect(annecy.balances()).toEqual({ Alice: 0, Bob: 0, Chloé: 0, David: 0 });
  });

  it('calcule les soldes du week-end à Annecy', () => {
    const annecy = new Group('annecy', 'Week-end à Annecy', AMIS);
    annecy.addExpense(new Expense('Gîte', 12000, 'Alice', AMIS));
    annecy.addExpense(new Expense('Courses', 6000, 'Bob', AMIS));
    annecy.addExpense(new Expense('Essence', 4000, 'Chloé', ['Alice', 'Chloé']));

    // positif = on lui doit de l'argent, négatif = il ou elle doit de l'argent
    expect(annecy.balances()).toEqual({ Alice: 5500, Bob: 1500, Chloé: -2500, David: -4500 });
  });

  it('donne le centime en trop au premier participant', () => {
    const trio = new Group('trio', 'Pizza', ['Alice', 'Bob', 'Chloé']);
    // 10 € à 3 : Alice doit 3,34 €, Bob et Chloé 3,33 €
    trio.addExpense(new Expense('Pizza', 1000, 'Alice', ['Alice', 'Bob', 'Chloé']));

    expect(trio.balances()).toEqual({ Alice: 666, Bob: -333, Chloé: -333 });
  });

  it('la somme des soldes vaut toujours 0', () => {
    const trio = new Group('trio', 'Pizza', ['Alice', 'Bob', 'Chloé']);
    trio.addExpense(new Expense('Pizza', 1000, 'Bob', ['Alice', 'Bob', 'Chloé']));
    trio.addExpense(new Expense('Glaces', 701, 'Chloé', ['Alice', 'Chloé']));

    const somme = Object.values(trio.balances()).reduce((a, b) => a + b, 0);
    expect(somme).toBe(0);
  });

  it('expose ses dépenses en lecture seule, dans l\'ordre d\'ajout', () => {
    const annecy = new Group('annecy', 'Week-end à Annecy', AMIS);
    const gite = new Expense('Gîte', 12000, 'Alice', AMIS);
    const courses = new Expense('Courses', 6000, 'Bob', AMIS);
    annecy.addExpense(gite);
    annecy.addExpense(courses);

    expect(annecy.expenses).toEqual([gite, courses]);
  });

  it('ne se laisse pas modifier par la liste de dépenses qu\'il expose', () => {
    const annecy = new Group('annecy', 'Week-end à Annecy', AMIS);
    const copie = annecy.expenses as Expense[];
    copie.push(new Expense('Fantôme', 9999, 'Zoé', ['Zoé']));

    expect(annecy.expenses).toEqual([]);
  });
});

describe('Group.restore', () => {
  it('reconstitue un groupe avec ses dépenses, et les mêmes soldes', () => {
    const depenses = [
      new Expense('Gîte', 12000, 'Alice', AMIS),
      new Expense('Courses', 6000, 'Bob', AMIS),
      new Expense('Essence', 4000, 'Chloé', ['Alice', 'Chloé']),
    ];

    const annecy = Group.restore('annecy', 'Week-end à Annecy', AMIS, depenses);

    expect(annecy.id).toBe('annecy');
    expect(annecy.name).toBe('Week-end à Annecy');
    expect(annecy.members).toEqual(AMIS);
    expect(annecy.expenses).toEqual(depenses);
    expect(annecy.balances()).toEqual({ Alice: 5500, Bob: 1500, Chloé: -2500, David: -4500 });
  });

  it('refuse de reconstituer un groupe avec une dépense d\'un non-membre', () => {
    const depenses = [new Expense('Resto', 5000, 'Zoé', ['Alice'])];

    expect(() => Group.restore('annecy', 'Week-end à Annecy', AMIS, depenses)).toThrow();
  });
});
