export function computeFees(qty: number, subtotal: number) {
    let fees = qty * 1.5 + subtotal * 0.03;
    if (fees > 15) fees = 15;
    return Math.round(fees * 100) / 100;
}
