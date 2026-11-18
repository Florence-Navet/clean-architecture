// Code de mardi (vert au départ) · Couche Domaine : Expense
import { Expense } from '../../src/domain/expense';

describe('Expense', () => {
  it('crée une dépense valide (montant en centimes)', () => {
    const gite = new Expense('Gîte', 12000, 'Alice', ['Alice', 'Bob', 'Chloé', 'David']);

    expect(gite.label).toBe('Gîte');
    expect(gite.amountCents).toBe(12000);
    expect(gite.paidBy).toBe('Alice');
    expect(gite.participants).toEqual(['Alice', 'Bob', 'Chloé', 'David']);
  });

  it('refuse un montant nul', () => {
    expect(() => new Expense('Rien', 0, 'Alice', ['Alice'])).toThrow();
  });

  it('refuse un montant négatif', () => {
    expect(() => new Expense('Remboursement ?', -500, 'Alice', ['Alice'])).toThrow();
  });

  it('refuse une dépense sans participant', () => {
    expect(() => new Expense('Gîte', 12000, 'Alice', [])).toThrow();
  });
});
