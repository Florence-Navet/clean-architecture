// Couche Domaine · ExchangeRate (fourni, vert au départ)
// Le calcul « montant × taux » est une règle métier : il est testé ici, sans réseau.
import { ExchangeRate } from '../../src/domain/exchange-rate';

describe('ExchangeRate', () => {
  it('convertit 30 $ en 27 € avec un taux de 0.9', () => {
    const usdToEur = new ExchangeRate('USD', 'EUR', 0.9);

    expect(usdToEur.convert(3000)).toBe(2700);
  });

  it('arrondit au centime le plus proche', () => {
    const usdToEur = new ExchangeRate('USD', 'EUR', 0.90893);

    // 3000 × 0.90893 = 2726,79 centimes → 2727 centimes (27,27 €)
    expect(usdToEur.convert(3000)).toBe(2727);
  });

  it('refuse un taux nul ou négatif', () => {
    expect(() => new ExchangeRate('USD', 'EUR', 0)).toThrow();
    expect(() => new ExchangeRate('USD', 'EUR', -1)).toThrow();
  });
});
