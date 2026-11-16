// Bonus D · Couche Domaine : le remboursement minimal
import { settleUp, Transfer } from '../../src/domain/settle-up';

// Applique les virements aux soldes, pour vérifier que tout le monde revient à 0.
function applyTransfers(balances: Record<string, number>, transfers: Transfer[]): Record<string, number> {
  const result = { ...balances };
  for (const transfer of transfers) {
    result[transfer.from] = (result[transfer.from] ?? 0) + transfer.amountCents;
    result[transfer.to] = (result[transfer.to] ?? 0) - transfer.amountCents;
  }
  return result;
}

describe('settleUp', () => {
  it('règle le week-end à Annecy en 3 virements', () => {
    const soldes = { Alice: 5500, Bob: 1500, Chloé: -2500, David: -4500 };

    const virements = settleUp(soldes);

    expect(virements).toEqual([
      { from: 'David', to: 'Alice', amountCents: 4500 },
      { from: 'Chloé', to: 'Bob', amountCents: 1500 },
      { from: 'Chloé', to: 'Alice', amountCents: 1000 },
    ]);
    expect(applyTransfers(soldes, virements)).toEqual({ Alice: 0, Bob: 0, Chloé: 0, David: 0 });
  });

  it('ne propose aucun virement quand tout le monde est à 0', () => {
    expect(settleUp({ Alice: 0, Bob: 0 })).toEqual([]);
  });

  it('remet tous les soldes à 0, avec au plus (membres - 1) virements', () => {
    const soldes = { Alice: 666, Bob: -333, Chloé: -333 };

    const virements = settleUp(soldes);

    expect(virements.length).toBeLessThanOrEqual(2);
    expect(applyTransfers(soldes, virements)).toEqual({ Alice: 0, Bob: 0, Chloé: 0 });
  });

  it('refuse des soldes dont la somme ne vaut pas 0', () => {
    expect(() => settleUp({ Alice: 100, Bob: -50 })).toThrow();
  });
});
