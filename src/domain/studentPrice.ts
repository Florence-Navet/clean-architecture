

export function studentPrice(price: number, categoryCode: string) {
  if (categoryCode == 'VIP') return price;
  return price * 0.8;
}
